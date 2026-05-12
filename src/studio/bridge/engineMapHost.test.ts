import { describe, expect, it, vi } from "vitest";
import {
  getEngineDocumentState,
  markEngineDocumentClean,
  readEngineViewportStatePatch,
  setEngineDocumentName,
  syncEngineViewport,
} from "./engineMapHost";
import type {
  EngineDocumentBaseline,
  EngineMapHostTargets,
} from "./engineMapHostTargets";

function createTargets(candidate: EngineDocumentBaseline) {
  const store: { __studioEngineDocumentBaseline?: EngineDocumentBaseline } = {};
  const setDocumentName = vi.fn();
  const frameScaler = { style: {} } as HTMLElement;
  const frame = { dataset: {}, style: {} } as HTMLElement;
  const stage = {} as HTMLElement;
  const map = { style: {} } as SVGSVGElement;
  const viewbox = {} as Element;
  const targets: EngineMapHostTargets = {
    getBaselineStore: () => store,
    getDocumentBaselineCandidate: vi.fn(() => candidate),
    setDocumentName,
    getViewportElements: () => ({ frameScaler, frame, stage, map }),
    getStageInnerSize: () => ({ width: 1000, height: 800 }),
    syncViewportSize: vi.fn(),
    applyFrameSize: vi.fn(),
    applyFrameScalerSize: vi.fn(),
    applyMapSize: vi.fn(),
    getContentFitTarget: () => ({
      graphWidth: 1440,
      graphHeight: 900,
      viewbox,
    }),
    applyViewboxTransform: vi.fn(),
    syncSvgCompatibility: vi.fn(),
  };
  return {
    targets,
    store,
    setDocumentName,
    frameScaler,
    frame,
    stage,
    map,
    viewbox,
  };
}

describe("engine map host document state", () => {
  it("marks the current engine document baseline clean", () => {
    const candidate = {
      mapId: "map-1",
      name: "Atlas",
      documentWidth: 1000,
      documentHeight: 800,
      seed: "seed-1",
      stylePreset: "default",
    };
    const { targets, store } = createTargets(candidate);

    markEngineDocumentClean(targets);

    expect(store.__studioEngineDocumentBaseline).toEqual(candidate);
  });

  it("initializes baseline and reports clean state for the current document", () => {
    const { targets } = createTargets({
      mapId: "map-1",
      name: "Atlas",
      documentWidth: 1000,
      documentHeight: 800,
      seed: "seed-1",
      stylePreset: "default",
    });

    expect(getEngineDocumentState(targets)).toEqual({
      name: "Atlas",
      documentWidth: 1000,
      documentHeight: 800,
      seed: "seed-1",
      stylePreset: "default",
      dirty: false,
      source: "core",
    });
  });

  it("detects dirty state against an existing baseline", () => {
    const { targets, store } = createTargets({
      mapId: "map-1",
      name: "Atlas v2",
      documentWidth: 1000,
      documentHeight: 800,
      seed: "seed-1",
      stylePreset: "default",
    });
    store.__studioEngineDocumentBaseline = {
      mapId: "map-1",
      name: "Atlas",
      documentWidth: 1000,
      documentHeight: 800,
      seed: "seed-1",
      stylePreset: "default",
    };

    expect(getEngineDocumentState(targets).dirty).toBe(true);
  });

  it("trims document names and writes them through targets", () => {
    const { targets, setDocumentName } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });

    expect(setEngineDocumentName("  New Atlas  ", targets)).toBe("New Atlas");
    expect(setEngineDocumentName("  ", targets)).toBe("Untitled map");
    expect(setDocumentName).toHaveBeenCalledWith("New Atlas");
    expect(setDocumentName).toHaveBeenCalledWith("Untitled map");
  });

  it("syncs viewport frame and map sizing through targets", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, frameScaler, frame, map, viewbox } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });

    let syncedSize: ReturnType<typeof syncEngineViewport>;
    try {
      syncedSize = syncEngineViewport(
        "desktop-landscape",
        "landscape",
        "contain",
        1,
        0,
        0,
        targets,
      );
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(syncedSize).toEqual({ width: 1440, height: 900 });
    expect(targets.applyFrameSize).toHaveBeenCalledWith(
      frame,
      1440,
      900,
      "landscape",
      "contain",
    );
    expect(targets.applyFrameScalerSize).toHaveBeenCalledWith(
      frameScaler,
      frame,
      1440,
      900,
      expect.any(Number),
    );
    expect(targets.syncViewportSize).toHaveBeenCalledWith(1440, 900);
    expect(targets.applyMapSize).toHaveBeenCalledWith(map, 1440, 900);
    expect(targets.applyViewboxTransform).toHaveBeenCalledWith(
      viewbox,
      "translate(0 0) scale(1)",
    );
    expect(targets.syncSvgCompatibility).toHaveBeenCalledWith(1440, 900);
  });

  it("reads compatible D3 zoom back into Studio viewport state", () => {
    const { targets, map } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });
    const fitScale = 788 / 900;
    const contentScale = fitScale * 2;
    const panX = 120;
    const panY = -40;
    const viewportWidth = 1260;
    const viewportHeight = 788;
    (
      map as SVGSVGElement & {
        __zoom: { x: number; y: number; k: number };
        getAttribute: (name: string) => string | null;
      }
    ).__zoom = {
      x: (viewportWidth - 1440 * contentScale) / 2 + panX,
      y: (viewportHeight - 900 * contentScale) / 2 + panY,
      k: contentScale,
    };
    (
      map as SVGSVGElement & {
        getAttribute: (name: string) => string | null;
      }
    ).getAttribute = vi.fn((name: string) =>
      name === "width" ? String(viewportWidth) : String(viewportHeight),
    );

    const patch = readEngineViewportStatePatch(
      "desktop-landscape",
      "landscape",
      "cover",
      targets,
    );

    expect(patch?.zoom).toBeCloseTo(2);
    expect(patch?.panX).toBeCloseTo(panX);
    expect(patch?.panY).toBeCloseTo(panY);
  });

  it("fits the native workbench frame inside the stage without scaler overflow", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, frameScaler, frame, map, stage, viewbox } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });
    (
      stage as HTMLElement & { closest: (selector: string) => Element | null }
    ).closest = vi.fn((selector) =>
      selector === ".studio-native-app" ? ({} as Element) : null,
    );
    targets.getStageInnerSize = vi.fn(() => ({ width: 1260, height: 856 }));

    try {
      syncEngineViewport(
        "desktop-landscape",
        "landscape",
        "cover",
        1,
        0,
        0,
        targets,
      );
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(targets.applyFrameSize).toHaveBeenCalledWith(
      frame,
      1260,
      788,
      "landscape",
      "cover",
    );
    expect(targets.applyFrameScalerSize).toHaveBeenCalledWith(
      frameScaler,
      frame,
      1260,
      788,
      1,
    );
    expect(targets.syncViewportSize).toHaveBeenCalledWith(1260, 788);
    expect(targets.applyMapSize).toHaveBeenCalledWith(map, 1260, 788);
    expect(targets.applyViewboxTransform).toHaveBeenCalledWith(
      viewbox,
      expect.stringContaining("scale(0.875"),
    );
    expect(targets.syncSvgCompatibility).toHaveBeenCalledWith(1260, 788);
  });

  it("keeps a native landscape frame inside the stage when height is constrained", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, frameScaler, frame, map, stage } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });
    (
      stage as HTMLElement & { closest: (selector: string) => Element | null }
    ).closest = vi.fn((selector) =>
      selector === ".studio-native-app" ? ({} as Element) : null,
    );
    targets.getStageInnerSize = vi.fn(() => ({ width: 1260, height: 700 }));

    try {
      syncEngineViewport(
        "desktop-landscape",
        "landscape",
        "cover",
        1,
        0,
        0,
        targets,
      );
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(targets.applyFrameSize).toHaveBeenCalledWith(
      frame,
      1120,
      700,
      "landscape",
      "cover",
    );
    expect(targets.applyFrameScalerSize).toHaveBeenCalledWith(
      frameScaler,
      frame,
      1120,
      700,
      1,
    );
    expect(targets.applyMapSize).toHaveBeenCalledWith(map, 1120, 700);
  });

  it("uses the largest complete native frame for a classic 4:3 canvas", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, frameScaler, frame, map, stage } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });
    (
      stage as HTMLElement & { closest: (selector: string) => Element | null }
    ).closest = vi.fn((selector) =>
      selector === ".studio-native-app" ? ({} as Element) : null,
    );
    targets.getStageInnerSize = vi.fn(() => ({ width: 1868, height: 995 }));

    try {
      syncEngineViewport(
        "classic-landscape",
        "landscape",
        "cover",
        1,
        0,
        0,
        targets,
      );
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(targets.applyFrameSize).toHaveBeenCalledWith(
      frame,
      1327,
      995,
      "landscape",
      "cover",
    );
    expect(targets.applyFrameScalerSize).toHaveBeenCalledWith(
      frameScaler,
      frame,
      1327,
      995,
      1,
    );
    expect(targets.applyMapSize).toHaveBeenCalledWith(map, 1327, 995);
  });

  it("does not rotate landscape map content inside a square canvas", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, viewbox } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });

    try {
      syncEngineViewport("square", "portrait", "cover", 1, 0, 0, targets);
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(targets.applyViewboxTransform).toHaveBeenCalledWith(
      viewbox,
      expect.not.stringContaining("rotate(90)"),
    );
  });

  it("switches the native workbench frame to a portrait adaptive container", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, frameScaler, frame, map, stage, viewbox } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });
    (
      stage as HTMLElement & { closest: (selector: string) => Element | null }
    ).closest = vi.fn((selector) =>
      selector === ".studio-native-app" ? ({} as Element) : null,
    );
    targets.getStageInnerSize = vi.fn(() => ({ width: 1260, height: 856 }));

    try {
      syncEngineViewport(
        "desktop-landscape",
        "portrait",
        "cover",
        1,
        0,
        0,
        targets,
      );
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(targets.applyFrameSize).toHaveBeenCalledWith(
      frame,
      535,
      856,
      "portrait",
      "cover",
    );
    expect(targets.applyFrameScalerSize).toHaveBeenCalledWith(
      frameScaler,
      frame,
      535,
      856,
      1,
    );
    expect(targets.syncViewportSize).toHaveBeenCalledWith(535, 856);
    expect(targets.applyMapSize).toHaveBeenCalledWith(map, 535, 856);
    expect(targets.applyViewboxTransform).toHaveBeenCalledWith(
      viewbox,
      "translate(0 0) scale(0.5944444444444444) translate(900 0) rotate(90)",
    );
    expect(targets.syncSvgCompatibility).toHaveBeenCalledWith(535, 856);
  });

  it("rotates content for portrait viewport when graph is landscape", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = {} as Window & typeof globalThis;
    globalThis.document = {
      getElementById: vi.fn(() => null),
    } as unknown as Document;
    const { targets, viewbox } = createTargets({
      mapId: "",
      name: "Atlas",
      documentWidth: 0,
      documentHeight: 0,
      seed: "",
      stylePreset: "default",
    });

    try {
      syncEngineViewport(
        "desktop-landscape",
        "portrait",
        "contain",
        1,
        0,
        0,
        targets,
      );
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }

    expect(targets.applyViewboxTransform).toHaveBeenCalledWith(
      viewbox,
      "translate(0 0) scale(1) translate(900 0) rotate(90)",
    );
  });
});
