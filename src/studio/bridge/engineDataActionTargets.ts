import {
  type AgmRuntimeDataFacade,
  getAgmRuntimeDataFacade,
} from "../../modules/agm-runtime-data-facade";
import type {
  EngineDocumentSourceSummary,
  EngineSaveTargetSummary,
} from "./engineActionTypes";
import {
  ensureEngineDocumentSourceTracking,
  getEngineDocumentSourceSummary,
  getEngineSaveTargetSummary,
  setEngineDocumentSourceSummary,
} from "./engineDocumentSource";

export type EngineDataActionTargets = {
  ensureDocumentSourceTracking: () => void;
  getDocumentSourceSummary: () => EngineDocumentSourceSummary;
  getSaveTargetSummary: () => EngineSaveTargetSummary;
  setDocumentSourceSummary: (summary: EngineDocumentSourceSummary) => void;
  hasFileInput: () => boolean;
  clickFileInput: () => void;
  canLoadBrowserSnapshot: () => boolean;
  loadBrowserSnapshot: () => Promise<void>;
  canSaveProject: () => boolean;
  saveProject: (target: "storage" | "machine") => Promise<void>;
  canCreateGeneratedWorld: () => boolean;
  createGeneratedWorld: () => Promise<void>;
  canOpenUrlSource: () => boolean;
  openUrlSource: () => void;
};

export type EngineDataDocumentSourceAdapter = {
  ensureDocumentSourceTracking: () => void;
  getDocumentSourceSummary: () => EngineDocumentSourceSummary;
  getSaveTargetSummary: () => EngineSaveTargetSummary;
  setDocumentSourceSummary: (summary: EngineDocumentSourceSummary) => void;
};

export type EngineDataDomAdapter = {
  hasFileInput: () => boolean;
  clickFileInput: () => void;
};

export type EngineDataRuntimeAdapter = {
  canLoadBrowserSnapshot: () => boolean;
  loadBrowserSnapshot: () => Promise<void>;
  canSaveProject: () => boolean;
  saveProject: (target: "storage" | "machine") => Promise<void>;
  canCreateGeneratedWorld: () => boolean;
  createGeneratedWorld: () => Promise<void>;
  canOpenUrlSource: () => boolean;
  openUrlSource: () => void;
};

type EngineDataWindow = typeof globalThis & {
  AgmRuntimeData?: AgmRuntimeDataFacade;
  requestStudioInput?: (
    promptText: string,
    options: { default: string; required?: boolean },
    callback: (value: string | number) => void,
  ) => void;
};

type AgmDataRuntimeOperations = {
  loadBrowserSnapshot?: () => Promise<void>;
  saveProject?: (target: "storage" | "machine") => Promise<void>;
  createGeneratedWorld?: () => Promise<void>;
  requestStudioInput?: EngineDataWindow["requestStudioInput"];
  openUrlSource?: AgmRuntimeDataFacade["openUrlSource"];
};

function getDataWindow(): EngineDataWindow {
  try {
    return (globalThis.window ?? globalThis) as EngineDataWindow;
  } catch {
    return globalThis as EngineDataWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getElement<T extends HTMLElement>(id: string) {
  try {
    return getDocument()?.getElementById(id) as T | null | undefined;
  } catch {
    return undefined;
  }
}

function callRuntimePromise(
  action: (() => Promise<void>) | undefined,
): Promise<void> {
  try {
    return action?.() ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

function createAgmDataRuntimeOperations(
  runtime = getDataWindow(),
): AgmDataRuntimeOperations {
  const dataFacade = getAgmRuntimeDataFacade(runtime);

  return {
    loadBrowserSnapshot: dataFacade.loadBrowserSnapshot,
    saveProject: dataFacade.saveProject,
    createGeneratedWorld: dataFacade.createGeneratedWorld,
    requestStudioInput:
      typeof runtime.requestStudioInput === "function"
        ? runtime.requestStudioInput
        : undefined,
    openUrlSource: dataFacade.openUrlSource,
  };
}

function hasAgmUrlSourceRequest(runtime: AgmDataRuntimeOperations) {
  return Boolean(runtime.openUrlSource && runtime.requestStudioInput);
}

function requestAgmUrlSource(runtime: AgmDataRuntimeOperations) {
  if (!runtime.openUrlSource) return false;
  if (!runtime.requestStudioInput) {
    runtime.openUrlSource();
    return true;
  }

  runtime.requestStudioInput(
    "Provide URL to map file",
    { default: "", required: true },
    (value) => {
      const url = String(value || "").trim();
      if (!url) return;
      runtime.openUrlSource?.(url);
    },
  );
  return true;
}

export function createGlobalDataDocumentSourceAdapter(): EngineDataDocumentSourceAdapter {
  return {
    ensureDocumentSourceTracking: ensureEngineDocumentSourceTracking,
    getDocumentSourceSummary: getEngineDocumentSourceSummary,
    getSaveTargetSummary: getEngineSaveTargetSummary,
    setDocumentSourceSummary: setEngineDocumentSourceSummary,
  };
}

export function createGlobalDataDomAdapter(): EngineDataDomAdapter {
  return {
    hasFileInput: () => Boolean(getElement<HTMLInputElement>("mapToLoad")),
    clickFileInput: () => {
      try {
        getElement<HTMLInputElement>("mapToLoad")?.click();
      } catch {
        // Compatibility DOM click is best-effort.
      }
    },
  };
}

export function createGlobalDataRuntimeAdapter(): EngineDataRuntimeAdapter {
  const getRuntime = () => createAgmDataRuntimeOperations();

  return {
    canLoadBrowserSnapshot: () => Boolean(getRuntime().loadBrowserSnapshot),
    loadBrowserSnapshot: () =>
      callRuntimePromise(getRuntime().loadBrowserSnapshot),
    canSaveProject: () => Boolean(getRuntime().saveProject),
    saveProject: (target) =>
      callRuntimePromise(getRuntime().saveProject?.bind(undefined, target)),
    canCreateGeneratedWorld: () => Boolean(getRuntime().createGeneratedWorld),
    createGeneratedWorld: () =>
      callRuntimePromise(getRuntime().createGeneratedWorld),
    canOpenUrlSource: () => {
      const runtime = getRuntime();
      return hasAgmUrlSourceRequest(runtime);
    },
    openUrlSource: () => {
      try {
        const runtime = getRuntime();
        requestAgmUrlSource(runtime);
      } catch {
        // Compatibility URL loading is best-effort.
      }
    },
  };
}

export function createDataActionTargets(
  documentSourceAdapter: EngineDataDocumentSourceAdapter,
  domAdapter: EngineDataDomAdapter,
  runtimeAdapter: EngineDataRuntimeAdapter,
): EngineDataActionTargets {
  return {
    ensureDocumentSourceTracking:
      documentSourceAdapter.ensureDocumentSourceTracking,
    getDocumentSourceSummary: documentSourceAdapter.getDocumentSourceSummary,
    getSaveTargetSummary: documentSourceAdapter.getSaveTargetSummary,
    setDocumentSourceSummary: documentSourceAdapter.setDocumentSourceSummary,
    hasFileInput: domAdapter.hasFileInput,
    clickFileInput: domAdapter.clickFileInput,
    canLoadBrowserSnapshot: runtimeAdapter.canLoadBrowserSnapshot,
    loadBrowserSnapshot: runtimeAdapter.loadBrowserSnapshot,
    canSaveProject: runtimeAdapter.canSaveProject,
    saveProject: runtimeAdapter.saveProject,
    canCreateGeneratedWorld: runtimeAdapter.canCreateGeneratedWorld,
    createGeneratedWorld: runtimeAdapter.createGeneratedWorld,
    canOpenUrlSource: runtimeAdapter.canOpenUrlSource,
    openUrlSource: runtimeAdapter.openUrlSource,
  };
}

export function createGlobalDataActionTargets(): EngineDataActionTargets {
  return createDataActionTargets(
    createGlobalDataDocumentSourceAdapter(),
    createGlobalDataDomAdapter(),
    createGlobalDataRuntimeAdapter(),
  );
}
