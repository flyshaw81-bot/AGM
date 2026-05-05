import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineWaterFeatureService = {
  addLakesInDeepDepressions: (lakeElevationLimit: number) => void;
  openNearSeaLakes: (heightmapTemplateId: string | undefined) => void;
  drawOceanLayers: (context: EngineRuntimeContext) => void;
};

export type EngineWaterFeatureTargets = EngineWaterFeatureService;

export function createWaterFeatureService(
  targets: EngineWaterFeatureTargets,
): EngineWaterFeatureService {
  return {
    addLakesInDeepDepressions: (lakeElevationLimit) => {
      targets.addLakesInDeepDepressions(lakeElevationLimit);
    },
    openNearSeaLakes: (heightmapTemplateId) => {
      targets.openNearSeaLakes(heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      targets.drawOceanLayers(context);
    },
  };
}

function getGlobalFunction<T extends (...args: never[]) => unknown>(
  name: string,
): T | undefined {
  try {
    const value = (globalThis as Record<string, unknown>)[name];
    return typeof value === "function" ? (value as T) : undefined;
  } catch {
    return undefined;
  }
}

export function createGlobalWaterFeatureTargets(): EngineWaterFeatureTargets {
  return {
    addLakesInDeepDepressions: (lakeElevationLimit) => {
      getGlobalFunction<(lakeElevationLimit: number) => void>(
        "addLakesInDeepDepressions",
      )?.(lakeElevationLimit);
    },
    openNearSeaLakes: (heightmapTemplateId) => {
      getGlobalFunction<(heightmapTemplateId: string | undefined) => void>(
        "openNearSeaLakes",
      )?.(heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      getGlobalFunction<(context: EngineRuntimeContext) => void>(
        "OceanLayers",
      )?.(context);
    },
  };
}

export function createGlobalWaterFeatureService(
  targets: EngineWaterFeatureTargets = createGlobalWaterFeatureTargets(),
): EngineWaterFeatureService {
  return createWaterFeatureService(targets);
}
