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
      const currentData = getGlobalValue<unknown>("biomesData");
      const data =
        currentData ||
        getGlobalValue<{ getDefault?: () => unknown }>(
          "Biomes",
        )?.getDefault?.();
      if (data && !currentData) setGlobalValue("biomesData", data);
      return data;
    },
    setBiomeData: (data) => {
      if (data) setGlobalValue("biomesData", data);
    },
  };
}

export function createGlobalResourcePackAdapter(): EngineResourcePackAdapter {
  return {
    getStates: () => getGlobalPack()?.states,
    getBurgs: () => getGlobalPack()?.burgs,
    getCultures: () => getGlobalPack()?.cultures,
    getReligions: () => getGlobalPack()?.religions,
    getProvinces: () => getGlobalPack()?.provinces,
    getRoutes: () => getGlobalPack()?.routes,
    getZones: () => getGlobalPack()?.zones,
    getCellArea: (cellId) =>
      finiteNumberOrUndefined(getGlobalPack()?.cells?.area?.[cellId]),
    getCellPopulation: (cellId) =>
      finiteNumberOrUndefined(getGlobalPack()?.cells?.pop?.[cellId]),
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

function getGlobalPack() {
  return getGlobalValue<typeof pack>("pack");
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

function setGlobalValue(name: string, value: unknown): void {
  try {
    (globalThis as Record<string, unknown>)[name] = value;
  } catch {
    // Blocked compatibility globals degrade to no-op writes.
  }
}
