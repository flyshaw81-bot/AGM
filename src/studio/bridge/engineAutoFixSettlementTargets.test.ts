import { afterEach, describe, expect, it } from "vitest";
import type { EngineAutoFixPreviewChange } from "./engineActionTypes";
import {
  createGlobalSettlementWritebackTargets,
  createSettlementWritebackTargets,
} from "./engineAutoFixSettlementTargets";

const originalPack = globalThis.pack;

describe("createGlobalSettlementWritebackTargets", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
  });

  it("uses an existing state burg point when available", () => {
    globalThis.pack = {
      burgs: [
        undefined,
        { i: 1, state: 3, x: 100, y: 200 },
        { i: 2, state: 3, x: 300, y: 400, removed: true },
      ],
    } as unknown as typeof pack;

    const change = {
      id: "burg:state:3",
      operation: "create",
      entity: "burg",
      summary: "Add support settlement",
      refs: { states: [3] },
    } satisfies EngineAutoFixPreviewChange;

    expect(
      createGlobalSettlementWritebackTargets().resolveSettlementPoint(change),
    ).toEqual({ x: 100, y: 200 });
  });

  it("falls back to the middle state cell point", () => {
    globalThis.pack = {
      burgs: [],
      cells: {
        i: [10, 11, 12],
        state: { 10: 4, 11: 4, 12: 4 },
        p: { 10: [100, 100], 11: [120, 140], 12: [160, 180] },
      },
    } as unknown as typeof pack;

    const change = {
      id: "burg:state:4",
      operation: "create",
      entity: "burg",
      summary: "Add support settlement",
      refs: { states: [4] },
    } satisfies EngineAutoFixPreviewChange;

    expect(
      createGlobalSettlementWritebackTargets().resolveSettlementPoint(change),
    ).toEqual({ x: 120, y: 140 });
  });

  it("falls back to the referenced province center point", () => {
    globalThis.pack = {
      provinces: {
        7: { i: 7, center: 30 },
      },
      cells: {
        p: { 30: [300, 420] },
      },
    } as unknown as typeof pack;

    const change = {
      id: "burg:province:7",
      operation: "create",
      entity: "burg",
      summary: "Add province settlement",
      refs: { provinces: [7] },
    } satisfies EngineAutoFixPreviewChange;

    expect(
      createGlobalSettlementWritebackTargets().resolveSettlementPoint(change),
    ).toEqual({ x: 300, y: 420 });
  });

  it("composes settlement writeback targets from an injected map adapter", () => {
    const targets = createSettlementWritebackTargets({
      findStateBurg: () => undefined,
      getStateCellIds: () => [10, 11, 12],
      getCellPoint: (cellId) =>
        cellId === 11 ? { x: 120, y: 140 } : undefined,
      getProvinceCenterCell: () => undefined,
    });
    const change = {
      id: "burg:state:4",
      operation: "create",
      entity: "burg",
      summary: "Add support settlement",
      refs: { states: [4] },
    } satisfies EngineAutoFixPreviewChange;

    expect(targets.resolveSettlementPoint(change)).toEqual({
      x: 120,
      y: 140,
    });
  });
});
