import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgmRuntimeDataFacade } from "../../modules/agm-runtime-data-facade";
import type {
  EngineDocumentSourceSummary,
  EngineSaveTargetSummary,
} from "./engineActionTypes";
import {
  createDataActionTargets,
  createGlobalDataActionTargets,
} from "./engineDataActionTargets";

type TestDataGlobals = typeof globalThis & {
  AgmRuntimeData?: AgmRuntimeDataFacade;
  requestStudioInput?: (
    promptText: string,
    options: { default: string; required?: boolean },
    callback: (value: string | number) => void,
  ) => void;
};

const testGlobals = globalThis as TestDataGlobals;
const originalDocument = globalThis.document;
const originalAgmRuntimeData = testGlobals.AgmRuntimeData;
const originalRequestStudioInput = testGlobals.requestStudioInput;
const originalWindow = globalThis.window;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalAgmRuntimeDataDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "AgmRuntimeData",
);
const originalRequestStudioInputDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "requestStudioInput",
);

describe("createGlobalDataActionTargets", () => {
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
    if (originalAgmRuntimeDataDescriptor) {
      Object.defineProperty(
        globalThis,
        "AgmRuntimeData",
        originalAgmRuntimeDataDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "AgmRuntimeData", {
        configurable: true,
        writable: true,
        value: originalAgmRuntimeData,
      });
    }
    if (originalRequestStudioInputDescriptor) {
      Object.defineProperty(
        globalThis,
        "requestStudioInput",
        originalRequestStudioInputDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "requestStudioInput", {
        configurable: true,
        writable: true,
        value: originalRequestStudioInput,
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

  it("reads file input availability from the active document", () => {
    const fileInput = { click: vi.fn() };
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "mapToLoad" ? fileInput : null)),
    } as unknown as Document;

    const targets = createGlobalDataActionTargets();

    expect(targets.hasFileInput()).toBe(true);
    targets.clickFileInput();
    expect(fileInput.click).toHaveBeenCalledWith();
  });

  it("forwards runtime data operations when available", async () => {
    const loadBrowserSnapshot = vi.fn(async () => undefined);
    const saveProject = vi.fn(async () => undefined);
    const createGeneratedWorld = vi.fn(async () => undefined);
    const openUrlSource = vi.fn();
    testGlobals.AgmRuntimeData = {
      loadBrowserSnapshot,
      saveProject,
      createGeneratedWorld,
      openUrlSource,
    };

    const targets = createGlobalDataActionTargets();

    expect(targets.canLoadBrowserSnapshot()).toBe(true);
    await targets.loadBrowserSnapshot();
    await targets.saveProject("storage");
    await targets.createGeneratedWorld();
    targets.openUrlSource();

    expect(loadBrowserSnapshot).toHaveBeenCalledWith();
    expect(saveProject).toHaveBeenCalledWith("storage");
    expect(createGeneratedWorld).toHaveBeenCalledWith();
    expect(openUrlSource).toHaveBeenCalledWith();
  });

  it("uses Studio input for URL loading through the AGM runtime facade", () => {
    const openUrlSource = vi.fn();
    const requestStudioInput = vi.fn(
      (
        _prompt: string,
        _options: { default: string; required?: boolean },
        callback: (value: string | number) => void,
      ) => {
        callback("https://example.test/world.map");
      },
    );
    testGlobals.AgmRuntimeData = { openUrlSource };
    testGlobals.requestStudioInput = requestStudioInput;

    const targets = createGlobalDataActionTargets();

    expect(targets.canOpenUrlSource()).toBe(true);
    targets.openUrlSource();

    expect(requestStudioInput).toHaveBeenCalledWith(
      "Provide URL to map file",
      { default: "", required: true },
      expect.any(Function),
    );
    expect(openUrlSource).toHaveBeenCalledWith(
      "https://example.test/world.map",
    );
  });

  it("keeps default DOM and runtime actions safe when browser helpers are absent", async () => {
    globalThis.document = undefined as unknown as Document;
    globalThis.window = {} as Window & typeof globalThis;

    const targets = createGlobalDataActionTargets();

    expect(targets.hasFileInput()).toBe(false);
    expect(() => targets.clickFileInput()).not.toThrow();
    expect(targets.canLoadBrowserSnapshot()).toBe(false);
    expect(targets.canSaveProject()).toBe(false);
    expect(targets.canCreateGeneratedWorld()).toBe(false);
    expect(targets.canOpenUrlSource()).toBe(false);
    await expect(targets.loadBrowserSnapshot()).resolves.toBeUndefined();
    await expect(targets.saveProject("machine")).resolves.toBeUndefined();
    await expect(targets.createGeneratedWorld()).resolves.toBeUndefined();
    expect(() => targets.openUrlSource()).not.toThrow();
  });

  it("keeps default DOM and runtime actions safe when browser helpers throw", async () => {
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
    Object.defineProperty(globalThis, "AgmRuntimeData", {
      configurable: true,
      get: () => {
        throw new Error("AGM data runtime blocked");
      },
    });

    const targets = createGlobalDataActionTargets();

    expect(targets.hasFileInput()).toBe(false);
    expect(() => targets.clickFileInput()).not.toThrow();
    expect(targets.canLoadBrowserSnapshot()).toBe(false);
    expect(targets.canSaveProject()).toBe(false);
    await expect(targets.loadBrowserSnapshot()).resolves.toBeUndefined();
    await expect(targets.saveProject("machine")).resolves.toBeUndefined();
    expect(() => targets.openUrlSource()).not.toThrow();
  });

  it("composes data action targets from injected document, DOM, and runtime adapters", async () => {
    const documentSummary = {
      sourceLabel: "AGM Core",
      sourceDetail: "Current map",
    } as EngineDocumentSourceSummary;
    const saveSummary = {
      saveLabel: "Browser storage",
      saveDetail: "Local save",
    } satisfies EngineSaveTargetSummary;
    const ensureDocumentSourceTracking = vi.fn();
    const setDocumentSourceSummary = vi.fn();
    const clickFileInput = vi.fn();
    const loadSnapshot = vi.fn(async () => undefined);
    const storeProject = vi.fn(async () => undefined);
    const targets = createDataActionTargets(
      {
        ensureDocumentSourceTracking,
        getDocumentSourceSummary: () => documentSummary,
        getSaveTargetSummary: () => saveSummary,
        setDocumentSourceSummary,
      },
      {
        hasFileInput: () => true,
        clickFileInput,
      },
      {
        canLoadBrowserSnapshot: () => true,
        loadBrowserSnapshot: loadSnapshot,
        canSaveProject: () => true,
        saveProject: storeProject,
        canCreateGeneratedWorld: () => false,
        createGeneratedWorld: async () => undefined,
        canOpenUrlSource: () => false,
        openUrlSource: vi.fn(),
      },
    );

    targets.ensureDocumentSourceTracking();
    expect(ensureDocumentSourceTracking).toHaveBeenCalledWith();
    expect(targets.getDocumentSourceSummary()).toBe(documentSummary);
    expect(targets.getSaveTargetSummary()).toBe(saveSummary);
    targets.setDocumentSourceSummary(documentSummary);
    expect(setDocumentSourceSummary).toHaveBeenCalledWith(documentSummary);
    expect(targets.hasFileInput()).toBe(true);
    targets.clickFileInput();
    expect(clickFileInput).toHaveBeenCalledWith();
    expect(targets.canLoadBrowserSnapshot()).toBe(true);
    await targets.loadBrowserSnapshot();
    await targets.saveProject("machine");
    expect(loadSnapshot).toHaveBeenCalledWith();
    expect(storeProject).toHaveBeenCalledWith("machine");
  });
});
