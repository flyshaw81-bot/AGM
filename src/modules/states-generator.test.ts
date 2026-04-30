import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { type State, StatesModule } from "./states-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createStatesContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      states: [{ i: 0, name: "Neutrals" }],
    } as unknown as PackedGraph,
    options: {
      year: 1200,
    },
    seed: "states-test",
    worldSettings: {},
    generationSettings: {
      pointsCount: 1,
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

describe("StatesModule", () => {
  it("uses the runtime random service for state expansionism", () => {
    const context = createStatesContext();
    context.random = {
      next: () => 0,
    };
    context.generationSettings.stateSizeVariety = 2;
    context.pack.burgs = [
      { i: 0 },
      { i: 1, capital: true, cell: 0, name: "Northreach", culture: 1 },
    ] as any;
    context.pack.cultures = [
      { i: 0, type: "Generic" },
      { i: 1, type: "Generic" },
    ] as any;

    const states = (
      new StatesModule() as unknown as {
        createStates: (context: EngineRuntimeContext) => State[];
      }
    ).createStates(context);

    expect(states[1]).toMatchObject({
      expansionism: 1,
      name: "C1 State 1",
    });
  });

  it("generates campaign names from the runtime naming service", () => {
    const context = createStatesContext();
    const state = {
      i: 1,
      name: "Northreach",
      culture: 7,
      neighbors: [0],
    } as State;

    const [campaign] = new StatesModule().generateCampaign(state, context);

    expect(campaign.name).toMatch(/^C7 /);
    expect(campaign.start).toBeGreaterThanOrEqual(1);
    expect(campaign.end).toBeLessThanOrEqual(1199);
  });

  it("defines state forms from an explicit runtime context", () => {
    const context = createStatesContext();
    context.pack.burgs = [{ i: 0 }, { i: 1, name: "Northreach" }] as any;
    context.pack.cultures = [{ i: 0 }, { i: 1, base: 1 }] as any;
    context.pack.religions = [{ i: 0, type: "Folk" }] as any;
    context.pack.cells = {
      religion: new Uint16Array([0, 0]),
    } as any;
    context.pack.states = [
      { i: 0, name: "Neutrals", area: 0 },
      {
        i: 1,
        name: "Northreach",
        type: "Generic",
        culture: 1,
        center: 1,
        capital: 1,
        area: 100,
        burgs: 2,
        neighbors: [],
        diplomacy: [],
        expansionism: 1,
      },
    ] as any;

    new StatesModule().defineStateForms(context);

    expect(context.pack.states[1].form).toBeTruthy();
    expect(context.pack.states[1].formName).toBeTruthy();
    expect(context.pack.states[1].fullName).toContain("Northreach");
  });
});
