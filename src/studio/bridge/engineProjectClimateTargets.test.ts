import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalProjectClimateTargets,
  createProjectClimateTargets,
} from "./engineProjectClimateTargets";

type TestClimateGlobals = typeof globalThis & {
  updateGlobePosition?: () => void;
  drawBiomes?: () => void;
  ThreeD?: {
    update?: () => void;
  };
};

const testGlobals = globalThis as TestClimateGlobals;
const originalDocument = globalThis.document;
const originalPack = globalThis.pack;
const originalUpdateGlobePosition = testGlobals.updateGlobePosition;
const originalCalculateTemperatures = globalThis.calculateTemperatures;
const originalGeneratePrecipitation = globalThis.generatePrecipitation;
const originalRivers = globalThis.Rivers;
const originalBiomes = globalThis.Biomes;
const originalFeatures = globalThis.Features;
const originalLakes = globalThis.Lakes;
const originalLayerIsOn = globalThis.layerIsOn;
const originalDrawBiomes = testGlobals.drawBiomes;
const originalThreeD = testGlobals.ThreeD;
const originalWindow = globalThis.window;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);
const originalUpdateGlobePositionDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "updateGlobePosition",
);
const originalCalculateTemperaturesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "calculateTemperatures",
);
const originalGeneratePrecipitationDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "generatePrecipitation",
);
const originalRiversDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Rivers",
);
const originalBiomesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Biomes",
);
const originalFeaturesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Features",
);
const originalLakesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Lakes",
);
const originalLayerIsOnDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "layerIsOn",
);
const originalDrawBiomesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "drawBiomes",
);
const originalThreeDDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "ThreeD",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

describe("createGlobalProjectClimateTargets", () => {
  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: originalDocument,
      });
    }
    if (originalPackDescriptor) {
      Object.defineProperty(globalThis, "pack", originalPackDescriptor);
    } else {
      Object.defineProperty(globalThis, "pack", {
        configurable: true,
        writable: true,
        value: originalPack,
      });
    }
    if (originalUpdateGlobePositionDescriptor) {
      Object.defineProperty(
        globalThis,
        "updateGlobePosition",
        originalUpdateGlobePositionDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "updateGlobePosition", {
        configurable: true,
        writable: true,
        value: originalUpdateGlobePosition,
      });
    }
    if (originalCalculateTemperaturesDescriptor) {
      Object.defineProperty(
        globalThis,
        "calculateTemperatures",
        originalCalculateTemperaturesDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "calculateTemperatures", {
        configurable: true,
        writable: true,
        value: originalCalculateTemperatures,
      });
    }
    if (originalGeneratePrecipitationDescriptor) {
      Object.defineProperty(
        globalThis,
        "generatePrecipitation",
        originalGeneratePrecipitationDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "generatePrecipitation", {
        configurable: true,
        writable: true,
        value: originalGeneratePrecipitation,
      });
    }
    if (originalRiversDescriptor) {
      Object.defineProperty(globalThis, "Rivers", originalRiversDescriptor);
    } else {
      Object.defineProperty(globalThis, "Rivers", {
        configurable: true,
        writable: true,
        value: originalRivers,
      });
    }
    if (originalBiomesDescriptor) {
      Object.defineProperty(globalThis, "Biomes", originalBiomesDescriptor);
    } else {
      Object.defineProperty(globalThis, "Biomes", {
        configurable: true,
        writable: true,
        value: originalBiomes,
      });
    }
    if (originalFeaturesDescriptor) {
      Object.defineProperty(globalThis, "Features", originalFeaturesDescriptor);
    } else {
      Object.defineProperty(globalThis, "Features", {
        configurable: true,
        writable: true,
        value: originalFeatures,
      });
    }
    if (originalLakesDescriptor) {
      Object.defineProperty(globalThis, "Lakes", originalLakesDescriptor);
    } else {
      Object.defineProperty(globalThis, "Lakes", {
        configurable: true,
        writable: true,
        value: originalLakes,
      });
    }
    if (originalLayerIsOnDescriptor) {
      Object.defineProperty(
        globalThis,
        "layerIsOn",
        originalLayerIsOnDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "layerIsOn", {
        configurable: true,
        writable: true,
        value: originalLayerIsOn,
      });
    }
    if (originalDrawBiomesDescriptor) {
      Object.defineProperty(
        globalThis,
        "drawBiomes",
        originalDrawBiomesDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "drawBiomes", {
        configurable: true,
        writable: true,
        value: originalDrawBiomes,
      });
    }
    if (originalThreeDDescriptor) {
      Object.defineProperty(globalThis, "ThreeD", originalThreeDDescriptor);
    } else {
      Object.defineProperty(globalThis, "ThreeD", {
        configurable: true,
        writable: true,
        value: originalThreeD,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        writable: true,
        value: originalWindow,
      });
    }
  });

  it("reads the auto-apply checkbox when present", () => {
    globalThis.document = {
      getElementById: vi.fn(() => ({ checked: false })),
    } as unknown as Document;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.shouldAutoApplyClimate()).toBe(false);
  });

  it("detects whether the climate pipeline is available", () => {
    globalThis.pack = {
      cells: {
        h: new Uint8Array([1, 2]),
      },
    } as unknown as typeof pack;
    globalThis.calculateTemperatures = vi.fn();
    globalThis.generatePrecipitation = vi.fn();
    globalThis.Rivers = {
      generate: vi.fn(),
      specify: vi.fn(),
    } as unknown as typeof Rivers;
    globalThis.Biomes = {
      define: vi.fn(),
    } as unknown as typeof Biomes;
    globalThis.Features = {
      defineGroups: vi.fn(),
    } as unknown as typeof Features;
    globalThis.Lakes = {
      defineNames: vi.fn(),
    } as unknown as typeof Lakes;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.canApplyClimatePipeline()).toBe(true);
  });

  it("clones and restores pack heights around river generation", () => {
    globalThis.pack = {
      cells: {
        h: new Uint8Array([4, 5, 6]),
      },
    } as unknown as typeof pack;

    const targets = createGlobalProjectClimateTargets();
    const heights = targets.cloneHeights();
    expect(heights).toEqual(new Uint8Array([4, 5, 6]));

    targets.restoreHeights(new Uint8Array([7, 8]));

    expect(globalThis.pack.cells.h).toEqual(new Float32Array([7, 8]));
  });

  it("forwards layer redraws and 3D refresh through global helpers", () => {
    const drawBiomes = vi.fn();
    const updateThreeD = vi.fn();
    globalThis.layerIsOn = vi.fn((layer) => layer === "toggleBiomes");
    testGlobals.drawBiomes = drawBiomes;
    testGlobals.ThreeD = { update: updateThreeD };
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "canvas3d" ? {} : null)),
    } as unknown as Document;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.isLayerOn("toggleBiomes")).toBe(true);
    targets.drawBiomes();
    expect(targets.hasCanvas3d()).toBe(true);
    targets.updateThreeD();

    expect(drawBiomes).toHaveBeenCalledWith();
    expect(updateThreeD).toHaveBeenCalledWith();
  });

  it("keeps climate targets safe when browser DOM and scheduler are absent", () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.window = {} as Window & typeof globalThis;

    const targets = createGlobalProjectClimateTargets();

    expect(targets.shouldAutoApplyClimate()).toBe(true);
    expect(targets.hasCanvas3d()).toBe(false);
    expect(targets.canUpdateGlobePosition()).toBe(false);
    expect(targets.canApplyClimatePipeline()).toBe(false);
    expect(targets.cloneHeights()).toBeUndefined();
    expect(() => targets.schedule(vi.fn(), 10)).not.toThrow();
  });

  it("keeps climate targets safe when browser and runtime globals throw", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      get: () => {
        throw new Error("pack blocked");
      },
    });
    Object.defineProperty(globalThis, "calculateTemperatures", {
      configurable: true,
      value: () => {
        throw new Error("temperature blocked");
      },
    });
    Object.defineProperty(globalThis, "generatePrecipitation", {
      configurable: true,
      value: () => {
        throw new Error("precipitation blocked");
      },
    });
    Object.defineProperty(globalThis, "Rivers", {
      configurable: true,
      get: () => {
        throw new Error("rivers blocked");
      },
    });
    Object.defineProperty(globalThis, "Biomes", {
      configurable: true,
      get: () => {
        throw new Error("biomes blocked");
      },
    });
    Object.defineProperty(globalThis, "Features", {
      configurable: true,
      get: () => {
        throw new Error("features blocked");
      },
    });
    Object.defineProperty(globalThis, "Lakes", {
      configurable: true,
      get: () => {
        throw new Error("lakes blocked");
      },
    });
    Object.defineProperty(globalThis, "layerIsOn", {
      configurable: true,
      value: () => {
        throw new Error("layer blocked");
      },
    });
    Object.defineProperty(globalThis, "drawBiomes", {
      configurable: true,
      value: () => {
        throw new Error("draw blocked");
      },
    });
    Object.defineProperty(globalThis, "ThreeD", {
      configurable: true,
      value: {
        update: () => {
          throw new Error("3D blocked");
        },
      },
    });

    const targets = createGlobalProjectClimateTargets();

    expect(targets.shouldAutoApplyClimate()).toBe(true);
    expect(targets.hasCanvas3d()).toBe(false);
    expect(targets.canUpdateGlobePosition()).toBe(false);
    expect(targets.canApplyClimatePipeline()).toBe(false);
    expect(targets.cloneHeights()).toBeUndefined();
    expect(() => targets.calculateTemperatures()).not.toThrow();
    expect(() => targets.generatePrecipitation()).not.toThrow();
    expect(() => targets.generateRivers()).not.toThrow();
    expect(() => targets.specifyRivers()).not.toThrow();
    expect(() => targets.restoreHeights(new Uint8Array([1]))).not.toThrow();
    expect(() => targets.defineBiomes()).not.toThrow();
    expect(() => targets.defineFeatureGroups()).not.toThrow();
    expect(() => targets.defineLakeNames()).not.toThrow();
    expect(targets.isLayerOn("toggleBiomes")).toBe(false);
    expect(() => targets.drawBiomes()).not.toThrow();
    expect(() => targets.updateThreeD()).not.toThrow();
    expect(() => targets.schedule(vi.fn(), 10)).not.toThrow();
  });

  it("composes climate targets from injected DOM, pipeline, renderer, and scheduler adapters", () => {
    const calculateTemperatures = vi.fn();
    const drawBiomes = vi.fn();
    const schedule = vi.fn();
    const heights = new Uint8Array([1, 2]);
    const targets = createProjectClimateTargets(
      {
        shouldAutoApplyClimate: () => false,
        hasCanvas3d: () => true,
      },
      {
        canUpdateGlobePosition: () => true,
        canApplyClimatePipeline: () => true,
        updateGlobeTemperature: vi.fn(),
        updateGlobePosition: vi.fn(),
        calculateTemperatures,
        generatePrecipitation: vi.fn(),
        cloneHeights: () => heights,
        generateRivers: vi.fn(),
        specifyRivers: vi.fn(),
        restoreHeights: vi.fn(),
        defineBiomes: vi.fn(),
        defineFeatureGroups: vi.fn(),
        defineLakeNames: vi.fn(),
      },
      {
        isLayerOn: () => true,
        drawTemperature: vi.fn(),
        drawPrecipitation: vi.fn(),
        drawBiomes,
        drawCoordinates: vi.fn(),
        drawRivers: vi.fn(),
        updateThreeD: vi.fn(),
      },
      {
        schedule,
      },
    );

    expect(targets.shouldAutoApplyClimate()).toBe(false);
    expect(targets.canApplyClimatePipeline()).toBe(true);
    targets.calculateTemperatures();
    expect(calculateTemperatures).toHaveBeenCalledWith();
    expect(targets.cloneHeights()).toBe(heights);
    expect(targets.isLayerOn("toggleBiomes")).toBe(true);
    targets.drawBiomes();
    expect(drawBiomes).toHaveBeenCalledWith();
    expect(targets.hasCanvas3d()).toBe(true);
    const callback = vi.fn();
    targets.schedule(callback, 10);
    expect(schedule).toHaveBeenCalledWith(callback, 10);
  });
});
