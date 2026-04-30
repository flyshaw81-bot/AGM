import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { EngineAutoFixPreviewChange } from "./engineActionTypes";

export type EngineSettlementWritebackPoint = {
  x: number;
  y: number;
};

export type EngineSettlementWritebackTargets = {
  resolveSettlementPoint: (
    change: EngineAutoFixPreviewChange,
  ) => EngineSettlementWritebackPoint | null;
};

export type EngineSettlementWritebackMapAdapter = {
  findStateBurg: (
    stateId: number,
  ) => EngineSettlementWritebackPoint | undefined;
  getStateCellIds: (stateId: number) => number[];
  getCellPoint: (cellId: number) => EngineSettlementWritebackPoint | undefined;
  getProvinceCenterCell: (provinceId: number) => number | undefined;
};

function resolveAgmSettlementWritebackPoint(
  change: EngineAutoFixPreviewChange,
  mapAdapter: EngineSettlementWritebackMapAdapter,
) {
  const stateId = change.refs.states?.[0];
  if (stateId !== undefined) {
    const existingStateBurg = mapAdapter.findStateBurg(stateId);
    if (existingStateBurg) return existingStateBurg;
    const stateCells = mapAdapter.getStateCellIds(stateId);
    const stateCenterCell = stateCells[Math.floor(stateCells.length / 2)];
    const statePoint =
      stateCenterCell === undefined
        ? undefined
        : mapAdapter.getCellPoint(stateCenterCell);
    if (statePoint) return statePoint;
  }

  const provinceId = change.refs.provinces?.[0];
  const provinceCenterCell =
    provinceId === undefined
      ? undefined
      : mapAdapter.getProvinceCenterCell(provinceId);
  const provincePoint =
    provinceCenterCell === undefined
      ? undefined
      : mapAdapter.getCellPoint(provinceCenterCell);
  if (provincePoint) return provincePoint;
  return null;
}

function pointOrUndefined(
  value: unknown,
): EngineSettlementWritebackPoint | undefined {
  return Array.isArray(value) &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
    ? { x: value[0], y: value[1] }
    : undefined;
}

export function createGlobalSettlementWritebackMapAdapter(): EngineSettlementWritebackMapAdapter {
  return {
    findStateBurg: (stateId) => {
      const burg = globalThis.pack?.burgs?.find(
        (item) =>
          item &&
          !item.removed &&
          item.state === stateId &&
          typeof item.x === "number" &&
          typeof item.y === "number",
      );
      return burg ? { x: burg.x, y: burg.y } : undefined;
    },
    getStateCellIds: (stateId) =>
      Array.from(globalThis.pack?.cells?.i || []).filter(
        (cellId) => globalThis.pack?.cells?.state?.[cellId] === stateId,
      ),
    getCellPoint: (cellId) =>
      pointOrUndefined(globalThis.pack?.cells?.p?.[cellId]),
    getProvinceCenterCell: (provinceId) =>
      globalThis.pack?.provinces?.[provinceId]?.center,
  };
}

export function createRuntimeSettlementWritebackMapAdapter(
  context: EngineRuntimeContext,
): EngineSettlementWritebackMapAdapter {
  return {
    findStateBurg: (stateId) => {
      const burg = context.pack?.burgs?.find(
        (item) =>
          item &&
          !item.removed &&
          item.state === stateId &&
          typeof item.x === "number" &&
          typeof item.y === "number",
      );
      return burg ? { x: burg.x, y: burg.y } : undefined;
    },
    getStateCellIds: (stateId) =>
      Array.from(context.pack?.cells?.i || []).filter(
        (cellId) => context.pack?.cells?.state?.[cellId] === stateId,
      ),
    getCellPoint: (cellId) =>
      pointOrUndefined(context.pack?.cells?.p?.[cellId]),
    getProvinceCenterCell: (provinceId) =>
      context.pack?.provinces?.[provinceId]?.center,
  };
}

export function createSettlementWritebackTargets(
  mapAdapter: EngineSettlementWritebackMapAdapter,
): EngineSettlementWritebackTargets {
  return {
    resolveSettlementPoint: (change) =>
      resolveAgmSettlementWritebackPoint(change, mapAdapter),
  };
}

export function createGlobalSettlementWritebackTargets(): EngineSettlementWritebackTargets {
  return createSettlementWritebackTargets(
    createGlobalSettlementWritebackMapAdapter(),
  );
}

export function createRuntimeSettlementWritebackTargets(
  context: EngineRuntimeContext,
): EngineSettlementWritebackTargets {
  return createSettlementWritebackTargets(
    createRuntimeSettlementWritebackMapAdapter(context),
  );
}
