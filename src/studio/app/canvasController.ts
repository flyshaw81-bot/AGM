import type {
  CanvasPaintPreviewState,
  CanvasSelectionState,
  StudioState,
} from "../types";
import {
  type CanvasInteractionTargets,
  createGlobalCanvasInteractionTargets,
} from "./canvasInteractionTargets";
import { syncOverlays } from "./canvasOverlaySync";

export {
  applyBiomeCoverageTarget,
  applyCanvasPaintPreview,
  getCanvasPaintPreviewForCell,
  isPaintCanvasTool,
  undoCanvasEditEntry,
} from "./canvasPaintEditing";
export { syncCanvasSelectionHighlight } from "./canvasSelectionHighlight";
export { syncOverlays };
export {
  type CanvasInteractionTargets,
  createCanvasInteractionTargets,
  createGlobalCanvasInteractionDomTargets,
  createGlobalCanvasInteractionTargets,
  createRuntimeCanvasInteractionTargets,
} from "./canvasInteractionTargets";

const NATIVE_CANVAS_GESTURE_EVENTS = [
  "dblclick",
  "mousedown",
  "mousemove",
  "mouseup",
  "touchstart",
  "touchmove",
] as const;

export function isNativeWorkbenchCanvasFrame(frame: HTMLElement) {
  return (
    typeof frame.closest === "function" &&
    Boolean(frame.closest(".studio-native-app"))
  );
}

function suppressNativeEngineGesture(event: Event) {
  if (event.cancelable) event.preventDefault();
  event.stopPropagation();
}

function bindNativeCanvasGestureShield(
  frame: HTMLElement,
  targets: CanvasInteractionTargets,
) {
  if (!isNativeWorkbenchCanvasFrame(frame)) return false;

  NATIVE_CANVAS_GESTURE_EVENTS.forEach((type) => {
    frame.addEventListener(
      type,
      (event) => {
        if (targets.isControlEvent(event)) return;
        suppressNativeEngineGesture(event);
      },
      { capture: true, passive: false },
    );
  });

  return true;
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
  const nativeWorkbench = bindNativeCanvasGestureShield(frame, targets);

  let panStart: {
    clientX: number;
    clientY: number;
    panX: number;
    panY: number;
    scaleX: number;
    scaleY: number;
  } | null = null;
  let panMoved = false;
  let activePaintPointerId: number | null = null;
  let paintedCells = new Set<number>();
  let paintChanged = false;
  let wheelSyncTimer: ReturnType<typeof setTimeout> | null = null;

  const syncViewportFromEngineWheel = () => {
    wheelSyncTimer = null;
    const patch = targets.readViewportPatch(
      state.viewport.presetId,
      state.viewport.orientation,
      state.viewport.fitMode,
    );
    if (!patch) return;
    state.viewport.zoom = patch.zoom;
    state.viewport.panX = patch.panX;
    state.viewport.panY = patch.panY;
    host.dataset.panX = String(Math.round(state.viewport.panX));
    host.dataset.panY = String(Math.round(state.viewport.panY));
    targets.syncToolHud(state);
  };

  frame.addEventListener(
    "wheel",
    (event) => {
      if (targets.isControlEvent(event)) return;
      if (wheelSyncTimer !== null) clearTimeout(wheelSyncTimer);
      wheelSyncTimer = setTimeout(syncViewportFromEngineWheel, 80);
    },
    { capture: true, passive: true },
  );

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

  // Capture-phase listeners — must fire before native engine's listeners on child SVG elements.
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
      panMoved = false;
      host.classList.add("is-panning");
      frame.setPointerCapture(event.pointerId);
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    if (!targets.isPaintTool(state.viewport.canvasTool)) return;
    activePaintPointerId = event.pointerId;
    paintedCells = new Set<number>();
    paintChanged = false;
    frame.setPointerCapture(event.pointerId);
    const painted = paintAtPointer(event);
    paintChanged = paintChanged || painted;
    event.stopPropagation();
    event.preventDefault();
  }, { capture: true });

  frame.addEventListener("pointermove", (event) => {
    if (targets.isControlEvent(event)) return;
    if (panStart && state.viewport.canvasTool === "pan") {
      const nextPanX =
        panStart.panX + (event.clientX - panStart.clientX) * panStart.scaleX;
      const nextPanY =
        panStart.panY + (event.clientY - panStart.clientY) * panStart.scaleY;
      const movedEnough =
        Math.abs(nextPanX - panStart.panX) > 0.5 ||
        Math.abs(nextPanY - panStart.panY) > 0.5;
      if (!panMoved && !movedEnough) return;
      panMoved = true;
      state.viewport.panX = nextPanX;
      state.viewport.panY = nextPanY;
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
  }, { capture: true });

  const finishPan = (event: PointerEvent) => {
    if (!panStart) return;
    const shouldCommitPan = panMoved;
    panStart = null;
    panMoved = false;
    host.classList.remove("is-panning");
    if (frame.hasPointerCapture(event.pointerId))
      frame.releasePointerCapture(event.pointerId);
    if (!shouldCommitPan) return;
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
  }, { capture: true });
  frame.addEventListener("pointercancel", (event) => {
    finishPan(event);
    finishPaint(event);
  }, { capture: true });

  const handleCanvasClick = (event: MouseEvent) => {
    if (targets.isControlEvent(event)) return;
    if (state.viewport.canvasTool === "select") {
      const selection = targets.getSelectionAt(event as PointerEvent, state);
      if (selection) onSelection(selection);
    }
    if (nativeWorkbench) suppressNativeEngineGesture(event);
  };

  frame.addEventListener("click", handleCanvasClick, {
    capture: nativeWorkbench,
    passive: false,
  });
}
