import {
  resolveEngineFocusGeometry,
  syncEngineProjectSummary,
} from "../bridge/engineActions";
import { syncEngineViewport } from "../bridge/engineMapHost";
import { bindStudioShellEvents, renderStudioShell } from "../layout/shell";
import type { StudioState } from "../types";
import {
  applyCanvasPaintPreview,
  bindCanvasToolInteractions,
  syncCanvasSelectionHighlight,
  syncOverlays,
} from "./canvasController";
import { syncDocumentState, syncEditorWorkflowState } from "./documentState";
import {
  preserveEngineNode,
  relocateEngineMapHost,
  syncEngineDialogsPosition,
} from "./engineHost";
import { updateProjectCenterState } from "./projectCenter";
import {
  createGlobalStudioBootstrapTargets,
  startStudioApp,
} from "./studioBootstrap";
import { createStudioShellEventHandlers } from "./studioShellHandlers";
import { updateViewportDimensions } from "./viewportState";

async function syncProjectSummaryState() {
  return syncEngineProjectSummary();
}

function render(root: HTMLElement, state: StudioState) {
  syncEditorWorkflowState(state);
  syncDocumentState(state);
  updateProjectCenterState(state);
  preserveEngineNode(root, "map");
  preserveEngineNode(root, "dialogs");
  root.innerHTML = renderStudioShell(state);
  root.dataset.studioTheme = state.theme;
  document.documentElement.dataset.studioTheme = state.theme;
  relocateEngineMapHost();
  syncOverlays(state);
  syncEngineViewport(
    state.viewport.presetId,
    state.viewport.orientation,
    state.viewport.fitMode,
    state.viewport.zoom,
    state.viewport.panX,
    state.viewport.panY,
  );
  syncCanvasSelectionHighlight(state);
  syncEngineDialogsPosition();
  bindCanvasToolInteractions(
    state,
    (patch) => {
      state.viewport = { ...state.viewport, ...patch };
      render(root, state);
    },
    (selection) => {
      state.viewport.selectedCanvasEntity = selection;
      if (selection.targetType === "state") {
        state.directEditor.selectedStateId = selection.targetId;
        state.directEditor.lastAppliedStateId = null;
      } else {
        state.directEditor.selectedBurgId = selection.targetId;
        state.directEditor.lastAppliedBurgId = null;
      }
      state.balanceFocus =
        selection.targetType === "state"
          ? resolveEngineFocusGeometry({
              targetType: "state",
              targetId: selection.targetId,
              sourceLabel: "canvas-select-tool",
              action: "focus",
            })
          : {
              targetType: selection.targetType,
              targetId: selection.targetId,
              sourceLabel: "canvas-select-tool",
              action: "focus",
              x: selection.x,
              y: selection.y,
            };
      syncDocumentState(state);
      render(root, state);
    },
    (preview) => applyCanvasPaintPreview(state, preview),
  );
  bindStudioShellEvents(
    state,
    createStudioShellEventHandlers({
      render,
      root,
      state,
      syncProjectSummaryState,
      updateViewportDimensions,
    }),
  );
}

startStudioApp(createGlobalStudioBootstrapTargets(render));
