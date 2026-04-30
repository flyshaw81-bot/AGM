import { syncEngineProjectSummary } from "../bridge/engineActions";
import { syncEngineViewport } from "../bridge/engineMapHost";
import type { FitMode, Orientation, StudioState } from "../types";
import { syncDocumentState } from "./documentState";
import { ensureStudioRoot } from "./engineHost";
import { createInitialState } from "./initialState";
import { createGlobalStudioBootstrapDomTargets } from "./studioBootstrapDom";
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

export function createStudioBootstrapTargets(
  targets: StudioBootstrapTargets,
): StudioBootstrapTargets {
  return targets;
}

export function createGlobalStudioBootstrapTargets(
  render: RenderStudioApp,
): StudioBootstrapTargets {
  const domTargets = createGlobalStudioBootstrapDomTargets();
  return createStudioBootstrapTargets({
    injectStyles: injectStudioStyles,
    enableStudioBody: domTargets.enableStudioBody,
    removeLoadingIndicator: domTargets.removeLoadingIndicator,
    createInitialState,
    updateViewportDimensions,
    ensureRoot: ensureStudioRoot,
    syncProjectSummary: syncEngineProjectSummary,
    syncDocument: syncDocumentState,
    render,
    createWorkflowWatcherTargets: createGlobalStudioWorkflowWatcherTargets,
    watchWorkflow: watchStudioWorkflow,
    addResizeListener: domTargets.addResizeListener,
    syncViewport: syncEngineViewport,
    getDocumentReadyState: domTargets.getDocumentReadyState,
    addDomContentLoadedListener: domTargets.addDomContentLoadedListener,
    setViewportSync: domTargets.setViewportSync,
  });
}
