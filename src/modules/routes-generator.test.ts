import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { RoutesModule } from "./routes-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createRoutesContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {
        temp: new Int8Array(),
      },
    },
    pack: {
      burgs: [],
      cells: {
        p: [],
      },
    } as unknown as PackedGraph,
    options: {},
    seed: "routes-test",
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

describe("RoutesModule", () => {
  it("generates routes against an explicit runtime context", () => {
    const context = createRoutesContext();

    new RoutesModule().generate(context);

    expect(context.pack.routes).toEqual([]);
    expect(context.pack.cells.routes).toEqual({});
  });

  it("builds bidirectional route links", () => {
    const routes = new RoutesModule().buildLinks([
      {
        i: 3,
        group: "roads",
        feature: 1,
        points: [
          [0, 0, 10],
          [1, 1, 11],
          [2, 2, 12],
        ],
      },
    ]);

    expect(routes[10][11]).toBe(3);
    expect(routes[11][10]).toBe(3);
    expect(routes[11][12]).toBe(3);
    expect(routes[12][11]).toBe(3);
  });
});
