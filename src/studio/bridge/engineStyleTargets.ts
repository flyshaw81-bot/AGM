type EngineStyleWindow = typeof globalThis & {
  stylePreset?: {
    value?: string;
  };
  requestStylePresetChange?: (preset: string) => void;
  changeStyle?: (preset: string) => void;
  invokeActiveZooming?: () => void;
};

export type EngineStyleTargets = {
  getCurrentPresetValue: () => string;
  getStoredPresetValue: () => string | null;
  storePresetValue: (preset: string) => void;
  isToggleChecked: (id: string) => boolean;
  setToggleChecked: (id: string, enabled: boolean) => boolean;
  dispatchChange: (element: HTMLElement) => void;
  requestStylePresetChange: (preset: string) => boolean;
  changeStyle: (preset: string) => boolean;
  invokeActiveZooming: () => void;
};

export type EngineStyleRuntimeAdapter = {
  getCurrentPresetValue: () => string;
  requestStylePresetChange: (preset: string) => boolean;
  changeStyle: (preset: string) => boolean;
  invokeActiveZooming: () => void;
};

export type EngineStyleStorageAdapter = {
  getStoredPresetValue: () => string | null;
  storePresetValue: (preset: string) => void;
};

export type EngineStyleToggleAdapter = {
  isToggleChecked: (id: string) => boolean;
  setToggleChecked: (id: string, enabled: boolean) => boolean;
  dispatchChange: (element: HTMLElement) => void;
};

function getStyleWindow(): EngineStyleWindow {
  return (globalThis.window ?? globalThis) as EngineStyleWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function getInput(id: string) {
  return getDocument()?.getElementById(id) as
    | HTMLInputElement
    | null
    | undefined;
}

function dispatchChange(element: HTMLElement) {
  if (typeof globalThis.Event !== "function") {
    return;
  }
  element.dispatchEvent(new globalThis.Event("change", { bubbles: true }));
}

export function createGlobalStyleRuntimeAdapter(): EngineStyleRuntimeAdapter {
  return {
    getCurrentPresetValue: () => getStyleWindow().stylePreset?.value || "",
    requestStylePresetChange: (preset) => {
      const requestChange = getStyleWindow().requestStylePresetChange;
      if (typeof requestChange !== "function") return false;
      requestChange(preset);
      return true;
    },
    changeStyle: (preset) => {
      const changeStyle = getStyleWindow().changeStyle;
      if (typeof changeStyle !== "function") return false;
      changeStyle(preset);
      return true;
    },
    invokeActiveZooming: () => getStyleWindow().invokeActiveZooming?.(),
  };
}

export function createGlobalStyleStorageAdapter(): EngineStyleStorageAdapter {
  return {
    getStoredPresetValue: () =>
      getLocalStorage()?.getItem("presetStyle") ?? null,
    storePresetValue: (preset) => {
      getLocalStorage()?.setItem("presetStyle", preset);
    },
  };
}

export function createGlobalStyleToggleAdapter(): EngineStyleToggleAdapter {
  return {
    isToggleChecked: (id) => Boolean(getInput(id)?.checked),
    setToggleChecked: (id, enabled) => {
      const input = getInput(id);
      if (!input) return false;
      input.checked = enabled;
      dispatchChange(input);
      return true;
    },
    dispatchChange,
  };
}

export function createStyleTargets(
  runtimeAdapter: EngineStyleRuntimeAdapter,
  storageAdapter: EngineStyleStorageAdapter,
  toggleAdapter: EngineStyleToggleAdapter,
): EngineStyleTargets {
  return {
    getCurrentPresetValue: runtimeAdapter.getCurrentPresetValue,
    getStoredPresetValue: storageAdapter.getStoredPresetValue,
    storePresetValue: storageAdapter.storePresetValue,
    isToggleChecked: toggleAdapter.isToggleChecked,
    setToggleChecked: toggleAdapter.setToggleChecked,
    dispatchChange: toggleAdapter.dispatchChange,
    requestStylePresetChange: runtimeAdapter.requestStylePresetChange,
    changeStyle: runtimeAdapter.changeStyle,
    invokeActiveZooming: runtimeAdapter.invokeActiveZooming,
  };
}

export function createGlobalStyleTargets(): EngineStyleTargets {
  return createStyleTargets(
    createGlobalStyleRuntimeAdapter(),
    createGlobalStyleStorageAdapter(),
    createGlobalStyleToggleAdapter(),
  );
}
