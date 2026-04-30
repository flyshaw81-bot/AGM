import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";

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

export type EngineResourceBiomeAdapter = {
  getBiomeData: () => unknown;
  setBiomeData: (data: unknown) => void;
};

export type EngineResourcePackAdapter = {
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

export function createGlobalResourceBiomeAdapter(): EngineResourceBiomeAdapter {
  return {
    getBiomeData: () => {
      const data = globalThis.biomesData || globalThis.Biomes?.getDefault?.();
      if (data && !globalThis.biomesData) globalThis.biomesData = data;
      return data;
    },
    setBiomeData: (data) => {
      if (data) globalThis.biomesData = data as typeof biomesData;
    },
  };
}

export function createGlobalResourcePackAdapter(): EngineResourcePackAdapter {
  return {
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

export function createRuntimeResourceBiomeAdapter(
  context: EngineRuntimeContext,
): EngineResourceBiomeAdapter {
  return {
    getBiomeData: () => context.biomesData,
    setBiomeData: (data) => {
      if (data) context.biomesData = data as EngineRuntimeContext["biomesData"];
    },
  };
}

export function createRuntimeResourcePackAdapter(
  context: EngineRuntimeContext,
): EngineResourcePackAdapter {
  return {
    getStates: () => context.pack?.states,
    getBurgs: () => context.pack?.burgs,
    getCultures: () => context.pack?.cultures,
    getReligions: () => context.pack?.religions,
    getProvinces: () => context.pack?.provinces,
    getRoutes: () => context.pack?.routes,
    getZones: () => context.pack?.zones,
    getCellArea: (cellId) =>
      finiteNumberOrUndefined(context.pack?.cells?.area?.[cellId]),
    getCellPopulation: (cellId) =>
      finiteNumberOrUndefined(context.pack?.cells?.pop?.[cellId]),
  };
}

export function createRuntimeResourceSummaryTargets(
  context: EngineRuntimeContext,
): EngineResourceSummaryTargets {
  return createResourceSummaryTargets(
    createRuntimeResourceBiomeAdapter(context),
    createRuntimeResourcePackAdapter(context),
  );
}

export function createResourceSummaryTargets(
  biomeAdapter: EngineResourceBiomeAdapter,
  packAdapter: EngineResourcePackAdapter,
): EngineResourceSummaryTargets {
  return {
    getBiomeData: biomeAdapter.getBiomeData,
    setBiomeData: biomeAdapter.setBiomeData,
    getStates: packAdapter.getStates,
    getBurgs: packAdapter.getBurgs,
    getCultures: packAdapter.getCultures,
    getReligions: packAdapter.getReligions,
    getProvinces: packAdapter.getProvinces,
    getRoutes: packAdapter.getRoutes,
    getZones: packAdapter.getZones,
    getCellArea: packAdapter.getCellArea,
    getCellPopulation: packAdapter.getCellPopulation,
  };
}

export function createGlobalResourceSummaryTargets(): EngineResourceSummaryTargets {
  return createResourceSummaryTargets(
    createGlobalResourceBiomeAdapter(),
    createGlobalResourcePackAdapter(),
  );
}
