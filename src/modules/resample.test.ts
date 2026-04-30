import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineMapSnapshot } from "./engine-map-store";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { Resampler } from "./resample";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

const originalPipeline = globalThis.EngineGenerationPipeline;
const originalProvinces = globalThis.Provinces;

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

describe("Resampler", () => {
  afterEach(() => {
    globalThis.EngineGenerationPipeline = originalPipeline;
    globalThis.Provinces = originalProvinces;
  });

  it("runs the resample pipeline against an explicit runtime context", () => {
    const { context, resampledContext, snapshot } = createResampleContext();
    globalThis.EngineGenerationPipeline = {
      markupGrid: vi.fn(),
      calculateClimate: vi.fn(),
      markupPack: vi.fn(),
      generateIce: vi.fn(),
    } as unknown as typeof EngineGenerationPipeline;
    globalThis.Provinces = {
      getPoles: vi.fn(),
    } as unknown as typeof Provinces;

    new Resampler().process(
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
    expect(EngineGenerationPipeline.markupGrid).toHaveBeenCalledWith(
      resampledContext,
    );
    expect(EngineGenerationPipeline.calculateClimate).toHaveBeenCalledWith(
      resampledContext,
    );
    expect(EngineGenerationPipeline.markupPack).toHaveBeenCalledWith(
      resampledContext,
    );
    expect(EngineGenerationPipeline.generateIce).toHaveBeenCalledWith(
      resampledContext,
    );
    expect(Provinces.getPoles).toHaveBeenCalledWith(resampledContext);
    expect(resampledContext.lifecycle.showStatistics).toHaveBeenCalledWith(
      resampledContext,
    );
  });
});
