import type {
  CanvasEditHistoryEntry,
  CanvasPaintPreviewState,
  StudioState,
} from "../types";
import {
  type CanvasPaintEditingTargets,
  createGlobalCanvasPaintEditingTargets,
} from "./canvasPaintEditingTargets";

export {
  type CanvasPaintEditingTargets,
  createGlobalCanvasPaintEditingTargets,
} from "./canvasPaintEditingTargets";

export function isPaintCanvasTool(
  tool: StudioState["viewport"]["canvasTool"],
): tool is CanvasPaintPreviewState["tool"] {
  return tool === "brush" || tool === "water" || tool === "terrain";
}

export function getCanvasPaintPreviewForCell(
  tool: CanvasPaintPreviewState["tool"],
  cellId: number,
  targets: CanvasPaintEditingTargets = createGlobalCanvasPaintEditingTargets(),
): CanvasPaintPreviewState | null {
  const cells = targets.getPackCells();
  const point = cells?.p?.[cellId];
  const { width: graphWidth, height: graphHeight } = targets.getGraphSize();
  if (!cells || !Array.isArray(point) || !graphWidth || !graphHeight)
    return null;
  const height = Number(cells.h?.[cellId]);
  const biomeId = Number(cells.biome?.[cellId]);
  const stateId = Number(cells.state?.[cellId]);
  const label = `Cell #${cellId} - h ${Number.isFinite(height) ? height : "?"} - biome ${Number.isFinite(biomeId) ? biomeId : "?"}`;
  return {
    tool,
    cellId,
    label,
    x: Math.max(0, Math.min(100, (point[0] / graphWidth) * 100)),
    y: Math.max(0, Math.min(100, (point[1] / graphHeight) * 100)),
    height: Number.isFinite(height) ? height : null,
    biomeId: Number.isFinite(biomeId) ? biomeId : null,
    stateId: Number.isFinite(stateId) && stateId > 0 ? stateId : null,
  };
}

function getCanvasEditTarget(
  preview: CanvasPaintPreviewState,
  targets: CanvasPaintEditingTargets,
): CanvasEditHistoryEntry | null {
  const cells = targets.getPackCells();
  if (!cells) return null;
  const beforeHeight = Number(cells.h?.[preview.cellId]);
  const beforeBiomeId = Number(cells.biome?.[preview.cellId]);
  const afterHeight =
    preview.tool === "terrain"
      ? Math.max(
          20,
          Math.min(
            100,
            (Number.isFinite(beforeHeight) ? beforeHeight : 20) + 5,
          ),
        )
      : preview.tool === "water"
        ? Math.max(
            0,
            Math.min(
              19,
              (Number.isFinite(beforeHeight) ? beforeHeight : 20) - 25,
            ),
          )
        : Number.isFinite(beforeHeight)
          ? beforeHeight
          : null;
  const afterBiomeId =
    preview.tool === "brush"
      ? 1
      : Number.isFinite(beforeBiomeId)
        ? beforeBiomeId
        : null;

  return {
    id: targets.now(),
    tool: preview.tool,
    cellId: preview.cellId,
    beforeHeight: Number.isFinite(beforeHeight) ? beforeHeight : null,
    afterHeight,
    beforeBiomeId: Number.isFinite(beforeBiomeId) ? beforeBiomeId : null,
    afterBiomeId,
    label: preview.label,
    undone: false,
  };
}

function writeCanvasCellEdit(
  entry: CanvasEditHistoryEntry,
  height: number | null,
  biomeId: number | null,
  targets: CanvasPaintEditingTargets,
) {
  const cells = targets.getPackCells();
  const gridCells = targets.getGridCells();
  if (!cells) return false;
  const biomeByCell = cells.biome;
  if (entry.batch?.length && biomeByCell) {
    const useAfter = biomeId === entry.afterBiomeId;
    entry.batch.forEach((change) => {
      biomeByCell[change.cellId] = useAfter
        ? change.afterBiomeId
        : change.beforeBiomeId;
    });
    targets.redrawEditLayers();
    return true;
  }
  if (height !== null && cells.h) cells.h[entry.cellId] = height;
  const gridCellId = Number(cells.g?.[entry.cellId]);
  if (height !== null && gridCells?.h && Number.isFinite(gridCellId))
    gridCells.h[gridCellId] = height;
  if (biomeId !== null && biomeByCell) biomeByCell[entry.cellId] = biomeId;
  targets.redrawEditLayers();
  return true;
}

function applyCanvasEditEntry(
  entry: CanvasEditHistoryEntry,
  targets: CanvasPaintEditingTargets,
) {
  return writeCanvasCellEdit(
    entry,
    entry.afterHeight,
    entry.afterBiomeId,
    targets,
  );
}

export function applyCanvasPaintPreview(
  state: StudioState,
  preview: CanvasPaintPreviewState,
  targets: CanvasPaintEditingTargets = createGlobalCanvasPaintEditingTargets(),
) {
  const entry = getCanvasEditTarget(preview, targets);
  if (!entry) return false;
  if (
    entry.beforeHeight === entry.afterHeight &&
    entry.beforeBiomeId === entry.afterBiomeId
  )
    return false;
  if (!applyCanvasEditEntry(entry, targets)) return false;
  state.viewport.canvasEditHistory = [
    entry,
    ...state.viewport.canvasEditHistory,
  ].slice(0, 8);
  state.viewport.paintPreview =
    getCanvasPaintPreviewForCell(preview.tool, preview.cellId, targets) ??
    preview;
  state.document.source = "core";
  return true;
}

export function undoCanvasEditEntry(
  entry: CanvasEditHistoryEntry,
  targets: CanvasPaintEditingTargets = createGlobalCanvasPaintEditingTargets(),
) {
  return writeCanvasCellEdit(
    entry,
    entry.beforeHeight,
    entry.beforeBiomeId,
    targets,
  );
}

export function applyBiomeCoverageTarget(
  state: StudioState,
  biomeId: number,
  targetPercentage: number,
  targets: CanvasPaintEditingTargets = createGlobalCanvasPaintEditingTargets(),
) {
  const cells = targets.getPackCells();
  if (
    !cells?.biome ||
    !Number.isFinite(biomeId) ||
    !Number.isFinite(targetPercentage)
  )
    return false;
  const biomeByCell = cells.biome;
  const biomeCells = Array.from(biomeByCell as ArrayLike<number>);
  const cellIds = biomeCells
    .map((value, cellId) => ({ cellId, value: Number(value) }))
    .filter((item) => Number.isFinite(item.value) && item.value >= 0)
    .map((item) => item.cellId);
  const total = cellIds.length;
  if (!total) return false;
  const currentIds = cellIds.filter(
    (cellId) => Number(biomeByCell[cellId]) === biomeId,
  );
  const targetCount = Math.max(
    1,
    Math.min(
      total - 1,
      Math.round((total * Math.max(1, Math.min(80, targetPercentage))) / 100),
    ),
  );
  const delta = targetCount - currentIds.length;
  if (!delta) return false;

  const points = cells.p || {};
  const currentSet = new Set(currentIds);
  const center = currentIds.reduce(
    (next, cellId) => {
      const point = points[cellId];
      return Array.isArray(point)
        ? {
            x: next.x + Number(point[0] || 0),
            y: next.y + Number(point[1] || 0),
            count: next.count + 1,
          }
        : next;
    },
    { x: 0, y: 0, count: 0 },
  );
  const anchor = center.count
    ? { x: center.x / center.count, y: center.y / center.count }
    : (() => {
        const point = points[currentIds[0]];
        return Array.isArray(point)
          ? { x: Number(point[0] || 0), y: Number(point[1] || 0) }
          : { x: 0, y: 0 };
      })();
  const distanceToAnchor = (cellId: number) => {
    const point = points[cellId];
    return Array.isArray(point)
      ? Math.hypot(
          Number(point[0] || 0) - anchor.x,
          Number(point[1] || 0) - anchor.y,
        )
      : Number.MAX_SAFE_INTEGER;
  };
  const fallbackBiomeId =
    cellIds
      .map((cellId) => Number(biomeByCell[cellId]))
      .find((value) => value !== biomeId && value >= 0) ?? 1;
  const changes =
    delta > 0
      ? cellIds
          .filter((cellId) => !currentSet.has(cellId))
          .sort((a, b) => distanceToAnchor(a) - distanceToAnchor(b))
          .slice(0, delta)
          .map((cellId) => ({
            cellId,
            beforeBiomeId: Number(biomeByCell[cellId]),
            afterBiomeId: biomeId,
          }))
      : currentIds
          .sort((a, b) => distanceToAnchor(b) - distanceToAnchor(a))
          .slice(0, Math.abs(delta))
          .map((cellId) => ({
            cellId,
            beforeBiomeId: biomeId,
            afterBiomeId: fallbackBiomeId,
          }))
          .filter((change) => change.afterBiomeId !== biomeId);

  if (!changes.length) return false;
  const entry: CanvasEditHistoryEntry = {
    id: targets.now(),
    tool: "biome-slider",
    cellId: changes[0].cellId,
    beforeHeight: null,
    afterHeight: null,
    beforeBiomeId: changes[0].beforeBiomeId,
    afterBiomeId: changes[0].afterBiomeId,
    label: `Biome #${biomeId} ${Math.round(targetPercentage)}%`,
    undone: false,
    batch: changes,
  };
  if (!applyCanvasEditEntry(entry, targets)) return false;
  state.viewport.canvasEditHistory = [
    entry,
    ...state.viewport.canvasEditHistory,
  ].slice(0, 8);
  state.directEditor.selectedBiomeId = biomeId;
  state.directEditor.lastAppliedBiomeId = biomeId;
  state.document.source = "core";
  return true;
}
