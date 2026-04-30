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
      states: [
        { i: 0, name: "Neutrals" },
        { i: 1, name: "Northland" },
      ],
      burgs: [],
      cells: {
        i: [0, 1],
        p: [
          [0, 0],
          [1, 1],
        ],
        c: [[1], [0]],
        s: new Float32Array([10, 10]),
        h: new Uint8Array([30, 30]),
        culture: new Uint16Array([1, 1]),
        state: new Uint16Array([1, 1]),
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
  it("generates names for non-theistic forms without a deity", () => {
    const context = createReligionsContext();
    const religions = new ReligionsModule() as unknown as {
      generateReligionName: (
        variety: string,
        form: string,
        deity: string | null,
        center: number,
        context: EngineRuntimeContext,
      ) => [string, string];
    };

    expect(() =>
      religions.generateReligionName(
        "Organized",
        "Non-theism",
        null,
        0,
        context,
      ),
    ).not.toThrow();
    expect(() =>
      religions.generateReligionName("Folk", "Animism", null, 0, context),
    ).not.toThrow();
  });

  it("generates folk religions against an explicit runtime context", () => {
    const context = createReligionsContext();

    new ReligionsModule().generate(context);

    expect(context.pack.religions[0].name).toBe("No religion");
    expect(context.pack.religions[1].type).toBe("Folk");
    expect(context.pack.religions[1].culture).toBe(1);
    expect(Array.from(context.pack.cells.religion)).toEqual([1, 1]);
  });

  it("adds manual religions against an explicit runtime context", () => {
    const context = createReligionsContext();
    context.pack.religions = [
      {
        i: 0,
        name: "No religion",
        color: "#ffffff",
        culture: 0,
        type: "Folk",
        form: "None",
        deity: null,
        expansion: "global",
        expansionism: 0,
        center: 0,
      },
      {
        i: 1,
        name: "Old Ways",
        color: "#6688aa",
        culture: 1,
        type: "Folk",
        form: "Shamanism",
        deity: "North Star",
        expansion: "culture",
        expansionism: 0,
        center: 0,
      },
    ];
    context.pack.cells.religion = new Uint16Array([1, 1]);

    new ReligionsModule().add(1, context);

    expect(context.pack.religions).toHaveLength(3);
    expect(context.pack.religions[2]).toMatchObject({
      i: 2,
      culture: 1,
      center: 1,
    });
    expect(context.pack.cells.religion[1]).toBe(2);
  });

  it("recalculates religions against an explicit runtime context", () => {
    const context = createReligionsContext();
    context.pack.religions = [
      {
        i: 0,
        name: "No religion",
        color: "#ffffff",
        culture: 0,
        type: "Folk",
        form: "None",
        deity: null,
        expansion: "global",
        expansionism: 0,
        center: 0,
      },
      {
        i: 1,
        name: "Old Ways",
        color: "#6688aa",
        culture: 1,
        type: "Folk",
        form: "Shamanism",
        deity: "North Star",
        expansion: "culture",
        expansionism: 0,
        center: 0,
      },
    ];
    context.pack.cells.religion = new Uint16Array([0, 0]);

    new ReligionsModule().recalculate(context);

    expect(Array.from(context.pack.cells.religion)).toEqual([1, 1]);
  });

  it("gets deity names from the explicit runtime naming service", () => {
    const context = createReligionsContext();

    expect(new ReligionsModule().getDeityName(1, context)).toContain(
      "Culture 1",
    );
  });
});
