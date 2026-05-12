import {
  createGlobalRenderAdapter,
  type EngineRenderAdapter,
} from "../../modules/engine-render-adapter";
import { getActiveEngineRuntimeContext } from "../../modules/engine-runtime-active-context";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";

type EngineCanvasPack = { cells?: unknown; states?: unknown[] };

type EngineCanvasWindow = typeof globalThis & {
  graphHeight?: number;
  graphWidth?: number;
  grid?: { cells?: unknown };
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
  const rendering = createGlobalRenderAdapter();
  return {
    drawHeightmap: () => {
      rendering.drawHeightmap?.();
    },
    drawBiomes: () => {
      rendering.drawBiomes?.();
    },
    drawCells: () => {
      rendering.drawCells?.();
    },
    isLayerOn: rendering.isLayerOn,
    invokeActiveZooming: () => {
      rendering.invokeActiveZooming?.();
    },
  };
}

export function createRuntimeEngineCanvasRendererAdapter(
  context: EngineRuntimeContext,
  fallbackAdapter: EngineCanvasRendererAdapter = createGlobalEngineCanvasRendererAdapter(),
): EngineCanvasRendererAdapter {
  const rendering: EngineRenderAdapter | undefined = context.rendering;
  return {
    drawHeightmap: () =>
      rendering?.drawHeightmap
        ? rendering.drawHeightmap()
        : fallbackAdapter.drawHeightmap(),
    drawBiomes: () =>
      rendering?.drawBiomes
        ? rendering.drawBiomes()
        : fallbackAdapter.drawBiomes(),
    drawCells: () =>
      rendering?.drawCells
        ? rendering.drawCells()
        : fallbackAdapter.drawCells(),
    isLayerOn: (layer) =>
      rendering?.isLayerOn(layer) ?? fallbackAdapter.isLayerOn(layer),
    invokeActiveZooming: () =>
      rendering?.invokeActiveZooming
        ? rendering.invokeActiveZooming()
        : fallbackAdapter.invokeActiveZooming(),
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
  rendererAdapter: EngineCanvasRendererAdapter = createRuntimeEngineCanvasRendererAdapter(
    context,
  ),
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
  let height = Number(targets.getGraphHeight() || 0);
  let width = Number(targets.getGraphWidth() || 0);
  if ((!height || !width)) {
    const ctx = getActiveEngineRuntimeContext();
    if (ctx) {
      height =
        Number(ctx.worldSettings.graphHeight ?? height) || height;
      width =
        Number(ctx.worldSettings.graphWidth ?? width) || width;
    }
  }
  return { height, width };
}

export function getEnginePackCells(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  const cells = targets.getPack()?.cells;
  if (cells) return cells;
  return getActiveEngineRuntimeContext()?.pack?.cells as unknown;
}

export function getEnginePack(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  const pack = targets.getPack();
  if (pack?.cells) return pack;
  const ctxPack = getActiveEngineRuntimeContext()?.pack;
  if (ctxPack?.cells) return ctxPack as EngineCanvasPack;
  return pack;
}

export function getEngineGridCells(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  const cells = targets.getGridCells();
  if (cells) return cells;
  return getActiveEngineRuntimeContext()?.grid?.cells;
}

export function redrawEngineCanvasEditLayers(
  targets: EngineCanvasAccessTargets = createGlobalEngineCanvasAccessTargets(),
) {
  targets.drawHeightmap();
  targets.drawBiomes();
  if (targets.isLayerOn("toggleCells")) targets.drawCells();
  targets.invokeActiveZooming();
}
