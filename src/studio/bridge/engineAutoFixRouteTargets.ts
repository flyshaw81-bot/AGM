import type {
  AgmWritableProvince,
  EngineAutoFixPreviewChange,
} from "./engineActionTypes";

export type EngineRouteWritebackTargets = {
  resolveRouteCell: (change: EngineAutoFixPreviewChange) => number | undefined;
  getWritableProvince: (provinceId: number) => AgmWritableProvince | undefined;
};

export type EngineRouteWritebackMapAdapter = {
  getCellIds: () => number[];
  getCellHeight: (cellId: number) => number | undefined;
  getCellProvince: (cellId: number) => number | undefined;
  getCellState: (cellId: number) => number | undefined;
  getCellRoutes: (cellId: number) => Record<string, unknown> | undefined;
  getProvince: (provinceId: number) => AgmWritableProvince | undefined;
};

function landHeightOrZero(value: number | undefined) {
  return value ?? 0;
}

function finiteNumberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function hasNoRoutes(routes: Record<string, unknown> | undefined) {
  return !routes || Object.keys(routes).length === 0;
}

function resolveAgmRouteProvinceCell(
  provinceId: number | undefined,
  mapAdapter: EngineRouteWritebackMapAdapter,
): number | undefined {
  const province =
    provinceId === undefined ? undefined : mapAdapter.getProvince(provinceId);
  if (!province) return undefined;

  const provinceCells = mapAdapter
    .getCellIds()
    .filter(
      (cellId) =>
        mapAdapter.getCellProvince(cellId) === provinceId &&
        landHeightOrZero(mapAdapter.getCellHeight(cellId)) >= 20,
    );
  const disconnectedCell = provinceCells.find((cellId) =>
    hasNoRoutes(mapAdapter.getCellRoutes(cellId)),
  );
  if (disconnectedCell !== undefined) return disconnectedCell;
  const center = finiteNumberOrUndefined(province.center);
  if (
    center !== undefined &&
    landHeightOrZero(mapAdapter.getCellHeight(center)) >= 20
  )
    return center;
  return provinceCells[Math.floor(provinceCells.length / 2)];
}

function resolveAgmRouteWritebackCell(
  change: EngineAutoFixPreviewChange,
  mapAdapter: EngineRouteWritebackMapAdapter,
): number | undefined {
  const fromProvince = change.fields?.fromProvince;
  const toProvince = change.fields?.toProvince;
  const provinceIds = [
    fromProvince,
    toProvince,
    ...(change.refs.provinces || []),
  ].filter((id): id is number => typeof id === "number" && Number.isFinite(id));

  for (const provinceId of provinceIds) {
    const cellId = resolveAgmRouteProvinceCell(provinceId, mapAdapter);
    if (cellId !== undefined) return cellId;
  }

  const stateId = change.refs.states?.[0];
  if (stateId !== undefined) {
    const stateCells = mapAdapter
      .getCellIds()
      .filter(
        (cellId) =>
          mapAdapter.getCellState(cellId) === stateId &&
          landHeightOrZero(mapAdapter.getCellHeight(cellId)) >= 20,
      );
    const disconnectedCell = stateCells.find((cellId) =>
      hasNoRoutes(mapAdapter.getCellRoutes(cellId)),
    );
    return disconnectedCell ?? stateCells[Math.floor(stateCells.length / 2)];
  }

  return undefined;
}

function writableProvinceOrUndefined(
  province: AgmWritableProvince | undefined,
) {
  if (!province || province.removed) return undefined;
  return province;
}

export function createGlobalRouteWritebackMapAdapter(): EngineRouteWritebackMapAdapter {
  return {
    getCellIds: () => Array.from(globalThis.pack?.cells?.i || []),
    getCellHeight: (cellId) => globalThis.pack?.cells?.h?.[cellId],
    getCellProvince: (cellId) => globalThis.pack?.cells?.province?.[cellId],
    getCellState: (cellId) => globalThis.pack?.cells?.state?.[cellId],
    getCellRoutes: (cellId) => globalThis.pack?.cells?.routes?.[cellId],
    getProvince: (provinceId) =>
      globalThis.pack?.provinces?.[provinceId] as unknown as
        | AgmWritableProvince
        | undefined,
  };
}

export function createRouteWritebackTargets(
  mapAdapter: EngineRouteWritebackMapAdapter,
): EngineRouteWritebackTargets {
  return {
    resolveRouteCell: (change) =>
      resolveAgmRouteWritebackCell(change, mapAdapter),
    getWritableProvince: (provinceId) =>
      writableProvinceOrUndefined(mapAdapter.getProvince(provinceId)),
  };
}

export function createGlobalRouteWritebackTargets(): EngineRouteWritebackTargets {
  return createRouteWritebackTargets(createGlobalRouteWritebackMapAdapter());
}
