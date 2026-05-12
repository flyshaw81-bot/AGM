import type { ClimateMapCoordinates, ClimateRuntimeContext } from "./climate";
import type { EngineGrid, EngineOptions } from "./engine-world-state";

export type EngineClimateContextTargets = {
  getGrid: () => EngineGrid;
  getCoordinates: () => ClimateMapCoordinates;
  getGraphWidth: () => number;
  getGraphHeight: () => number;
  getOptions: () => EngineOptions;
  getHeightExponent: () => number;
  getPointsCount: () => number;
  getPrecipitationPercent: () => number;
  getPrecipitationLayer: () => typeof prec;
  getDebugTemperature: () => boolean;
  getShouldTime: () => boolean;
};

export type EngineClimateInputTargets = {
  getHeightExponent: () => number;
  getPointsInput: () => HTMLInputElement | undefined;
  getPrecipitationPercent: () => number;
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
    getHeightExponent: () => {
      try {
        return typeof globalThis.heightExponent === "number"
          ? globalThis.heightExponent
          : 1;
      } catch {
        return 1;
      }
    },
    getPointsInput: () => getGlobalInput("pointsInput"),
    getPrecipitationPercent: () => {
      try {
        return typeof globalThis.precipitationPercent === "number"
          ? globalThis.precipitationPercent
          : 100;
      } catch {
        return 100;
      }
    },
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
    getHeightExponent: inputTargets.getHeightExponent,
    getPointsCount: () =>
      Number(inputTargets.getPointsInput()?.dataset?.cells ?? 0),
    getPrecipitationPercent: inputTargets.getPrecipitationPercent,
    getPrecipitationLayer: () => prec,
    getDebugTemperature: () => Boolean(DEBUG.temperature),
    getShouldTime: () => TIME,
  };
}

export function createGlobalClimateContext(): ClimateRuntimeContext {
  return createClimateContext(createGlobalClimateContextTargets());
}
