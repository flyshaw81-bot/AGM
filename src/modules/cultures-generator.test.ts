import { describe, expect, it } from "vitest";
import { type Culture, CulturesModule } from "./cultures-generator";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import type { NameBase } from "./names-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createCultureContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      cells: {},
    } as any,
    options: {},
    seed: "cultures-test",
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
    heraldry: {
      ...createTestRuntimeAdapters().heraldry,
      getRandomShield: () => "round",
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

function createGenerateCultureContext(): EngineRuntimeContext {
  const size = 30;
  const cells = {
    i: Array.from({ length: size }, (_, index) => index),
    s: new Float32Array(size).fill(10),
    t: new Int8Array(size).fill(2),
    h: new Uint8Array(size).fill(25),
    temp: new Int8Array(size).fill(20),
    g: new Uint16Array(Array.from({ length: size }, (_, index) => index)),
    biome: new Uint8Array(size).fill(5),
    haven: new Uint16Array(size),
    f: new Uint16Array(size),
    harbor: new Uint8Array(size),
    r: new Uint16Array(size),
    fl: new Uint16Array(size),
    p: Array.from({ length: size }, (_, index) => [index * 2, 10]),
    c: Array.from({ length: size }, (_, index) =>
      [index - 1, index + 1].filter((cell) => cell >= 0 && cell < size),
    ),
  };

  const testNameBases = [
    { name: "Test", i: 0, min: 4, max: 8, d: "ae", m: 0, b: "Test" },
  ] as NameBase[];

  return {
    ...createCultureContext(),
    grid: {
      cells: {
        temp: cells.temp,
      },
    },
    pack: {
      cells,
      features: [{ type: "land", group: "continent", cells: size }],
      cultures: [],
    } as any,
    worldSettings: {
      graphWidth: 100,
      graphHeight: 100,
    },
    generationSettings: {
      ...createCultureContext().generationSettings,
      culturesCount: 1,
      cultureSet: "european",
      cultureSetMax: 1,
      cultureEmblemShape: "random",
    },
    naming: {
      ...createCultureContext().naming,
      getNameBases: () => testNameBases,
    },
  };
}

describe("CulturesModule", () => {
  it("gets random shields through the runtime heraldry service", () => {
    expect(new CulturesModule().getRandomShield(createCultureContext())).toBe(
      "round",
    );
  });

  it("generates cultures from an explicit runtime context", () => {
    const context = createGenerateCultureContext();

    new CulturesModule().generate(context);

    expect(context.pack.cultures).toHaveLength(2);
    expect(context.pack.cultures[0]).toMatchObject({
      name: "Wildlands",
      i: 0,
    });
    expect((context.pack.cultures[1] as Culture).center).toBeTypeOf("number");
    expect(context.pack.cells.culture).toBeInstanceOf(Uint16Array);
  });

  it("uses the runtime random service for culture expansionism", () => {
    const context = createGenerateCultureContext();
    context.random = {
      next: () => 0,
    };
    context.generationSettings.stateSizeVariety = 2;

    new CulturesModule().generate(context);

    expect(context.pack.cultures[1]).toMatchObject({
      expansionism: 1,
    });
  });

  it("adds manual cultures through an explicit runtime context", () => {
    const context = createGenerateCultureContext();
    context.pack.cultures = [
      {
        name: "Wildlands",
        i: 0,
        base: 0,
        shield: "round",
      },
    ];
    context.pack.cells.culture = new Uint16Array([0]);

    new CulturesModule().add(0, context);

    expect(context.pack.cultures).toHaveLength(2);
    expect(context.pack.cultures[1]).toMatchObject({
      i: 1,
      center: 0,
      shield: "round",
    });
  });

  it("routes extreme-climate warnings through the runtime notice service", () => {
    const notices: Array<{ title: string; html: string }> = [];
    const warnings: string[] = [];
    const context = createGenerateCultureContext();
    context.pack.cells.i = [0];
    context.pack.cells.s = new Float32Array([0]);
    context.generationSettings.culturesCount = 2;
    context.generationSettings.cultureSetMax = 2;
    context.logs = {
      warn: (message) => {
        warnings.push(message);
      },
      error: () => {},
    };
    context.notices = {
      showModal: (notice) => {
        notices.push(notice);
      },
      showGenerationError: () => {},
    };

    new CulturesModule().generate(context);

    expect(context.pack.cultures).toEqual([
      { name: "Wildlands", i: 0, base: 1, shield: "round" },
    ]);
    expect(notices).toHaveLength(1);
    expect(notices[0].title).toBe("Extreme climate warning");
    expect(notices[0].html).toContain("No cultures, states and burgs");
    expect(warnings).toEqual([
      "There are no populated cells. Cannot generate cultures",
    ]);
  });

  it("keeps extreme-climate warning fallback on the explicit runtime log service", () => {
    const warnings: string[] = [];
    const context = createGenerateCultureContext();
    context.pack.cells.i = [0];
    context.pack.cells.s = new Float32Array([0]);
    context.generationSettings.culturesCount = 2;
    context.generationSettings.cultureSetMax = 2;
    context.notices = undefined;
    context.logs = {
      warn: (message) => {
        warnings.push(message);
      },
      error: () => {},
    };

    new CulturesModule().generate(context);

    expect(warnings).toEqual([
      "There are no populated cells. Cannot generate cultures",
      expect.stringContaining("No cultures, states and burgs"),
    ]);
  });
});
