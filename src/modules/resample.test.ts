import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineMapSnapshot } from "./engine-map-store";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { createGlobalResamplerTargets, Resampler } from "./resample";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

const originalPipeline = globalThis.EngineGenerationPipeline;
const originalMarkers = globalThis.Markers;
const originalProvinces = globalThis.Provinces;
const originalRivers = globalThis.Rivers;
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

function createEmptyPack() {
  return {
    cells: {
      i: [],
      p: [],
      c: [],
      h: new Uint8Array(),
      f: new Uint16Array(),
      g: new Uint16Array(),
      area: [],
    },
    rivers: [],
    cultures: [],
    burgs: [],
    states: [],
    routes: [],
    religions: [],
    provinces: [],
    features: [],
    markers: [],
    zones: [],
  };
}

function createResampleContext() {
  const snapshot = {
    grid: {
      points: [],
      cells: {
        c: [],
        h: new Uint8Array(),
        temp: new Int8Array(),
        prec: new Uint8Array(),
      },
    },
    pack: createEmptyPack(),
    notes: [],
  } as unknown as EngineMapSnapshot;

  const resampledContext = {
    grid: {
      points: [],
      cells: {
        c: [],
      },
    },
    pack: createEmptyPack(),
    options: {},
    seed: "resample-test",
    worldSettings: {
      graphWidth: 100,
      graphHeight: 100,
    },
    generationSettings: {
      pointsCount: 0,
      heightExponent: 1,
      lakeElevationLimit: 80,
      resolveDepressionsSteps: 100,
      religionsCount: 0,
      provincesRatio: 0,
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
      getCulture: (culture: number) => `Culture ${culture}`,
      getCultureShort: (culture: number) => `C${culture}`,
      getState: (baseName: string) => `${baseName} Province`,
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
  } as unknown as EngineRuntimeContext;

  resampledContext.lifecycle = {
    ...resampledContext.lifecycle,
    addLakesInDeepDepressions: vi.fn(),
    openNearSeaLakes: vi.fn(),
    drawOceanLayers: vi.fn(),
    calculateMapCoordinates: vi.fn(),
    rebuildGraph: vi.fn(),
    createDefaultRuler: vi.fn(),
    showStatistics: vi.fn(),
  };

  const context = {
    ...resampledContext,
    mapStore: {
      createSnapshot: vi.fn(() => snapshot),
      resetPackForGeneration: vi.fn(),
      resetForResample: vi.fn(),
      getCurrentContext: vi.fn(() => resampledContext),
    },
  } as EngineRuntimeContext;

  return { context, resampledContext, snapshot };
}

function createResamplerTargets() {
  return {
    addRiverMeandering: vi.fn(() => []),
    calculateClimate: vi.fn(),
    deleteMarker: vi.fn(),
    generateIce: vi.fn(),
    getProvincePoles: vi.fn(),
    getRiverApproximateLength: vi.fn(() => 0),
    getRiverBasin: vi.fn(() => 0),
    markupGrid: vi.fn(),
    markupPack: vi.fn(),
  };
}

describe("Resampler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.EngineGenerationPipeline = originalPipeline;
    globalThis.Markers = originalMarkers;
    globalThis.Provinces = originalProvinces;
    globalThis.Rivers = originalRivers;
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

    await expect(import("./resample")).resolves.toBeDefined();
  });

  it("runs the resample pipeline against an explicit runtime context", () => {
    const { context, resampledContext, snapshot } = createResampleContext();
    const targets = createResamplerTargets();

    new Resampler(targets).process(
      {
        projection: (x, y) => [x, y],
        inverse: (x, y) => [x, y],
        scale: 1,
      },
      context,
    );

    expect(context.mapStore.createSnapshot).toHaveBeenCalledWith();
    expect(context.mapStore.resetForResample).toHaveBeenCalledWith(snapshot);
    expect(context.mapStore.getCurrentContext).toHaveBeenCalledWith();
    expect(targets.markupGrid).toHaveBeenCalledWith(resampledContext);
    expect(targets.calculateClimate).toHaveBeenCalledWith(resampledContext);
    expect(targets.markupPack).toHaveBeenCalledWith(resampledContext);
    expect(targets.generateIce).toHaveBeenCalledWith(resampledContext);
    expect(targets.getProvincePoles).toHaveBeenCalledWith(resampledContext);
    expect(resampledContext.lifecycle.showStatistics).toHaveBeenCalledWith(
      resampledContext,
    );
  });

  it("keeps the global compatibility target wiring available", () => {
    globalThis.EngineGenerationPipeline = {
      markupGrid: vi.fn(),
      calculateClimate: vi.fn(),
      markupPack: vi.fn(),
      generateIce: vi.fn(),
    } as unknown as typeof EngineGenerationPipeline;
    globalThis.Markers = {
      deleteMarker: vi.fn(),
    } as unknown as typeof Markers;
    globalThis.Provinces = {
      getPoles: vi.fn(),
    } as unknown as typeof Provinces;
    globalThis.Rivers = {
      addMeandering: vi.fn(() => [[0, 0, 0]]),
      getApproximateLength: vi.fn(() => 7),
      getBasin: vi.fn(() => 3),
    } as unknown as typeof Rivers;
    const context = createResampleContext().context;

    const targets = createGlobalResamplerTargets();

    expect(targets.addRiverMeandering([1], [], 0.5, context)).toEqual([
      [0, 0, 0],
    ]);
    expect(targets.getRiverApproximateLength([])).toBe(7);
    expect(targets.getRiverBasin(1, context)).toBe(3);
    targets.markupGrid(context);
    targets.calculateClimate(context);
    targets.markupPack(context);
    targets.generateIce(context);
    targets.getProvincePoles(context);
    targets.deleteMarker(4, context);

    expect(globalThis.EngineGenerationPipeline.markupGrid).toHaveBeenCalledWith(
      context,
    );
    expect(
      globalThis.EngineGenerationPipeline.calculateClimate,
    ).toHaveBeenCalledWith(context);
    expect(globalThis.EngineGenerationPipeline.markupPack).toHaveBeenCalledWith(
      context,
    );
    expect(
      globalThis.EngineGenerationPipeline.generateIce,
    ).toHaveBeenCalledWith(context);
    expect(globalThis.Provinces.getPoles).toHaveBeenCalledWith(context);
    expect(globalThis.Markers.deleteMarker).toHaveBeenCalledWith(4, context);
  });

  it("can build global targets from injected compatibility adapters", () => {
    const context = createResampleContext().context;
    const pipeline = {
      markupGrid: vi.fn(),
      calculateClimate: vi.fn(),
      markupPack: vi.fn(),
      generateIce: vi.fn(),
    };
    const markers = {
      deleteMarker: vi.fn(),
    };
    const provinces = {
      getPoles: vi.fn(),
    };
    const rivers = {
      addMeandering: vi.fn(() => [[1, 2, 3]]),
      getApproximateLength: vi.fn(() => 11),
      getBasin: vi.fn(() => 5),
    };

    const targets = createGlobalResamplerTargets({
      getEngineGenerationPipeline: () =>
        pipeline as unknown as typeof EngineGenerationPipeline,
      getMarkers: () => markers as unknown as typeof Markers,
      getProvinces: () => provinces as unknown as typeof Provinces,
      getRivers: () => rivers as unknown as typeof Rivers,
    });

    expect(targets.addRiverMeandering([1], [], 0.5, context)).toEqual([
      [1, 2, 3],
    ]);
    expect(targets.getRiverApproximateLength([])).toBe(11);
    expect(targets.getRiverBasin(1, context)).toBe(5);
    targets.markupGrid(context);
    targets.calculateClimate(context);
    targets.markupPack(context);
    targets.generateIce(context);
    targets.getProvincePoles(context);
    targets.deleteMarker(4, context);

    expect(pipeline.markupGrid).toHaveBeenCalledWith(context);
    expect(pipeline.calculateClimate).toHaveBeenCalledWith(context);
    expect(pipeline.markupPack).toHaveBeenCalledWith(context);
    expect(pipeline.generateIce).toHaveBeenCalledWith(context);
    expect(provinces.getPoles).toHaveBeenCalledWith(context);
    expect(markers.deleteMarker).toHaveBeenCalledWith(4, context);
  });
});
