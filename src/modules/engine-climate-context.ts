import type { ClimateMapCoordinates, ClimateRuntimeContext } from "./climate";

export type EngineClimateContextTargets = {
  getGrid: () => typeof grid;
  getCoordinates: () => ClimateMapCoordinates;
  getGraphWidth: () => number;
  getGraphHeight: () => number;
  getOptions: () => typeof options;
  getHeightExponent: () => number;
  getPointsCount: () => number;
  getPrecipitationPercent: () => number;
  getPrecipitationLayer: () => typeof prec;
  getDebugTemperature: () => boolean;
  getShouldTime: () => boolean;
};

export type EngineClimateInputTargets = {
  getHeightExponentInput: () => HTMLInputElement | undefined;
  getPointsInput: () => HTMLInputElement | undefined;
  getPrecipitationInput: () => HTMLInputElement | undefined;
};

function getGlobalInput(
  name: keyof typeof globalThis,
): HTMLInputElement | undefined {
  try {
    return globalThis[name] as HTMLInputElement | undefined;
  } catch {
    return undefined;
  }
}

export function createGlobalClimateInputTargets(): EngineClimateInputTargets {
  return {
    getHeightExponentInput: () => getGlobalInput("heightExponentInput"),
    getPointsInput: () => getGlobalInput("pointsInput"),
    getPrecipitationInput: () => getGlobalInput("precInput"),
  };
}

export function createClimateContext(
  targets: EngineClimateContextTargets,
): ClimateRuntimeContext {
  return {
    grid: targets.getGrid(),
    coordinates: targets.getCoordinates(),
    graphWidth: targets.getGraphWidth(),
    graphHeight: targets.getGraphHeight(),
    options: targets.getOptions(),
    heightExponent: targets.getHeightExponent(),
    pointsCount: targets.getPointsCount(),
    precipitationPercent: targets.getPrecipitationPercent(),
    precipitationLayer: targets.getPrecipitationLayer(),
    debugTemperature: targets.getDebugTemperature(),
    shouldTime: targets.getShouldTime(),
  };
}

export function createGlobalClimateContextTargets(
  inputTargets: EngineClimateInputTargets = createGlobalClimateInputTargets(),
): EngineClimateContextTargets {
  return {
    getGrid: () => grid,
    getCoordinates: () => mapCoordinates as ClimateMapCoordinates,
    getGraphWidth: () => graphWidth,
    getGraphHeight: () => graphHeight,
    getOptions: () => options,
    getHeightExponent: () =>
      Number(inputTargets.getHeightExponentInput()?.value ?? 1),
    getPointsCount: () =>
      Number(inputTargets.getPointsInput()?.dataset?.cells ?? 0),
    getPrecipitationPercent: () =>
      Number(inputTargets.getPrecipitationInput()?.value ?? 100),
    getPrecipitationLayer: () => prec,
    getDebugTemperature: () => Boolean(DEBUG.temperature),
    getShouldTime: () => TIME,
  };
}

export function createGlobalClimateContext(): ClimateRuntimeContext {
  return createClimateContext(createGlobalClimateContextTargets());
}
