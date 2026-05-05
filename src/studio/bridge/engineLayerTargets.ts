import type { LayerAction } from "./engineActionTypes";

type EngineLayerWindow = Window &
  typeof globalThis &
  Partial<Record<LayerAction, () => void>>;

export type EngineLayerDetailTarget = {
  id: string;
  label: string;
  shortcut: string;
  pinned: boolean;
};

export type EngineLayerRuntimeAdapter = {
  getHandler: (action: LayerAction) => (() => void) | undefined;
  isLayerOn: (action: LayerAction) => boolean;
};

export type EngineLayerDomAdapter = {
  getLayerItems: () => HTMLLIElement[];
};

export type EngineLayerTargets = {
  hasLayerHandler: (action: LayerAction) => boolean;
  isLayerOn: (action: LayerAction) => boolean;
  toggleLayer: (action: LayerAction) => void;
  getLayerDetails: () => EngineLayerDetailTarget[];
};

function getLayerWindow(): EngineLayerWindow {
  try {
    return (globalThis.window ?? globalThis) as EngineLayerWindow;
  } catch {
    return globalThis as EngineLayerWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalLayerRuntimeAdapter(): EngineLayerRuntimeAdapter {
  return {
    isLayerOn: (action) => {
      try {
        return getLayerWindow().layerIsOn?.(action) === true;
      } catch {
        return false;
      }
    },
    getHandler: (action) => {
      try {
        const handler = getLayerWindow()[action];
        return typeof handler === "function" ? handler : undefined;
      } catch {
        return undefined;
      }
    },
  };
}

export function createGlobalLayerDomAdapter(): EngineLayerDomAdapter {
  return {
    getLayerItems: () => {
      try {
        const list = getDocument()?.getElementById("mapLayers");
        if (!list) return [];

        return Array.from(
          list.querySelectorAll<HTMLLIElement>("li[id^='toggle']"),
        );
      } catch {
        return [];
      }
    },
  };
}

export function createLayerTargets(
  runtimeAdapter: EngineLayerRuntimeAdapter,
  domAdapter: EngineLayerDomAdapter,
): EngineLayerTargets {
  return {
    hasLayerHandler: (action) => Boolean(runtimeAdapter.getHandler(action)),
    isLayerOn: (action) => runtimeAdapter.isLayerOn(action),
    toggleLayer: (action) => {
      try {
        runtimeAdapter.getHandler(action)?.();
      } catch {
        // Compatibility layer handlers are best-effort.
      }
    },
    getLayerDetails: () =>
      domAdapter.getLayerItems().map((item) => ({
        id: item.id,
        label: item.textContent?.replace(/\s+/g, " ").trim() || item.id,
        shortcut: item.dataset.shortcut || "",
        pinned: item.classList.contains("solid"),
      })),
  };
}

export function createGlobalLayerTargets(): EngineLayerTargets {
  return createLayerTargets(
    createGlobalLayerRuntimeAdapter(),
    createGlobalLayerDomAdapter(),
  );
}
