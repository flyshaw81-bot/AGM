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
  getNamesModule: () => EngineNamesModule | undefined;
};

export function createEngineNamingService(
  targets: EngineNamingServiceTargets,
): EngineNamingService {
  return {
    getCulture: (culture, min, max, dupl) =>
      targets.getNamesModule()?.getCulture(culture, min, max, dupl) ??
      `Culture ${culture}`,
    getCultureShort: (culture) =>
      targets.getNamesModule()?.getCultureShort(culture) ?? `C${culture}`,
    getState: (baseName, culture) =>
      targets.getNamesModule()?.getState(baseName, culture) ??
      `${baseName} State`,
    getBase: (base, min, max, dupl) =>
      targets.getNamesModule()?.getBase(base, min, max, dupl) ?? `Base ${base}`,
    getBaseShort: (base) =>
      targets.getNamesModule()?.getBaseShort(base) ?? `B${base}`,
    getNameBases: () => targets.getNamesModule()?.getNameBases() ?? [],
    getMapName: () => {
      targets.getNamesModule()?.getMapName(false);
    },
  };
}

export function createGlobalNamingServiceTargets(): EngineNamingServiceTargets {
  return {
    getNamesModule: () => getGlobalValue<EngineNamesModule>("Names"),
  };
}

export function createGlobalNamingService(): EngineNamingService {
  return createEngineNamingService(createGlobalNamingServiceTargets());
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}
