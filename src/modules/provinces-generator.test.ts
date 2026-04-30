import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { ProvinceModule } from "./provinces-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

const originalBurgs = globalThis.Burgs;

function createProvinceContext(): EngineRuntimeContext {
  const cells = {
    i: [0, 1, 2, 3],
    c: [[1], [0, 2], [1, 3], [2]],
    h: new Uint8Array([30, 30, 30, 30]),
    t: new Uint8Array([0, 0, 0, 0]),
    state: new Uint16Array([1, 1, 1, 1]),
    burg: new Uint16Array([1, 0, 2, 0]),
    culture: new Uint16Array([1, 1, 1, 1]),
    f: new Uint16Array([0, 0, 0, 0]),
    province: new Uint16Array(4),
  };

  return {
    grid: {
      cells: {},
    },
    pack: {
      cells,
      features: [{ i: 0, type: "land", group: "continent", cells: 4 }],
      states: [
        { i: 0, name: "Neutral", removed: true },
        {
          i: 1,
          name: "Northland",
          form: "Monarchy",
          color: "#6688aa",
          center: 0,
          provinces: [],
          coa: { shield: "heater" },
        },
      ],
      burgs: [
        { i: 0, removed: true },
        {
          i: 1,
          name: "Northkeep",
          cell: 0,
          state: 1,
          culture: 1,
          population: 100,
          capital: 1,
          port: 0,
          coa: { shield: "round" },
        },
        {
          i: 2,
          name: "Eastwatch",
          cell: 2,
          state: 1,
          culture: 1,
          population: 60,
          capital: 0,
          port: 0,
          coa: { shield: "round" },
        },
      ],
      provinces: [],
    } as unknown as PackedGraph,
    options: {},
    seed: "provinces-test",
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
      provincesRatio: 100,
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
      getState: (baseName, culture) => `${baseName} Province ${culture}`,
    },
    ...createTestRuntimeAdapters(),
    heraldry: {
      ...createTestRuntimeAdapters().heraldry,
      generate: vi.fn(() => ({ generated: true })),
      getShield: vi.fn(() => "heater"),
    },
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

describe("ProvinceModule", () => {
  afterEach(() => {
    globalThis.Burgs = originalBurgs;
  });

  it("generates provinces against an explicit runtime context", () => {
    globalThis.Burgs = {
      getType: vi.fn(() => "Generic"),
    } as unknown as typeof Burgs;
    const context = createProvinceContext();

    new ProvinceModule().generate(context);

    expect(context.pack.provinces).toHaveLength(3);
    expect(context.pack.provinces[1]).toMatchObject({
      i: 1,
      state: 1,
      center: 0,
      burg: 1,
    });
    expect(context.pack.provinces[2]).toMatchObject({
      i: 2,
      state: 1,
      center: 2,
      burg: 2,
    });
    expect(context.pack.states[1].provinces).toEqual([1, 2]);
    expect(Array.from(context.pack.cells.province)).toEqual([1, 1, 2, 2]);
    expect(context.heraldry.generate).toHaveBeenCalled();
    expect(context.heraldry.getShield).toHaveBeenCalledWith(1, 1);
  });
});
