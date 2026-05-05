import { afterEach, describe, expect, it, vi } from "vitest";
import { EngineGenerationPipelineModule } from "./engine-generation-pipeline";
import type { EngineRuntimeContext } from "./engine-runtime-context";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

function createPipelineContext(id: string): EngineRuntimeContext {
  return {
    grid: { cells: {} },
    pack: {} as EngineRuntimeContext["pack"],
    options: {},
    seed: id,
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
      getCulture: () => "",
      getCultureShort: () => "",
      getState: () => "",
    },
    burgs: {
      add: () => null,
      remove: () => {},
      findById: () => undefined,
      getType: () => "Generic",
    },
    routes: {
      isCrossroad: () => false,
      isConnected: () => false,
      hasRoad: () => false,
      getRoute: () => undefined,
      getConnectivityRate: () => 0,
      buildLinks: () => [],
      connect: () => null,
      remove: () => {},
      getLength: () => 0,
      findById: () => undefined,
    },
    states: {
      generateCampaign: () => [],
      getPoles: () => {},
    },
    units: {
      height: "m",
    },
    heraldry: {
      generate: () => ({}),
      getShield: () => "",
      getRandomShield: () => "",
    },
    mapStore: {
      createSnapshot: () => ({ grid: {}, pack: {}, notes: [] }) as any,
      resetPackForGeneration: () => {},
      resetForResample: () => {},
      getCurrentContext: () => ({}) as EngineRuntimeContext,
    },
    seedSession: {
      apply: () => "",
      resolve: () => "",
    } as EngineRuntimeContext["seedSession"],
    graphSession: {
      applyGraphSize: () => {},
    } as EngineRuntimeContext["graphSession"],
    optionsSession: {
      randomizeOptions: () => {},
    } as EngineRuntimeContext["optionsSession"],
    gridSession: {
      prepareGrid: () => {},
    },
    sessionLifecycle: {
      resetActiveView: () => {},
    },
    generationSession: {
      prepare: () => {},
    },
    lifecycle: {
      addLakesInDeepDepressions: () => {},
      openNearSeaLakes: () => {},
      drawOceanLayers: () => {},
      defineMapSize: () => {},
      calculateMapCoordinates: () => {},
      rebuildGraph: () => {},
      createDefaultRuler: () => {},
      showStatistics: () => {},
    },
    notes: {
      all: () => [],
      push: () => {},
      find: () => undefined,
      findIndex: () => -1,
      removeWhere: () => {},
      splice: () => [],
    },
    random: {
      next: () => 0.5,
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
  } as EngineRuntimeContext;
}

describe("EngineGenerationPipelineModule", () => {
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

    await expect(import("./engine-generation-pipeline")).resolves.toBeDefined();
  });

  it("prepares the compatibility generation session before world generation", () => {
    const calls: string[] = [];
    const sessionContext = createPipelineContext("session");
    const preparedContext = createPipelineContext("prepared");
    sessionContext.mapStore.getCurrentContext = () => {
      calls.push("refresh");
      return preparedContext;
    };
    sessionContext.generationSession.prepare = (request) => {
      calls.push(`prepare:${request?.seed}`);
    };

    class TestPipeline extends EngineGenerationPipelineModule {
      override getCurrentContext() {
        calls.push("context");
        return calls.length === 1 ? sessionContext : preparedContext;
      }
    }

    const result = new TestPipeline().prepareGenerationSession({
      seed: "session",
    });

    expect(result).toBe(preparedContext);
    expect(calls).toEqual(["context", "prepare:session", "refresh"]);
  });

  it("generates the world through the expected runtime phases", async () => {
    const calls: string[] = [];
    const initialContext = createPipelineContext("initial");
    const refreshedContext = createPipelineContext("refreshed");
    const placedContext = createPipelineContext("placed");
    initialContext.mapStore.resetPackForGeneration = () => {
      calls.push("reset-pack");
    };
    initialContext.mapStore.getCurrentContext = () => {
      calls.push("refresh");
      return refreshedContext;
    };

    class TestPipeline extends EngineGenerationPipelineModule {
      override async generateHeightmap(context: EngineRuntimeContext) {
        calls.push(`heightmap:${context.seed}`);
        return [];
      }

      override prepareGridSurface(context: EngineRuntimeContext) {
        calls.push(`grid:${context.seed}`);
      }

      override prepareMapPlacement(context: EngineRuntimeContext) {
        calls.push(`placement:${context.seed}`);
        return placedContext;
      }

      override preparePackGraph(context: EngineRuntimeContext) {
        calls.push(`pack:${context.seed}`);
      }

      override generateTerrainFeatures(context: EngineRuntimeContext) {
        calls.push(`terrain:${context.seed}`);
      }

      override generateWorldEntities(context: EngineRuntimeContext) {
        calls.push(`entities:${context.seed}`);
      }
    }

    const result = await new TestPipeline().generateWorld(initialContext);

    expect(result).toBe(placedContext);
    expect(calls).toEqual([
      "heightmap:initial",
      "reset-pack",
      "refresh",
      "grid:refreshed",
      "placement:refreshed",
      "pack:placed",
      "terrain:placed",
      "entities:placed",
    ]);
  });

  it("routes generation errors through runtime logs and notices", () => {
    const calls: string[] = [];
    const context = createPipelineContext("error");
    context.logs = {
      warn: () => {},
      error: (message) => {
        calls.push(`log:${message}`);
      },
    };
    context.notices = {
      showModal: () => {},
      showGenerationError: (error) => {
        calls.push(`notice:${String(error)}`);
      },
    };

    class TestPipeline extends EngineGenerationPipelineModule {
      override getCurrentContext() {
        return context;
      }
    }

    new TestPipeline().handleGenerationError(new Error("boom"));

    expect(calls).toEqual(["log:Error: boom", "notice:Error: boom"]);
  });

  it("refreshes map placement through the runtime map store", () => {
    const calls: string[] = [];
    const context = createPipelineContext("placement-source");
    const placedContext = createPipelineContext("placement-refreshed");
    context.lifecycle.defineMapSize = (receivedContext) => {
      calls.push(`define:${receivedContext?.seed}`);
    };
    context.mapStore.getCurrentContext = () => {
      calls.push("refresh");
      return placedContext;
    };
    placedContext.lifecycle.calculateMapCoordinates = (receivedContext) => {
      calls.push(`coordinates:${receivedContext?.seed}`);
    };

    class TestPipeline extends EngineGenerationPipelineModule {
      override calculateClimate(receivedContext: EngineRuntimeContext) {
        calls.push(`climate:${receivedContext.seed}`);
      }
    }

    const result = new TestPipeline().prepareMapPlacement(context);

    expect(result).toBe(placedContext);
    expect(calls).toEqual([
      "define:placement-source",
      "refresh",
      "coordinates:placement-refreshed",
      "climate:placement-refreshed",
    ]);
  });
});
