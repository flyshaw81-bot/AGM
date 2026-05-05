import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";

export type EngineMutableEntity = Record<string, unknown>;

export type EngineEntityMutationTargets = {
  getState: (stateId: number) => EngineMutableEntity | undefined;
  getCulture: (cultureId: number) => EngineMutableEntity | undefined;
  getReligion: (religionId: number) => EngineMutableEntity | undefined;
  getBurg: (burgId: number) => EngineMutableEntity | undefined;
  getProvince: (provinceId: number) => EngineMutableEntity | undefined;
  getRoute: (routeId: number) => EngineMutableEntity | undefined;
  getZone: (zoneId: number) => EngineMutableEntity | undefined;
  redrawStates: () => void;
  redrawStateLabels: (stateIds?: number[]) => void;
  redrawCultures: () => void;
  redrawReligions: () => void;
  redrawBurgs: () => void;
  redrawLabels: () => void;
  redrawProvinces: () => void;
  redrawRoute: (route: EngineMutableEntity) => void;
  redrawZones: () => void;
};

export type EngineEntityLookupAdapter = {
  getState: (stateId: number) => EngineMutableEntity | undefined;
  getCulture: (cultureId: number) => EngineMutableEntity | undefined;
  getReligion: (religionId: number) => EngineMutableEntity | undefined;
  getBurg: (burgId: number) => EngineMutableEntity | undefined;
  getProvince: (provinceId: number) => EngineMutableEntity | undefined;
  getRoute: (routeId: number) => EngineMutableEntity | undefined;
  getZone: (zoneId: number) => EngineMutableEntity | undefined;
};

export type EngineEntityRedrawAdapter = {
  redrawStates: () => void;
  redrawStateLabels: (stateIds?: number[]) => void;
  redrawCultures: () => void;
  redrawReligions: () => void;
  redrawBurgs: () => void;
  redrawLabels: () => void;
  redrawProvinces: () => void;
  redrawRoute: (route: EngineMutableEntity) => void;
  redrawZones: () => void;
};

function callGlobalDraw(name: string, ...args: unknown[]) {
  const fn = getGlobalValue<(...args: unknown[]) => void>(name);
  if (typeof fn === "function") fn(...args);
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

function getGlobalPack(): typeof pack | undefined {
  return getGlobalValue<typeof pack>("pack");
}

export function createGlobalEntityLookupAdapter(): EngineEntityLookupAdapter {
  return {
    getState: (stateId) =>
      (
        getGlobalPack()?.states as unknown as EngineMutableEntity[] | undefined
      )?.[stateId],
    getCulture: (cultureId) =>
      (
        getGlobalPack()?.cultures as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[cultureId],
    getReligion: (religionId) =>
      (
        getGlobalPack()?.religions as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[religionId],
    getBurg: (burgId) =>
      (
        getGlobalPack()?.burgs as unknown as EngineMutableEntity[] | undefined
      )?.[burgId],
    getProvince: (provinceId) =>
      (
        getGlobalPack()?.provinces as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[provinceId],
    getRoute: (routeId) =>
      (
        getGlobalPack()?.routes as unknown as EngineMutableEntity[] | undefined
      )?.[routeId],
    getZone: (zoneId) =>
      (
        getGlobalPack()?.zones as unknown as EngineMutableEntity[] | undefined
      )?.find((zone) => zone?.i === zoneId),
  };
}

export function createRuntimeEntityLookupAdapter(
  context: EngineRuntimeContext,
): EngineEntityLookupAdapter {
  return {
    getState: (stateId) =>
      (context.pack?.states as unknown as EngineMutableEntity[] | undefined)?.[
        stateId
      ],
    getCulture: (cultureId) =>
      (
        context.pack?.cultures as unknown as EngineMutableEntity[] | undefined
      )?.[cultureId],
    getReligion: (religionId) =>
      (
        context.pack?.religions as unknown as EngineMutableEntity[] | undefined
      )?.[religionId],
    getBurg: (burgId) =>
      (context.pack?.burgs as unknown as EngineMutableEntity[] | undefined)?.[
        burgId
      ],
    getProvince: (provinceId) =>
      (
        context.pack?.provinces as unknown as EngineMutableEntity[] | undefined
      )?.[provinceId],
    getRoute: (routeId) =>
      (context.pack?.routes as unknown as EngineMutableEntity[] | undefined)?.[
        routeId
      ],
    getZone: (zoneId) =>
      (
        context.pack?.zones as unknown as EngineMutableEntity[] | undefined
      )?.find((zone) => zone?.i === zoneId),
  };
}

export function createGlobalEntityRedrawAdapter(): EngineEntityRedrawAdapter {
  return {
    redrawStates: () => callGlobalDraw("drawStates"),
    redrawStateLabels: (stateIds) =>
      callGlobalDraw("drawStateLabels", stateIds),
    redrawCultures: () => callGlobalDraw("drawCultures"),
    redrawReligions: () => callGlobalDraw("drawReligions"),
    redrawBurgs: () => callGlobalDraw("drawBurgs"),
    redrawLabels: () => callGlobalDraw("drawLabels"),
    redrawProvinces: () => callGlobalDraw("drawProvinces"),
    redrawRoute: (route) => {
      const drawRoutes = getGlobalValue<() => void>("drawRoutes");
      if (typeof drawRoutes === "function") drawRoutes();
      else callGlobalDraw("drawRoute", route);
    },
    redrawZones: () => callGlobalDraw("drawZones"),
  };
}

export function createEntityMutationTargets(
  lookupAdapter: EngineEntityLookupAdapter,
  redrawAdapter: EngineEntityRedrawAdapter,
): EngineEntityMutationTargets {
  return {
    getState: lookupAdapter.getState,
    getCulture: lookupAdapter.getCulture,
    getReligion: lookupAdapter.getReligion,
    getBurg: lookupAdapter.getBurg,
    getProvince: lookupAdapter.getProvince,
    getRoute: lookupAdapter.getRoute,
    getZone: lookupAdapter.getZone,
    redrawStates: redrawAdapter.redrawStates,
    redrawStateLabels: redrawAdapter.redrawStateLabels,
    redrawCultures: redrawAdapter.redrawCultures,
    redrawReligions: redrawAdapter.redrawReligions,
    redrawBurgs: redrawAdapter.redrawBurgs,
    redrawLabels: redrawAdapter.redrawLabels,
    redrawProvinces: redrawAdapter.redrawProvinces,
    redrawRoute: redrawAdapter.redrawRoute,
    redrawZones: redrawAdapter.redrawZones,
  };
}

export function createGlobalEntityMutationTargets(): EngineEntityMutationTargets {
  return createEntityMutationTargets(
    createGlobalEntityLookupAdapter(),
    createGlobalEntityRedrawAdapter(),
  );
}

export function createRuntimeEntityMutationTargets(
  context: EngineRuntimeContext,
  redrawAdapter: EngineEntityRedrawAdapter = createGlobalEntityRedrawAdapter(),
): EngineEntityMutationTargets {
  return createEntityMutationTargets(
    createRuntimeEntityLookupAdapter(context),
    redrawAdapter,
  );
}
