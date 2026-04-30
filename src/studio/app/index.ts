import {
  resolveEngineFocusGeometry,
  syncEngineProjectSummary,
} from "../bridge/engineActions";
import { syncEngineViewport } from "../bridge/engineMapHost";
import { bindStudioShellEvents, renderStudioShell } from "../layout/shell";
import type { FitMode, Orientation, StudioState } from "../types";
import {
  applyCanvasPaintPreview,
  bindCanvasToolInteractions,
  syncCanvasSelectionHighlight,
  syncOverlays,
} from "./canvasController";
import { syncDocumentState, syncEditorWorkflowState } from "./documentState";
import {
  ensureStudioRoot,
  preserveEngineNode,
  relocateEngineMapHost,
  syncEngineDialogsPosition,
} from "./engineHost";
import { createInitialState } from "./initialState";
import { updateProjectCenterState } from "./projectCenter";
import { createStudioShellEventHandlers } from "./studioShellHandlers";
import { injectStudioStyles } from "./styles";
import { updateViewportDimensions } from "./viewportState";

async function syncProjectSummaryState() {
  return syncEngineProjectSummary();
}

function watchEditorWorkflow(root: HTMLElement, state: StudioState) {
  const syncAndRender = async () => {
    const editorChanged = syncEditorWorkflowState(state);
    const projectSummaryChanged = await syncProjectSummaryState();
    const documentChanged = syncDocumentState(state);
    if (editorChanged || projectSummaryChanged || documentChanged) {
      render(root, state);
    }
  };

  window.setInterval(() => {
    void syncAndRender();
  }, 500);
  window.addEventListener("focus", () => {
    void syncAndRender();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncAndRender();
  });
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

async function bootstrapStudio() {
  injectStudioStyles();
  document.body.classList.add("studio-enabled");
  document.getElementById("loading")?.remove();
  const state = createInitialState();
  updateViewportDimensions(state);
  const root = ensureStudioRoot();
  await syncProjectSummaryState();
  syncDocumentState(state);
  render(root, state);
  watchEditorWorkflow(root, state);

  window.addEventListener("resize", () => {
    syncEngineViewport(
      state.viewport.presetId,
      state.viewport.orientation,
      state.viewport.fitMode,
      state.viewport.zoom,
      state.viewport.panX,
      state.viewport.panY,
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      void bootstrapStudio();
    },
    { once: true },
  );
} else {
  void bootstrapStudio();
}

declare global {
  interface Window {
    studioViewportSync?: (
      presetId: string,
      orientation: Orientation,
      fitMode: FitMode,
    ) => void;
  }
}

window.studioViewportSync = syncEngineViewport;
