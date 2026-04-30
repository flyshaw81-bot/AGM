import type { EngineClimateRedrawOptions } from "./engineProjectClimate";

type ClimateWindow = typeof globalThis & {
  updateGlobeTemperature?: () => void;
  updateGlobePosition?: () => void;
  calculateTemperatures?: () => void;
  generatePrecipitation?: () => void;
  Rivers?: {
    generate?: () => void;
    specify?: () => void;
  };
  Biomes?: {
    define?: () => void;
  };
  Features?: {
    defineGroups?: () => void;
  };
  Lakes?: {
    defineNames?: () => void;
  };
  layerIsOn?: (layer: string) => boolean;
  drawTemperature?: () => void;
  drawPrecipitation?: () => void;
  drawBiomes?: () => void;
  drawCoordinates?: () => void;
  drawRivers?: () => void;
  ThreeD?: {
    update?: () => void;
  };
  pack?: {
    cells?: {
      h?: ArrayLike<number>;
    };
  };
};

export type EngineProjectClimateTargets = {
  shouldAutoApplyClimate: () => boolean;
  canUpdateGlobePosition: () => boolean;
  canApplyClimatePipeline: () => boolean;
  updateGlobeTemperature: () => void;
  updateGlobePosition: () => void;
  calculateTemperatures: () => void;
  generatePrecipitation: () => void;
  cloneHeights: () => Uint8Array | undefined;
  generateRivers: () => void;
  specifyRivers: () => void;
  restoreHeights: (heights: Uint8Array) => void;
  defineBiomes: () => void;
  defineFeatureGroups: () => void;
  defineLakeNames: () => void;
  isLayerOn: (layer: string) => boolean;
  drawTemperature: () => void;
  drawPrecipitation: () => void;
  drawBiomes: () => void;
  drawCoordinates: () => void;
  drawRivers: () => void;
  hasCanvas3d: () => boolean;
  updateThreeD: () => void;
  schedule: (callback: () => void, delay: number) => void;
};

export type EngineProjectClimateDomAdapter = {
  shouldAutoApplyClimate: () => boolean;
  hasCanvas3d: () => boolean;
};

export type EngineProjectClimatePipelineAdapter = {
  canUpdateGlobePosition: () => boolean;
  canApplyClimatePipeline: () => boolean;
  updateGlobeTemperature: () => void;
  updateGlobePosition: () => void;
  calculateTemperatures: () => void;
  generatePrecipitation: () => void;
  cloneHeights: () => Uint8Array | undefined;
  generateRivers: () => void;
  specifyRivers: () => void;
  restoreHeights: (heights: Uint8Array) => void;
  defineBiomes: () => void;
  defineFeatureGroups: () => void;
  defineLakeNames: () => void;
};

export type EngineProjectClimateRendererAdapter = {
  isLayerOn: (layer: string) => boolean;
  drawTemperature: () => void;
  drawPrecipitation: () => void;
  drawBiomes: () => void;
  drawCoordinates: () => void;
  drawRivers: () => void;
  updateThreeD: () => void;
};

export type EngineProjectClimateSchedulerAdapter = {
  schedule: (callback: () => void, delay: number) => void;
};

function getClimateWindow(): ClimateWindow {
  return (globalThis.window ?? globalThis) as ClimateWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function isFunction(value: unknown): value is () => void {
  return typeof value === "function";
}

function getPackCells() {
  return getClimateWindow().pack?.cells;
}

function isClimatePipelineAvailable(options: EngineClimateRedrawOptions) {
  const engineWindow = getClimateWindow();
  return (
    (!options.updateGlobePosition ||
      isFunction(engineWindow.updateGlobePosition)) &&
    isFunction(engineWindow.calculateTemperatures) &&
    isFunction(engineWindow.generatePrecipitation) &&
    isFunction(engineWindow.Rivers?.generate) &&
    isFunction(engineWindow.Rivers?.specify) &&
    isFunction(engineWindow.Biomes?.define) &&
    isFunction(engineWindow.Features?.defineGroups) &&
    isFunction(engineWindow.Lakes?.defineNames) &&
    Boolean(getPackCells()?.h)
  );
}

export function createGlobalProjectClimateTargets(
  options: EngineClimateRedrawOptions = {},
): EngineProjectClimateTargets {
  return createProjectClimateTargets(
    createGlobalProjectClimateDomAdapter(),
    createGlobalProjectClimatePipelineAdapter(options),
    createGlobalProjectClimateRendererAdapter(),
    createGlobalProjectClimateSchedulerAdapter(),
  );
}

export function createGlobalProjectClimateDomAdapter(): EngineProjectClimateDomAdapter {
  return {
    shouldAutoApplyClimate: () => {
      const wcAutoChange = getDocument()?.getElementById("wcAutoChange") as
        | HTMLInputElement
        | null
        | undefined;
      return wcAutoChange ? wcAutoChange.checked : true;
    },
    hasCanvas3d: () => Boolean(getDocument()?.getElementById("canvas3d")),
  };
}

export function createGlobalProjectClimatePipelineAdapter(
  options: EngineClimateRedrawOptions = {},
): EngineProjectClimatePipelineAdapter {
  return {
    canUpdateGlobePosition: () =>
      isFunction(getClimateWindow().updateGlobePosition),
    canApplyClimatePipeline: () => isClimatePipelineAvailable(options),
    updateGlobeTemperature: () => getClimateWindow().updateGlobeTemperature?.(),
    updateGlobePosition: () => getClimateWindow().updateGlobePosition?.(),
    calculateTemperatures: () => getClimateWindow().calculateTemperatures?.(),
    generatePrecipitation: () => getClimateWindow().generatePrecipitation?.(),
    cloneHeights: () => {
      const heights = getPackCells()?.h;
      return heights ? new Uint8Array(heights) : undefined;
    },
    generateRivers: () => getClimateWindow().Rivers?.generate?.(),
    specifyRivers: () => getClimateWindow().Rivers?.specify?.(),
    restoreHeights: (heights) => {
      const cells = getPackCells();
      if (cells) cells.h = new Float32Array(heights);
    },
    defineBiomes: () => getClimateWindow().Biomes?.define?.(),
    defineFeatureGroups: () => getClimateWindow().Features?.defineGroups?.(),
    defineLakeNames: () => getClimateWindow().Lakes?.defineNames?.(),
  };
}

export function createGlobalProjectClimateRendererAdapter(): EngineProjectClimateRendererAdapter {
  return {
    isLayerOn: (layer) => getClimateWindow().layerIsOn?.(layer) === true,
    drawTemperature: () => getClimateWindow().drawTemperature?.(),
    drawPrecipitation: () => getClimateWindow().drawPrecipitation?.(),
    drawBiomes: () => getClimateWindow().drawBiomes?.(),
    drawCoordinates: () => getClimateWindow().drawCoordinates?.(),
    drawRivers: () => getClimateWindow().drawRivers?.(),
    updateThreeD: () => getClimateWindow().ThreeD?.update?.(),
  };
}

export function createGlobalProjectClimateSchedulerAdapter(): EngineProjectClimateSchedulerAdapter {
  return {
    schedule: (callback, delay) =>
      getClimateWindow().setTimeout(callback, delay),
  };
}

export function createProjectClimateTargets(
  domAdapter: EngineProjectClimateDomAdapter,
  pipelineAdapter: EngineProjectClimatePipelineAdapter,
  rendererAdapter: EngineProjectClimateRendererAdapter,
  schedulerAdapter: EngineProjectClimateSchedulerAdapter,
): EngineProjectClimateTargets {
  return {
    shouldAutoApplyClimate: domAdapter.shouldAutoApplyClimate,
    canUpdateGlobePosition: pipelineAdapter.canUpdateGlobePosition,
    canApplyClimatePipeline: pipelineAdapter.canApplyClimatePipeline,
    updateGlobeTemperature: pipelineAdapter.updateGlobeTemperature,
    updateGlobePosition: pipelineAdapter.updateGlobePosition,
    calculateTemperatures: pipelineAdapter.calculateTemperatures,
    generatePrecipitation: pipelineAdapter.generatePrecipitation,
    cloneHeights: pipelineAdapter.cloneHeights,
    generateRivers: pipelineAdapter.generateRivers,
    specifyRivers: pipelineAdapter.specifyRivers,
    restoreHeights: pipelineAdapter.restoreHeights,
    defineBiomes: pipelineAdapter.defineBiomes,
    defineFeatureGroups: pipelineAdapter.defineFeatureGroups,
    defineLakeNames: pipelineAdapter.defineLakeNames,
    isLayerOn: rendererAdapter.isLayerOn,
    drawTemperature: rendererAdapter.drawTemperature,
    drawPrecipitation: rendererAdapter.drawPrecipitation,
    drawBiomes: rendererAdapter.drawBiomes,
    drawCoordinates: rendererAdapter.drawCoordinates,
    drawRivers: rendererAdapter.drawRivers,
    hasCanvas3d: domAdapter.hasCanvas3d,
    updateThreeD: rendererAdapter.updateThreeD,
    schedule: schedulerAdapter.schedule,
  };
}
