import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import type { PackedGraphFeature } from "./features";
import { LakesModule } from "./lakes";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createLakeContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      cells: {
        h: new Uint8Array([10, 25, 35, 45]),
      },
    } as unknown as PackedGraph,
    options: {},
    seed: "lakes-test",
    worldSettings: {},
    generationSettings: {
      pointsCount: 4,
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

describe("LakesModule", () => {
  it("gets lake height from an explicit engine runtime context", () => {
    const feature = {
      shoreline: [1, 2, 3],
    } as PackedGraphFeature;

    expect(new LakesModule().getHeight(feature, createLakeContext())).toBe(
      24.9,
    );
  });

  it("gets lake names from the runtime naming service", () => {
    const feature = {
      shoreline: [1],
    } as PackedGraphFeature;
    const context = createLakeContext();
    context.pack.cells.culture = new Uint8Array([0, 7]);

    expect(new LakesModule().getName(feature, context)).toBe("Culture 7");
  });
});
