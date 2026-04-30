type EngineCanvasPack = { cells?: unknown; states?: unknown[] };

type EngineCanvasWindow = typeof globalThis & {
  drawBiomes?: () => void;
  drawCells?: () => void;
  drawHeightmap?: () => void;
  graphHeight?: number;
  graphWidth?: number;
  grid?: { cells?: unknown };
  invokeActiveZooming?: () => void;
  layerIsOn?: (layer: string) => boolean;
  mapHeightInput?: { value?: string };
  mapWidthInput?: { value?: string };
  pack?: EngineCanvasPack;
};

export type EngineCanvasAccessTargets = {
  getGraphWidth: () => number | string | undefined;
  getGraphHeight: () => number | string | undefined;
  getPack: () => EngineCanvasPack | undefined;
  getGridCells: () => unknown;
  drawHeightmap: () => void;
  drawBiomes: () => void;
  drawCells: () => void;
  isLayerOn: (layer: string) => boolean;
  invokeActiveZooming: () => void;
};

function engineCanvasWindow() {
  return globalThis as EngineCanvasWindow;
}

export function createGlobalEngineCanvasAccessTargets(): EngineCanvasAccessTargets {
  const engine = engineCanvasWindow();
  return {
    getGraphWidth: () => engine.graphWidth || engine.mapWidthInput?.value,
    getGraphHeight: () => engine.graphHeight || engine.mapHeightInput?.value,
    getPack: () => engine.pack,
    getGridCells: () => engine.grid?.cells,
    drawHeightmap: () => {
      if (typeof engine.drawHeightmap === "function") engine.drawHeightmap();
    },
    drawBiomes: () => {
      if (typeof engine.drawBiomes === "function") engine.drawBiomes();
    },
    drawCells: () => {
      if (typeof engine.drawCells === "function") engine.drawCells();
    },
    isLayerOn: (layer) => Boolean(engine.layerIsOn?.(layer)),
    invokeActiveZooming: () => {
      if (typeof engine.invokeActiveZooming === "function")
        engine.invokeActiveZooming();
    },
  };
}

export function getEngineCanvasGraphSize(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  return {
    height: Number(targets.getGraphHeight() || 0),
    width: Number(targets.getGraphWidth() || 0),
  };
}

export function getEnginePackCells(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  return targets.getPack()?.cells;
}

export function getEnginePack(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  return targets.getPack();
}

export function getEngineGridCells(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  return targets.getGridCells();
}

export function redrawEngineCanvasEditLayers(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  targets.drawHeightmap();
  targets.drawBiomes();
  if (targets.isLayerOn("toggleCells")) targets.drawCells();
  targets.invokeActiveZooming();
}
