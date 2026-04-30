import type { StudioState } from "../types";
import type {
  StudioBootstrapTargets,
  StudioViewportSync,
} from "./studioBootstrapTargets";

export {
  createGlobalStudioBootstrapTargets,
  createStudioBootstrapTargets,
  type StudioBootstrapTargets,
  type StudioViewportSync,
} from "./studioBootstrapTargets";

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
