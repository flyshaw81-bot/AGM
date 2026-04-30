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

function getStyleWindow(): EngineStyleWindow {
  return (globalThis.window ?? globalThis) as EngineStyleWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function getLocalStorage(): Storage | undefined {
  return globalThis.localStorage;
}

function getInput(id: string) {
  return getDocument()?.getElementById(id) as
    | HTMLInputElement
    | null
    | undefined;
}

function dispatchChange(element: HTMLElement) {
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function createGlobalStyleTargets(): EngineStyleTargets {
  return {
    getCurrentPresetValue: () => getStyleWindow().stylePreset?.value || "",
    getStoredPresetValue: () =>
      getLocalStorage()?.getItem("presetStyle") ?? null,
    storePresetValue: (preset) => {
      getLocalStorage()?.setItem("presetStyle", preset);
    },
    isToggleChecked: (id) => Boolean(getInput(id)?.checked),
    setToggleChecked: (id, enabled) => {
      const input = getInput(id);
      if (!input) return false;
      input.checked = enabled;
      dispatchChange(input);
      return true;
    },
    dispatchChange,
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
