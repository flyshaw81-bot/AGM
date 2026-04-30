import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { RiverModule } from "./river-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createRiverContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      cells: {
        p: [
          [10, 20],
          [90, 20],
        ],
        h: new Uint8Array([40, 35]),
        fl: new Uint16Array([12, 8]),
        culture: new Uint8Array([1, 1]),
      },
      rivers: [],
    } as unknown as PackedGraph,
    options: {},
    seed: "rivers-test",
    worldSettings: {
      graphWidth: 100,
      graphHeight: 80,
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
      cost: [],
    },
  } as EngineRuntimeContext;
}

describe("RiverModule", () => {
  it("gets border points from explicit map dimensions", () => {
    const rivers = new RiverModule();

    expect(rivers.getBorderPoint(0, createRiverContext())).toEqual([0, 20]);
  });

  it("adds meandering from explicit packed cell geometry", () => {
    const rivers = new RiverModule();
    const points = rivers.addMeandering(
      [0, 1, -1],
      null,
      0.5,
      createRiverContext(),
    );

    expect(points[0]).toEqual([10, 20, 12]);
    expect(points.at(-1)).toEqual([100, 20, 8]);
  });

  it("gets river basins from explicit packed river data", () => {
    const context = createRiverContext();
    context.pack.rivers = [
      { i: 1, parent: 0 } as any,
      { i: 2, parent: 1 } as any,
      { i: 3, parent: 2 } as any,
    ];

    expect(new RiverModule().getBasin(3, context)).toBe(1);
  });

  it("restores global Math.random after failed river generation", () => {
    const originalRandom = Math.random;

    try {
      expect(() => new RiverModule().generate(createRiverContext())).toThrow();
      expect(Math.random).toBe(originalRandom);
    } finally {
      Math.random = originalRandom;
    }
  });

  it("gets river names from the runtime naming service", () => {
    expect(new RiverModule().getName(1, createRiverContext())).toBe(
      "Culture 1",
    );
  });
});
