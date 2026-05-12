import { getActiveEngineRuntimeContext } from "../../modules/engine-runtime-active-context";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import { getBrowserPack } from "./engineBrowserPackAdapter";

export type EngineFocusPoint = [number, number];

export type EngineFocusGeometryTargets = {
  getWidth: () => number | undefined;
  getHeight: () => number | undefined;
  getCellIds: () => number[];
  getCellPoint: (cellId: number) => EngineFocusPoint | undefined;
  getCellFieldValue: (field: string, cellId: number) => unknown;
  getState: (stateId: number) => Record<string, unknown> | undefined;
  getProvince: (provinceId: number) => Record<string, unknown> | undefined;
  getBurg: (burgId: number) => Record<string, unknown> | undefined;
  getRoute: (routeId: number) => Record<string, unknown> | undefined;
  getZone: (zoneId: number) => Record<string, unknown> | undefined;
};

export type EngineFocusDimensionAdapter = {
  getWidth: () => number | undefined;
  getHeight: () => number | undefined;
};

export type EngineFocusCellAdapter = {
  getCellIds: () => number[];
  getCellPoint: (cellId: number) => EngineFocusPoint | undefined;
  getCellFieldValue: (field: string, cellId: number) => unknown;
};

export type EngineFocusEntityAdapter = {
  getState: (stateId: number) => Record<string, unknown> | undefined;
  getProvince: (provinceId: number) => Record<string, unknown> | undefined;
  getBurg: (burgId: number) => Record<string, unknown> | undefined;
  getRoute: (routeId: number) => Record<string, unknown> | undefined;
  getZone: (zoneId: number) => Record<string, unknown> | undefined;
};

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

export function createGlobalFocusDimensionAdapter(): EngineFocusDimensionAdapter {
  return {
    getWidth: () =>
      finiteNumberOrUndefined(
        getActiveEngineRuntimeContext()?.worldSettings?.graphWidth,
      ) ||
      finiteNumberOrUndefined(getGlobalValue("graphWidth")) ||
      finiteNumberOrUndefined(getGlobalValue("svgWidth")),
    getHeight: () =>
      finiteNumberOrUndefined(
        getActiveEngineRuntimeContext()?.worldSettings?.graphHeight,
      ) ||
      finiteNumberOrUndefined(getGlobalValue("graphHeight")) ||
      finiteNumberOrUndefined(getGlobalValue("svgHeight")),
  };
}

export function createRuntimeFocusDimensionAdapter(
  context: EngineRuntimeContext,
): EngineFocusDimensionAdapter {
  return {
    getWidth: () => finiteNumberOrUndefined(context.worldSettings.graphWidth),
    getHeight: () => finiteNumberOrUndefined(context.worldSettings.graphHeight),
  };
}

export function createGlobalFocusCellAdapter(): EngineFocusCellAdapter {
  return {
    getCellIds: () => Array.from(getBrowserPack()?.cells?.i || []),
    getCellPoint: (cellId) => {
      const point = getBrowserPack()?.cells?.p?.[cellId];
      return Array.isArray(point) ? point : undefined;
    },
    getCellFieldValue: (field, cellId) =>
      (getBrowserPack()?.cells as Record<string, any> | undefined)?.[field]?.[
        cellId
      ],
  };
}

export function createRuntimeFocusCellAdapter(
  context: EngineRuntimeContext,
): EngineFocusCellAdapter {
  return {
    getCellIds: () => Array.from(context.pack?.cells?.i || []),
    getCellPoint: (cellId) => {
      const point = context.pack?.cells?.p?.[cellId];
      return Array.isArray(point) ? point : undefined;
    },
    getCellFieldValue: (field, cellId) =>
      (context.pack?.cells as Record<string, any> | undefined)?.[field]?.[
        cellId
      ],
  };
}

export function createGlobalFocusEntityAdapter(): EngineFocusEntityAdapter {
  return {
    getState: (stateId) =>
      getBrowserPack()?.states?.[stateId] as unknown as
        | Record<string, unknown>
        | undefined,
    getProvince: (provinceId) =>
      getBrowserPack()?.provinces?.[provinceId] as unknown as
        | Record<string, unknown>
        | undefined,
    getBurg: (burgId) =>
      getBrowserPack()?.burgs?.[burgId] as unknown as
        | Record<string, unknown>
        | undefined,
    getRoute: (routeId) =>
      (getBrowserPack()?.routes as unknown[] | undefined)?.[routeId] as
        | Record<string, unknown>
        | undefined,
    getZone: (zoneId) =>
      (getBrowserPack()?.zones as unknown[] | undefined)?.find(
        (item) => (item as Record<string, unknown> | undefined)?.i === zoneId,
      ) as Record<string, unknown> | undefined,
  };
}

export function createRuntimeFocusEntityAdapter(
  context: EngineRuntimeContext,
): EngineFocusEntityAdapter {
  return {
    getState: (stateId) =>
      context.pack?.states?.[stateId] as unknown as
        | Record<string, unknown>
        | undefined,
    getProvince: (provinceId) =>
      context.pack?.provinces?.[provinceId] as unknown as
        | Record<string, unknown>
        | undefined,
    getBurg: (burgId) =>
      context.pack?.burgs?.[burgId] as unknown as
        | Record<string, unknown>
        | undefined,
    getRoute: (routeId) =>
      (context.pack?.routes as unknown[] | undefined)?.[routeId] as
        | Record<string, unknown>
        | undefined,
    getZone: (zoneId) =>
      (context.pack?.zones as unknown[] | undefined)?.find(
        (item) => (item as Record<string, unknown> | undefined)?.i === zoneId,
      ) as Record<string, unknown> | undefined,
  };
}

export function createFocusGeometryTargets(
  dimensionAdapter: EngineFocusDimensionAdapter,
  cellAdapter: EngineFocusCellAdapter,
  entityAdapter: EngineFocusEntityAdapter,
): EngineFocusGeometryTargets {
  return {
    getWidth: dimensionAdapter.getWidth,
    getHeight: dimensionAdapter.getHeight,
    getCellIds: cellAdapter.getCellIds,
    getCellPoint: cellAdapter.getCellPoint,
    getCellFieldValue: cellAdapter.getCellFieldValue,
    getState: entityAdapter.getState,
    getProvince: entityAdapter.getProvince,
    getBurg: entityAdapter.getBurg,
    getRoute: entityAdapter.getRoute,
    getZone: entityAdapter.getZone,
  };
}

export function createGlobalFocusGeometryTargets(): EngineFocusGeometryTargets {
  return createFocusGeometryTargets(
    createGlobalFocusDimensionAdapter(),
    createGlobalFocusCellAdapter(),
    createGlobalFocusEntityAdapter(),
  );
}

export function createRuntimeFocusGeometryTargets(
  context: EngineRuntimeContext,
): EngineFocusGeometryTargets {
  return createFocusGeometryTargets(
    createRuntimeFocusDimensionAdapter(context),
    createRuntimeFocusCellAdapter(context),
    createRuntimeFocusEntityAdapter(context),
  );
}
