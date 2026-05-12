import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import { getBrowserPack } from "./engineBrowserPackAdapter";

export type EngineMutableEntity = Record<string, unknown>;

export type EngineEntityMutationTargets = {
  getState: (stateId: number) => EngineMutableEntity | undefined;
  getCulture: (cultureId: number) => EngineMutableEntity | undefined;
  getReligion: (religionId: number) => EngineMutableEntity | undefined;
  getBurg: (burgId: number) => EngineMutableEntity | undefined;
  getProvince: (provinceId: number) => EngineMutableEntity | undefined;
  getRoute: (routeId: number) => EngineMutableEntity | undefined;
  getZone: (zoneId: number) => EngineMutableEntity | undefined;
  getMarker: (markerId: number) => EngineMutableEntity | undefined;
  redrawStates: () => void;
  redrawStateLabels: (stateIds?: number[]) => void;
  redrawCultures: () => void;
  redrawReligions: () => void;
  redrawBurgs: () => void;
  redrawLabels: () => void;
  redrawProvinces: () => void;
  redrawRoute: (route: EngineMutableEntity) => void;
  redrawZones: () => void;
  redrawMarkers: () => void;
};

export type EngineEntityLookupAdapter = {
  getState: (stateId: number) => EngineMutableEntity | undefined;
  getCulture: (cultureId: number) => EngineMutableEntity | undefined;
  getReligion: (religionId: number) => EngineMutableEntity | undefined;
  getBurg: (burgId: number) => EngineMutableEntity | undefined;
  getProvince: (provinceId: number) => EngineMutableEntity | undefined;
  getRoute: (routeId: number) => EngineMutableEntity | undefined;
  getZone: (zoneId: number) => EngineMutableEntity | undefined;
  getMarker: (markerId: number) => EngineMutableEntity | undefined;
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
  redrawMarkers: () => void;
};

export type EngineDrawFunctionName =
  | "drawStates"
  | "drawStateLabels"
  | "drawCultures"
  | "drawReligions"
  | "drawBurgs"
  | "drawLabels"
  | "drawProvinces"
  | "drawRoutes"
  | "drawRoute"
  | "drawZones"
  | "drawMarkers";

export type EngineDrawFunctions = {
  drawStates: () => void;
  drawStateLabels: (stateIds?: number[]) => void;
  drawCultures: () => void;
  drawReligions: () => void;
  drawBurgs: () => void;
  drawLabels: () => void;
  drawProvinces: () => void;
  drawRoute: (route: EngineMutableEntity) => void;
  drawZones: () => void;
  drawMarkers: () => void;
};

function reportMissingDrawFunction(name: string, error?: unknown) {
  try {
    console.error(
      `[AGM V2] Missing engine draw function: ${name}`,
      error ?? "",
    );
  } catch {
    // Console can be stubbed or blocked in embedding contexts.
  }
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

function callRequiredGlobalDraw(
  name: EngineDrawFunctionName,
  ...args: unknown[]
) {
  const fn = getGlobalValue<(...args: unknown[]) => void>(name);
  if (typeof fn === "function") {
    fn(...args);
    return true;
  }

  reportMissingDrawFunction(name);
  return false;
}

function callFirstAvailableGlobalDraw(
  candidates: {
    name: EngineDrawFunctionName;
    args: unknown[];
  }[],
) {
  for (const candidate of candidates) {
    const fn = getGlobalValue<(...args: unknown[]) => void>(candidate.name);
    if (typeof fn === "function") {
      fn(...candidate.args);
      return true;
    }
  }

  reportMissingDrawFunction(
    candidates.map((candidate) => candidate.name).join(" or "),
  );
  return false;
}

export function createGlobalEntityLookupAdapter(): EngineEntityLookupAdapter {
  return {
    getState: (stateId) =>
      (
        getBrowserPack()?.states as unknown as EngineMutableEntity[] | undefined
      )?.[stateId],
    getCulture: (cultureId) =>
      (
        getBrowserPack()?.cultures as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[cultureId],
    getReligion: (religionId) =>
      (
        getBrowserPack()?.religions as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[religionId],
    getBurg: (burgId) =>
      (
        getBrowserPack()?.burgs as unknown as EngineMutableEntity[] | undefined
      )?.[burgId],
    getProvince: (provinceId) =>
      (
        getBrowserPack()?.provinces as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.[provinceId],
    getRoute: (routeId) =>
      (
        getBrowserPack()?.routes as unknown as EngineMutableEntity[] | undefined
      )?.[routeId],
    getZone: (zoneId) =>
      (
        getBrowserPack()?.zones as unknown as EngineMutableEntity[] | undefined
      )?.find((zone) => zone?.i === zoneId),
    getMarker: (markerId) =>
      (
        getBrowserPack()?.markers as unknown as
          | EngineMutableEntity[]
          | undefined
      )?.find((marker) => marker?.i === markerId),
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
    getMarker: (markerId) =>
      (
        context.pack?.markers as unknown as EngineMutableEntity[] | undefined
      )?.find((marker) => marker?.i === markerId),
  };
}

export function createGlobalEngineDrawFunctions(): EngineDrawFunctions {
  return {
    drawStates: () => callRequiredGlobalDraw("drawStates"),
    drawStateLabels: (stateIds) =>
      callRequiredGlobalDraw("drawStateLabels", stateIds),
    drawCultures: () => callRequiredGlobalDraw("drawCultures"),
    drawReligions: () => callRequiredGlobalDraw("drawReligions"),
    drawBurgs: () => callRequiredGlobalDraw("drawBurgs"),
    drawLabels: () => callRequiredGlobalDraw("drawLabels"),
    drawProvinces: () => callRequiredGlobalDraw("drawProvinces"),
    drawRoute: (route) =>
      callFirstAvailableGlobalDraw([
        { name: "drawRoutes", args: [] },
        { name: "drawRoute", args: [route] },
      ]),
    drawZones: () => callRequiredGlobalDraw("drawZones"),
    drawMarkers: () => callRequiredGlobalDraw("drawMarkers"),
  };
}

export function createGlobalEntityRedrawAdapter(): EngineEntityRedrawAdapter {
  const draw = createGlobalEngineDrawFunctions();
  return {
    redrawStates: draw.drawStates,
    redrawStateLabels: draw.drawStateLabels,
    redrawCultures: draw.drawCultures,
    redrawReligions: draw.drawReligions,
    redrawBurgs: draw.drawBurgs,
    redrawLabels: draw.drawLabels,
    redrawProvinces: draw.drawProvinces,
    redrawRoute: draw.drawRoute,
    redrawZones: draw.drawZones,
    redrawMarkers: draw.drawMarkers,
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
    getMarker: lookupAdapter.getMarker,
    redrawStates: redrawAdapter.redrawStates,
    redrawStateLabels: redrawAdapter.redrawStateLabels,
    redrawCultures: redrawAdapter.redrawCultures,
    redrawReligions: redrawAdapter.redrawReligions,
    redrawBurgs: redrawAdapter.redrawBurgs,
    redrawLabels: redrawAdapter.redrawLabels,
    redrawProvinces: redrawAdapter.redrawProvinces,
    redrawRoute: redrawAdapter.redrawRoute,
    redrawZones: redrawAdapter.redrawZones,
    redrawMarkers: redrawAdapter.redrawMarkers,
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
