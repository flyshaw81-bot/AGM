import {
  createGlobalGenerationStatisticsService,
  type EngineGenerationStatisticsService,
} from "./engine-generation-statistics-service";
import {
  createGlobalMapGraphLifecycleService,
  type EngineMapGraphLifecycleService,
} from "./engine-map-graph-lifecycle-service";
import {
  createGlobalMapPlacementService,
  type EngineMapPlacementService,
} from "./engine-map-placement-service";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createGlobalWaterFeatureService,
  type EngineWaterFeatureService,
} from "./engine-water-feature-service";

export type EngineLifecycleAdapter = {
  addLakesInDeepDepressions: (context?: EngineRuntimeContext) => void;
  openNearSeaLakes: (context?: EngineRuntimeContext) => void;
  drawOceanLayers: (context?: EngineRuntimeContext) => void;
  defineMapSize: (context?: EngineRuntimeContext) => void;
  calculateMapCoordinates: (context?: EngineRuntimeContext) => void;
  rebuildGraph: (context?: EngineRuntimeContext) => void;
  createDefaultRuler: (context?: EngineRuntimeContext) => void;
  showStatistics: (context?: EngineRuntimeContext) => void;
};

export type EngineMapCoordinateSettings = {
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
};

export type EngineLifecycleTargets = {
  addLakesInDeepDepressions: (lakeElevationLimit: number) => void;
  openNearSeaLakes: (heightmapTemplateId: string | undefined) => void;
  drawOceanLayers: (context: EngineRuntimeContext) => void;
  defineMapSize: (heightmapTemplateId: string | undefined) => void;
  calculateMapCoordinates: (settings: EngineMapCoordinateSettings) => void;
  rebuildGraph: () => void;
  createDefaultRuler: () => void;
  showStatistics: (heightmapTemplateId: string | undefined) => void;
};

export type EngineLifecycleRuntimeServices = {
  generationStatistics: EngineGenerationStatisticsService;
  mapGraphLifecycle: EngineMapGraphLifecycleService;
  mapPlacement: EngineMapPlacementService;
  waterFeatures: EngineWaterFeatureService;
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
  return createLifecycleTargets({
    generationStatistics: createGlobalGenerationStatisticsService(),
    mapGraphLifecycle: createGlobalMapGraphLifecycleService(),
    mapPlacement: createGlobalMapPlacementService(),
    waterFeatures: createGlobalWaterFeatureService(),
  });
}

export function createLifecycleTargets(
  services: EngineLifecycleRuntimeServices,
): EngineLifecycleTargets {
  return {
    addLakesInDeepDepressions: (lakeElevationLimit) => {
      services.waterFeatures.addLakesInDeepDepressions(lakeElevationLimit);
    },
    openNearSeaLakes: (heightmapTemplateId) => {
      services.waterFeatures.openNearSeaLakes(heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      services.waterFeatures.drawOceanLayers(context);
    },
    defineMapSize: (heightmapTemplateId) => {
      services.mapPlacement.defineMapSize(heightmapTemplateId);
    },
    calculateMapCoordinates: (settings) => {
      services.mapPlacement.calculateMapCoordinates(settings);
    },
    rebuildGraph: () => {
      services.mapGraphLifecycle.rebuildGraph();
    },
    createDefaultRuler: () => {
      services.mapGraphLifecycle.createDefaultRuler();
    },
    showStatistics: (heightmapTemplateId) => {
      services.generationStatistics.showStatistics(heightmapTemplateId);
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
      if (context.waterFeatures) {
        context.waterFeatures.addLakesInDeepDepressions(
          settings.lakeElevationLimit,
        );
      } else {
        targets.addLakesInDeepDepressions(settings.lakeElevationLimit);
      }
    },
    openNearSeaLakes: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      if (context.waterFeatures) {
        context.waterFeatures.openNearSeaLakes(settings.heightmapTemplateId);
      } else {
        targets.openNearSeaLakes(settings.heightmapTemplateId);
      }
    },
    drawOceanLayers: (context = getCurrentContext()) => {
      if (context.waterFeatures) {
        context.waterFeatures.drawOceanLayers(context);
      } else {
        targets.drawOceanLayers(context);
      }
    },
    defineMapSize: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      if (context.mapPlacement) {
        context.mapPlacement.defineMapSize(settings.heightmapTemplateId);
      } else {
        targets.defineMapSize(settings.heightmapTemplateId);
      }
    },
    calculateMapCoordinates: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      const mapCoordinates = {
        mapSizePercent: settings.mapSizePercent,
        latitudePercent: settings.latitudePercent,
        longitudePercent: settings.longitudePercent,
      };
      if (context.mapPlacement) {
        context.mapPlacement.calculateMapCoordinates(mapCoordinates);
      } else {
        targets.calculateMapCoordinates(mapCoordinates);
      }
    },
    rebuildGraph: (context = getCurrentContext()) => {
      if (context.mapGraphLifecycle) {
        context.mapGraphLifecycle.rebuildGraph();
      } else {
        targets.rebuildGraph();
      }
    },
    createDefaultRuler: (context = getCurrentContext()) => {
      if (context.mapGraphLifecycle) {
        context.mapGraphLifecycle.createDefaultRuler();
      } else {
        targets.createDefaultRuler();
      }
    },
    showStatistics: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      if (context.generationStatistics) {
        context.generationStatistics.showStatistics(
          settings.heightmapTemplateId,
        );
      } else {
        targets.showStatistics(settings.heightmapTemplateId);
      }
    },
  };
}

export function createGlobalLifecycleAdapter(
  getCurrentContext: () => EngineRuntimeContext,
  targets: EngineLifecycleTargets = createGlobalLifecycleTargets(),
): EngineLifecycleAdapter {
  return createLifecycleAdapter(getCurrentContext, targets);
}
