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

function getInput(id: string): HTMLInputElement | null {
  return document.getElementById(id) as HTMLInputElement | null;
}

function getInputNumber(id: string, fallback: number): number {
  return Number(getInput(id)?.value ?? fallback);
}

export function createGlobalWorldSettings(): EngineWorldSettings {
  return {
    mapCoordinates,
    graphWidth,
    graphHeight,
    mapSizePercent: getInputNumber("mapSizeOutput", 0),
    latitudePercent: getInputNumber("latitudeOutput", 0),
    longitudePercent: getInputNumber("longitudeOutput", 0),
  };
}

export function createGlobalPopulationSettings(): EnginePopulationSettings {
  return {
    populationRate,
    urbanDensity,
    urbanization,
  };
}

export function createGlobalUnitSettings(): EngineUnitSettings {
  return {
    height: heightUnit.value,
  };
}

export function createGlobalTimingSettings(): EngineTimingSettings {
  return {
    shouldTime: TIME,
  };
}
