import { describe, expect, it, vi } from "vitest";
import type {
  AgmWritableBiomeData,
  EngineAutoFixPreviewChange,
} from "./engineActionTypes";
import type { EngineBiomeWritebackTargets } from "./engineAutoFixBiomeTargets";
import {
  applyEngineBiomePreviewChanges,
  updateEngineBiomeResource,
} from "./engineAutoFixBiomeWriteback";

function createBiomeTargets(overrides: Partial<EngineBiomeWritebackTargets>) {
  return {
    getWritableBiomeData: vi.fn(),
    redrawBiomes: vi.fn(),
    ...overrides,
  } as EngineBiomeWritebackTargets;
}

describe("engine autofix biome commands", () => {
  it("updates biome preview fields through injected targets", () => {
    const biomeData: AgmWritableBiomeData = {
      habitability: { 2: 30 },
      agmRuleWeight: { 2: 1.2 },
      agmResourceTag: { 2: "forest" },
    };
    const targets = createBiomeTargets({
      getWritableBiomeData: vi.fn(() => biomeData),
    });
    const change: EngineAutoFixPreviewChange = {
      id: "biome:2",
      operation: "update",
      entity: "biome",
      summary: "Tune biome",
      refs: { biomes: [2] },
      fields: {
        habitability: 45,
        agmRuleWeight: 1.8,
        agmResourceTag: "wetland",
      },
    };

    const result = applyEngineBiomePreviewChanges([change], targets);

    expect(targets.getWritableBiomeData).toHaveBeenCalledWith();
    expect(biomeData.habitability[2]).toBe(45);
    expect(biomeData.agmRuleWeight?.[2]).toBe(1.8);
    expect(biomeData.agmResourceTag?.[2]).toBe("wetland");
    expect(result.updatedBiomes).toEqual([
      {
        biomeId: 2,
        previousHabitability: 30,
        nextHabitability: 45,
        previousAgmRuleWeight: 1.2,
        nextAgmRuleWeight: 1.8,
        previousAgmResourceTag: "forest",
        nextAgmResourceTag: "wetland",
      },
    ]);
  });

  it("updates single biome resources and redraws only when data changes", () => {
    const biomeData: AgmWritableBiomeData = {
      habitability: { 4: 20 },
      agmRuleWeight: { 4: 1 },
      agmResourceTag: { 4: "dry" },
    };
    const targets = createBiomeTargets({
      getWritableBiomeData: vi.fn(() => biomeData),
      redrawBiomes: vi.fn(),
    });

    expect(
      updateEngineBiomeResource(
        4,
        { habitability: 35, agmRuleWeight: 1.4, agmResourceTag: " steppe " },
        targets,
      ),
    ).toBe(true);
    expect(biomeData.habitability[4]).toBe(35);
    expect(biomeData.agmRuleWeight?.[4]).toBe(1.4);
    expect(biomeData.agmResourceTag?.[4]).toBe("steppe");
    expect(targets.redrawBiomes).toHaveBeenCalledTimes(1);

    expect(updateEngineBiomeResource(4, { habitability: 35 }, targets)).toBe(
      false,
    );
    expect(targets.redrawBiomes).toHaveBeenCalledTimes(1);
  });
});
