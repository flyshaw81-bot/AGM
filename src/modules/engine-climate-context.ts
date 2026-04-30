import type { ClimateMapCoordinates, ClimateRuntimeContext } from "./climate";

function getGlobalInput(name: string): HTMLInputElement | undefined {
  return globalThis[name as keyof typeof globalThis] as
    | HTMLInputElement
    | undefined;
}

export function createGlobalClimateContext(): ClimateRuntimeContext {
  return {
    grid,
    coordinates: mapCoordinates as ClimateMapCoordinates,
    graphWidth,
    graphHeight,
    options,
    heightExponent: Number(getGlobalInput("heightExponentInput")?.value ?? 1),
    pointsCount: Number(getGlobalInput("pointsInput")?.dataset?.cells ?? 0),
    precipitationPercent: Number(getGlobalInput("precInput")?.value ?? 100),
    precipitationLayer: prec,
    debugTemperature: Boolean(DEBUG.temperature),
    shouldTime: TIME,
  };
}
