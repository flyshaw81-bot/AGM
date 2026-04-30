import { describe, expect, it, vi } from "vitest";
import type { EngineAutoFixPreviewChange } from "./engineActionTypes";
import type { EngineStateWritebackTargets } from "./engineAutoFixStateTargets";
import { applyEngineStatePreviewChanges } from "./engineAutoFixStateWriteback";

function createStateTargets(overrides: Partial<EngineStateWritebackTargets>) {
  return {
    getWritableState: vi.fn(),
    ...overrides,
  } as EngineStateWritebackTargets;
}

describe("engine autofix state commands", () => {
  it("updates state autofix fields through injected targets", () => {
    const state = {
      agmFairStart: false,
      agmFairStartScore: 0.2,
      agmPriority: "normal",
    };
    const targets = createStateTargets({
      getWritableState: vi.fn(() => state),
    });
    const change: EngineAutoFixPreviewChange = {
      id: "state:2",
      operation: "update",
      entity: "state",
      summary: "Prioritize state",
      refs: { states: [2] },
      fields: {
        agmFairStart: true,
        agmFairStartScore: 0.95,
        agmPriority: "high",
      },
    };

    const result = applyEngineStatePreviewChanges([change], targets);

    expect(targets.getWritableState).toHaveBeenCalledWith(2);
    expect(state).toEqual({
      agmFairStart: true,
      agmFairStartScore: 0.95,
      agmPriority: "high",
    });
    expect(result.updatedStates).toEqual([
      {
        stateId: 2,
        previousAgmFairStart: false,
        nextAgmFairStart: true,
        previousAgmFairStartScore: 0.2,
        nextAgmFairStartScore: 0.95,
        previousAgmPriority: "normal",
        nextAgmPriority: "high",
      },
    ]);
  });

  it("skips invalid changes before reading targets", () => {
    const targets = createStateTargets({
      getWritableState: vi.fn(),
    });

    const result = applyEngineStatePreviewChanges(
      [
        {
          id: "state:bad",
          operation: "update",
          entity: "state",
          summary: "Bad state",
          refs: { states: [1] },
          fields: {
            agmFairStart: true,
            agmFairStartScore: Number.NaN,
            agmPriority: "high",
          },
        },
      ],
      targets,
    );

    expect(targets.getWritableState).not.toHaveBeenCalled();
    expect(result.updatedStates).toEqual([]);
  });
});
