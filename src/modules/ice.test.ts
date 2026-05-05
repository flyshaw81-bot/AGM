import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { IceModule } from "./ice";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createIceContext() {
  const calls = {
    redrawIceberg: 0,
    redrawGlacier: 0,
  };

  const context = {
    grid: {
      cells: {
        i: [0],
        f: new Uint8Array([0]),
        h: new Uint8Array([0]),
        t: new Int8Array([-1]),
        temp: new Int8Array([-10]),
        v: [[0, 1, 2, 3]],
      },
      features: [{ type: "ocean" }],
      points: [[5, 5]],
      vertices: {
        p: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
      },
    },
    pack: {
      ice: [],
    },
    options: {},
    seed: "test-seed",
    worldSettings: {
      graphWidth: 10,
      graphHeight: 10,
    },
    generationSettings: {
      pointsCount: 1,
      heightExponent: 1,
      lakeElevationLimit: 0,
      resolveDepressionsSteps: 0,
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
      getCulture: () => "Test",
      getCultureShort: () => "Test",
      getState: () => "Test",
    },
    ...createTestRuntimeAdapters(),
    notes: createTestNoteService(),
    rendering: {
      findCell: () => 0,
      addBurgCoa: () => {},
      drawRoute: () => {},
      isLayerOn: () => false,
      drawBurg: () => {},
      removeBurg: () => {},
      removeBurgCoa: () => {},
      redrawIceberg: () => {
        calls.redrawIceberg++;
      },
      redrawGlacier: () => {
        calls.redrawGlacier++;
      },
      removeElementById: () => {},
    },
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
  } as unknown as EngineRuntimeContext;

  return { calls, context };
}

describe("IceModule", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("adds and removes icebergs through runtime context adapters", () => {
    const { calls, context } = createIceContext();
    const ice = new IceModule();

    ice.addIceberg(0, 0.5, context);
    expect(context.pack.ice).toHaveLength(1);
    expect(calls.redrawIceberg).toBe(1);

    ice.removeIce(0, context);
    expect(context.pack.ice).toHaveLength(0);
    expect(calls.redrawIceberg).toBe(2);
    expect(calls.redrawGlacier).toBe(0);
  });

  it("restores global Math.random after ice generation", () => {
    const originalRandom = Math.random;
    const { context } = createIceContext();
    const ice = new IceModule();

    try {
      ice.generate(context);

      expect(Math.random).toBe(originalRandom);
    } finally {
      Math.random = originalRandom;
    }
  });

  it("can be imported when window access throws", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./ice")).resolves.toBeDefined();
  });
});
