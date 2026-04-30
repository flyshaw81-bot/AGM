import type { StudioState } from "../types";
import {
  createGlobalStudioRendererTargets,
  type StudioRendererTargets,
} from "./studioRendererTargets";
import { createStudioShellEventHandlers } from "./studioShellHandlers";
import type { RenderStudioApp } from "./studioWorkflowWatcher";

export {
  createGlobalStudioRendererTargets,
  type StudioRendererTargets,
} from "./studioRendererTargets";

function syncViewport(state: StudioState, targets: StudioRendererTargets) {
  targets.syncViewport(
    state.viewport.presetId,
    state.viewport.orientation,
    state.viewport.fitMode,
    state.viewport.zoom,
    state.viewport.panX,
    state.viewport.panY,
  );
}

export function renderStudioApp(
  root: HTMLElement,
  state: StudioState,
  render: RenderStudioApp,
  targets: StudioRendererTargets,
) {
  targets.syncEditorWorkflow(state);
  targets.syncDocument(state);
  targets.updateProjectCenter(state);
  targets.preserveEngineNode(root, "map");
  targets.preserveEngineNode(root, "dialogs");
  targets.setRootHtml(root, targets.renderShell(state));
  targets.setRootTheme(root, state.theme);
  targets.setDocumentTheme(state.theme);
  targets.relocateEngineMapHost();
  targets.syncOverlays(state);
  syncViewport(state, targets);
  targets.syncCanvasSelectionHighlight(state);
  targets.syncDialogsPosition();
  targets.bindCanvasToolInteractions(
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
          ? targets.resolveFocusGeometry({
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
      targets.syncDocument(state);
      render(root, state);
    },
    (preview) => targets.applyCanvasPaintPreview(state, preview),
  );
  targets.bindShellEvents(
    state,
    createStudioShellEventHandlers({
      render,
      root,
      state,
      syncProjectSummaryState: targets.syncProjectSummary,
      updateViewportDimensions: targets.updateViewportDimensions,
    }),
  );
}

export function createStudioRenderer(
  targets: StudioRendererTargets = createGlobalStudioRendererTargets(),
): RenderStudioApp {
  const render: RenderStudioApp = (root, state) =>
    renderStudioApp(root, state, render, targets);
  return render;
}
