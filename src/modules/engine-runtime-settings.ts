import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineWorldSettings = {
  mapCoordinates?: typeof mapCoordinates;
  graphWidth?: number;
  graphHeight?: number;
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
};

export type EnginePopulationSettings = {
  populationRate: number;
  urbanDensity: number;
  urbanization: number;
};

export type EngineUnitSettings = {
  height: string;
};

export type EngineTimingSettings = {
  shouldTime: boolean;
};

export type EngineWorldSettingsTargets = {
  getMapCoordinates: () => typeof mapCoordinates;
  getGraphWidth: () => number;
  getGraphHeight: () => number;
  getMapSizePercent: () => number;
  getLatitudePercent: () => number;
  getLongitudePercent: () => number;
};

export type EnginePopulationSettingsTargets = {
  getPopulationRate: () => number;
  getUrbanDensity: () => number;
  getUrbanization: () => number;
};

export type EngineUnitSettingsTargets = {
  getHeightUnit: () => string;
};

export type EngineTimingSettingsTargets = {
  getShouldTime: () => boolean;
};

export type EngineSettingsDomTargets = {
  getInput: (id: string) => HTMLInputElement | null;
};

export type EngineWorldSettingsStore = {
  get: () => EngineWorldSettings;
  replace: (nextSettings: EngineWorldSettings) => EngineWorldSettings;
  patch: (patch: Partial<EngineWorldSettings>) => EngineWorldSettings;
  refresh: (targets?: EngineWorldSettingsTargets) => EngineWorldSettings;
};

export function createWorldSettings(
  targets: EngineWorldSettingsTargets,
): EngineWorldSettings {
  return {
    mapCoordinates: targets.getMapCoordinates(),
    graphWidth: targets.getGraphWidth(),
    graphHeight: targets.getGraphHeight(),
    mapSizePercent: targets.getMapSizePercent(),
    latitudePercent: targets.getLatitudePercent(),
    longitudePercent: targets.getLongitudePercent(),
  };
}

export function createPopulationSettings(
  targets: EnginePopulationSettingsTargets,
): EnginePopulationSettings {
  return {
    populationRate: targets.getPopulationRate(),
    urbanDensity: targets.getUrbanDensity(),
    urbanization: targets.getUrbanization(),
  };
}

export function createUnitSettings(
  targets: EngineUnitSettingsTargets,
): EngineUnitSettings {
  return {
    height: targets.getHeightUnit(),
  };
}

export function createTimingSettings(
  targets: EngineTimingSettingsTargets,
): EngineTimingSettings {
  return {
    shouldTime: targets.getShouldTime(),
  };
}

export function createGlobalSettingsDomTargets(): EngineSettingsDomTargets {
  return {
    getInput: (id) => document.getElementById(id) as HTMLInputElement | null,
  };
}

export function createSettingsInputNumberReader(
  domTargets: EngineSettingsDomTargets,
): (id: string, fallback: number) => number {
  return (id, fallback) => Number(domTargets.getInput(id)?.value ?? fallback);
}

export function createGlobalWorldSettingsTargets(
  domTargets: EngineSettingsDomTargets = createGlobalSettingsDomTargets(),
): EngineWorldSettingsTargets {
  const readInputNumber = createSettingsInputNumberReader(domTargets);

  return {
    getMapCoordinates: () => mapCoordinates,
    getGraphWidth: () => graphWidth,
    getGraphHeight: () => graphHeight,
    getMapSizePercent: () => readInputNumber("mapSizeOutput", 0),
    getLatitudePercent: () => readInputNumber("latitudeOutput", 0),
    getLongitudePercent: () => readInputNumber("longitudeOutput", 0),
  };
}

export function createGlobalPopulationSettingsTargets(): EnginePopulationSettingsTargets {
  return {
    getPopulationRate: () => populationRate,
    getUrbanDensity: () => urbanDensity,
    getUrbanization: () => urbanization,
  };
}

export function createGlobalUnitSettingsTargets(): EngineUnitSettingsTargets {
  return {
    getHeightUnit: () => heightUnit.value,
  };
}

export function createGlobalTimingSettingsTargets(): EngineTimingSettingsTargets {
  return {
    getShouldTime: () => TIME,
  };
}

export function createGlobalWorldSettings(): EngineWorldSettings {
  return createWorldSettings(createGlobalWorldSettingsTargets());
}

export function createWorldSettingsStore(
  getSettings: () => EngineWorldSettings,
  setSettings: (nextSettings: EngineWorldSettings) => void,
  readSettings: (
    targets?: EngineWorldSettingsTargets,
  ) => EngineWorldSettings = (targets = createGlobalWorldSettingsTargets()) =>
    createWorldSettings(targets),
): EngineWorldSettingsStore {
  return {
    get: getSettings,
    replace: (nextSettings) => {
      setSettings(nextSettings);
      return nextSettings;
    },
    patch: (patch) => {
      const nextSettings = { ...getSettings(), ...patch };
      setSettings(nextSettings);
      return nextSettings;
    },
    refresh: (targets) => {
      const nextSettings = readSettings(targets);
      setSettings(nextSettings);
      return nextSettings;
    },
  };
}

export function createRuntimeWorldSettingsStore(
  context: EngineRuntimeContext,
): EngineWorldSettingsStore {
  return createWorldSettingsStore(
    () => context.worldSettings,
    (nextSettings) => {
      context.worldSettings = nextSettings;
    },
  );
}

export function createGlobalPopulationSettings(): EnginePopulationSettings {
  return createPopulationSettings(createGlobalPopulationSettingsTargets());
}

export function createGlobalUnitSettings(): EngineUnitSettings {
  return createUnitSettings(createGlobalUnitSettingsTargets());
}

export function createGlobalTimingSettings(): EngineTimingSettings {
  return createTimingSettings(createGlobalTimingSettingsTargets());
}
