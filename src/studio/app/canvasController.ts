import { syncEngineViewport } from "../bridge/engineMapHost";
import type {
  CanvasPaintPreviewState,
  CanvasSelectionState,
  StudioState,
} from "../types";
import {
  getCanvasPaintPreviewAt,
  getCanvasSelectionAt,
} from "./canvasInteractionGeometry";
import {
  syncCanvasPaintPreview,
  syncCanvasToolHud,
  syncOverlays,
} from "./canvasOverlaySync";
import { isPaintCanvasTool } from "./canvasPaintEditing";

export {
  applyBiomeCoverageTarget,
  applyCanvasPaintPreview,
  getCanvasPaintPreviewForCell,
  isPaintCanvasTool,
  undoCanvasEditEntry,
} from "./canvasPaintEditing";
export { syncCanvasSelectionHighlight } from "./canvasSelectionHighlight";
export { syncOverlays };

export type CanvasInteractionTargets = {
  getCanvasFrame: () => HTMLElement | null;
  getMapHost: () => HTMLElement | null;
  isControlEvent: (event: Event) => boolean;
  getPaintPreviewAt: typeof getCanvasPaintPreviewAt;
  getSelectionAt: typeof getCanvasSelectionAt;
  syncPaintPreview: (state: StudioState) => void;
  syncToolHud: (state: StudioState) => void;
  syncViewport: typeof syncEngineViewport;
  isPaintTool: typeof isPaintCanvasTool;
};

export function createGlobalCanvasInteractionTargets(): CanvasInteractionTargets {
  return {
    getCanvasFrame: () => document.getElementById("studioCanvasFrame"),
    getMapHost: () => document.getElementById("studioMapHost"),
    isControlEvent: isCanvasControlEvent,
    getPaintPreviewAt: getCanvasPaintPreviewAt,
    getSelectionAt: getCanvasSelectionAt,
    syncPaintPreview: syncCanvasPaintPreview,
    syncToolHud: syncCanvasToolHud,
    syncViewport: syncEngineViewport,
    isPaintTool: isPaintCanvasTool,
  };
}

function isCanvasControlEvent(event: Event) {
  return (
    event.target instanceof Element &&
    Boolean(
      event.target.closest(
        "[data-canvas-tool-hud='true'], [data-canvas-selection-card='true'], [data-studio-map-tools='true']",
      ),
    )
  );
}

export function bindCanvasToolInteractions(
  state: StudioState,
  onViewportPatch: (patch: Partial<StudioState["viewport"]>) => void,
  onSelection: (selection: CanvasSelectionState) => void,
  onCanvasPaint: (preview: CanvasPaintPreviewState) => boolean,
  targets: CanvasInteractionTargets = createGlobalCanvasInteractionTargets(),
) {
  const frame = targets.getCanvasFrame();
  const host = targets.getMapHost();
  if (!frame || !host) return;

  let panStart: {
    clientX: number;
    clientY: number;
    panX: number;
    panY: number;
    scaleX: number;
    scaleY: number;
  } | null = null;
  let activePaintPointerId: number | null = null;
  let paintedCells = new Set<number>();
  let paintChanged = false;

  const updatePaintPreview = (event: PointerEvent) => {
    state.viewport.paintPreview = targets.getPaintPreviewAt(event, state);
    targets.syncPaintPreview(state);
    targets.syncToolHud(state);
    return state.viewport.paintPreview;
  };

  const paintAtPointer = (event: PointerEvent) => {
    const preview = updatePaintPreview(event);
    if (!preview || paintedCells.has(preview.cellId)) return false;
    paintedCells.add(preview.cellId);
    const changed = onCanvasPaint(preview);
    paintChanged = paintChanged || changed;
    targets.syncPaintPreview(state);
    targets.syncToolHud(state);
    return changed;
  };

  frame.addEventListener("pointerdown", (event) => {
    if (targets.isControlEvent(event) || event.button !== 0) return;
    if (state.viewport.canvasTool === "pan") {
      const rect = frame.getBoundingClientRect();
      panStart = {
        clientX: event.clientX,
        clientY: event.clientY,
        panX: state.viewport.panX,
        panY: state.viewport.panY,
        scaleX: frame.offsetWidth / Math.max(rect.width, 1),
        scaleY: frame.offsetHeight / Math.max(rect.height, 1),
      };
      host.classList.add("is-panning");
      frame.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }

    if (!targets.isPaintTool(state.viewport.canvasTool)) return;
    activePaintPointerId = event.pointerId;
    paintedCells = new Set<number>();
    paintChanged = false;
    frame.setPointerCapture(event.pointerId);
    paintAtPointer(event);
    event.preventDefault();
  });

  frame.addEventListener("pointermove", (event) => {
    if (targets.isControlEvent(event)) return;
    if (panStart && state.viewport.canvasTool === "pan") {
      state.viewport.panX =
        panStart.panX + (event.clientX - panStart.clientX) * panStart.scaleX;
      state.viewport.panY =
        panStart.panY + (event.clientY - panStart.clientY) * panStart.scaleY;
      host.dataset.panX = String(Math.round(state.viewport.panX));
      host.dataset.panY = String(Math.round(state.viewport.panY));
      targets.syncViewport(
        state.viewport.presetId,
        state.viewport.orientation,
        state.viewport.fitMode,
        state.viewport.zoom,
        state.viewport.panX,
        state.viewport.panY,
      );
      targets.syncToolHud(state);
      return;
    }

    if (!targets.isPaintTool(state.viewport.canvasTool)) return;
    if (activePaintPointerId === event.pointerId) {
      paintAtPointer(event);
      return;
    }
    updatePaintPreview(event);
  });

  const finishPan = (event: PointerEvent) => {
    if (!panStart) return;
    panStart = null;
    host.classList.remove("is-panning");
    if (frame.hasPointerCapture(event.pointerId))
      frame.releasePointerCapture(event.pointerId);
    onViewportPatch({ panX: state.viewport.panX, panY: state.viewport.panY });
  };

  const finishPaint = (event: PointerEvent) => {
    if (activePaintPointerId !== event.pointerId) return;
    activePaintPointerId = null;
    paintedCells = new Set<number>();
    if (frame.hasPointerCapture(event.pointerId))
      frame.releasePointerCapture(event.pointerId);
    if (paintChanged)
      onViewportPatch({ paintPreview: state.viewport.paintPreview });
    paintChanged = false;
  };

  frame.addEventListener("pointerup", (event) => {
    finishPan(event);
    finishPaint(event);
  });
  frame.addEventListener("pointercancel", (event) => {
    finishPan(event);
    finishPaint(event);
  });

  frame.addEventListener("click", (event) => {
    if (targets.isControlEvent(event)) return;
    if (state.viewport.canvasTool === "select") {
      const selection = targets.getSelectionAt(event, state);
      if (selection) onSelection(selection);
    }
  });
}
