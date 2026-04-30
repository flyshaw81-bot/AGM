import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { ReligionsModule } from "./religions-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createReligionsContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      cultures: [
        { i: 0, name: "Wildlands", removed: true },
        {
          i: 1,
          name: "Northmen",
          center: 0,
          color: "#6688aa",
          removed: false,
        },
      ],
      states: [{ i: 0, name: "Neutrals" }],
      burgs: [],
      cells: {
        i: [0, 1],
        c: [[1], [0]],
        h: new Uint8Array([30, 30]),
        culture: new Uint16Array([1, 1]),
        state: new Uint16Array([0, 0]),
        burg: new Uint16Array([0, 0]),
        biome: new Uint8Array([1, 1]),
      },
    } as unknown as PackedGraph,
    options: {},
    seed: "religions-test",
    worldSettings: {
      graphWidth: 100,
      graphHeight: 100,
    },
    generationSettings: {
      pointsCount: 2,
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
      cost: [0, 1],
    },
  } as EngineRuntimeContext;
}

describe("ReligionsModule", () => {
  it("generates folk religions against an explicit runtime context", () => {
    const context = createReligionsContext();

    new ReligionsModule().generate(context);

    expect(context.pack.religions[0].name).toBe("No religion");
    expect(context.pack.religions[1].type).toBe("Folk");
    expect(context.pack.religions[1].culture).toBe(1);
    expect(Array.from(context.pack.cells.religion)).toEqual([1, 1]);
  });
});
