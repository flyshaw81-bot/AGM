import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineLifecycleAdapter = {
  addLakesInDeepDepressions: (context?: EngineRuntimeContext) => void;
  openNearSeaLakes: (context?: EngineRuntimeContext) => void;
  drawOceanLayers: (context?: EngineRuntimeContext) => void;
  defineMapSize: (context?: EngineRuntimeContext) => void;
  calculateMapCoordinates: (context?: EngineRuntimeContext) => void;
  rebuildGraph: () => void;
  createDefaultRuler: () => void;
  showStatistics: (context?: EngineRuntimeContext) => void;
};

export function createGlobalLifecycleAdapter(
  getCurrentContext: () => EngineRuntimeContext,
): EngineLifecycleAdapter {
  return {
    addLakesInDeepDepressions: (context = getCurrentContext()) => {
      addLakesInDeepDepressions(context.generationSettings.lakeElevationLimit);
    },
    openNearSeaLakes: (context = getCurrentContext()) => {
      openNearSeaLakes(context.generationSettings.heightmapTemplateId);
    },
    drawOceanLayers: (context = getCurrentContext()) => {
      OceanLayers(context);
    },
    defineMapSize: (context = getCurrentContext()) => {
      defineMapSize(context.generationSettings.heightmapTemplateId);
    },
    calculateMapCoordinates: (context = getCurrentContext()) => {
      calculateMapCoordinates({
        mapSizePercent: context.worldSettings.mapSizePercent,
        latitudePercent: context.worldSettings.latitudePercent,
        longitudePercent: context.worldSettings.longitudePercent,
      });
    },
    rebuildGraph: () => {
      reGraph();
    },
    createDefaultRuler: () => {
      createDefaultRuler();
    },
    showStatistics: (context = getCurrentContext()) => {
      showStatistics(context.generationSettings.heightmapTemplateId);
    },
  };
}
