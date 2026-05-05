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

export type EngineDropboxState = {
  connectButtonAvailable: boolean;
  connected: boolean;
  buttonsVisible: boolean;
  selectedFile: string;
  selectedLabel: string;
  hasShareLink: boolean;
  shareUrl: string;
};

export type EngineDataActionTargets = {
  ensureDocumentSourceTracking: () => void;
  getDocumentSourceSummary: () => EngineDocumentSourceSummary;
  getSaveTargetSummary: () => EngineSaveTargetSummary;
  setDocumentSourceSummary: (summary: EngineDocumentSourceSummary) => void;
  getDropboxState: () => EngineDropboxState;
  hasFileInput: () => boolean;
  clickFileInput: () => void;
  canQuickLoad: () => boolean;
  quickLoad: () => Promise<void>;
  canSaveMap: () => boolean;
  saveMap: (method: "storage" | "machine" | "dropbox") => Promise<void>;
  canConnectDropbox: () => boolean;
  connectDropbox: () => Promise<void>;
  canLoadFromDropbox: () => boolean;
  loadFromDropbox: () => Promise<void>;
  canShareDropbox: () => boolean;
  createSharableDropboxLink: () => Promise<void>;
  canGenerateMapOnLoad: () => boolean;
  generateMapOnLoad: () => Promise<void>;
  canLoadUrl: () => boolean;
  loadUrl: () => void;
};

export type EngineDataDocumentSourceAdapter = {
  ensureDocumentSourceTracking: () => void;
  getDocumentSourceSummary: () => EngineDocumentSourceSummary;
  getSaveTargetSummary: () => EngineSaveTargetSummary;
  setDocumentSourceSummary: (summary: EngineDocumentSourceSummary) => void;
};

export type EngineDataDomAdapter = {
  getDropboxState: () => EngineDropboxState;
  hasFileInput: () => boolean;
  clickFileInput: () => void;
};

export type EngineDataRuntimeAdapter = {
  canQuickLoad: () => boolean;
  quickLoad: () => Promise<void>;
  canSaveMap: () => boolean;
  saveMap: (method: "storage" | "machine" | "dropbox") => Promise<void>;
  canConnectDropbox: () => boolean;
  connectDropbox: () => Promise<void>;
  canLoadFromDropbox: () => boolean;
  loadFromDropbox: () => Promise<void>;
  canShareDropbox: () => boolean;
  createSharableDropboxLink: () => Promise<void>;
  canGenerateMapOnLoad: () => boolean;
  generateMapOnLoad: () => Promise<void>;
  canLoadUrl: () => boolean;
  loadUrl: () => void;
};

type EngineDataWindow = typeof globalThis & {
  quickLoad?: () => Promise<void>;
  saveMap?: (method: "storage" | "machine" | "dropbox") => Promise<void>;
  connectToDropbox?: () => Promise<void>;
  loadFromDropbox?: () => Promise<void>;
  createSharableDropboxLink?: () => Promise<void>;
  generateMapOnLoad?: () => Promise<void>;
  loadURL?: () => void;
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

function getSelectedDropboxLabel(select: HTMLSelectElement | null | undefined) {
  return select?.selectedOptions?.[0]?.textContent?.trim() || "";
}

function getRuntimeFunction<K extends keyof EngineDataWindow>(
  key: K,
): EngineDataWindow[K] | undefined {
  try {
    const value = getDataWindow()[key];
    return typeof value === "function" ? value : undefined;
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
    getDropboxState: () => {
      try {
        const dropboxConnectButton = getElement<HTMLButtonElement>(
          "dropboxConnectButton",
        );
        const dropboxSelect = getElement<HTMLSelectElement>(
          "loadFromDropboxSelect",
        );
        const dropboxButtons = getElement<HTMLDivElement>(
          "loadFromDropboxButtons",
        );
        const sharableLinkContainer = getElement<HTMLDivElement>(
          "sharableLinkContainer",
        );
        const sharableLink = getElement<HTMLAnchorElement>("sharableLink");
        const selectedFile = dropboxSelect?.value || "";
        const connected = Boolean(
          dropboxSelect && dropboxSelect.style.display !== "none",
        );
        const buttonsVisible = Boolean(
          dropboxButtons && dropboxButtons.style.display !== "none",
        );

        return {
          connectButtonAvailable: Boolean(dropboxConnectButton),
          connected,
          buttonsVisible,
          selectedFile,
          selectedLabel: getSelectedDropboxLabel(dropboxSelect),
          hasShareLink: Boolean(
            sharableLinkContainer &&
              sharableLinkContainer.style.display !== "none",
          ),
          shareUrl: sharableLink?.href || "",
        };
      } catch {
        return {
          connectButtonAvailable: false,
          connected: false,
          buttonsVisible: false,
          selectedFile: "",
          selectedLabel: "",
          hasShareLink: false,
          shareUrl: "",
        };
      }
    },
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
  return {
    canQuickLoad: () => Boolean(getRuntimeFunction("quickLoad")),
    quickLoad: () =>
      callRuntimePromise(
        getRuntimeFunction("quickLoad") as (() => Promise<void>) | undefined,
      ),
    canSaveMap: () => Boolean(getRuntimeFunction("saveMap")),
    saveMap: (method) =>
      callRuntimePromise(
        getRuntimeFunction("saveMap")?.bind(undefined, method) as
          | (() => Promise<void>)
          | undefined,
      ),
    canConnectDropbox: () => Boolean(getRuntimeFunction("connectToDropbox")),
    connectDropbox: () =>
      callRuntimePromise(
        getRuntimeFunction("connectToDropbox") as
          | (() => Promise<void>)
          | undefined,
      ),
    canLoadFromDropbox: () => Boolean(getRuntimeFunction("loadFromDropbox")),
    loadFromDropbox: () =>
      callRuntimePromise(
        getRuntimeFunction("loadFromDropbox") as
          | (() => Promise<void>)
          | undefined,
      ),
    canShareDropbox: () =>
      Boolean(getRuntimeFunction("createSharableDropboxLink")),
    createSharableDropboxLink: () =>
      callRuntimePromise(
        getRuntimeFunction("createSharableDropboxLink") as
          | (() => Promise<void>)
          | undefined,
      ),
    canGenerateMapOnLoad: () =>
      Boolean(getRuntimeFunction("generateMapOnLoad")),
    generateMapOnLoad: () =>
      callRuntimePromise(
        getRuntimeFunction("generateMapOnLoad") as
          | (() => Promise<void>)
          | undefined,
      ),
    canLoadUrl: () => Boolean(getRuntimeFunction("loadURL")),
    loadUrl: () => {
      try {
        (getRuntimeFunction("loadURL") as (() => void) | undefined)?.();
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
    getDropboxState: domAdapter.getDropboxState,
    hasFileInput: domAdapter.hasFileInput,
    clickFileInput: domAdapter.clickFileInput,
    canQuickLoad: runtimeAdapter.canQuickLoad,
    quickLoad: runtimeAdapter.quickLoad,
    canSaveMap: runtimeAdapter.canSaveMap,
    saveMap: runtimeAdapter.saveMap,
    canConnectDropbox: runtimeAdapter.canConnectDropbox,
    connectDropbox: runtimeAdapter.connectDropbox,
    canLoadFromDropbox: runtimeAdapter.canLoadFromDropbox,
    loadFromDropbox: runtimeAdapter.loadFromDropbox,
    canShareDropbox: runtimeAdapter.canShareDropbox,
    createSharableDropboxLink: runtimeAdapter.createSharableDropboxLink,
    canGenerateMapOnLoad: runtimeAdapter.canGenerateMapOnLoad,
    generateMapOnLoad: runtimeAdapter.generateMapOnLoad,
    canLoadUrl: runtimeAdapter.canLoadUrl,
    loadUrl: runtimeAdapter.loadUrl,
  };
}

export function createGlobalDataActionTargets(): EngineDataActionTargets {
  return createDataActionTargets(
    createGlobalDataDocumentSourceAdapter(),
    createGlobalDataDomAdapter(),
    createGlobalDataRuntimeAdapter(),
  );
}
