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

function getGlobalInput(name: string): HTMLInputElement | undefined {
  return globalThis[name as keyof typeof globalThis] as
    | HTMLInputElement
    | undefined;
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

export function createGlobalClimateContextTargets(): EngineClimateContextTargets {
  return {
    getGrid: () => grid,
    getCoordinates: () => mapCoordinates as ClimateMapCoordinates,
    getGraphWidth: () => graphWidth,
    getGraphHeight: () => graphHeight,
    getOptions: () => options,
    getHeightExponent: () =>
      Number(getGlobalInput("heightExponentInput")?.value ?? 1),
    getPointsCount: () =>
      Number(getGlobalInput("pointsInput")?.dataset?.cells ?? 0),
    getPrecipitationPercent: () =>
      Number(getGlobalInput("precInput")?.value ?? 100),
    getPrecipitationLayer: () => prec,
    getDebugTemperature: () => Boolean(DEBUG.temperature),
    getShouldTime: () => TIME,
  };
}

export function createGlobalClimateContext(): ClimateRuntimeContext {
  return createClimateContext(createGlobalClimateContextTargets());
}
