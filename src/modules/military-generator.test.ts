import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { MilitaryModule } from "./military-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

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
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    }
  });

  it("can be imported when window access throws", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./military-generator")).resolves.toBeDefined();
  });

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
