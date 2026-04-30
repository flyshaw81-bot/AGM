import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";

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

export function createGlobalFocusDimensionAdapter(): EngineFocusDimensionAdapter {
  return {
    getWidth: () =>
      finiteNumberOrUndefined(globalThis.graphWidth) ||
      finiteNumberOrUndefined(globalThis.svgWidth),
    getHeight: () =>
      finiteNumberOrUndefined(globalThis.graphHeight) ||
      finiteNumberOrUndefined(globalThis.svgHeight),
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
    getCellIds: () => Array.from(globalThis.pack?.cells?.i || []),
    getCellPoint: (cellId) => {
      const point = globalThis.pack?.cells?.p?.[cellId];
      return Array.isArray(point) ? point : undefined;
    },
    getCellFieldValue: (field, cellId) =>
      (globalThis.pack?.cells as Record<string, any> | undefined)?.[field]?.[
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
      globalThis.pack?.states?.[stateId] as unknown as
        | Record<string, unknown>
        | undefined,
    getProvince: (provinceId) =>
      globalThis.pack?.provinces?.[provinceId] as unknown as
        | Record<string, unknown>
        | undefined,
    getBurg: (burgId) =>
      globalThis.pack?.burgs?.[burgId] as unknown as
        | Record<string, unknown>
        | undefined,
    getRoute: (routeId) =>
      (globalThis.pack?.routes as unknown[] | undefined)?.[routeId] as
        | Record<string, unknown>
        | undefined,
    getZone: (zoneId) =>
      (globalThis.pack?.zones as unknown[] | undefined)?.find(
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
