export type EngineResourceSummaryTargets = {
  getBiomeData: () => unknown;
  setBiomeData: (data: unknown) => void;
  getStates: () => unknown;
  getBurgs: () => unknown;
  getCultures: () => unknown;
  getReligions: () => unknown;
  getProvinces: () => unknown;
  getRoutes: () => unknown;
  getZones: () => unknown;
  getCellArea: (cellId: number) => number | undefined;
  getCellPopulation: (cellId: number) => number | undefined;
};

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function createGlobalResourceSummaryTargets(): EngineResourceSummaryTargets {
  return {
    getBiomeData: () => {
      const data = globalThis.biomesData || globalThis.Biomes?.getDefault?.();
      if (data && !globalThis.biomesData) globalThis.biomesData = data;
      return data;
    },
    setBiomeData: (data) => {
      if (data) globalThis.biomesData = data as typeof biomesData;
    },
    getStates: () => globalThis.pack?.states,
    getBurgs: () => globalThis.pack?.burgs,
    getCultures: () => globalThis.pack?.cultures,
    getReligions: () => globalThis.pack?.religions,
    getProvinces: () => globalThis.pack?.provinces,
    getRoutes: () => globalThis.pack?.routes,
    getZones: () => globalThis.pack?.zones,
    getCellArea: (cellId) =>
      finiteNumberOrUndefined(globalThis.pack?.cells?.area?.[cellId]),
    getCellPopulation: (cellId) =>
      finiteNumberOrUndefined(globalThis.pack?.cells?.pop?.[cellId]),
  };
}
