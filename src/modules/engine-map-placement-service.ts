import type { EngineMapCoordinateSettings } from "./engine-lifecycle-adapter";

export type EngineMapPlacementService = {
  defineMapSize: (heightmapTemplateId?: string) => void;
  calculateMapCoordinates: (settings: EngineMapCoordinateSettings) => void;
};

export type EngineMapPlacementTargets = {
  defineMapSize: (heightmapTemplateId?: string) => void;
  calculateMapCoordinates: (settings: EngineMapCoordinateSettings) => void;
};

export function createMapPlacementService(
  targets: EngineMapPlacementTargets,
): EngineMapPlacementService {
  return {
    defineMapSize: (heightmapTemplateId) => {
      targets.defineMapSize(heightmapTemplateId);
    },
    calculateMapCoordinates: (settings) => {
      targets.calculateMapCoordinates(settings);
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

export function createGlobalMapPlacementTargets(): EngineMapPlacementTargets {
  return {
    defineMapSize: (heightmapTemplateId) => {
      getGlobalFunction<(heightmapTemplateId?: string) => void>(
        "defineMapSize",
      )?.(heightmapTemplateId);
    },
    calculateMapCoordinates: (settings) => {
      getGlobalFunction<(settings: EngineMapCoordinateSettings) => void>(
        "calculateMapCoordinates",
      )?.(settings);
    },
  };
}

export function createGlobalMapPlacementService(
  targets: EngineMapPlacementTargets = createGlobalMapPlacementTargets(),
): EngineMapPlacementService {
  return createMapPlacementService(targets);
}
