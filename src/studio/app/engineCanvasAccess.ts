import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";

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

export type EngineCanvasDimensionAdapter = {
  getGraphWidth: () => number | string | undefined;
  getGraphHeight: () => number | string | undefined;
};

export type EngineCanvasMapDataAdapter = {
  getPack: () => EngineCanvasPack | undefined;
  getGridCells: () => unknown;
};

export type EngineCanvasRendererAdapter = {
  drawHeightmap: () => void;
  drawBiomes: () => void;
  drawCells: () => void;
  isLayerOn: (layer: string) => boolean;
  invokeActiveZooming: () => void;
};

function engineCanvasWindow() {
  return globalThis as EngineCanvasWindow;
}

export function createGlobalEngineCanvasDimensionAdapter(): EngineCanvasDimensionAdapter {
  const engine = engineCanvasWindow();
  return {
    getGraphWidth: () => engine.graphWidth || engine.mapWidthInput?.value,
    getGraphHeight: () => engine.graphHeight || engine.mapHeightInput?.value,
  };
}

export function createGlobalEngineCanvasMapDataAdapter(): EngineCanvasMapDataAdapter {
  const engine = engineCanvasWindow();
  return {
    getPack: () => engine.pack,
    getGridCells: () => engine.grid?.cells,
  };
}

export function createRuntimeEngineCanvasDimensionAdapter(
  context: EngineRuntimeContext,
): EngineCanvasDimensionAdapter {
  return {
    getGraphWidth: () => context.worldSettings.graphWidth,
    getGraphHeight: () => context.worldSettings.graphHeight,
  };
}

export function createRuntimeEngineCanvasMapDataAdapter(
  context: EngineRuntimeContext,
): EngineCanvasMapDataAdapter {
  return {
    getPack: () => context.pack,
    getGridCells: () => context.grid?.cells,
  };
}

export function createGlobalEngineCanvasRendererAdapter(): EngineCanvasRendererAdapter {
  const engine = engineCanvasWindow();
  return {
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

export function createEngineCanvasAccessTargets(
  dimensionAdapter: EngineCanvasDimensionAdapter,
  mapDataAdapter: EngineCanvasMapDataAdapter,
  rendererAdapter: EngineCanvasRendererAdapter,
): EngineCanvasAccessTargets {
  return {
    getGraphWidth: dimensionAdapter.getGraphWidth,
    getGraphHeight: dimensionAdapter.getGraphHeight,
    getPack: mapDataAdapter.getPack,
    getGridCells: mapDataAdapter.getGridCells,
    drawHeightmap: rendererAdapter.drawHeightmap,
    drawBiomes: rendererAdapter.drawBiomes,
    drawCells: rendererAdapter.drawCells,
    isLayerOn: rendererAdapter.isLayerOn,
    invokeActiveZooming: rendererAdapter.invokeActiveZooming,
  };
}

export function createGlobalEngineCanvasAccessTargets(): EngineCanvasAccessTargets {
  return createEngineCanvasAccessTargets(
    createGlobalEngineCanvasDimensionAdapter(),
    createGlobalEngineCanvasMapDataAdapter(),
    createGlobalEngineCanvasRendererAdapter(),
  );
}

export function createRuntimeEngineCanvasAccessTargets(
  context: EngineRuntimeContext,
  rendererAdapter: EngineCanvasRendererAdapter = createGlobalEngineCanvasRendererAdapter(),
): EngineCanvasAccessTargets {
  return createEngineCanvasAccessTargets(
    createRuntimeEngineCanvasDimensionAdapter(context),
    createRuntimeEngineCanvasMapDataAdapter(context),
    rendererAdapter,
  );
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
