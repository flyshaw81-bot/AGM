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
import { syncStudioDocumentTheme } from "./studioThemeSync";
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

export function createStudioRendererTargets(
  targets: StudioRendererTargets,
): StudioRendererTargets {
  return targets;
}

export function createGlobalStudioRendererTargets(): StudioRendererTargets {
  return createStudioRendererTargets({
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
  });
}
