import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalLifecycleAdapter,
  createGlobalLifecycleTargets,
  createLifecycleAdapter,
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
    adapter.rebuildGraph();
    adapter.createDefaultRuler();
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
});
