import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import { BiomesModule } from "./biomes";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createBiomesContext(): EngineRuntimeContext {
  const biomes = new BiomesModule();
  const pack = {
    cells: {
      i: [0, 1, 2],
      fl: new Uint8Array([0, 0, 0]),
      r: new Uint8Array([0, 0, 0]),
      h: new Uint8Array([10, 35, 40]),
      c: [[1], [0, 2], [1]],
      g: [0, 1, 2],
    },
  } as unknown as PackedGraph;

  return {
    grid: {
      cells: {
        temp: new Int8Array([12, 18, 2]),
        prec: new Uint8Array([8, 18, 14]),
      },
    },
    pack,
    options: {},
    seed: "biomes-test",
    worldSettings: {
      graphWidth: 100,
      graphHeight: 100,
    },
    generationSettings: {
      pointsCount: 3,
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
    biomesData: biomes.getDefault(),
  } as EngineRuntimeContext;
}

describe("BiomesModule", () => {
  it("defines biomes from an explicit engine runtime context", () => {
    const context = createBiomesContext();

    new BiomesModule().define(context);

    expect(context.pack.cells.biome).toBeInstanceOf(Uint8Array);
    expect(context.pack.cells.biome).toHaveLength(3);
    expect(context.pack.cells.biome[0]).toBe(0);
    expect(context.pack.cells.biome[1]).toBeGreaterThan(0);
    expect(context.pack.cells.biome[2]).toBeGreaterThan(0);
  });
});
