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
  getInputNumber: (id: string, fallback: number) => number;
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

export function createWorldSettings(
  targets: EngineWorldSettingsTargets,
): EngineWorldSettings {
  return {
    mapCoordinates: targets.getMapCoordinates(),
    graphWidth: targets.getGraphWidth(),
    graphHeight: targets.getGraphHeight(),
    mapSizePercent: targets.getInputNumber("mapSizeOutput", 0),
    latitudePercent: targets.getInputNumber("latitudeOutput", 0),
    longitudePercent: targets.getInputNumber("longitudeOutput", 0),
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

function getInput(id: string): HTMLInputElement | null {
  return document.getElementById(id) as HTMLInputElement | null;
}

function getInputNumber(id: string, fallback: number): number {
  return Number(getInput(id)?.value ?? fallback);
}

export function createGlobalWorldSettingsTargets(): EngineWorldSettingsTargets {
  return {
    getMapCoordinates: () => mapCoordinates,
    getGraphWidth: () => graphWidth,
    getGraphHeight: () => graphHeight,
    getInputNumber,
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

export function createGlobalPopulationSettings(): EnginePopulationSettings {
  return createPopulationSettings(createGlobalPopulationSettingsTargets());
}

export function createGlobalUnitSettings(): EngineUnitSettings {
  return createUnitSettings(createGlobalUnitSettingsTargets());
}

export function createGlobalTimingSettings(): EngineTimingSettings {
  return createTimingSettings(createGlobalTimingSettingsTargets());
}
