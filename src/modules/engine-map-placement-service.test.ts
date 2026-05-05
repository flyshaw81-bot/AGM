import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalMapPlacementService,
  createGlobalMapPlacementTargets,
  createMapPlacementService,
} from "./engine-map-placement-service";

const originalDefineMapSize = globalThis.defineMapSize;
const originalCalculateMapCoordinates = globalThis.calculateMapCoordinates;
const originalDefineMapSizeDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "defineMapSize",
);
const originalCalculateMapCoordinatesDescriptor =
  Object.getOwnPropertyDescriptor(globalThis, "calculateMapCoordinates");

describe("EngineMapPlacementService", () => {
  afterEach(() => {
    if (originalDefineMapSizeDescriptor) {
      Object.defineProperty(
        globalThis,
        "defineMapSize",
        originalDefineMapSizeDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "defineMapSize", {
        configurable: true,
        value: originalDefineMapSize,
        writable: true,
      });
    }
    if (originalCalculateMapCoordinatesDescriptor) {
      Object.defineProperty(
        globalThis,
        "calculateMapCoordinates",
        originalCalculateMapCoordinatesDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "calculateMapCoordinates", {
        configurable: true,
        value: originalCalculateMapCoordinates,
        writable: true,
      });
    }
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

  it("keeps global placement targets safe when public helpers are absent", () => {
    globalThis.defineMapSize =
      undefined as unknown as typeof globalThis.defineMapSize;
    globalThis.calculateMapCoordinates =
      undefined as unknown as typeof globalThis.calculateMapCoordinates;
    const targets = createGlobalMapPlacementTargets();

    expect(() => targets.defineMapSize("volcano")).not.toThrow();
    expect(() =>
      targets.calculateMapCoordinates({
        mapSizePercent: 60,
        latitudePercent: 20,
        longitudePercent: 70,
      }),
    ).not.toThrow();
  });

  it("keeps global placement targets safe when helper access throws", () => {
    Object.defineProperty(globalThis, "defineMapSize", {
      configurable: true,
      get: () => {
        throw new Error("defineMapSize blocked");
      },
    });
    Object.defineProperty(globalThis, "calculateMapCoordinates", {
      configurable: true,
      get: () => {
        throw new Error("calculateMapCoordinates blocked");
      },
    });
    const targets = createGlobalMapPlacementTargets();

    expect(() => targets.defineMapSize("volcano")).not.toThrow();
    expect(() =>
      targets.calculateMapCoordinates({
        mapSizePercent: 60,
        latitudePercent: 20,
        longitudePercent: 70,
      }),
    ).not.toThrow();
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
