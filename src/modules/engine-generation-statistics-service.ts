import { byId } from "../utils/shorthands";
import {
  getBrowserRuntimeGraphSize,
  getBrowserRuntimeGrid,
  getBrowserRuntimePack,
  getBrowserRuntimeSeed,
} from "./engine-browser-runtime-globals";
import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineGenerationStatisticsService = {
  showStatistics: (heightmapTemplateId: string | undefined) => void;
};

export type EngineGenerationStatisticsTargets =
  EngineGenerationStatisticsService;

export type EngineGenerationStatisticsRuntimeTargets = {
  getHeightmapTemplateId: () => string | undefined;
  getHeightmapTemplates: () => Record<string, unknown>;
  isLocked: (settingId: string) => boolean;
  getSeed: () => string | undefined;
  getGraphSize: () => { width: number; height: number };
  getGridPointCount: () => number;
  getPackCount: (
    collection:
      | "cells"
      | "states"
      | "provinces"
      | "burgs"
      | "religions"
      | "cultures",
  ) => number;
  getMapSizePercent: () => string | undefined;
  getCulturesSet: () => string | undefined;
  createMapId: () => number;
  setMapId: (mapId: number) => void;
  pushMapHistory: (entry: {
    seed?: string;
    width: number;
    height: number;
    template: string | undefined;
    created: number;
  }) => void;
  logInfo: (message: string) => void;
  dispatchGeneratedEvent: (detail: { seed?: string; mapId: number }) => void;
};

declare global {
  var EngineGenerationStatistics: EngineGenerationStatisticsService;
  var mapId: number | string | undefined;

  interface Window {
    EngineGenerationStatistics: EngineGenerationStatisticsService;
    mapId: number | string | undefined;
    showStatistics: (heightmapTemplateId?: string) => void;
  }
}

export function createGenerationStatisticsService(
  targets: EngineGenerationStatisticsTargets,
): EngineGenerationStatisticsService {
  return {
    showStatistics: (heightmapTemplateId) => {
      targets.showStatistics(heightmapTemplateId);
    },
  };
}

export function createGlobalGenerationStatisticsRuntimeTargets(): EngineGenerationStatisticsRuntimeTargets {
  return {
    getHeightmapTemplateId: () =>
      byId<HTMLInputElement>("templateInput")?.value,
    getHeightmapTemplates: () => globalThis.heightmapTemplates ?? {},
    isLocked: (settingId) => globalThis.locked?.(settingId) ?? false,
    getSeed: () => getBrowserRuntimeSeed(),
    getGraphSize: () => {
      const { width, height } = getBrowserRuntimeGraphSize();
      return { width: width ?? 0, height: height ?? 0 };
    },
    getGridPointCount: () => getBrowserRuntimeGrid()?.points?.length ?? 0,
    getPackCount: (collection) => {
      const packSource = getBrowserRuntimePack();
      if (collection === "cells") return packSource?.cells?.i?.length ?? 0;
      return Math.max((packSource?.[collection]?.length ?? 1) - 1, 0);
    },
    getMapSizePercent: () =>
      typeof globalThis.mapSizePercent === "number"
        ? String(globalThis.mapSizePercent)
        : undefined,
    getCulturesSet: () => globalThis.culturesSet?.value,
    createMapId: () => Date.now(),
    setMapId: (mapId) => {
      globalThis.mapId = mapId;
    },
    pushMapHistory: (entry) => {
      globalThis.mapHistory?.push(entry);
    },
    logInfo: (message) => {
      if ((globalThis as typeof globalThis & { INFO?: boolean }).INFO) {
        console.info(message);
      }
    },
    dispatchGeneratedEvent: (detail) => {
      getWindow()?.dispatchEvent(new CustomEvent("map:generated", { detail }));
    },
  };
}

export function showEngineGenerationStatistics(
  heightmapTemplateId: string | undefined,
  targets: EngineGenerationStatisticsRuntimeTargets = createGlobalGenerationStatisticsRuntimeTargets(),
) {
  const heightmap = heightmapTemplateId ?? targets.getHeightmapTemplateId();
  const graphSize = targets.getGraphSize();
  const templates = targets.getHeightmapTemplates();
  const isTemplate = Boolean(heightmap && heightmap in templates);
  const heightmapType = isTemplate ? "template" : "precreated";
  const isRandomTemplate =
    isTemplate && !targets.isLocked("template") ? "random " : "";
  const seed = targets.getSeed();

  const stats = `  Seed: ${seed}
    Canvas size: ${graphSize.width}x${graphSize.height} px
    Heightmap: ${heightmap}
    Template: ${isRandomTemplate}${heightmapType}
    Points: ${targets.getGridPointCount()}
    Cells: ${targets.getPackCount("cells")}
    Map size: ${targets.getMapSizePercent()}%
    States: ${targets.getPackCount("states")}
    Provinces: ${targets.getPackCount("provinces")}
    Burgs: ${targets.getPackCount("burgs")}
    Religions: ${targets.getPackCount("religions")}
    Culture set: ${targets.getCulturesSet()}
    Cultures: ${targets.getPackCount("cultures")}`;

  const mapId = targets.createMapId();
  targets.setMapId(mapId);
  targets.pushMapHistory({
    seed,
    width: graphSize.width,
    height: graphSize.height,
    template: heightmap,
    created: mapId,
  });
  targets.logInfo(stats);
  targets.dispatchGeneratedEvent({ seed, mapId });
}

export function createGlobalGenerationStatisticsTargets(): EngineGenerationStatisticsTargets {
  return {
    showStatistics: (heightmapTemplateId) => {
      showEngineGenerationStatistics(heightmapTemplateId);
    },
  };
}

export function createRuntimeGenerationStatisticsTargets(
  context: EngineRuntimeContext,
  globalTargets: EngineGenerationStatisticsRuntimeTargets = createGlobalGenerationStatisticsRuntimeTargets(),
): EngineGenerationStatisticsTargets {
  const runtimeTargets: EngineGenerationStatisticsRuntimeTargets = {
    ...globalTargets,
    getSeed: () => context.seed,
    getGraphSize: () => ({
      width: context.worldSettings.graphWidth ?? 0,
      height: context.worldSettings.graphHeight ?? 0,
    }),
    getGridPointCount: () => context.grid?.points?.length ?? 0,
    getPackCount: (collection) => {
      if (collection === "cells") return context.pack?.cells?.i?.length ?? 0;
      return Math.max(
        ((context.pack as unknown as Record<string, unknown[]>)[collection]
          ?.length ?? 1) - 1,
        0,
      );
    },
  };

  return {
    showStatistics: (heightmapTemplateId) => {
      showEngineGenerationStatistics(heightmapTemplateId, runtimeTargets);
    },
  };
}

export function createGlobalGenerationStatisticsService(
  targets: EngineGenerationStatisticsTargets = createGlobalGenerationStatisticsTargets(),
): EngineGenerationStatisticsService {
  return createGenerationStatisticsService(targets);
}

export function createRuntimeGenerationStatisticsService(
  context: EngineRuntimeContext,
  targets: EngineGenerationStatisticsTargets = createRuntimeGenerationStatisticsTargets(
    context,
  ),
): EngineGenerationStatisticsService {
  return createGenerationStatisticsService(targets);
}

function getWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.EngineGenerationStatistics =
    createGlobalGenerationStatisticsService();
  runtimeWindow.showStatistics = (heightmapTemplateId?: string) => {
    runtimeWindow.EngineGenerationStatistics.showStatistics(
      heightmapTemplateId,
    );
  };
}
