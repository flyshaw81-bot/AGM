import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalMapPlacementService,
  createGlobalMapPlacementTargets,
  createMapPlacementService,
} from "./engine-map-placement-service";

const originalDefineMapSize = globalThis.defineMapSize;
const originalCalculateMapCoordinates = globalThis.calculateMapCoordinates;

describe("EngineMapPlacementService", () => {
  afterEach(() => {
    globalThis.defineMapSize = originalDefineMapSize;
    globalThis.calculateMapCoordinates = originalCalculateMapCoordinates;
  });

  it("routes map placement through injected targets", () => {
    const targets = {
      defineMapSize: vi.fn(),
      calculateMapCoordinates: vi.fn(),
    };
    const service = createMapPlacementService(targets);

    service.defineMapSize("archipelago");
    service.calculateMapCoordinates({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });

    expect(targets.defineMapSize).toHaveBeenCalledWith("archipelago");
    expect(targets.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });
  });

  it("keeps public placement helpers behind global targets", () => {
    globalThis.defineMapSize = vi.fn();
    globalThis.calculateMapCoordinates = vi.fn();
    const targets = createGlobalMapPlacementTargets();

    targets.defineMapSize("volcano");
    targets.calculateMapCoordinates({
      mapSizePercent: 60,
      latitudePercent: 20,
      longitudePercent: 70,
    });

    expect(globalThis.defineMapSize).toHaveBeenCalledWith("volcano");
    expect(globalThis.calculateMapCoordinates).toHaveBeenCalledWith({
      mapSizePercent: 60,
      latitudePercent: 20,
      longitudePercent: 70,
    });
  });

  it("creates a global map placement service from explicit targets", () => {
    const targets = {
      defineMapSize: vi.fn(),
      calculateMapCoordinates: vi.fn(),
    };

    createGlobalMapPlacementService(targets).defineMapSize("islands");

    expect(targets.defineMapSize).toHaveBeenCalledWith("islands");
  });
});
