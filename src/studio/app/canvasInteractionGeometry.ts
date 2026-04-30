import type {
  CanvasPaintPreviewState,
  CanvasSelectionState,
  StudioState,
} from "../types";
import {
  findNearestCanvasCell,
  getCanvasPointPercent,
} from "./canvasCellGeometry";
import { calculateCanvasWorldPoint } from "./canvasGeometry";
import {
  type CanvasInteractionGeometryTargets,
  createGlobalCanvasInteractionGeometryTargets,
} from "./canvasInteractionGeometryTargets";
import {
  getCanvasPaintPreviewForCell,
  isPaintCanvasTool,
} from "./canvasPaintEditing";

export {
  type CanvasInteractionGeometryTargets,
  createGlobalCanvasInteractionGeometryTargets,
} from "./canvasInteractionGeometryTargets";

function getCanvasFramePoint(
  event: PointerEvent,
  targets: CanvasInteractionGeometryTargets,
) {
  const frame = targets.getCanvasFrame();
  if (!frame) return null;
  const rect = frame.getBoundingClientRect();
  const scaleX = frame.offsetWidth / Math.max(rect.width, 1);
  const scaleY = frame.offsetHeight / Math.max(rect.height, 1);
  return {
    frame,
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function getCanvasWorldPoint(
  event: PointerEvent,
  state: StudioState,
  targets: CanvasInteractionGeometryTargets,
) {
  const point = getCanvasFramePoint(event, targets);
  if (!point) return null;
  const { width: graphWidth, height: graphHeight } = targets.getGraphSize();
  if (!graphWidth || !graphHeight) return null;

  return calculateCanvasWorldPoint(
    { x: point.x, y: point.y },
    { width: point.frame.offsetWidth, height: point.frame.offsetHeight },
    { width: graphWidth, height: graphHeight },
    state.viewport,
  );
}

function getNearestCanvasCell(
  event: PointerEvent,
  state: StudioState,
  targets: CanvasInteractionGeometryTargets,
) {
  const point = getCanvasWorldPoint(event, state, targets);
  const cells = targets.getPack()?.cells;
  if (!point || !cells) return null;
  const nearestCell = findNearestCanvasCell(cells.i, cells.p, point);
  if (!nearestCell) return null;
  return {
    ...nearestCell,
    graphWidth: point.graphWidth,
    graphHeight: point.graphHeight,
  };
}

export function getCanvasPaintPreviewAt(
  event: PointerEvent,
  state: StudioState,
  targets: CanvasInteractionGeometryTargets = createGlobalCanvasInteractionGeometryTargets(),
): CanvasPaintPreviewState | null {
  if (!isPaintCanvasTool(state.viewport.canvasTool)) return null;
  const nearest = getNearestCanvasCell(event, state, targets);
  if (!nearest) return null;
  return getCanvasPaintPreviewForCell(
    state.viewport.canvasTool,
    nearest.cellId,
  );
}

export function getCanvasSelectionAt(
  event: PointerEvent,
  state: StudioState,
  targets: CanvasInteractionGeometryTargets = createGlobalCanvasInteractionGeometryTargets(),
): CanvasSelectionState | null {
  const point = getCanvasWorldPoint(event, state, targets);
  const pack = targets.getPack();
  if (!point || !pack) return null;

  const cells = pack.cells;
  const nearestCell = findNearestCanvasCell(cells?.i, cells?.p, point);
  const stateId = nearestCell ? Number(cells?.state?.[nearestCell.cellId]) : 0;
  const selectedState = stateId > 0 ? pack.states?.[stateId] : null;
  if (!selectedState || selectedState.removed) return null;
  return {
    targetType: "state",
    targetId: stateId,
    label: `${selectedState.name || "State"} #${stateId}`,
    x: getCanvasPointPercent(point.x, point.graphWidth),
    y: getCanvasPointPercent(point.y, point.graphHeight),
  };
}
