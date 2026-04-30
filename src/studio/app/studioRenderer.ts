import {
  resolveEngineFocusGeometry,
  syncEngineProjectSummary,
} from "../bridge/engineActions";
import { syncEngineViewport } from "../bridge/engineMapHost";
import { bindStudioShellEvents, renderStudioShell } from "../layout/shell";
import type {
  CanvasPaintPreviewState,
  CanvasSelectionState,
  StudioState,
} from "../types";
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
import { createStudioShellEventHandlers } from "./studioShellHandlers";
import { syncStudioDocumentTheme } from "./studioThemeSync";
import type { RenderStudioApp } from "./studioWorkflowWatcher";
import { updateViewportDimensions } from "./viewportState";

export type StudioRendererTargets = {
  syncEditorWorkflow: (state: StudioState) => boolean;
  syncDocument: (state: StudioState) => boolean;
  updateProjectCenter: (state: StudioState) => void;
  preserveEngineNode: (root: HTMLElement, elementId: string) => void;
  renderShell: (state: StudioState) => string;
  setRootHtml: (root: HTMLElement, html: string) => void;
  setRootTheme: (root: HTMLElement, theme: StudioState["theme"]) => void;
  setDocumentTheme: (theme: StudioState["theme"]) => void;
  relocateEngineMapHost: () => void;
  syncOverlays: (state: StudioState) => void;
  syncViewport: typeof syncEngineViewport;
  syncCanvasSelectionHighlight: (state: StudioState) => void;
  syncDialogsPosition: () => void;
  bindCanvasToolInteractions: (
    state: StudioState,
    onViewportPatch: (patch: Partial<StudioState["viewport"]>) => void,
    onSelection: (selection: CanvasSelectionState) => void,
    onCanvasPaint: (preview: CanvasPaintPreviewState) => boolean,
  ) => void;
  resolveFocusGeometry: typeof resolveEngineFocusGeometry;
  applyCanvasPaintPreview: (
    state: StudioState,
    preview: CanvasPaintPreviewState,
  ) => boolean;
  bindShellEvents: (
    state: StudioState,
    handlers: Parameters<typeof bindStudioShellEvents>[1],
  ) => void;
  syncProjectSummary: () => Promise<unknown>;
  updateViewportDimensions: (state: StudioState) => void;
};

export function createGlobalStudioRendererTargets(): StudioRendererTargets {
  return {
    syncEditorWorkflow: syncEditorWorkflowState,
    syncDocument: syncDocumentState,
    updateProjectCenter: updateProjectCenterState,
    preserveEngineNode,
    renderShell: renderStudioShell,
    setRootHtml: (root, html) => {
      root.innerHTML = html;
    },
    setRootTheme: (root, theme) => {
      root.dataset.studioTheme = theme;
    },
    setDocumentTheme: syncStudioDocumentTheme,
    relocateEngineMapHost,
    syncOverlays,
    syncViewport: syncEngineViewport,
    syncCanvasSelectionHighlight,
    syncDialogsPosition: syncEngineDialogsPosition,
    bindCanvasToolInteractions,
    resolveFocusGeometry: resolveEngineFocusGeometry,
    applyCanvasPaintPreview,
    bindShellEvents: bindStudioShellEvents,
    syncProjectSummary: syncEngineProjectSummary,
    updateViewportDimensions,
  };
}

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
