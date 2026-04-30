import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import { type Burg, BurgModule } from "./burgs-generator";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createBurgContext(): EngineRuntimeContext {
  const notes = createTestNoteService([
    { id: "burg1", name: "Northport", legend: "Existing burg note" },
  ]);
  const calls = {
    addBurgCoa: 0,
    drawRoute: 0,
    drawBurg: 0,
  };
  const adapters = createTestRuntimeAdapters();

  return {
    grid: {
      cells: {
        temp: new Int8Array([12, 12]),
      },
    },
    pack: {
      cells: {
        burg: new Uint16Array([0, 1, 0]),
        culture: new Uint16Array([1, 1, 1]),
        state: new Uint16Array([1, 1, 1]),
        f: new Uint16Array([0, 0, 0]),
        haven: [],
        h: new Uint8Array([30, 30, 30]),
        r: new Uint16Array([0, 0, 0]),
        fl: new Uint16Array([0, 0, 0]),
        biome: new Uint8Array([5, 5, 5]),
        pop: new Float32Array([10, 10, 10]),
        religion: new Uint16Array([0, 0, 0]),
        s: new Int16Array([100, 100, 100]),
        i: [0, 1, 2],
      },
      features: [{ i: 0, type: "land" }],
      states: [
        { i: 0, name: "Neutrals", form: "Generic" },
        { i: 1, name: "Northrealm", culture: 1, form: "Generic", coa: {} },
      ],
      burgs: [
        { i: 0, name: "Removed" },
        {
          i: 1,
          cell: 1,
          x: 10,
          y: 20,
          name: "Northport",
          population: 12,
        },
      ],
    } as unknown as PackedGraph,
    options: {
      burgs: {
        groups: [{ name: "Towns", active: true, isDefault: true }],
      },
    },
    seed: "burg-test",
    worldSettings: {},
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
    ...adapters,
    routes: {
      ...adapters.routes,
      connect: () => ({ i: 1, group: "roads" }),
    },
    heraldry: {
      generate: () => ({ generated: true }),
      getShield: () => "heater",
      getRandomShield: () => "heater",
    },
    notes,
    rendering: {
      findCell: () => 1,
      addBurgCoa: () => {
        calls.addBurgCoa++;
      },
      drawRoute: () => {
        calls.drawRoute++;
      },
      isLayerOn: () => true,
      drawBurg: (burg) => {
        calls.drawBurg++;
        (burg as Burg & { rendered?: boolean }).rendered = true;
      },
      removeBurg: () => {},
      removeBurgCoa: () => {},
      redrawIceberg: () => {},
      redrawGlacier: () => {},
      removeElementById: () => {},
      drawScaleBar: () => {},
    },
    profile: calls as unknown as string,
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

describe("BurgModule", () => {
  it("uses the runtime random service when ranking capitals", () => {
    const context = createBurgContext();
    let randomCalls = 0;
    context.random = {
      next: () => {
        randomCalls++;
        return 0;
      },
    };
    context.worldSettings = {
      graphWidth: 100,
      graphHeight: 100,
    };
    context.generationSettings.statesCount = 1;
    context.generationSettings.manorsCount = 0;
    context.grid = {
      cells: {
        temp: new Int8Array(11).fill(12),
      },
      points: Array.from({ length: 11 }, (_, index) => [index, index]),
    } as any;
    context.pack.cells = {
      i: Array.from({ length: 11 }, (_, index) => index),
      s: new Int16Array(11).fill(100),
      culture: new Uint16Array(11).fill(1),
      burg: new Uint16Array(11),
      p: Array.from({ length: 11 }, (_, index) => [index * 10, index * 10]),
      f: new Uint16Array(11),
      haven: [],
      harbor: new Uint8Array(11),
      h: new Uint8Array(11).fill(30),
      r: new Uint16Array(11),
      fl: new Uint16Array(11),
    } as any;
    context.pack.features = [{ i: 0, type: "land", cells: 1 }] as any;

    new BurgModule().generate(context);

    expect(randomCalls).toBe(11);
    expect(context.pack.burgs).toHaveLength(2);
    expect(context.pack.burgs[1]).toMatchObject({
      i: 1,
      capital: 1,
      culture: 1,
    });
  });

  it("routes generation errors through runtime logs", () => {
    const context = createBurgContext();
    const errors: string[] = [];
    context.pack.cells.s = new Int16Array([0, 0, 0]);
    context.logs = {
      warn: () => {},
      error: (message) => {
        errors.push(message);
      },
    };

    const burgs = new BurgModule().generate(context);

    expect(burgs).toEqual([0]);
    expect(errors).toEqual([
      "There is no populated cells with culture assigned. Cannot generate states",
    ]);
  });

  it("changes burg groups through an explicit runtime context", () => {
    const context = createBurgContext();
    const burg = context.pack.burgs[1] as Burg & { rendered?: boolean };

    new BurgModule().changeGroup(burg, "Towns", context);

    expect(burg.group).toBe("Towns");
    expect(burg.rendered).toBe(true);
  });

  it("removes burg notes and cell occupancy through an explicit runtime context", () => {
    const context = createBurgContext();

    new BurgModule().remove(1, context);

    expect(context.pack.cells.burg[1]).toBe(0);
    expect(context.pack.burgs[1].removed).toBe(true);
    expect(context.notes.all()).toEqual([]);
  });

  it("adds burgs through context services and render adapters", () => {
    const context = createBurgContext();
    const calls = context.profile as unknown as {
      addBurgCoa: number;
      drawRoute: number;
      drawBurg: number;
    };

    context.rendering!.findCell = () => 0;

    const burgId = new BurgModule().add([12, 24], context);

    expect(burgId).toBe(2);
    expect(context.pack.cells.burg[0]).toBe(2);
    expect(context.pack.burgs[2]).toMatchObject({
      i: 2,
      cell: 0,
      name: "Culture 1",
      group: "Towns",
    });
    expect(context.pack.burgs[2].coa).toEqual({
      generated: true,
      shield: "heater",
    });
    expect(calls).toEqual({ addBurgCoa: 1, drawRoute: 1, drawBurg: 1 });
  });
});
