import { getBrowserRuntimeValue } from "./engine-browser-runtime-globals";
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
  addLakesInDeepDepressions: (
    context: EngineRuntimeContext,
    lakeElevationLimit: number,
  ) => void;
  openNearSeaLakes: (
    context: EngineRuntimeContext,
    heightmapTemplateId: string | undefined,
  ) => void;
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

const lifecycleRuntimeGlobalKeys = [
  "grid",
  "pack",
  "options",
  "biomesData",
  "seed",
  "graphWidth",
  "graphHeight",
  "mapCoordinates",
] as const;

type LifecycleRuntimeGlobalKey = (typeof lifecycleRuntimeGlobalKeys)[number];

type LifecycleRuntimeGlobalSnapshot = {
  descriptor: PropertyDescriptor | undefined;
  key: LifecycleRuntimeGlobalKey;
};

function getGlobalValue<T = unknown>(
  key: LifecycleRuntimeGlobalKey,
): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[key] as T | undefined;
  } catch {
    return undefined;
  }
}

function setGlobalValue(key: LifecycleRuntimeGlobalKey, value: unknown): void {
  try {
    (globalThis as Record<string, unknown>)[key] = value;
  } catch {
    // Compatibility globals can be read-only in tests or embedding contexts.
  }
}

function snapshotLifecycleRuntimeGlobals(): LifecycleRuntimeGlobalSnapshot[] {
  return lifecycleRuntimeGlobalKeys.map((key) => ({
    descriptor: Object.getOwnPropertyDescriptor(globalThis, key),
    key,
  }));
}

function restoreLifecycleRuntimeGlobals(
  snapshots: LifecycleRuntimeGlobalSnapshot[],
): void {
  for (const { descriptor, key } of snapshots) {
    try {
      if (descriptor) {
        Object.defineProperty(globalThis, key, descriptor);
      } else {
        delete (globalThis as Record<string, unknown>)[key];
      }
    } catch {
      if (!descriptor) setGlobalValue(key, undefined);
    }
  }
}

function readContextWorldSettings(context: EngineRuntimeContext) {
  return context.worldSettingsStore?.get() ?? context.worldSettings;
}

function refreshContextWorldSettings(context: EngineRuntimeContext): void {
  const mapCoordinatesValue = getBrowserRuntimeValue("mapCoordinates");
  const graphWidthValue = getGlobalValue<number>("graphWidth");
  const graphHeightValue = getGlobalValue<number>("graphHeight");
  const patch: Partial<EngineRuntimeContext["worldSettings"]> = {};

  if (mapCoordinatesValue) patch.mapCoordinates = mapCoordinatesValue;
  if (typeof graphWidthValue === "number") patch.graphWidth = graphWidthValue;
  if (typeof graphHeightValue === "number")
    patch.graphHeight = graphHeightValue;

  if (Object.keys(patch).length) {
    context.worldSettings = context.worldSettingsStore?.patch?.(patch) ?? {
      ...context.worldSettings,
      ...patch,
    };
  }
  if (context.climate && mapCoordinatesValue) {
    context.climate.coordinates = mapCoordinatesValue as NonNullable<
      EngineRuntimeContext["climate"]
    >["coordinates"];
    context.climate.graphWidth = context.worldSettings.graphWidth ?? 0;
    context.climate.graphHeight = context.worldSettings.graphHeight ?? 0;
  }
}

function withLifecycleRuntimeGlobals(
  context: EngineRuntimeContext,
  callback: () => void,
): void {
  const worldSettings = readContextWorldSettings(context);
  const snapshots = snapshotLifecycleRuntimeGlobals();
  setGlobalValue("grid", context.grid);
  setGlobalValue("pack", context.pack);
  setGlobalValue("options", context.options);
  setGlobalValue("biomesData", context.biomesData);
  setGlobalValue("seed", context.seed);
  setGlobalValue("graphWidth", worldSettings.graphWidth);
  setGlobalValue("graphHeight", worldSettings.graphHeight);
  setGlobalValue("mapCoordinates", worldSettings.mapCoordinates);

  try {
    callback();
    refreshContextWorldSettings(context);
  } finally {
    restoreLifecycleRuntimeGlobals(snapshots);
  }
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
    addLakesInDeepDepressions: (context, lakeElevationLimit) => {
      services.waterFeatures.addLakesInDeepDepressions(
        context,
        lakeElevationLimit,
      );
    },
    openNearSeaLakes: (context, heightmapTemplateId) => {
      services.waterFeatures.openNearSeaLakes(context, heightmapTemplateId);
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
          context,
          settings.lakeElevationLimit,
        );
      } else {
        targets.addLakesInDeepDepressions(context, settings.lakeElevationLimit);
      }
    },
    openNearSeaLakes: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      if (context.waterFeatures) {
        context.waterFeatures.openNearSeaLakes(
          context,
          settings.heightmapTemplateId,
        );
      } else {
        targets.openNearSeaLakes(context, settings.heightmapTemplateId);
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
      withLifecycleRuntimeGlobals(context, () => {
        if (context.mapPlacement) {
          context.mapPlacement.defineMapSize(settings.heightmapTemplateId);
        } else {
          targets.defineMapSize(settings.heightmapTemplateId);
        }
      });
      context.worldSettingsStore?.refresh?.();
    },
    calculateMapCoordinates: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      const mapCoordinates = {
        mapSizePercent: settings.mapSizePercent,
        latitudePercent: settings.latitudePercent,
        longitudePercent: settings.longitudePercent,
      };
      withLifecycleRuntimeGlobals(context, () => {
        if (context.mapPlacement) {
          context.mapPlacement.calculateMapCoordinates(mapCoordinates);
        } else {
          targets.calculateMapCoordinates(mapCoordinates);
        }
      });
    },
    rebuildGraph: (context = getCurrentContext()) => {
      withLifecycleRuntimeGlobals(context, () => {
        if (context.mapGraphLifecycle) {
          context.mapGraphLifecycle.rebuildGraph();
        } else {
          targets.rebuildGraph();
        }
      });
    },
    createDefaultRuler: (context = getCurrentContext()) => {
      withLifecycleRuntimeGlobals(context, () => {
        if (context.mapGraphLifecycle) {
          context.mapGraphLifecycle.createDefaultRuler();
        } else {
          targets.createDefaultRuler();
        }
      });
    },
    showStatistics: (context = getCurrentContext()) => {
      const settings = createLifecycleSettingsSnapshot(context);
      withLifecycleRuntimeGlobals(context, () => {
        if (context.generationStatistics) {
          context.generationStatistics.showStatistics(
            settings.heightmapTemplateId,
          );
        } else {
          targets.showStatistics(settings.heightmapTemplateId);
        }
      });
    },
  };
}

export function createGlobalLifecycleAdapter(
  getCurrentContext: () => EngineRuntimeContext,
  targets: EngineLifecycleTargets = createGlobalLifecycleTargets(),
): EngineLifecycleAdapter {
  return createLifecycleAdapter(getCurrentContext, targets);
}
