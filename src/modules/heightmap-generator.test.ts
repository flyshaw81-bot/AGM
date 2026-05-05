import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalHeightmapImageBrowserTargets,
  createGlobalHeightmapImageTargets,
  createGlobalHeightmapLogTargets,
  createGlobalHeightmapTemplateTargets,
  createGlobalHeightmapWorldTargets,
  type HeightmapImageTargets,
  HeightmapModule,
} from "./heightmap-generator";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalErrorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "ERROR",
);

function createGraph() {
  return {
    cellsDesired: 4,
    cells: {
      h: new Uint8Array([1, 2, 3, 4]),
    },
    points: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  };
}

function createPrecreatedGraph() {
  return {
    cellsDesired: 4,
    cellsX: 2,
    cellsY: 2,
    cells: {
      h: new Uint8Array([0, 0, 0, 0]),
    },
    points: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  };
}

function createImageTargets(data: Uint8ClampedArray): HeightmapImageTargets {
  return {
    createCanvas: () =>
      ({
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage: () => {},
          getImageData: () => ({ data }),
        }),
        remove: () => {},
      }) as unknown as HTMLCanvasElement,
    createImage: () => {
      const image = {
        onload: null as (() => void) | null,
        remove: () => {},
      };
      return Object.defineProperty(image, "src", {
        set: () => setTimeout(() => image.onload?.(), 0),
      }) as unknown as HTMLImageElement;
    },
  };
}

describe("HeightmapModule", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    }
    if (originalErrorDescriptor) {
      Object.defineProperty(globalThis, "ERROR", originalErrorDescriptor);
    }
  });

  it("can be imported when window access throws", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./heightmap-generator")).resolves.toBeDefined();
  });

  it("can initialize heights without browser globals", () => {
    const heightmap = new HeightmapModule();

    heightmap.setGraph(createGraph());

    expect(heightmap.getHeights()).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("keeps global image targets safe when document and Image are absent", () => {
    const originalDocument = globalThis.document;
    const originalImage = globalThis.Image;

    try {
      globalThis.document = undefined as unknown as Document;
      globalThis.Image = undefined as unknown as typeof Image;
      const targets = createGlobalHeightmapImageTargets();
      const canvas = targets.createCanvas();
      const image = targets.createImage();

      expect(canvas.getContext("2d")).toBeNull();
      expect(() => canvas.remove()).not.toThrow();
      expect(() => image.remove()).not.toThrow();
    } finally {
      globalThis.document = originalDocument;
      globalThis.Image = originalImage;
    }
  });

  it("keeps browser image targets safe when document and Image access throws", () => {
    const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    );
    const originalImageDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "Image",
    );
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "Image", {
      configurable: true,
      get: () => {
        throw new Error("image blocked");
      },
    });

    try {
      const browserTargets = createGlobalHeightmapImageBrowserTargets();
      const targets = createGlobalHeightmapImageTargets(browserTargets);

      expect(browserTargets.createCanvasElement()).toBeUndefined();
      expect(browserTargets.createImageElement()).toBeUndefined();
      expect(targets.createCanvas().getContext("2d")).toBeNull();
      expect(() => targets.createImage().remove()).not.toThrow();
    } finally {
      if (originalDocumentDescriptor) {
        Object.defineProperty(
          globalThis,
          "document",
          originalDocumentDescriptor,
        );
      }
      if (originalImageDescriptor) {
        Object.defineProperty(globalThis, "Image", originalImageDescriptor);
      }
    }
  });

  it("keeps global template targets behind the compatibility adapter", () => {
    const originalTemplates = globalThis.heightmapTemplates;

    try {
      globalThis.heightmapTemplates = {
        volcano: { template: "Hill 1-10 20-30 40" },
      };

      const targets = createGlobalHeightmapTemplateTargets();

      expect(targets.hasTemplate("volcano")).toBe(true);
      expect(targets.getTemplate("volcano")).toBe("Hill 1-10 20-30 40");
    } finally {
      globalThis.heightmapTemplates = originalTemplates;
    }
  });

  it("keeps global world targets behind the compatibility adapter", () => {
    const originalGraphWidth = globalThis.graphWidth;
    const originalGraphHeight = globalThis.graphHeight;

    try {
      globalThis.graphWidth = 120;
      globalThis.graphHeight = 80;
      const targets = createGlobalHeightmapWorldTargets();

      expect(targets.getGraphWidth()).toBe(120);
      expect(targets.getGraphHeight()).toBe(80);
    } finally {
      globalThis.graphWidth = originalGraphWidth;
      globalThis.graphHeight = originalGraphHeight;
    }
  });

  it("generates template heightmaps through injected template targets", async () => {
    const heightmap = new HeightmapModule(
      createImageTargets(new Uint8ClampedArray()),
      { error: vi.fn() },
      {
        hasTemplate: (id) => id === "flat",
        getTemplate: () => "Hill 0-100 0-100 20",
      },
      {
        getGraphWidth: () => 2,
        getGraphHeight: () => 2,
      },
    );

    const heights = await heightmap.generate(createGraph(), {
      generationSettings: { heightmapTemplateId: "flat" },
      random: { next: () => 0.5 },
      seed: "heightmap-seed",
      timing: { shouldTime: false },
    } as never);

    expect(heights.length).toBe(4);
    expect(Math.max(...heights)).toBeGreaterThan(0);
  });

  it("loads precreated heightmaps through injected image targets", async () => {
    const heightmap = new HeightmapModule(
      createImageTargets(
        new Uint8ClampedArray([
          0, 0, 0, 255, 64, 64, 64, 255, 128, 128, 128, 255, 255, 255, 255, 255,
        ]),
      ),
    );

    const heights = await heightmap.fromPrecreated(
      createPrecreatedGraph(),
      "x",
    );

    expect(heights).toEqual(new Uint8Array([0, 29, 58, 100]));
  });

  it("restores global Math.random after generation", async () => {
    const originalRandom = Math.random;
    const originalTemplates = globalThis.heightmapTemplates;
    const heightmap = new HeightmapModule(
      createImageTargets(
        new Uint8ClampedArray([
          0, 0, 0, 255, 64, 64, 64, 255, 128, 128, 128, 255, 255, 255, 255, 255,
        ]),
      ),
    );

    try {
      globalThis.heightmapTemplates = {};

      await heightmap.generate(createPrecreatedGraph(), {
        generationSettings: { heightmapTemplateId: "missing-precreated" },
        random: { next: () => 0.5 },
        seed: "heightmap-seed",
        timing: { shouldTime: false },
      } as never);

      expect(Math.random).toBe(originalRandom);
    } finally {
      globalThis.heightmapTemplates = originalTemplates;
      Math.random = originalRandom;
    }
  });

  it("reports invalid point ranges through injected log targets", () => {
    const error = vi.fn();
    const heightmap = new HeightmapModule(
      createImageTargets(new Uint8ClampedArray()),
      {
        error,
      },
    ) as unknown as {
      getPointInRange: (range: unknown, length: number) => number | undefined;
    };

    expect(heightmap.getPointInRange(42, 10)).toBeUndefined();
    expect(error).toHaveBeenCalledWith("Range should be a string");
  });

  it("keeps global log targets safe when error flag access throws", () => {
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      get: () => {
        throw new Error("ERROR blocked");
      },
    });
    const targets = createGlobalHeightmapLogTargets();

    expect(() => targets.error("Range should be a string")).not.toThrow();
  });
});
