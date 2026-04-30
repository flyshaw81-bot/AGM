import { syncEngineProjectSummary } from "../bridge/engineActions";
import { syncEngineViewport } from "../bridge/engineMapHost";
import type { FitMode, Orientation, StudioState } from "../types";
import { syncDocumentState } from "./documentState";
import { ensureStudioRoot } from "./engineHost";
import { createInitialState } from "./initialState";
import {
  createGlobalStudioWorkflowWatcherTargets,
  type RenderStudioApp,
  type StudioWorkflowWatcherTargets,
  watchStudioWorkflow,
} from "./studioWorkflowWatcher";
import { injectStudioStyles } from "./styles";
import { updateViewportDimensions } from "./viewportState";

export type StudioViewportSync = (
  presetId: string,
  orientation: Orientation,
  fitMode: FitMode,
) => void;

export type StudioBootstrapTargets = {
  injectStyles: () => void;
  enableStudioBody: () => void;
  removeLoadingIndicator: () => void;
  createInitialState: () => StudioState;
  updateViewportDimensions: (state: StudioState) => void;
  ensureRoot: () => HTMLElement;
  syncProjectSummary: () => Promise<boolean>;
  syncDocument: (state: StudioState) => boolean;
  render: RenderStudioApp;
  createWorkflowWatcherTargets: (
    render: RenderStudioApp,
    syncProjectSummary: () => Promise<boolean>,
  ) => StudioWorkflowWatcherTargets;
  watchWorkflow: (
    root: HTMLElement,
    state: StudioState,
    targets: StudioWorkflowWatcherTargets,
  ) => void;
  addResizeListener: (callback: () => void) => void;
  syncViewport: typeof syncEngineViewport;
  getDocumentReadyState: () => DocumentReadyState;
  addDomContentLoadedListener: (callback: () => void) => void;
  setViewportSync: (sync: StudioViewportSync) => void;
};

export function createGlobalStudioBootstrapTargets(
  render: RenderStudioApp,
): StudioBootstrapTargets {
  return {
    injectStyles: injectStudioStyles,
    enableStudioBody: () => {
      document.body.classList.add("studio-enabled");
    },
    removeLoadingIndicator: () => {
      document.getElementById("loading")?.remove();
    },
    createInitialState,
    updateViewportDimensions,
    ensureRoot: ensureStudioRoot,
    syncProjectSummary: syncEngineProjectSummary,
    syncDocument: syncDocumentState,
    render,
    createWorkflowWatcherTargets: createGlobalStudioWorkflowWatcherTargets,
    watchWorkflow: watchStudioWorkflow,
    addResizeListener: (callback) => {
      window.addEventListener("resize", callback);
    },
    syncViewport: syncEngineViewport,
    getDocumentReadyState: () => document.readyState,
    addDomContentLoadedListener: (callback) => {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    },
    setViewportSync: (sync) => {
      window.studioViewportSync = sync;
    },
  };
}

function syncCurrentViewport(
  state: StudioState,
  targets: StudioBootstrapTargets,
) {
  targets.syncViewport(
    state.viewport.presetId,
    state.viewport.orientation,
    state.viewport.fitMode,
    state.viewport.zoom,
    state.viewport.panX,
    state.viewport.panY,
  );
}

export async function bootstrapStudio(targets: StudioBootstrapTargets) {
  targets.injectStyles();
  targets.enableStudioBody();
  targets.removeLoadingIndicator();
  const state = targets.createInitialState();
  targets.updateViewportDimensions(state);
  const root = targets.ensureRoot();
  await targets.syncProjectSummary();
  targets.syncDocument(state);
  targets.render(root, state);
  targets.watchWorkflow(
    root,
    state,
    targets.createWorkflowWatcherTargets(
      targets.render,
      targets.syncProjectSummary,
    ),
  );
  targets.addResizeListener(() => syncCurrentViewport(state, targets));
  return { root, state };
}

export function startStudioApp(targets: StudioBootstrapTargets) {
  targets.setViewportSync(targets.syncViewport);
  if (targets.getDocumentReadyState() === "loading") {
    targets.addDomContentLoadedListener(() => {
      void bootstrapStudio(targets);
    });
    return;
  }
  void bootstrapStudio(targets);
}

declare global {
  interface Window {
    studioViewportSync?: StudioViewportSync;
  }
}
