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
  return (globalThis.window ?? globalThis) as EngineDataWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function getElement<T extends HTMLElement>(id: string) {
  return getDocument()?.getElementById(id) as T | null | undefined;
}

function getSelectedDropboxLabel(select: HTMLSelectElement | null | undefined) {
  return select?.selectedOptions?.[0]?.textContent?.trim() || "";
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
    },
    hasFileInput: () => Boolean(getElement<HTMLInputElement>("mapToLoad")),
    clickFileInput: () => getElement<HTMLInputElement>("mapToLoad")?.click(),
  };
}

export function createGlobalDataRuntimeAdapter(): EngineDataRuntimeAdapter {
  return {
    canQuickLoad: () => typeof getDataWindow().quickLoad === "function",
    quickLoad: () => getDataWindow().quickLoad?.() ?? Promise.resolve(),
    canSaveMap: () => typeof getDataWindow().saveMap === "function",
    saveMap: (method) => getDataWindow().saveMap?.(method) ?? Promise.resolve(),
    canConnectDropbox: () =>
      typeof getDataWindow().connectToDropbox === "function",
    connectDropbox: () =>
      getDataWindow().connectToDropbox?.() ?? Promise.resolve(),
    canLoadFromDropbox: () =>
      typeof getDataWindow().loadFromDropbox === "function",
    loadFromDropbox: () =>
      getDataWindow().loadFromDropbox?.() ?? Promise.resolve(),
    canShareDropbox: () =>
      typeof getDataWindow().createSharableDropboxLink === "function",
    createSharableDropboxLink: () =>
      getDataWindow().createSharableDropboxLink?.() ?? Promise.resolve(),
    canGenerateMapOnLoad: () =>
      typeof getDataWindow().generateMapOnLoad === "function",
    generateMapOnLoad: () =>
      getDataWindow().generateMapOnLoad?.() ?? Promise.resolve(),
    canLoadUrl: () => typeof getDataWindow().loadURL === "function",
    loadUrl: () => getDataWindow().loadURL?.(),
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
