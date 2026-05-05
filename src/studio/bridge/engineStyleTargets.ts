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
  try {
    return (globalThis.window ?? globalThis) as EngineStyleWindow;
  } catch {
    return globalThis as EngineStyleWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function getInput(id: string) {
  try {
    return getDocument()?.getElementById(id) as
      | HTMLInputElement
      | null
      | undefined;
  } catch {
    return undefined;
  }
}

function dispatchChange(element: HTMLElement) {
  try {
    if (typeof globalThis.Event !== "function") {
      return;
    }
    element.dispatchEvent(new globalThis.Event("change", { bubbles: true }));
  } catch {
    // Compatibility DOM events are best-effort.
  }
}

export function createGlobalStyleRuntimeAdapter(): EngineStyleRuntimeAdapter {
  return {
    getCurrentPresetValue: () => {
      try {
        return getStyleWindow().stylePreset?.value || "";
      } catch {
        return "";
      }
    },
    requestStylePresetChange: (preset) => {
      try {
        const requestChange = getStyleWindow().requestStylePresetChange;
        if (typeof requestChange !== "function") return false;
        requestChange(preset);
        return true;
      } catch {
        return false;
      }
    },
    changeStyle: (preset) => {
      try {
        const changeStyle = getStyleWindow().changeStyle;
        if (typeof changeStyle !== "function") return false;
        changeStyle(preset);
        return true;
      } catch {
        return false;
      }
    },
    invokeActiveZooming: () => {
      try {
        getStyleWindow().invokeActiveZooming?.();
      } catch {
        // Compatibility zoom refresh is best-effort.
      }
    },
  };
}

export function createGlobalStyleStorageAdapter(): EngineStyleStorageAdapter {
  return {
    getStoredPresetValue: () => {
      try {
        return getLocalStorage()?.getItem("presetStyle") ?? null;
      } catch {
        return null;
      }
    },
    storePresetValue: (preset) => {
      try {
        getLocalStorage()?.setItem("presetStyle", preset);
      } catch {
        // Preset storage is optional in compatibility mode.
      }
    },
  };
}

export function createGlobalStyleToggleAdapter(): EngineStyleToggleAdapter {
  return {
    isToggleChecked: (id) => Boolean(getInput(id)?.checked),
    setToggleChecked: (id, enabled) => {
      try {
        const input = getInput(id);
        if (!input) return false;
        input.checked = enabled;
        dispatchChange(input);
        return true;
      } catch {
        return false;
      }
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
