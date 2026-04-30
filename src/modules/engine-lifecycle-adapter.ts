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

export type EngineLifecycleTargets = {
  addLakesInDeepDepressions: (lakeElevationLimit: number) => void;
  openNearSeaLakes: (heightmapTemplateId: string | undefined) => void;
  drawOceanLayers: (context: EngineRuntimeContext) => void;
  defineMapSize: (heightmapTemplateId: string | undefined) => void;
  calculateMapCoordinates: (settings: {
    mapSizePercent?: number;
    latitudePercent?: number;
    longitudePercent?: number;
  }) => void;
  rebuildGraph: () => void;
  createDefaultRuler: () => void;
  showStatistics: (heightmapTemplateId: string | undefined) => void;
};

export function createGlobalLifecycleTargets(): EngineLifecycleTargets {
  return {
    addLakesInDeepDepressions: (lakeElevationLimit) => {
      addLakesInDeepDepressions(lakeElevationLimit);
    },
    openNearSeaLakes: (heightmapTemplateId) => {
      openNearSeaLakes(heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      OceanLayers(context);
    },
    defineMapSize: (heightmapTemplateId) => {
      defineMapSize(heightmapTemplateId);
    },
    calculateMapCoordinates: (settings) => {
      calculateMapCoordinates(settings);
    },
    rebuildGraph: () => {
      reGraph();
    },
    createDefaultRuler: () => {
      createDefaultRuler();
    },
    showStatistics: (heightmapTemplateId) => {
      showStatistics(heightmapTemplateId);
    },
  };
}

export function createLifecycleAdapter(
  getCurrentContext: () => EngineRuntimeContext,
  targets: EngineLifecycleTargets,
): EngineLifecycleAdapter {
  return {
    addLakesInDeepDepressions: (context = getCurrentContext()) => {
      targets.addLakesInDeepDepressions(
        context.generationSettings.lakeElevationLimit,
      );
    },
    openNearSeaLakes: (context = getCurrentContext()) => {
      targets.openNearSeaLakes(context.generationSettings.heightmapTemplateId);
    },
    drawOceanLayers: (context = getCurrentContext()) => {
      targets.drawOceanLayers(context);
    },
    defineMapSize: (context = getCurrentContext()) => {
      targets.defineMapSize(context.generationSettings.heightmapTemplateId);
    },
    calculateMapCoordinates: (context = getCurrentContext()) => {
      targets.calculateMapCoordinates({
        mapSizePercent: context.worldSettings.mapSizePercent,
        latitudePercent: context.worldSettings.latitudePercent,
        longitudePercent: context.worldSettings.longitudePercent,
      });
    },
    rebuildGraph: () => {
      targets.rebuildGraph();
    },
    createDefaultRuler: () => {
      targets.createDefaultRuler();
    },
    showStatistics: (context = getCurrentContext()) => {
      targets.showStatistics(context.generationSettings.heightmapTemplateId);
    },
  };
}

export function createGlobalLifecycleAdapter(
  getCurrentContext: () => EngineRuntimeContext,
  targets: EngineLifecycleTargets = createGlobalLifecycleTargets(),
): EngineLifecycleAdapter {
  return createLifecycleAdapter(getCurrentContext, targets);
}
