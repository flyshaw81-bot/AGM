import { describe, expect, it, vi } from "vitest";
import {
  getEngineDocumentState,
  markEngineDocumentClean,
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

    try {
      syncEngineViewport(
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
