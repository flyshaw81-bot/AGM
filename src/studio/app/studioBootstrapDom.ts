import type { StudioViewportSync } from "./studioBootstrapTargets";

export type StudioBootstrapBodyAdapter = {
  enableStudioBody: () => void;
  removeLoadingIndicator: () => void;
};

export type StudioBootstrapBrowserEventAdapter = {
  addResizeListener: (callback: () => void) => void;
  getDocumentReadyState: () => DocumentReadyState;
  addDomContentLoadedListener: (callback: () => void) => void;
};

export type StudioBootstrapViewportSyncAdapter = {
  setViewportSync: (sync: StudioViewportSync) => void;
};

export type StudioBootstrapDomTargets = StudioBootstrapBodyAdapter &
  StudioBootstrapBrowserEventAdapter &
  StudioBootstrapViewportSyncAdapter;

export function createGlobalStudioBootstrapBodyAdapter(): StudioBootstrapBodyAdapter {
  return {
    enableStudioBody: () => {
      globalThis.document?.body?.classList.add("studio-enabled");
    },
    removeLoadingIndicator: () => {
      globalThis.document?.getElementById("loading")?.remove();
    },
  };
}

export function createGlobalStudioBootstrapBrowserEventAdapter(): StudioBootstrapBrowserEventAdapter {
  return {
    addResizeListener: (callback) => {
      globalThis.window?.addEventListener("resize", callback);
    },
    getDocumentReadyState: () => globalThis.document?.readyState ?? "complete",
    addDomContentLoadedListener: (callback) => {
      globalThis.document?.addEventListener("DOMContentLoaded", callback, {
        once: true,
      });
    },
  };
}

export function createGlobalStudioBootstrapViewportSyncAdapter(): StudioBootstrapViewportSyncAdapter {
  return {
    setViewportSync: (sync) => {
      if (globalThis.window) globalThis.window.studioViewportSync = sync;
    },
  };
}

export function createStudioBootstrapDomTargets(
  body: StudioBootstrapBodyAdapter,
  browserEvents: StudioBootstrapBrowserEventAdapter,
  viewportSync: StudioBootstrapViewportSyncAdapter,
): StudioBootstrapDomTargets {
  return {
    enableStudioBody: body.enableStudioBody,
    removeLoadingIndicator: body.removeLoadingIndicator,
    addResizeListener: browserEvents.addResizeListener,
    getDocumentReadyState: browserEvents.getDocumentReadyState,
    addDomContentLoadedListener: browserEvents.addDomContentLoadedListener,
    setViewportSync: viewportSync.setViewportSync,
  };
}

export function createGlobalStudioBootstrapDomTargets(): StudioBootstrapDomTargets {
  return createStudioBootstrapDomTargets(
    createGlobalStudioBootstrapBodyAdapter(),
    createGlobalStudioBootstrapBrowserEventAdapter(),
    createGlobalStudioBootstrapViewportSyncAdapter(),
  );
}
