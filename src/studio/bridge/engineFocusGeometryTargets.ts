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

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function createGlobalFocusGeometryTargets(): EngineFocusGeometryTargets {
  return {
    getWidth: () =>
      finiteNumberOrUndefined(globalThis.graphWidth) ||
      finiteNumberOrUndefined(globalThis.svgWidth),
    getHeight: () =>
      finiteNumberOrUndefined(globalThis.graphHeight) ||
      finiteNumberOrUndefined(globalThis.svgHeight),
    getCellIds: () => Array.from(globalThis.pack?.cells?.i || []),
    getCellPoint: (cellId) => {
      const point = globalThis.pack?.cells?.p?.[cellId];
      return Array.isArray(point) ? point : undefined;
    },
    getCellFieldValue: (field, cellId) =>
      (globalThis.pack?.cells as Record<string, any> | undefined)?.[field]?.[
        cellId
      ],
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
