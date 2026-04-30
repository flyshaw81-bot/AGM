import { describe, expect, it } from "vitest";
import { EngineGenerationPipelineModule } from "./engine-generation-pipeline";
import type { EngineRuntimeContext } from "./engine-runtime-context";

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
    routes: {
      isCrossroad: () => false,
      isConnected: () => false,
      hasRoad: () => false,
      getRoute: () => undefined,
      getConnectivityRate: () => 0,
      buildLinks: () => [],
      connect: () => null,
      remove: () => {},
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
  it("prepares the compatibility generation session before world generation", () => {
    const calls: string[] = [];
    const sessionContext = createPipelineContext("session");
    const preparedContext = createPipelineContext("prepared");
    sessionContext.generationSession.prepare = (request, context) => {
      calls.push(`prepare:${request?.seed}:${context?.seed}`);
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
    expect(calls).toEqual(["context", "prepare:session:session", "context"]);
  });

  it("generates the world through the expected runtime phases", async () => {
    const calls: string[] = [];
    const initialContext = createPipelineContext("initial");
    const refreshedContext = createPipelineContext("refreshed");
    const placedContext = createPipelineContext("placed");
    initialContext.mapStore.resetPackForGeneration = () => {
      calls.push("reset-pack");
    };

    class TestPipeline extends EngineGenerationPipelineModule {
      override async generateHeightmap(context: EngineRuntimeContext) {
        calls.push(`heightmap:${context.seed}`);
        return [];
      }

      override getCurrentContext() {
        calls.push("refresh");
        return refreshedContext;
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
});
