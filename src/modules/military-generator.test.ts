import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { MilitaryModule } from "./military-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createMilitaryContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      burgs: [],
      cells: {
        i: [],
        p: [],
      },
      states: [],
    } as unknown as PackedGraph,
    options: {},
    seed: "military-test",
    worldSettings: {},
    generationSettings: {
      pointsCount: 0,
      heightExponent: 1,
      lakeElevationLimit: 80,
      resolveDepressionsSteps: 100,
      religionsCount: 0,
      stateSizeVariety: 1,
      globalGrowthRate: 1,
      statesGrowthRate: 1,
    },
    populationSettings: {
      populationRate: 1,
      urbanDensity: 1,
      urbanization: 1,
    },
    naming: {
      getCulture: (culture) => `Culture ${culture}`,
      getCultureShort: (culture) => `C${culture}`,
      getState: (baseName, culture) => `${baseName} State ${culture}`,
    },
    ...createTestRuntimeAdapters(),
    notes: createTestNoteService(),
    timing: {
      shouldTime: false,
    },
    biomesData: {
      i: [],
      name: [],
      color: [],
      biomesMatrix: [],
      habitability: [],
      iconsDensity: [],
      icons: [],
      cost: [],
    },
  } as EngineRuntimeContext;
}

describe("MilitaryModule", () => {
  it("generates military data against an explicit runtime context", () => {
    const context = createMilitaryContext();
    context.notes.push({ id: "regiment1-1", name: "Stale", legend: "" });

    new MilitaryModule().generate(context);

    expect(context.options.military).toEqual(
      new MilitaryModule().getDefaultOptions(),
    );
    expect(context.notes.all()).toEqual([]);
  });
});
