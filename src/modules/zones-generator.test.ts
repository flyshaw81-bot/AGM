import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";
import { ZonesModule } from "./zones-generator";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

function createZonesContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      cells: {
        i: [0, 1],
      },
      zones: [
        {
          i: 0,
          name: "Stale Zone",
          type: "Test",
          cells: [0],
          color: "#000",
        },
      ],
    } as unknown as PackedGraph,
    options: {},
    seed: "zones-test",
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

describe("ZonesModule", () => {
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

    await expect(import("./zones-generator")).resolves.toBeDefined();
  });

  it("generates zones against an explicit runtime context", () => {
    const context = createZonesContext();

    new ZonesModule().generate(context, 0);

    expect(context.pack.zones).toEqual([]);
  });
});
