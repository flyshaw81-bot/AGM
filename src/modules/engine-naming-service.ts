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

export function createGlobalNamingService(): EngineNamingService {
  return {
    getCulture: (culture, min, max, dupl) =>
      Names.getCulture(culture, min, max, dupl),
    getCultureShort: (culture) => Names.getCultureShort(culture),
    getState: (baseName, culture) => Names.getState(baseName, culture),
    getBase: (base, min, max, dupl) => Names.getBase(base, min, max, dupl),
    getBaseShort: (base) => Names.getBaseShort(base),
    getNameBases: () => Names.getNameBases(),
    getMapName: () => {
      Names.getMapName(false);
    },
  };
}
