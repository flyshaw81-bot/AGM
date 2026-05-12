import { afterEach, describe, expect, it, vi } from "vitest";
import { EngineGenerationPipelineModule } from "./engine-generation-pipeline";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { createEngineWorldState } from "./engine-world-state";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalClimateDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Climate",
);
const originalGridDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "grid",
);
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);
const originalOptionsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "options",
);
const originalSeedDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "seed",
);
const originalBiomesDataDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "biomesData",
);
const originalGraphWidthDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "graphWidth",
);
const originalGraphHeightDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "graphHeight",
);
const originalMapCoordinatesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "mapCoordinates",
);
const originalEngineGenerationPipelineDescriptor =
  Object.getOwnPropertyDescriptor(globalThis, "EngineGenerationPipeline");
const originalGenerateDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "generate",
);

function createPipelineContext(id: string): EngineRuntimeContext {
  const context = {
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
  context.worldState = createEngineWorldState({
    grid: context.grid,
    pack: context.pack,
    options: context.options,
    seed: context.seed,
    worldSettings: context.worldSettings,
    generationSettings: context.generationSettings,
    biomesData: context.biomesData,
  });
  return context;
}

describe("EngineGenerationPipelineModule", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    }
    if (originalClimateDescriptor) {
      Object.defineProperty(globalThis, "Climate", originalClimateDescriptor);
    } else {
      delete (globalThis as Record<string, unknown>).Climate;
    }
    for (const [name, descriptor] of [
      ["grid", originalGridDescriptor],
      ["pack", originalPackDescriptor],
      ["options", originalOptionsDescriptor],
      ["seed", originalSeedDescriptor],
      ["biomesData", originalBiomesDataDescriptor],
      ["graphWidth", originalGraphWidthDescriptor],
      ["graphHeight", originalGraphHeightDescriptor],
      ["mapCoordinates", originalMapCoordinatesDescriptor],
      ["EngineGenerationPipeline", originalEngineGenerationPipelineDescriptor],
      ["generate", originalGenerateDescriptor],
    ] as const) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        delete (globalThis as Record<string, unknown>)[name];
      }
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

  it("mounts the legacy generate compatibility entrypoint from the module", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
      writable: true,
    });
    await import("./engine-generation-pipeline");
    const result = createPipelineContext("generated");
    const runGenerationRequest = vi.fn(async () => result);
    globalThis.EngineGenerationPipeline = {
      runGenerationRequest,
    } as unknown as typeof EngineGenerationPipeline;

    await expect(globalThis.generate({ seed: "fixed" })).resolves.toBe(result);
    expect(runGenerationRequest).toHaveBeenCalledWith({ seed: "fixed" });
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

  it("keeps generated runtime map data inside the engine context", async () => {
    for (const name of [
      "grid",
      "pack",
      "options",
      "seed",
      "biomesData",
      "graphWidth",
      "graphHeight",
      "mapCoordinates",
    ]) {
      delete (globalThis as Record<string, unknown>)[name];
    }

    const context = createPipelineContext("compat");
    const nextPack = { cells: { i: [1] } } as EngineRuntimeContext["pack"];
    context.grid = { cells: { i: [1] } } as typeof grid;
    context.pack = { cells: { i: [0] } } as EngineRuntimeContext["pack"];
    context.options = { era: "runtime" } as typeof options;
    context.biomesData = {
      i: [1],
      name: ["runtime"],
      color: [],
      biomesMatrix: [],
      habitability: [],
      iconsDensity: [],
      icons: [],
      cost: [],
    };
    context.worldSettings = {
      graphWidth: 1200,
      graphHeight: 800,
      mapCoordinates: {
        latT: 90,
        latN: 45,
        latS: -45,
      } as typeof mapCoordinates,
    };
    context.mapStore.resetPackForGeneration = () => {
      context.pack = nextPack;
    };
    context.mapStore.getCurrentContext = () => context;

    class TestPipeline extends EngineGenerationPipelineModule {
      override async generateHeightmap() {
        return [];
      }

      override prepareGridSurface() {}
      override prepareMapPlacement(receivedContext: EngineRuntimeContext) {
        return receivedContext;
      }
      override preparePackGraph() {}
      override generateTerrainFeatures() {}
      override generateWorldEntities() {}
    }

    await new TestPipeline().generateWorld(context);

    expect(context.pack).toBe(nextPack);
    expect(context.seed).toBe("compat");
    expect(globalThis.grid).toBeUndefined();
    expect(globalThis.pack).toBeUndefined();
    expect(globalThis.options).toBeUndefined();
    expect(globalThis.seed).toBeUndefined();
    expect(globalThis.biomesData).toBeUndefined();
    expect(globalThis.graphWidth).toBeUndefined();
    expect(globalThis.graphHeight).toBeUndefined();
    expect(globalThis.mapCoordinates).toBeUndefined();
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

  it("runs a full generation request through the pipeline boundary", async () => {
    const calls: string[] = [];
    const sessionContext = createPipelineContext("request");
    const generationContext = createPipelineContext("generated");
    sessionContext.worldState = createEngineWorldState({
      runtimeFlags: { shouldLogWarnings: true },
    });
    generationContext.worldState = createEngineWorldState({
      runtimeFlags: { shouldLogWarnings: true },
    });
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    class TestPipeline extends EngineGenerationPipelineModule {
      override prepareGenerationSession() {
        calls.push("prepare");
        return sessionContext;
      }

      override async generateWorld(context: EngineRuntimeContext) {
        calls.push(`world:${context.seed}`);
        return generationContext;
      }

      override finalizeGeneration(context: EngineRuntimeContext) {
        calls.push(`finalize:${context.seed}`);
      }
    }

    const result = await new TestPipeline().runGenerationRequest({
      seed: "request",
    });

    expect(result).toBe(generationContext);
    expect(calls).toEqual(["prepare", "world:request", "finalize:generated"]);
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringMatching(/^TOTAL:/));
  });

  it("keeps generation request errors inside the pipeline boundary", async () => {
    const calls: string[] = [];

    class TestPipeline extends EngineGenerationPipelineModule {
      override prepareGenerationSession(): EngineRuntimeContext {
        throw new Error("request failed");
      }

      override handleGenerationError(error: unknown) {
        calls.push(String(error));
      }
    }

    await expect(
      new TestPipeline().runGenerationRequest(),
    ).resolves.toBeUndefined();
    expect(calls).toEqual(["Error: request failed"]);
  });

  it("refreshes cached climate context from the active runtime context", () => {
    const context = createPipelineContext("climate");
    const runtimeGrid = { cells: { i: [1] } } as typeof grid;
    const staleGrid = { cells: { i: [99] } } as typeof grid;
    const coordinates = { latT: 90, latN: 45, latS: -45 };
    const precipitationLayer = {
      selectAll: () => ({ remove: () => {} }),
    } as unknown as typeof prec;
    context.grid = runtimeGrid;
    context.worldSettings = {
      mapCoordinates: coordinates as typeof mapCoordinates,
      graphWidth: 1200,
      graphHeight: 800,
    };
    context.generationSettings = {
      ...context.generationSettings,
      heightExponent: 2,
      pointsCount: 1000,
    };
    context.climate = {
      grid: staleGrid,
      coordinates: { latT: 0, latN: 0, latS: 0 },
      graphWidth: 1,
      graphHeight: 1,
      options: {},
      heightExponent: 1,
      pointsCount: 1,
      precipitationPercent: 75,
      precipitationLayer,
      debugTemperature: true,
      shouldTime: false,
    };
    globalThis.Climate = {
      calculateTemperatures: vi.fn(),
      generatePrecipitation: vi.fn(() => "precipitation"),
    } as unknown as typeof Climate;

    const result = new EngineGenerationPipelineModule().calculateClimate(
      context,
    );

    expect(result).toBe("precipitation");
    expect(context.climate.grid).toBe(runtimeGrid);
    expect(context.climate.coordinates).toBe(coordinates);
    expect(context.climate.graphWidth).toBe(1200);
    expect(context.climate.graphHeight).toBe(800);
    expect(context.climate.heightExponent).toBe(2);
    expect(context.climate.pointsCount).toBe(1000);
    expect(context.climate.precipitationPercent).toBe(75);
    expect(globalThis.Climate.calculateTemperatures).toHaveBeenCalledWith(
      context.climate,
    );
    expect(globalThis.Climate.generatePrecipitation).toHaveBeenCalledWith(
      context.climate,
    );
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
