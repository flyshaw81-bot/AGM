import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgmRuntimeDataFacade } from "../../modules/agm-runtime-data-facade";
import type { EngineDocumentSourceTargets } from "./engineDocumentSource";
import {
  createGlobalEngineDocumentSourceTargets,
  ensureEngineDocumentSourceTracking,
  getEngineDocumentSourceSummary,
  getEngineSaveTargetSummary,
} from "./engineDocumentSource";

type TestRuntime = {
  AgmRuntimeData?: AgmRuntimeDataFacade;
};

function createTargets(overrides: {
  runtime?: TestRuntime;
  mapFileName?: string;
}): EngineDocumentSourceTargets {
  const store = {};
  const runtime = overrides.runtime ?? { AgmRuntimeData: {} };
  if (!runtime.AgmRuntimeData) runtime.AgmRuntimeData = {};
  return {
    getStore: () => store,
    getMapFileName: () => overrides.mapFileName ?? "Current map",
    getBrowserSnapshotLoader: () => runtime.AgmRuntimeData?.loadBrowserSnapshot,
    setBrowserSnapshotLoader: (loader) => {
      runtime.AgmRuntimeData!.loadBrowserSnapshot = loader;
    },
    getUrlSourceLoader: () => runtime.AgmRuntimeData?.openUrlSource,
    setUrlSourceLoader: (loader) => {
      runtime.AgmRuntimeData!.openUrlSource = loader;
    },
    getFileUploader: () => runtime.AgmRuntimeData?.importProjectFile,
    setFileUploader: (uploader) => {
      runtime.AgmRuntimeData!.importProjectFile = uploader;
    },
    getGeneratedWorldCreator: () =>
      runtime.AgmRuntimeData?.createGeneratedWorld,
    setGeneratedWorldCreator: (creator) => {
      runtime.AgmRuntimeData!.createGeneratedWorld = creator;
    },
    getProjectSaver: () => runtime.AgmRuntimeData?.saveProject,
    setProjectSaver: (saver) => {
      runtime.AgmRuntimeData!.saveProject = saver;
    },
  } as EngineDocumentSourceTargets;
}

describe("engine document source tracking", () => {
  const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "window",
  );
  const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );

  afterEach(() => {
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("tracks browser snapshot loading through injected targets without browser globals", async () => {
    const loadBrowserSnapshot = vi.fn(async () => undefined);
    const targets = createTargets({
      runtime: { AgmRuntimeData: { loadBrowserSnapshot } },
    });

    ensureEngineDocumentSourceTracking(targets);
    await targets.getBrowserSnapshotLoader()?.();

    expect(loadBrowserSnapshot).toHaveBeenCalledWith();
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Browser snapshot",
      sourceDetail: "Browser snapshot",
    });
  });

  it("tracks URL source summaries through injected targets", () => {
    const openUrlSource = vi.fn();
    const targets = createTargets({
      runtime: { AgmRuntimeData: { openUrlSource } },
    });

    ensureEngineDocumentSourceTracking(targets);
    targets.getUrlSourceLoader()?.(
      "https%3A%2F%2Fexample.test%2Fmaps%2Fworld.map",
      1,
    );
    expect(openUrlSource).toHaveBeenCalledWith(
      "https%3A%2F%2Fexample.test%2Fmaps%2Fworld.map",
      1,
    );
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "URL",
      sourceDetail: "example.test/maps/world.map",
    });
  });

  it("tracks upload, generated maps, and save targets through injected targets", async () => {
    const importProjectFile = vi.fn();
    const createGeneratedWorld = vi.fn(async () => undefined);
    const saveProject = vi.fn(async () => undefined);
    const targets = createTargets({
      runtime: {
        AgmRuntimeData: {
          importProjectFile,
          createGeneratedWorld,
          saveProject,
        },
      },
      mapFileName: "Atlas.map",
    });

    ensureEngineDocumentSourceTracking(targets);
    targets.getFileUploader()?.(new File(["map"], "Uploaded.map"));
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Local file",
      sourceDetail: "Uploaded.map",
    });

    await targets.getGeneratedWorldCreator()?.();
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    });

    await targets.getProjectSaver()?.("machine");
    expect(saveProject).toHaveBeenCalledWith("machine");
    expect(getEngineSaveTargetSummary(targets)).toEqual({
      saveLabel: "Downloads",
      saveDetail: "Atlas.map",
    });
  });

  it("keeps global document-source targets safe when browser globals throw", () => {
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
    const targets = createGlobalEngineDocumentSourceTargets();

    expect(targets.getMapFileName()).toBe("Current map");
    expect(targets.getBrowserSnapshotLoader()).toBeUndefined();
    expect(() =>
      targets.setBrowserSnapshotLoader(async () => undefined),
    ).not.toThrow();
    expect(() => ensureEngineDocumentSourceTracking(targets)).not.toThrow();
  });
});
