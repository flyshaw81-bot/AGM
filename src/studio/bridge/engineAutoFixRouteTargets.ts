import type {
  AgmWritableProvince,
  EngineAutoFixPreviewChange,
} from "./engineActionTypes";

export type EngineRouteWritebackTargets = {
  resolveRouteCell: (change: EngineAutoFixPreviewChange) => number | undefined;
  getWritableProvince: (provinceId: number) => AgmWritableProvince | undefined;
};

function resolveAgmRouteProvinceCell(provinceId: number | undefined) {
  const cells = globalThis.pack?.cells;
  const province =
    provinceId === undefined
      ? undefined
      : globalThis.pack?.provinces?.[provinceId];
  if (!cells || !province) return undefined;

  const provinceCells = Array.from(cells.i || []).filter(
    (cellId) =>
      cells.province?.[cellId] === provinceId && (cells.h?.[cellId] ?? 0) >= 20,
  );
  const disconnectedCell = provinceCells.find(
    (cellId) =>
      !cells.routes?.[cellId] || Object.keys(cells.routes[cellId]).length === 0,
  );
  if (disconnectedCell !== undefined) return disconnectedCell;
  if (province.center !== undefined && (cells.h?.[province.center] ?? 0) >= 20)
    return province.center;
  return provinceCells[Math.floor(provinceCells.length / 2)];
}

function resolveAgmRouteWritebackCell(change: EngineAutoFixPreviewChange) {
  const fromProvince = change.fields?.fromProvince;
  const toProvince = change.fields?.toProvince;
  const provinceIds = [
    fromProvince,
    toProvince,
    ...(change.refs.provinces || []),
  ].filter((id): id is number => typeof id === "number" && Number.isFinite(id));

  for (const provinceId of provinceIds) {
    const cellId = resolveAgmRouteProvinceCell(provinceId);
    if (cellId !== undefined) return cellId;
  }

  const stateId = change.refs.states?.[0];
  if (stateId !== undefined) {
    const cells = globalThis.pack?.cells;
    const stateCells = Array.from(cells?.i || []).filter(
      (cellId) =>
        cells?.state?.[cellId] === stateId && (cells?.h?.[cellId] ?? 0) >= 20,
    );
    const disconnectedCell = stateCells.find(
      (cellId) =>
        !cells?.routes?.[cellId] ||
        Object.keys(cells.routes[cellId]).length === 0,
    );
    return disconnectedCell ?? stateCells[Math.floor(stateCells.length / 2)];
  }

  return undefined;
}

export function createGlobalRouteWritebackTargets(): EngineRouteWritebackTargets {
  return {
    resolveRouteCell: resolveAgmRouteWritebackCell,
    getWritableProvince: (provinceId) => {
      const province = globalThis.pack?.provinces?.[provinceId] as unknown as
        | AgmWritableProvince
        | undefined;
      if (!province || province.removed) return undefined;
      return province;
    },
  };
}
