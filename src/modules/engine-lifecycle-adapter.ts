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

export type EngineLifecycleSettingsSnapshot = {
  heightmapTemplateId?: string;
  lakeElevationLimit: number;
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
};

export function createLifecycleSettingsSnapshot(
  context: EngineRuntimeContext,
): EngineLifecycleSettingsSnapshot {
  const generationSettings =
    context.generationSettingsStore?.get() ?? context.generationSettings;
  const worldSettings =
    context.worldSettingsStore?.get() ?? context.worldSettings;

  return {
    heightmapTemplateId: generationSettings.heightmapTemplateId,
    lakeElevationLimit: generationSettings.lakeElevationLimit,
    mapSizePercent: worldSettings.mapSizePercent,
    latitudePercent: worldSettings.latitudePercent,
    longitudePercent: worldSettings.longitudePercent,
  };
}

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
      const settings = createLifecycleSettingsSnapshot(context);
      targets.addLakesInDeepDepressions(settings.lakeElevationLimit);
    },
    openNearSeaLakes: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      targets.openNearSeaLakes(settings.heightmapTemplateId);
    },
    drawOceanLayers: (context = getCurrentContext()) => {
      targets.drawOceanLayers(context);
    },
    defineMapSize: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      targets.defineMapSize(settings.heightmapTemplateId);
    },
    calculateMapCoordinates: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      targets.calculateMapCoordinates({
        mapSizePercent: settings.mapSizePercent,
        latitudePercent: settings.latitudePercent,
        longitudePercent: settings.longitudePercent,
      });
    },
    rebuildGraph: () => {
      targets.rebuildGraph();
    },
    createDefaultRuler: () => {
      targets.createDefaultRuler();
    },
    showStatistics: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      targets.showStatistics(settings.heightmapTemplateId);
    },
  };
}

export function createGlobalLifecycleAdapter(
  getCurrentContext: () => EngineRuntimeContext,
  targets: EngineLifecycleTargets = createGlobalLifecycleTargets(),
): EngineLifecycleAdapter {
  return createLifecycleAdapter(getCurrentContext, targets);
}
