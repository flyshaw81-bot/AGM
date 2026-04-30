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

    expect(calls.addLakesInDeepDepressions).toHaveBeenCalledWith(22);
    expect(calls.openNearSeaLakes).toHaveBeenCalledWith("archipelago");
    expect(calls.OceanLayers).toHaveBeenCalledWith(context);
    expect(calls.defineMapSize).toHaveBeenCalledWith("archipelago");
    expect(calls.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
    expect(calls.showStatistics).toHaveBeenCalledWith("archipelago");
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

    expect(targets.addLakesInDeepDepressions).toHaveBeenCalledWith(22);
    expect(targets.openNearSeaLakes).toHaveBeenCalledWith("archipelago");
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

    expect(targets.addLakesInDeepDepressions).toHaveBeenCalledWith(31);
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

    expect(calls.addLakesInDeepDepressions).toHaveBeenCalledWith(22);
    expect(calls.openNearSeaLakes).toHaveBeenCalledWith("archipelago");
    expect(calls.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
  });

  it("keeps graph and ruler helpers as no-argument public lifecycle calls", () => {
    const calls = installLifecycleGlobals();
    const adapter = createGlobalLifecycleAdapter(createContext);

    adapter.rebuildGraph();
    adapter.createDefaultRuler();

    expect(calls.reGraph).toHaveBeenCalledWith();
    expect(calls.createDefaultRuler).toHaveBeenCalledWith();
  });

  it("keeps public helper calls inside the default lifecycle targets", () => {
    const calls = installLifecycleGlobals();
    const targets = createGlobalLifecycleTargets();
    const context = createContext();

    targets.addLakesInDeepDepressions(22);
    targets.openNearSeaLakes("archipelago");
    targets.drawOceanLayers(context);
    targets.defineMapSize("archipelago");
    targets.calculateMapCoordinates({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
    targets.rebuildGraph();
    targets.createDefaultRuler();
    targets.showStatistics("archipelago");

    expect(calls.addLakesInDeepDepressions).toHaveBeenCalledWith(22);
    expect(calls.openNearSeaLakes).toHaveBeenCalledWith("archipelago");
    expect(calls.OceanLayers).toHaveBeenCalledWith(context);
    expect(calls.defineMapSize).toHaveBeenCalledWith("archipelago");
    expect(calls.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
    expect(calls.reGraph).toHaveBeenCalledWith();
    expect(calls.createDefaultRuler).toHaveBeenCalledWith();
    expect(calls.showStatistics).toHaveBeenCalledWith("archipelago");
  });

  it("can compose lifecycle targets from runtime services", () => {
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
    };
    const targets = createLifecycleTargets({
      mapGraphLifecycle,
      mapPlacement,
      waterFeatures,
    });

    targets.addLakesInDeepDepressions(25);
    targets.openNearSeaLakes("volcano");
    targets.drawOceanLayers(createContext());
    targets.defineMapSize("peninsula");
    targets.calculateMapCoordinates({
      mapSizePercent: 50,
      latitudePercent: 20,
      longitudePercent: 30,
    });
    targets.rebuildGraph();
    targets.createDefaultRuler();

    expect(waterFeatures.addLakesInDeepDepressions).toHaveBeenCalledWith(25);
    expect(waterFeatures.openNearSeaLakes).toHaveBeenCalledWith("volcano");
    expect(waterFeatures.drawOceanLayers).toHaveBeenCalledWith(createContext());
    expect(mapPlacement.defineMapSize).toHaveBeenCalledWith("peninsula");
    expect(mapPlacement.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 50,
      latitudePercent: 20,
      longitudePercent: 30,
    });
    expect(mapGraphLifecycle.rebuildGraph).toHaveBeenCalledWith();
    expect(mapGraphLifecycle.createDefaultRuler).toHaveBeenCalledWith();
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

    expect(waterFeatures.addLakesInDeepDepressions).toHaveBeenCalledWith(22);
    expect(waterFeatures.openNearSeaLakes).toHaveBeenCalledWith("archipelago");
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
});
