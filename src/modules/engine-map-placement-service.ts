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

export function createGlobalMapPlacementTargets(): EngineMapPlacementTargets {
  return {
    defineMapSize: (heightmapTemplateId) => {
      defineMapSize(heightmapTemplateId);
    },
    calculateMapCoordinates: (settings) => {
      calculateMapCoordinates(settings);
    },
  };
}

export function createGlobalMapPlacementService(
  targets: EngineMapPlacementTargets = createGlobalMapPlacementTargets(),
): EngineMapPlacementService {
  return createMapPlacementService(targets);
}
