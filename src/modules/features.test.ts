import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { FeatureModule, type PackedGraphFeature } from "./features";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createFeatureContext(): EngineRuntimeContext {
  const pack = {
    cells: {
      i: [] as number[],
    },
    vertices: {
      c: [],
      p: [],
    },
  } as unknown as PackedGraph;

  return {
    grid: {
      cells: {
        i: [0, 1, 2, 3],
        h: new Uint8Array([10, 30, 30, 10]),
        c: [
          [1, 2, 3],
          [0, 2, 3],
          [0, 1, 3],
          [0, 1, 2],
        ],
        b: [true, true, true, true],
      },
    },
    pack,
    options: {},
    seed: "features-test",
    worldSettings: {
      graphWidth: 100,
      graphHeight: 100,
    },
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
    profile: "test",
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

describe("FeatureModule", () => {
  it("marks grid features from an explicit engine runtime context", () => {
    const context = createFeatureContext();

    new FeatureModule().markupGrid(context);

    expect(context.grid.cells.t).toBeInstanceOf(Int8Array);
    expect(context.grid.cells.f).toBeInstanceOf(Uint16Array);
    expect(context.grid.features).toEqual([
      0,
      { i: 1, land: false, border: true, type: "ocean" },
      { i: 2, land: true, border: true, type: "island" },
    ]);
  });

  it("accepts an explicit context for empty packed graph markup", () => {
    const context = createFeatureContext();

    new FeatureModule().markupPack(context);

    expect(context.pack.features).toBeUndefined();
  });

  it("defines feature groups from an explicit engine runtime context", () => {
    const context = createFeatureContext();
    context.grid.cells.i = [0, 1, 2, 3];
    context.pack.cells = {
      f: new Uint8Array([0, 1, 1, 1]),
      h: new Uint8Array([10, 35, 35, 35]),
    } as PackedGraph["cells"];
    context.pack.features = [
      0 as unknown as PackedGraphFeature,
      {
        i: 1,
        type: "island",
        land: true,
        border: true,
        cells: 3,
        firstCell: 1,
      } as PackedGraphFeature,
    ];

    new FeatureModule().defineGroups(context);

    expect(context.pack.features[1].group).toBe("continent");
  });
});
