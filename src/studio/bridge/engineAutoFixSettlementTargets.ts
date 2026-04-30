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

function resolveAgmSettlementWritebackPoint(
  change: EngineAutoFixPreviewChange,
) {
  const stateId = change.refs.states?.[0];
  if (stateId !== undefined) {
    const existingStateBurg = globalThis.pack?.burgs?.find(
      (burg) =>
        burg &&
        !burg.removed &&
        burg.state === stateId &&
        typeof burg.x === "number" &&
        typeof burg.y === "number",
    );
    if (existingStateBurg)
      return { x: existingStateBurg.x, y: existingStateBurg.y };
    const stateCells = Array.from(globalThis.pack?.cells?.i || []).filter(
      (cellId) => globalThis.pack?.cells?.state?.[cellId] === stateId,
    );
    const stateCenterCell = stateCells[Math.floor(stateCells.length / 2)];
    const statePoint =
      stateCenterCell === undefined
        ? undefined
        : globalThis.pack?.cells?.p?.[stateCenterCell];
    if (statePoint) return { x: statePoint[0], y: statePoint[1] };
  }

  const provinceId = change.refs.provinces?.[0];
  const province =
    provinceId === undefined
      ? undefined
      : globalThis.pack?.provinces?.[provinceId];
  const provincePoint =
    province?.center === undefined
      ? undefined
      : globalThis.pack?.cells?.p?.[province.center];
  if (provincePoint) return { x: provincePoint[0], y: provincePoint[1] };
  return null;
}

export function createGlobalSettlementWritebackTargets(): EngineSettlementWritebackTargets {
  return {
    resolveSettlementPoint: resolveAgmSettlementWritebackPoint,
  };
}
