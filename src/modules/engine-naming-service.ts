import type { NameBase } from "./names-generator";

export type EngineNamingService = {
  getCulture: (
    culture: number,
    min?: number,
    max?: number,
    dupl?: string,
  ) => string;
  getCultureShort: (culture: number) => string;
  getState: (baseName: string, culture: number) => string;
  getBase?: (base: number, min?: number, max?: number, dupl?: string) => string;
  getBaseShort?: (base: number) => string;
  getNameBases?: () => NameBase[];
  getMapName?: () => void;
};

type EngineNamesModule = {
  getCulture: (
    culture: number,
    min?: number,
    max?: number,
    dupl?: string,
  ) => string;
  getCultureShort: (culture: number) => string;
  getState: (baseName: string, culture: number) => string;
  getBase: (base: number, min?: number, max?: number, dupl?: string) => string;
  getBaseShort: (base: number) => string;
  getNameBases: () => NameBase[];
  getMapName: (force: boolean) => unknown;
};

export type EngineNamingServiceTargets = {
  getNamesModule: () => EngineNamesModule;
};

export function createEngineNamingService(
  targets: EngineNamingServiceTargets,
): EngineNamingService {
  return {
    getCulture: (culture, min, max, dupl) =>
      targets.getNamesModule().getCulture(culture, min, max, dupl),
    getCultureShort: (culture) =>
      targets.getNamesModule().getCultureShort(culture),
    getState: (baseName, culture) =>
      targets.getNamesModule().getState(baseName, culture),
    getBase: (base, min, max, dupl) =>
      targets.getNamesModule().getBase(base, min, max, dupl),
    getBaseShort: (base) => targets.getNamesModule().getBaseShort(base),
    getNameBases: () => targets.getNamesModule().getNameBases(),
    getMapName: () => {
      targets.getNamesModule().getMapName(false);
    },
  };
}

export function createGlobalNamingService(): EngineNamingService {
  return createEngineNamingService({
    getNamesModule: () => Names,
  });
}
