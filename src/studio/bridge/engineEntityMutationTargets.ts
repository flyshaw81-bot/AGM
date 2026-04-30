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

function callGlobalDraw(name: string, ...args: unknown[]) {
  const fn = (globalThis as Record<string, unknown>)[name];
  if (typeof fn === "function") fn(...args);
}

export function createGlobalEntityMutationTargets(): EngineEntityMutationTargets {
  return {
    getState: (stateId) =>
      (
        globalThis.pack?.states as unknown as EngineMutableEntity[] | undefined
      )?.[stateId],
    getCulture: (cultureId) =>
      (
        globalThis.pack?.cultures as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[cultureId],
    getReligion: (religionId) =>
      (
        globalThis.pack?.religions as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[religionId],
    getBurg: (burgId) =>
      (
        globalThis.pack?.burgs as unknown as EngineMutableEntity[] | undefined
      )?.[burgId],
    getProvince: (provinceId) =>
      (
        globalThis.pack?.provinces as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[provinceId],
    getRoute: (routeId) =>
      (
        globalThis.pack?.routes as unknown as EngineMutableEntity[] | undefined
      )?.[routeId],
    getZone: (zoneId) =>
      (
        globalThis.pack?.zones as unknown as EngineMutableEntity[] | undefined
      )?.find((zone) => zone?.i === zoneId),
    redrawStates: () => callGlobalDraw("drawStates"),
    redrawStateLabels: (stateIds) =>
      callGlobalDraw("drawStateLabels", stateIds),
    redrawCultures: () => callGlobalDraw("drawCultures"),
    redrawReligions: () => callGlobalDraw("drawReligions"),
    redrawBurgs: () => callGlobalDraw("drawBurgs"),
    redrawLabels: () => callGlobalDraw("drawLabels"),
    redrawProvinces: () => callGlobalDraw("drawProvinces"),
    redrawRoute: (route) => {
      const drawRoutes = (globalThis as any).drawRoutes;
      if (typeof drawRoutes === "function") drawRoutes();
      else callGlobalDraw("drawRoute", route);
    },
    redrawZones: () => callGlobalDraw("drawZones"),
  };
}
