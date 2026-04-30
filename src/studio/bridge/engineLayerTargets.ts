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

export type EngineLayerTargets = {
  hasLayerHandler: (action: LayerAction) => boolean;
  isLayerOn: (action: LayerAction) => boolean;
  toggleLayer: (action: LayerAction) => void;
  getLayerDetails: () => EngineLayerDetailTarget[];
};

function getLayerWindow(): EngineLayerWindow {
  return (globalThis.window ?? globalThis) as EngineLayerWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

export function createGlobalLayerTargets(): EngineLayerTargets {
  return {
    hasLayerHandler: (action) => typeof getLayerWindow()[action] === "function",
    isLayerOn: (action) => getLayerWindow().layerIsOn?.(action) === true,
    toggleLayer: (action) => getLayerWindow()[action]?.(),
    getLayerDetails: () => {
      const list = getDocument()?.getElementById("mapLayers");
      if (!list) return [];

      return Array.from(
        list.querySelectorAll<HTMLLIElement>("li[id^='toggle']"),
      ).map((item) => ({
        id: item.id,
        label: item.textContent?.replace(/\s+/g, " ").trim() || item.id,
        shortcut: item.dataset.shortcut || "",
        pinned: item.classList.contains("solid"),
      }));
    },
  };
}
