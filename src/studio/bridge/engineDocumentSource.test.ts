import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineDocumentSourceTargets } from "./engineDocumentSource";
import {
  createGlobalEngineDocumentSourceTargets,
  ensureEngineDocumentSourceTracking,
  getEngineDocumentSourceSummary,
  getEngineSaveTargetSummary,
} from "./engineDocumentSource";

type TestRuntime = {
  quickLoad?: () => Promise<void>;
  loadFromDropbox?: () => Promise<void>;
  loadMapFromURL?: (maplink: string, random?: number) => void;
  uploadMap?: (file: Blob | File, callback?: () => void) => void;
  generateMapOnLoad?: () => Promise<void>;
  saveMap?: (method: "storage" | "machine" | "dropbox") => Promise<void>;
};

function createTargets(overrides: {
  runtime?: TestRuntime;
  mapFileName?: string;
  dropboxSourceDetail?: string;
}): EngineDocumentSourceTargets {
  const store = {};
  const runtime = overrides.runtime ?? {};
  const runtimeRecord = runtime as Record<string, unknown>;
  return {
    getStore: () => store,
    getMapFileName: () => overrides.mapFileName ?? "Current map",
    getDropboxSourceDetail: () =>
      overrides.dropboxSourceDetail ?? "Selected file",
    getRuntimeFunction: (key) => runtimeRecord[key as string],
    setRuntimeFunction: (key, value) => {
      runtimeRecord[key as string] = value;
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

  it("tracks quick load through injected targets without browser globals", async () => {
    const quickLoad = vi.fn(async () => undefined);
    const targets = createTargets({ runtime: { quickLoad } });

    ensureEngineDocumentSourceTracking(targets);
    await targets.getRuntimeFunction("quickLoad")?.();

    expect(quickLoad).toHaveBeenCalledWith();
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Browser snapshot",
      sourceDetail: "Quick load",
    });
  });

  it("tracks Dropbox load and URL source summaries through injected targets", async () => {
    const loadFromDropbox = vi.fn(async () => undefined);
    const loadMapFromURL = vi.fn();
    const targets = createTargets({
      runtime: { loadFromDropbox, loadMapFromURL },
      dropboxSourceDetail: "World From Dropbox",
    });

    ensureEngineDocumentSourceTracking(targets);
    await targets.getRuntimeFunction("loadFromDropbox")?.();
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Dropbox",
      sourceDetail: "World From Dropbox",
    });

    targets.getRuntimeFunction("loadMapFromURL")?.(
      "https%3A%2F%2Fexample.test%2Fmaps%2Fworld.map",
      1,
    );
    expect(loadMapFromURL).toHaveBeenCalledWith(
      "https%3A%2F%2Fexample.test%2Fmaps%2Fworld.map",
      1,
    );
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "URL",
      sourceDetail: "example.test/maps/world.map",
    });
  });

  it("tracks upload, generated maps, and save targets through injected targets", async () => {
    const uploadMap = vi.fn();
    const generateMapOnLoad = vi.fn(async () => undefined);
    const saveMap = vi.fn(async () => undefined);
    const targets = createTargets({
      runtime: { uploadMap, generateMapOnLoad, saveMap },
      mapFileName: "Atlas.map",
    });

    ensureEngineDocumentSourceTracking(targets);
    targets.getRuntimeFunction("uploadMap")?.(
      new File(["map"], "Uploaded.map"),
    );
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Local file",
      sourceDetail: "Uploaded.map",
    });

    await targets.getRuntimeFunction("generateMapOnLoad")?.();
    expect(getEngineDocumentSourceSummary(targets)).toEqual({
      sourceLabel: "Generated",
      sourceDetail: "Current settings",
    });

    await targets.getRuntimeFunction("saveMap")?.("machine");
    expect(saveMap).toHaveBeenCalledWith("machine");
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
    expect(targets.getDropboxSourceDetail()).toBe("Selected file");
    expect(targets.getRuntimeFunction("quickLoad")).toBeUndefined();
    expect(() =>
      targets.setRuntimeFunction("quickLoad", async () => undefined),
    ).not.toThrow();
    expect(() => ensureEngineDocumentSourceTracking(targets)).not.toThrow();
  });
});
