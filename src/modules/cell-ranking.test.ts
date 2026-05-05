import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import { CellRankingModule } from "./cell-ranking";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createRankingContext(): EngineRuntimeContext {
  const pack = {
    cells: {
      i: [0, 1, 2],
      h: new Uint8Array([10, 50, 60]),
      biome: new Uint8Array([0, 1, 2]),
      fl: new Uint16Array([0, 0, 0]),
      conf: new Uint8Array([0, 0, 0]),
      area: new Float32Array([10, 10, 10]),
      t: new Uint8Array([0, 0, 0]),
      r: new Uint8Array([0, 0, 0]),
      f: new Uint16Array([0, 0, 0]),
      haven: new Uint16Array([0, 0, 0]),
      harbor: new Uint8Array([0, 0, 0]),
    },
    features: [0],
  } as unknown as PackedGraph;

  return {
    grid: { cells: { i: [0, 1, 2] } },
    pack,
    options: {},
    seed: "cell-ranking-test",
    worldSettings: {},
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
      habitability: [0, 50, 25],
      iconsDensity: [],
      icons: [],
      cost: [],
    },
  } as EngineRuntimeContext;
}

describe("CellRankingModule", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("ranks population suitability from an explicit runtime context", () => {
    const context = createRankingContext();

    new CellRankingModule().rank(context);

    expect(Array.from(context.pack.cells.s)).toEqual([0, 10, 4]);
    expect(Array.from(context.pack.cells.pop)).toEqual([0, 10, 4]);
  });

  it("can be imported when window access throws", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./cell-ranking")).resolves.toBeDefined();
  });
});
