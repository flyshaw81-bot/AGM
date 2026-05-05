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

export type EngineWorldRuntimeTargets = {
  getMapCoordinates: () => typeof mapCoordinates;
  getGraphWidth: () => number;
  getGraphHeight: () => number;
};

export type EnginePopulationRuntimeTargets = {
  getPopulationRate: () => number;
  getUrbanDensity: () => number;
  getUrbanization: () => number;
};

export type EngineUnitRuntimeTargets = {
  getHeightUnit: () => string;
};

export type EngineTimingRuntimeTargets = {
  getShouldTime: () => boolean;
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

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getGlobalMapCoordinates(): typeof mapCoordinates {
  try {
    return globalThis.mapCoordinates ?? ({} as typeof mapCoordinates);
  } catch {
    return {} as typeof mapCoordinates;
  }
}

function getGlobalNumber(name: keyof typeof globalThis, fallback: number) {
  try {
    const value = globalThis[name];
    return typeof value === "number" ? value : fallback;
  } catch {
    return fallback;
  }
}

function getGlobalHeightUnit(): string {
  try {
    return globalThis.heightUnit?.value ?? "m";
  } catch {
    return "m";
  }
}

function getGlobalTimeFlag(): boolean {
  try {
    return Boolean(globalThis.TIME);
  } catch {
    return false;
  }
}

export function createGlobalSettingsDomTargets(): EngineSettingsDomTargets {
  return {
    getInput: (id) =>
      getDocument()?.getElementById(id) as HTMLInputElement | null,
  };
}

export function createGlobalWorldRuntimeTargets(): EngineWorldRuntimeTargets {
  return {
    getMapCoordinates: () => getGlobalMapCoordinates(),
    getGraphWidth: () => getGlobalNumber("graphWidth", 0),
    getGraphHeight: () => getGlobalNumber("graphHeight", 0),
  };
}

export function createGlobalPopulationRuntimeTargets(): EnginePopulationRuntimeTargets {
  return {
    getPopulationRate: () => getGlobalNumber("populationRate", 0),
    getUrbanDensity: () => getGlobalNumber("urbanDensity", 0),
    getUrbanization: () => getGlobalNumber("urbanization", 0),
  };
}

export function createGlobalUnitRuntimeTargets(): EngineUnitRuntimeTargets {
  return {
    getHeightUnit: getGlobalHeightUnit,
  };
}

export function createGlobalTimingRuntimeTargets(): EngineTimingRuntimeTargets {
  return {
    getShouldTime: getGlobalTimeFlag,
  };
}

export function createSettingsInputNumberReader(
  domTargets: EngineSettingsDomTargets,
): (id: string, fallback: number) => number {
  return (id, fallback) => Number(domTargets.getInput(id)?.value ?? fallback);
}

export function createGlobalWorldSettingsTargets(
  domTargets: EngineSettingsDomTargets = createGlobalSettingsDomTargets(),
  runtimeTargets: EngineWorldRuntimeTargets = createGlobalWorldRuntimeTargets(),
): EngineWorldSettingsTargets {
  const readInputNumber = createSettingsInputNumberReader(domTargets);

  return {
    getMapCoordinates: runtimeTargets.getMapCoordinates,
    getGraphWidth: runtimeTargets.getGraphWidth,
    getGraphHeight: runtimeTargets.getGraphHeight,
    getMapSizePercent: () => readInputNumber("mapSizeOutput", 0),
    getLatitudePercent: () => readInputNumber("latitudeOutput", 0),
    getLongitudePercent: () => readInputNumber("longitudeOutput", 0),
  };
}

export function createGlobalPopulationSettingsTargets(
  runtimeTargets: EnginePopulationRuntimeTargets = createGlobalPopulationRuntimeTargets(),
): EnginePopulationSettingsTargets {
  return {
    getPopulationRate: runtimeTargets.getPopulationRate,
    getUrbanDensity: runtimeTargets.getUrbanDensity,
    getUrbanization: runtimeTargets.getUrbanization,
  };
}

export function createGlobalUnitSettingsTargets(
  runtimeTargets: EngineUnitRuntimeTargets = createGlobalUnitRuntimeTargets(),
): EngineUnitSettingsTargets {
  return {
    getHeightUnit: runtimeTargets.getHeightUnit,
  };
}

export function createGlobalTimingSettingsTargets(
  runtimeTargets: EngineTimingRuntimeTargets = createGlobalTimingRuntimeTargets(),
): EngineTimingSettingsTargets {
  return {
    getShouldTime: runtimeTargets.getShouldTime,
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
