import { rn } from "../utils/numberUtils";
import { gauss, P } from "../utils/probabilityUtils";
import { byId } from "../utils/shorthands";
import {
  getBrowserRuntimeGraphSize,
  getBrowserRuntimeGrid,
  getBrowserRuntimeNumber,
  setBrowserRuntimeValue,
} from "./engine-browser-runtime-globals";
import type { EngineMapCoordinateSettings } from "./engine-lifecycle-adapter";
import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineMapPlacementService = {
  defineMapSize: (heightmapTemplateId?: string) => void;
  calculateMapCoordinates: (settings: EngineMapCoordinateSettings) => void;
};

export type EngineMapPlacementTargets = {
  defineMapSize: (heightmapTemplateId?: string) => void;
  calculateMapCoordinates: (settings: EngineMapCoordinateSettings) => void;
};

export type EngineMapCoordinates = {
  latT: number;
  latN: number;
  latS: number;
  lonT: number;
  lonW: number;
  lonE: number;
};

export type EngineMapCoordinateRuntimeTargets = {
  getGraphSize: () => { width: number; height: number };
  getMapSizePercent: () => number;
  getLatitudePercent: () => number;
  getLongitudePercent: () => number;
  round: (value: number, decimals: number) => number;
  setMapCoordinates: (coordinates: EngineMapCoordinates) => void;
};

export type EngineMapPlacementValues = {
  size: number;
  latitude: number;
  longitude: number;
};

export type EngineMapSizeRuntimeTargets = {
  getHeightmapTemplateId: () => string | undefined;
  hasBorderLand: () => boolean;
  isDefaultOptionsRequested: () => boolean;
  isLocked: (settingId: string) => boolean;
  probability: (probability: number) => boolean;
  gaussian: (
    expected?: number,
    deviation?: number,
    min?: number,
    max?: number,
    round?: number,
  ) => number;
  setMapPlacementValue: (
    key: "mapSize" | "latitude" | "longitude",
    value: number,
  ) => void;
};

function readRuntimeNumber(name: string, fallback: number): number {
  return getBrowserRuntimeNumber(name as never, fallback);
}

function writeRuntimeMapPlacementValue(
  key: "mapSize" | "latitude" | "longitude",
  value: number,
) {
  const globalKey =
    key === "mapSize"
      ? "mapSizePercent"
      : key === "latitude"
        ? "latitudePercent"
        : "longitudePercent";

  setBrowserRuntimeValue(globalKey as never, value as never);
}

declare global {
  var EngineMapPlacement: EngineMapPlacementService;

  interface Window {
    EngineMapPlacement: EngineMapPlacementService;
    defineMapSize: (heightmapTemplateId?: string) => void;
    calculateMapCoordinates: (settings?: EngineMapCoordinateSettings) => void;
  }
}

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

export function createGlobalMapCoordinateRuntimeTargets(): EngineMapCoordinateRuntimeTargets {
  return {
    getGraphSize: () => {
      const { width, height } = getBrowserRuntimeGraphSize();
      return { width: width ?? 0, height: height ?? 0 };
    },
    getMapSizePercent: () => readRuntimeNumber("mapSizePercent", 0),
    getLatitudePercent: () => readRuntimeNumber("latitudePercent", 0),
    getLongitudePercent: () => readRuntimeNumber("longitudePercent", 0),
    round: rn,
    setMapCoordinates: (coordinates) => {
      setBrowserRuntimeValue("mapCoordinates", coordinates);
    },
  };
}

export function createRuntimeMapCoordinateRuntimeTargets(
  context: EngineRuntimeContext,
  globalTargets: EngineMapCoordinateRuntimeTargets = createGlobalMapCoordinateRuntimeTargets(),
): EngineMapCoordinateRuntimeTargets {
  return {
    ...globalTargets,
    getGraphSize: () => ({
      width: context.worldSettings.graphWidth ?? 0,
      height: context.worldSettings.graphHeight ?? 0,
    }),
    getMapSizePercent: () => context.worldSettings.mapSizePercent ?? 0,
    getLatitudePercent: () => context.worldSettings.latitudePercent ?? 0,
    getLongitudePercent: () => context.worldSettings.longitudePercent ?? 0,
    setMapCoordinates: (coordinates) => {
      context.worldSettingsStore?.patch({ mapCoordinates: coordinates });
      context.worldSettings.mapCoordinates = coordinates;
      if (context.worldState) {
        context.worldState.worldSettings.mapCoordinates = coordinates;
      }
      // Also sync to globalThis so that worldSettingsStore.refresh() and refreshContextWorldSettings read back correctly
      setBrowserRuntimeValue("mapCoordinates", coordinates);
    },
  };
}

export function createGlobalMapSizeRuntimeTargets(): EngineMapSizeRuntimeTargets {
  return {
    getHeightmapTemplateId: () =>
      byId<HTMLInputElement>("templateInput")?.value,
    hasBorderLand: () =>
      Boolean(
        getBrowserRuntimeGrid()?.features?.some(
          (feature: { land?: boolean; border?: boolean }) =>
            feature.land && feature.border,
        ),
      ),
    isDefaultOptionsRequested: () => {
      try {
        return (
          new URL(window.location.href).searchParams.get("options") ===
          "default"
        );
      } catch {
        return false;
      }
    },
    isLocked: (settingId) => globalThis.locked?.(settingId) ?? false,
    probability: P,
    gaussian: gauss,
    setMapPlacementValue: (key, value) => {
      writeRuntimeMapPlacementValue(key, value);
    },
  };
}

export function createRuntimeMapSizeRuntimeTargets(
  context: EngineRuntimeContext,
  globalTargets: EngineMapSizeRuntimeTargets = createGlobalMapSizeRuntimeTargets(),
): EngineMapSizeRuntimeTargets {
  return {
    ...globalTargets,
    hasBorderLand: () =>
      Boolean(
        context.grid?.features?.some(
          (feature: { land?: boolean; border?: boolean }) =>
            feature.land && feature.border,
        ),
      ),
    setMapPlacementValue: (key, value) => {
      const patch =
        key === "mapSize"
          ? { mapSizePercent: value }
          : key === "latitude"
            ? { latitudePercent: value }
            : { longitudePercent: value };
      context.worldSettingsStore?.patch(patch);
      Object.assign(context.worldSettings, patch);
      if (context.worldState)
        Object.assign(context.worldState.worldSettings, patch);
      // Also sync to globalThis so that worldSettingsStore.refresh() reads back the correct values
      writeRuntimeMapPlacementValue(key, value);
    },
  };
}

export function resolveEngineMapPlacementValues(
  template: string | undefined,
  targets: Pick<
    EngineMapSizeRuntimeTargets,
    "hasBorderLand" | "probability" | "gaussian"
  >,
): EngineMapPlacementValues {
  if (template === "africa-centric")
    return { size: 45, latitude: 53, longitude: 38 };
  if (template === "arabia") return { size: 20, latitude: 35, longitude: 35 };
  if (template === "atlantics")
    return { size: 42, latitude: 23, longitude: 65 };
  if (template === "britain") return { size: 7, latitude: 20, longitude: 51.3 };
  if (template === "caribbean")
    return { size: 15, latitude: 40, longitude: 74.8 };
  if (template === "east-asia")
    return { size: 11, latitude: 28, longitude: 9.4 };
  if (template === "eurasia") return { size: 38, latitude: 19, longitude: 27 };
  if (template === "europe") return { size: 20, latitude: 16, longitude: 44.8 };
  if (template === "europe-accented")
    return { size: 14, latitude: 22, longitude: 44.8 };
  if (template === "europe-and-central-asia")
    return { size: 25, latitude: 10, longitude: 39.5 };
  if (template === "europe-central")
    return { size: 11, latitude: 22, longitude: 46.4 };
  if (template === "europe-north")
    return { size: 7, latitude: 18, longitude: 48.9 };
  if (template === "greenland")
    return { size: 22, latitude: 7, longitude: 55.8 };
  if (template === "hellenica")
    return { size: 8, latitude: 27, longitude: 43.5 };
  if (template === "iceland") return { size: 2, latitude: 15, longitude: 55.3 };
  if (template === "indian-ocean")
    return { size: 45, latitude: 55, longitude: 14 };
  if (template === "mediterranean-sea")
    return { size: 10, latitude: 29, longitude: 45.8 };
  if (template === "middle-east")
    return { size: 8, latitude: 31, longitude: 34.4 };
  if (template === "north-america")
    return { size: 37, latitude: 17, longitude: 87 };
  if (template === "us-centric")
    return { size: 66, latitude: 27, longitude: 100 };
  if (template === "us-mainland")
    return { size: 16, latitude: 30, longitude: 77.5 };
  if (template === "world") return { size: 78, latitude: 27, longitude: 40 };
  if (template === "world-from-pacific")
    return { size: 75, latitude: 32, longitude: 30 };

  const part = targets.hasBorderLand();
  const max = part ? 80 : 100;
  const latitude = () =>
    targets.gaussian(targets.probability(0.5) ? 40 : 60, 20, 25, 75);

  if (!part) {
    if (template === "pangea")
      return { size: 100, latitude: 50, longitude: 50 };
    if (template === "shattered" && targets.probability(0.7))
      return { size: 100, latitude: 50, longitude: 50 };
    if (template === "continents" && targets.probability(0.5))
      return { size: 100, latitude: 50, longitude: 50 };
    if (template === "archipelago" && targets.probability(0.35))
      return { size: 100, latitude: 50, longitude: 50 };
    if (template === "highIsland" && targets.probability(0.25))
      return { size: 100, latitude: 50, longitude: 50 };
    if (template === "lowIsland" && targets.probability(0.1))
      return { size: 100, latitude: 50, longitude: 50 };
  }

  if (template === "pangea")
    return {
      size: targets.gaussian(70, 20, 30, max),
      latitude: latitude(),
      longitude: 50,
    };
  if (template === "volcano")
    return {
      size: targets.gaussian(20, 20, 10, max),
      latitude: latitude(),
      longitude: 50,
    };
  if (template === "mediterranean")
    return {
      size: targets.gaussian(25, 30, 15, 80),
      latitude: latitude(),
      longitude: 50,
    };
  if (template === "peninsula")
    return {
      size: targets.gaussian(15, 15, 5, 80),
      latitude: latitude(),
      longitude: 50,
    };
  if (template === "isthmus")
    return {
      size: targets.gaussian(15, 20, 3, 80),
      latitude: latitude(),
      longitude: 50,
    };
  if (template === "atoll")
    return {
      size: targets.gaussian(3, 2, 1, 5, 1),
      latitude: latitude(),
      longitude: 50,
    };

  return {
    size: targets.gaussian(30, 20, 15, max),
    latitude: latitude(),
    longitude: 50,
  };
}

export function defineEngineMapSize(
  heightmapTemplateId: string | undefined,
  targets: EngineMapSizeRuntimeTargets = createGlobalMapSizeRuntimeTargets(),
): EngineMapPlacementValues {
  const template = heightmapTemplateId ?? targets.getHeightmapTemplateId();
  const values = resolveEngineMapPlacementValues(template, targets);
  const randomize = targets.isDefaultOptionsRequested();

  if (randomize || !targets.isLocked("mapSize")) {
    targets.setMapPlacementValue("mapSize", values.size);
  }
  if (randomize || !targets.isLocked("latitude")) {
    targets.setMapPlacementValue("latitude", values.latitude);
  }
  if (randomize || !targets.isLocked("longitude")) {
    targets.setMapPlacementValue("longitude", values.longitude);
  }

  return values;
}

export function calculateEngineMapCoordinates(
  settings: EngineMapCoordinateSettings = {},
  targets: EngineMapCoordinateRuntimeTargets = createGlobalMapCoordinateRuntimeTargets(),
): EngineMapCoordinates {
  const sizeFraction =
    Number(settings.mapSizePercent ?? targets.getMapSizePercent()) / 100;
  const latShift =
    Number(settings.latitudePercent ?? targets.getLatitudePercent()) / 100;
  const lonShift =
    Number(settings.longitudePercent ?? targets.getLongitudePercent()) / 100;
  const graphSize = targets.getGraphSize();

  const latT = targets.round(sizeFraction * 180, 1);
  const latN = targets.round(90 - (180 - latT) * latShift, 1);
  const latS = targets.round(latN - latT, 1);

  const lonT = targets.round(
    Math.min((graphSize.width / graphSize.height) * latT, 360),
    1,
  );
  const lonE = targets.round(180 - (360 - lonT) * lonShift, 1);
  const lonW = targets.round(lonE - lonT, 1);
  const coordinates = { latT, latN, latS, lonT, lonW, lonE };

  targets.setMapCoordinates(coordinates);
  return coordinates;
}

export function createGlobalMapPlacementTargets(): EngineMapPlacementTargets {
  return {
    defineMapSize: (heightmapTemplateId) => {
      defineEngineMapSize(heightmapTemplateId);
    },
    calculateMapCoordinates: (settings) => {
      calculateEngineMapCoordinates(settings);
    },
  };
}

export function createRuntimeMapPlacementTargets(
  context: EngineRuntimeContext,
): EngineMapPlacementTargets {
  return {
    defineMapSize: (heightmapTemplateId) => {
      defineEngineMapSize(
        heightmapTemplateId,
        createRuntimeMapSizeRuntimeTargets(context),
      );
    },
    calculateMapCoordinates: (settings) => {
      calculateEngineMapCoordinates(
        settings,
        createRuntimeMapCoordinateRuntimeTargets(context),
      );
    },
  };
}

export function createGlobalMapPlacementService(
  targets: EngineMapPlacementTargets = createGlobalMapPlacementTargets(),
): EngineMapPlacementService {
  return createMapPlacementService(targets);
}

export function createRuntimeMapPlacementService(
  context: EngineRuntimeContext,
  targets: EngineMapPlacementTargets = createRuntimeMapPlacementTargets(
    context,
  ),
): EngineMapPlacementService {
  return createMapPlacementService(targets);
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
  runtimeWindow.EngineMapPlacement = createGlobalMapPlacementService();
  runtimeWindow.defineMapSize = (heightmapTemplateId?: string) => {
    runtimeWindow.EngineMapPlacement.defineMapSize(heightmapTemplateId);
  };
  runtimeWindow.calculateMapCoordinates = (
    settings: EngineMapCoordinateSettings = {},
  ) => {
    calculateEngineMapCoordinates(settings);
  };
}
