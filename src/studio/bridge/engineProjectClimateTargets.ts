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
  try {
    return (globalThis.window ?? globalThis) as ClimateWindow;
  } catch {
    return globalThis as ClimateWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function isFunction(value: unknown): value is () => void {
  return typeof value === "function";
}

function getPackCells() {
  try {
    return getClimateWindow().pack?.cells;
  } catch {
    return undefined;
  }
}

function isClimatePipelineAvailable(options: EngineClimateRedrawOptions) {
  try {
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
  } catch {
    return false;
  }
}

function callClimateHelper(callback: () => void) {
  try {
    callback();
  } catch {
    // Climate compatibility helpers are best-effort behind injected adapters.
  }
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
      try {
        const wcAutoChange = getDocument()?.getElementById("wcAutoChange") as
          | HTMLInputElement
          | null
          | undefined;
        return wcAutoChange ? wcAutoChange.checked : true;
      } catch {
        return true;
      }
    },
    hasCanvas3d: () => {
      try {
        return Boolean(getDocument()?.getElementById("canvas3d"));
      } catch {
        return false;
      }
    },
  };
}

export function createGlobalProjectClimatePipelineAdapter(
  options: EngineClimateRedrawOptions = {},
): EngineProjectClimatePipelineAdapter {
  return {
    canUpdateGlobePosition: () => {
      try {
        return isFunction(getClimateWindow().updateGlobePosition);
      } catch {
        return false;
      }
    },
    canApplyClimatePipeline: () => isClimatePipelineAvailable(options),
    updateGlobeTemperature: () =>
      callClimateHelper(() => getClimateWindow().updateGlobeTemperature?.()),
    updateGlobePosition: () =>
      callClimateHelper(() => getClimateWindow().updateGlobePosition?.()),
    calculateTemperatures: () =>
      callClimateHelper(() => getClimateWindow().calculateTemperatures?.()),
    generatePrecipitation: () =>
      callClimateHelper(() => getClimateWindow().generatePrecipitation?.()),
    cloneHeights: () => {
      try {
        const heights = getPackCells()?.h;
        return heights ? new Uint8Array(heights) : undefined;
      } catch {
        return undefined;
      }
    },
    generateRivers: () =>
      callClimateHelper(() => getClimateWindow().Rivers?.generate?.()),
    specifyRivers: () =>
      callClimateHelper(() => getClimateWindow().Rivers?.specify?.()),
    restoreHeights: (heights) => {
      try {
        const cells = getPackCells();
        if (cells) cells.h = new Float32Array(heights);
      } catch {
        // Pack height restore is best-effort for compatibility targets.
      }
    },
    defineBiomes: () =>
      callClimateHelper(() => getClimateWindow().Biomes?.define?.()),
    defineFeatureGroups: () =>
      callClimateHelper(() => getClimateWindow().Features?.defineGroups?.()),
    defineLakeNames: () =>
      callClimateHelper(() => getClimateWindow().Lakes?.defineNames?.()),
  };
}

export function createGlobalProjectClimateRendererAdapter(): EngineProjectClimateRendererAdapter {
  return {
    isLayerOn: (layer) => {
      try {
        return getClimateWindow().layerIsOn?.(layer) === true;
      } catch {
        return false;
      }
    },
    drawTemperature: () =>
      callClimateHelper(() => getClimateWindow().drawTemperature?.()),
    drawPrecipitation: () =>
      callClimateHelper(() => getClimateWindow().drawPrecipitation?.()),
    drawBiomes: () =>
      callClimateHelper(() => getClimateWindow().drawBiomes?.()),
    drawCoordinates: () =>
      callClimateHelper(() => getClimateWindow().drawCoordinates?.()),
    drawRivers: () =>
      callClimateHelper(() => getClimateWindow().drawRivers?.()),
    updateThreeD: () =>
      callClimateHelper(() => getClimateWindow().ThreeD?.update?.()),
  };
}

export function createGlobalProjectClimateSchedulerAdapter(): EngineProjectClimateSchedulerAdapter {
  return {
    schedule: (callback, delay) => {
      try {
        const scheduler = getClimateWindow().setTimeout;
        if (typeof scheduler === "function") scheduler(callback, delay);
      } catch {
        // Scheduling is optional in compatibility mode.
      }
    },
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
