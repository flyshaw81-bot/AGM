import {
  getEngineCanvasGraphSize,
  getEngineGridCells,
  getEnginePackCells,
  redrawEngineCanvasEditLayers,
} from "./engineCanvasAccess";

export type CanvasPaintPackCells = {
  biome?: (ArrayLike<number> & Record<number, number>) | Record<number, number>;
  g?: Record<number, number>;
  h?: Record<number, number>;
  p?: Record<number, unknown>;
  state?: Record<number, number>;
};

export type CanvasPaintGridCells = {
  h?: Record<number, number>;
};

export type CanvasPaintEditingTargets = {
  getGraphSize: typeof getEngineCanvasGraphSize;
  getPackCells: () => CanvasPaintPackCells | undefined;
  getGridCells: () => CanvasPaintGridCells | undefined;
  redrawEditLayers: () => void;
  now: () => number;
};

export function createCanvasPaintEditingTargets(
  targets: CanvasPaintEditingTargets,
): CanvasPaintEditingTargets {
  return targets;
}

export function createGlobalCanvasPaintEditingTargets(): CanvasPaintEditingTargets {
  return createCanvasPaintEditingTargets({
    getGraphSize: getEngineCanvasGraphSize,
    getPackCells: () =>
      getEnginePackCells() as CanvasPaintPackCells | undefined,
    getGridCells: () =>
      getEngineGridCells() as CanvasPaintGridCells | undefined,
    redrawEditLayers: redrawEngineCanvasEditLayers,
    now: () => Date.now(),
  });
}
