import type { StudioViewportSync } from "./studioBootstrap";

export type StudioBootstrapDomTargets = {
  enableStudioBody: () => void;
  removeLoadingIndicator: () => void;
  addResizeListener: (callback: () => void) => void;
  getDocumentReadyState: () => DocumentReadyState;
  addDomContentLoadedListener: (callback: () => void) => void;
  setViewportSync: (sync: StudioViewportSync) => void;
};

export function createGlobalStudioBootstrapDomTargets(): StudioBootstrapDomTargets {
  return {
    enableStudioBody: () => {
      document.body.classList.add("studio-enabled");
    },
    removeLoadingIndicator: () => {
      document.getElementById("loading")?.remove();
    },
    addResizeListener: (callback) => {
      window.addEventListener("resize", callback);
    },
    getDocumentReadyState: () => document.readyState,
    addDomContentLoadedListener: (callback) => {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    },
    setViewportSync: (sync) => {
      window.studioViewportSync = sync;
    },
  };
}
