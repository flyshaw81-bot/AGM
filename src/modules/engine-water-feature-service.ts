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

export function createGlobalWaterFeatureTargets(): EngineWaterFeatureTargets {
  return {
    addLakesInDeepDepressions: (lakeElevationLimit) => {
      globalThis.addLakesInDeepDepressions?.(lakeElevationLimit);
    },
    openNearSeaLakes: (heightmapTemplateId) => {
      globalThis.openNearSeaLakes?.(heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      globalThis.OceanLayers?.(context);
    },
  };
}

export function createGlobalWaterFeatureService(
  targets: EngineWaterFeatureTargets = createGlobalWaterFeatureTargets(),
): EngineWaterFeatureService {
  return createWaterFeatureService(targets);
}
