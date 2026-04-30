import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineBurgService } from "../../modules/engine-burg-service";
import type { EngineAutoFixPreviewChange } from "./engineActionTypes";
import type { EngineSettlementWritebackTargets } from "./engineAutoFixSettlementTargets";
import { applyEngineSettlementPreviewChanges } from "./engineAutoFixSettlementWriteback";

const originalPack = globalThis.pack;

function createBurgService(overrides: Partial<EngineBurgService>) {
  return {
    add: vi.fn(() => null),
    remove: vi.fn(),
    findById: vi.fn(),
    ...overrides,
  } as EngineBurgService;
}

function createSettlementTargets(
  overrides: Partial<EngineSettlementWritebackTargets>,
) {
  return {
    resolveSettlementPoint: vi.fn(() => null),
    ...overrides,
  } as EngineSettlementWritebackTargets;
}

describe("engine autofix settlement commands", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
  });

  it("creates settlement preview burgs through the injected burg service", () => {
    const burg = { i: 12 };
    const burgs = createBurgService({
      add: vi.fn(() => 12),
      findById: vi.fn(() => burg as any),
    });
    const targets = createSettlementTargets({
      resolveSettlementPoint: vi.fn(() => ({ x: 120, y: 220 })),
    });

    const change: EngineAutoFixPreviewChange = {
      id: "burg:3",
      operation: "create",
      entity: "burg",
      summary: "Add support settlement",
      refs: { states: [3] },
      fields: {
        provisionalName: "Northwatch",
        agmRole: "support",
        priority: "high",
        agmSupportState: 3,
      },
    };

    const result = applyEngineSettlementPreviewChanges(
      [change],
      burgs,
      targets,
    );

    expect(targets.resolveSettlementPoint).toHaveBeenCalledWith(change);
    expect(burgs.add).toHaveBeenCalledWith([120, 220]);
    expect(burgs.findById).toHaveBeenCalledWith(12);
    expect(result.createdBurgIds).toEqual([12]);
    expect(burg).toMatchObject({
      name: "Northwatch",
      agmRole: "support",
      agmPriority: "high",
      agmSupportState: 3,
    });
  });

  it("skips metadata updates when the burg command cannot create a burg", () => {
    const burgs = createBurgService({
      add: vi.fn(() => null),
      findById: vi.fn(),
    });
    const targets = createSettlementTargets({
      resolveSettlementPoint: vi.fn(() => ({ x: 30, y: 40 })),
    });

    const change: EngineAutoFixPreviewChange = {
      id: "burg:province:4",
      operation: "create",
      entity: "burg",
      summary: "Add settlement",
      refs: { provinces: [4] },
      fields: { provisionalName: "Eastford" },
    };

    const result = applyEngineSettlementPreviewChanges(
      [change],
      burgs,
      targets,
    );

    expect(targets.resolveSettlementPoint).toHaveBeenCalledWith(change);
    expect(burgs.add).toHaveBeenCalledWith([30, 40]);
    expect(burgs.findById).not.toHaveBeenCalled();
    expect(result.createdBurgIds).toEqual([]);
  });
});
