import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalLifecycleAdapter,
  createGlobalLifecycleTargets,
  createLifecycleAdapter,
  createLifecycleSettingsSnapshot,
  createLifecycleTargets,
  type EngineLifecycleAdapter,
  type EngineLifecycleTargets,
} from "./engine-lifecycle-adapter";
import type { EngineRuntimeContext } from "./engine-runtime-context";

const originalAddLakesInDeepDepressions = globalThis.addLakesInDeepDepressions;
const originalOpenNearSeaLakes = globalThis.openNearSeaLakes;
const originalOceanLayers = globalThis.OceanLayers;
const originalDefineMapSize = globalThis.defineMapSize;
const originalCalculateMapCoordinates = globalThis.calculateMapCoordinates;
const originalReGraph = globalThis.reGraph;
const originalCreateDefaultRuler = globalThis.createDefaultRuler;
const originalShowStatistics = globalThis.showStatistics;
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
const originalBiomesDataDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "biomesData",
);
const originalSeedDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "seed",
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

function createContext(): EngineRuntimeContext {
  return {
    generationSettings: {
      heightmapTemplateId: "archipelago",
      lakeElevationLimit: 22,
    },
    worldSettings: {
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    },
  } as EngineRuntimeContext;
}

function createTargets(): EngineLifecycleTargets {
  return {
    addLakesInDeepDepressions: vi.fn(),
    openNearSeaLakes: vi.fn(),
    drawOceanLayers: vi.fn(),
    defineMapSize: vi.fn(),
    calculateMapCoordinates: vi.fn(),
    rebuildGraph: vi.fn(),
    createDefaultRuler: vi.fn(),
    showStatistics: vi.fn(),
  };
}

function installLifecycleGlobals(): Record<string, ReturnType<typeof vi.fn>> {
  const calls = {
    addLakesInDeepDepressions: vi.fn(),
    openNearSeaLakes: vi.fn(),
    OceanLayers: vi.fn(),
    defineMapSize: vi.fn(),
    calculateMapCoordinates: vi.fn(),
    reGraph: vi.fn(),
    createDefaultRuler: vi.fn(),
    showStatistics: vi.fn(),
  };

  globalThis.addLakesInDeepDepressions = calls.addLakesInDeepDepressions;
  globalThis.openNearSeaLakes = calls.openNearSeaLakes;
  globalThis.OceanLayers = calls.OceanLayers;
  globalThis.defineMapSize = calls.defineMapSize;
  globalThis.calculateMapCoordinates = calls.calculateMapCoordinates;
  globalThis.reGraph = calls.reGraph;
  globalThis.createDefaultRuler = calls.createDefaultRuler;
  globalThis.showStatistics = calls.showStatistics;

  return calls;
}

describe("createGlobalLifecycleAdapter", () => {
  afterEach(() => {
    globalThis.addLakesInDeepDepressions = originalAddLakesInDeepDepressions;
    globalThis.openNearSeaLakes = originalOpenNearSeaLakes;
    globalThis.OceanLayers = originalOceanLayers;
    globalThis.defineMapSize = originalDefineMapSize;
    globalThis.calculateMapCoordinates = originalCalculateMapCoordinates;
    globalThis.reGraph = originalReGraph;
    globalThis.createDefaultRuler = originalCreateDefaultRuler;
    globalThis.showStatistics = originalShowStatistics;
    for (const [name, descriptor] of [
      ["grid", originalGridDescriptor],
      ["pack", originalPackDescriptor],
      ["options", originalOptionsDescriptor],
      ["biomesData", originalBiomesDataDescriptor],
      ["seed", originalSeedDescriptor],
      ["graphWidth", originalGraphWidthDescriptor],
      ["graphHeight", originalGraphHeightDescriptor],
      ["mapCoordinates", originalMapCoordinatesDescriptor],
    ] as const) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        delete (globalThis as Record<string, unknown>)[name];
      }
    }
  });

  it("passes explicit runtime context values into public lifecycle helpers", () => {
    const calls = installLifecycleGlobals();
    const context = createContext();
    const adapter = createGlobalLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    });

    adapter.addLakesInDeepDepressions(context);
    adapter.openNearSeaLakes(context);
    adapter.drawOceanLayers(context);
    adapter.defineMapSize(context);
    adapter.calculateMapCoordinates(context);
    adapter.showStatistics(context);

    expect(calls.addLakesInDeepDepressions).not.toHaveBeenCalled();
    expect(calls.openNearSeaLakes).not.toHaveBeenCalled();
    expect(calls.OceanLayers).toHaveBeenCalledWith(context);
    expect(calls.defineMapSize).not.toHaveBeenCalled();
    expect(calls.calculateMapCoordinates).not.toHaveBeenCalled();
    expect(calls.showStatistics).not.toHaveBeenCalled();
  });

  it("keeps default map placement out of public helper calls", () => {
    const originalGrid = { features: [] } as typeof grid;
    const runtimeGrid = {
      features: [0, { land: true, border: false }],
    } as typeof grid;
    const context = {
      ...createContext(),
      grid: runtimeGrid,
      pack: {},
      options: {},
      seed: "runtime-seed",
      biomesData: {},
    } as unknown as EngineRuntimeContext;
    globalThis.grid = originalGrid;
    globalThis.defineMapSize = vi.fn();
    const adapter = createGlobalLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    });

    adapter.defineMapSize(context);

    expect(globalThis.defineMapSize).not.toHaveBeenCalled();
    expect(globalThis.grid).toBe(originalGrid);
  });

  it("prefers runtime graph lifecycle service over public graph helper", () => {
    const mapGraphLifecycle = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    const context = {
      ...createContext(),
      grid: { cells: {}, features: [] },
      pack: {},
      options: {},
      seed: "runtime-seed",
      biomesData: {},
      mapGraphLifecycle,
      worldSettings: {
        ...createContext().worldSettings,
        graphWidth: 100,
        graphHeight: 100,
      },
    } as unknown as EngineRuntimeContext;
    globalThis.reGraph = vi.fn();
    const adapter = createGlobalLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    });

    adapter.rebuildGraph(context);

    expect(mapGraphLifecycle.rebuildGraph).toHaveBeenCalledWith();
    expect(globalThis.reGraph).not.toHaveBeenCalled();
  });

  it("copies public map-coordinate mutations back to runtime settings", () => {
    const context = {
      ...createContext(),
      grid: { cells: {}, features: [] },
      pack: {},
      options: {},
      seed: "runtime-seed",
      biomesData: {},
      worldSettings: {
        ...createContext().worldSettings,
        graphWidth: 100,
        graphHeight: 100,
      },
    } as EngineRuntimeContext;
    const nextCoordinates = { latT: 90, latN: 45, latS: -45 };
    globalThis.calculateMapCoordinates = vi.fn(() => {
      globalThis.mapCoordinates = nextCoordinates as typeof mapCoordinates;
    });
    const adapter = createGlobalLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    });

    adapter.calculateMapCoordinates(context);

    expect(globalThis.calculateMapCoordinates).not.toHaveBeenCalled();
    expect(context.worldSettings.mapCoordinates).toEqual({
      latT: 144,
      latN: 73.8,
      latS: -70.2,
      lonT: 144,
      lonE: 61.2,
      lonW: -82.8,
    });
  });

  it("maps lifecycle context values into injected lifecycle targets", () => {
    const targets = createTargets();
    const context = createContext();
    const adapter = createLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    }, targets);

    adapter.addLakesInDeepDepressions(context);
    adapter.openNearSeaLakes(context);
    adapter.drawOceanLayers(context);
    adapter.defineMapSize(context);
    adapter.calculateMapCoordinates(context);
    adapter.rebuildGraph(context);
    adapter.createDefaultRuler(context);
    adapter.showStatistics(context);

    expect(targets.addLakesInDeepDepressions).toHaveBeenCalledWith(context, 22);
    expect(targets.openNearSeaLakes).toHaveBeenCalledWith(
      context,
      "archipelago",
    );
    expect(targets.drawOceanLayers).toHaveBeenCalledWith(context);
    expect(targets.defineMapSize).toHaveBeenCalledWith("archipelago");
    expect(targets.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
    expect(targets.rebuildGraph).toHaveBeenCalledWith();
    expect(targets.createDefaultRuler).toHaveBeenCalledWith();
    expect(targets.showStatistics).toHaveBeenCalledWith("archipelago");
  });

  it("reads lifecycle settings from runtime stores when available", () => {
    const targets = createTargets();
    const context = {
      ...createContext(),
      generationSettingsStore: {
        get: () => ({
          heightmapTemplateId: "volcano",
          lakeElevationLimit: 31,
          pointsCount: 0,
          heightExponent: 1,
          resolveDepressionsSteps: 0,
          religionsCount: 0,
          stateSizeVariety: 1,
          globalGrowthRate: 1,
          statesGrowthRate: 1,
        }),
      },
      worldSettingsStore: {
        get: () => ({
          mapSizePercent: 60,
          latitudePercent: 25,
          longitudePercent: 75,
        }),
      },
    } as unknown as EngineRuntimeContext;
    const adapter = createLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    }, targets);

    adapter.addLakesInDeepDepressions(context);
    adapter.defineMapSize(context);
    adapter.calculateMapCoordinates(context);

    expect(targets.addLakesInDeepDepressions).toHaveBeenCalledWith(context, 31);
    expect(targets.defineMapSize).toHaveBeenCalledWith("volcano");
    expect(targets.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 60,
      latitudePercent: 25,
      longitudePercent: 75,
    });
  });

  it("creates a lifecycle settings snapshot from runtime context settings", () => {
    expect(createLifecycleSettingsSnapshot(createContext())).toEqual({
      heightmapTemplateId: "archipelago",
      lakeElevationLimit: 22,
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
  });

  it("falls back to the injected current-context provider", () => {
    const calls = installLifecycleGlobals();
    const context = createContext();
    const adapter: EngineLifecycleAdapter = createGlobalLifecycleAdapter(
      () => context,
    );

    adapter.addLakesInDeepDepressions();
    adapter.openNearSeaLakes();
    adapter.calculateMapCoordinates();

    expect(calls.addLakesInDeepDepressions).not.toHaveBeenCalled();
    expect(calls.openNearSeaLakes).not.toHaveBeenCalled();
    expect(calls.calculateMapCoordinates).not.toHaveBeenCalled();
  });

  it("keeps graph and ruler helpers as no-argument public lifecycle calls", () => {
    const calls = installLifecycleGlobals();
    const mapGraphLifecycle = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    const adapter = createGlobalLifecycleAdapter(
      () =>
        ({
          ...createContext(),
          mapGraphLifecycle,
        }) as EngineRuntimeContext,
    );

    adapter.rebuildGraph();
    adapter.createDefaultRuler();

    expect(mapGraphLifecycle.rebuildGraph).toHaveBeenCalledWith();
    expect(mapGraphLifecycle.createDefaultRuler).toHaveBeenCalledWith();
    expect(calls.reGraph).not.toHaveBeenCalled();
    expect(calls.createDefaultRuler).not.toHaveBeenCalled();
  });

  it("keeps public helper calls inside the default lifecycle targets", () => {
    const calls = installLifecycleGlobals();
    const targets = createGlobalLifecycleTargets();
    const context = createContext();

    targets.addLakesInDeepDepressions(context, 22);
    targets.openNearSeaLakes(context, "archipelago");
    targets.drawOceanLayers(context);
    targets.defineMapSize("archipelago");
    targets.calculateMapCoordinates({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
    targets.createDefaultRuler();
    targets.showStatistics("archipelago");

    expect(calls.addLakesInDeepDepressions).not.toHaveBeenCalled();
    expect(calls.openNearSeaLakes).not.toHaveBeenCalled();
    expect(calls.OceanLayers).toHaveBeenCalledWith(context);
    expect(calls.defineMapSize).not.toHaveBeenCalled();
    expect(calls.calculateMapCoordinates).not.toHaveBeenCalled();
    expect(calls.reGraph).not.toHaveBeenCalled();
    expect(calls.createDefaultRuler).toHaveBeenCalledWith();
    expect(calls.showStatistics).not.toHaveBeenCalled();
  });

  it("can compose lifecycle targets from runtime services", () => {
    const generationStatistics = {
      showStatistics: vi.fn(),
    };
    const mapPlacement = {
      defineMapSize: vi.fn(),
      calculateMapCoordinates: vi.fn(),
    };
    const mapGraphLifecycle = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    const waterFeatures = {
      addLakesInDeepDepressions: vi.fn(),
      openNearSeaLakes: vi.fn(),
      drawOceanLayers: vi.fn(),
      isWetLand: vi.fn(() => true),
    };
    const targets = createLifecycleTargets({
      generationStatistics,
      mapGraphLifecycle,
      mapPlacement,
      waterFeatures,
    });

    const waterContext = createContext();

    targets.addLakesInDeepDepressions(waterContext, 25);
    targets.openNearSeaLakes(waterContext, "volcano");
    targets.drawOceanLayers(waterContext);
    targets.defineMapSize("peninsula");
    targets.calculateMapCoordinates({
      mapSizePercent: 50,
      latitudePercent: 20,
      longitudePercent: 30,
    });
    targets.rebuildGraph();
    targets.createDefaultRuler();
    targets.showStatistics("volcano");

    expect(waterFeatures.addLakesInDeepDepressions).toHaveBeenCalledWith(
      waterContext,
      25,
    );
    expect(waterFeatures.openNearSeaLakes).toHaveBeenCalledWith(
      waterContext,
      "volcano",
    );
    expect(waterFeatures.drawOceanLayers).toHaveBeenCalledWith(waterContext);
    expect(mapPlacement.defineMapSize).toHaveBeenCalledWith("peninsula");
    expect(mapPlacement.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 50,
      latitudePercent: 20,
      longitudePercent: 30,
    });
    expect(mapGraphLifecycle.rebuildGraph).toHaveBeenCalledWith();
    expect(mapGraphLifecycle.createDefaultRuler).toHaveBeenCalledWith();
    expect(generationStatistics.showStatistics).toHaveBeenCalledWith("volcano");
  });

  it("uses runtime map placement service from the context when available", () => {
    const targets = createTargets();
    const mapPlacement = {
      defineMapSize: vi.fn(),
      calculateMapCoordinates: vi.fn(),
    };
    const context = {
      ...createContext(),
      mapPlacement,
    } as unknown as EngineRuntimeContext;
    const adapter = createLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    }, targets);

    adapter.defineMapSize(context);
    adapter.calculateMapCoordinates(context);

    expect(mapPlacement.defineMapSize).toHaveBeenCalledWith("archipelago");
    expect(mapPlacement.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
    expect(targets.defineMapSize).not.toHaveBeenCalled();
    expect(targets.calculateMapCoordinates).not.toHaveBeenCalled();
  });

  it("uses runtime water feature service from the context when available", () => {
    const targets = createTargets();
    const waterFeatures = {
      addLakesInDeepDepressions: vi.fn(),
      openNearSeaLakes: vi.fn(),
      drawOceanLayers: vi.fn(),
      isWetLand: vi.fn(() => true),
    };
    const context = {
      ...createContext(),
      waterFeatures,
    } as unknown as EngineRuntimeContext;
    const adapter = createLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    }, targets);

    adapter.addLakesInDeepDepressions(context);
    adapter.openNearSeaLakes(context);
    adapter.drawOceanLayers(context);

    expect(waterFeatures.addLakesInDeepDepressions).toHaveBeenCalledWith(
      context,
      22,
    );
    expect(waterFeatures.openNearSeaLakes).toHaveBeenCalledWith(
      context,
      "archipelago",
    );
    expect(waterFeatures.drawOceanLayers).toHaveBeenCalledWith(context);
    expect(targets.addLakesInDeepDepressions).not.toHaveBeenCalled();
    expect(targets.openNearSeaLakes).not.toHaveBeenCalled();
    expect(targets.drawOceanLayers).not.toHaveBeenCalled();
  });

  it("uses runtime map graph lifecycle service from the context when available", () => {
    const targets = createTargets();
    const mapGraphLifecycle = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    const context = {
      ...createContext(),
      mapGraphLifecycle,
    } as unknown as EngineRuntimeContext;
    const adapter = createLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    }, targets);

    adapter.rebuildGraph(context);
    adapter.createDefaultRuler(context);

    expect(mapGraphLifecycle.rebuildGraph).toHaveBeenCalledWith();
    expect(mapGraphLifecycle.createDefaultRuler).toHaveBeenCalledWith();
    expect(targets.rebuildGraph).not.toHaveBeenCalled();
    expect(targets.createDefaultRuler).not.toHaveBeenCalled();
  });

  it("uses runtime generation statistics service from the context when available", () => {
    const targets = createTargets();
    const generationStatistics = {
      showStatistics: vi.fn(),
    };
    const context = {
      ...createContext(),
      generationStatistics,
    } as unknown as EngineRuntimeContext;
    const adapter = createLifecycleAdapter(() => {
      throw new Error("explicit context should be used");
    }, targets);

    adapter.showStatistics(context);

    expect(generationStatistics.showStatistics).toHaveBeenCalledWith(
      "archipelago",
    );
    expect(targets.showStatistics).not.toHaveBeenCalled();
  });
});
