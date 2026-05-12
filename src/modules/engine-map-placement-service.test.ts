import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateEngineMapCoordinates,
  createGlobalMapPlacementService,
  createGlobalMapPlacementTargets,
  createMapPlacementService,
  defineEngineMapSize,
  type EngineMapSizeRuntimeTargets,
  resolveEngineMapPlacementValues,
} from "./engine-map-placement-service";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalDefineMapSize = globalThis.defineMapSize;
const originalCalculateMapCoordinates = globalThis.calculateMapCoordinates;
const originalEngineMapPlacementDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "EngineMapPlacement",
);
const originalMapCoordinatesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "mapCoordinates",
);
const originalDefineMapSizeDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "defineMapSize",
);
const originalCalculateMapCoordinatesDescriptor =
  Object.getOwnPropertyDescriptor(globalThis, "calculateMapCoordinates");

function restoreGlobalDescriptor(
  name: string,
  descriptor?: PropertyDescriptor,
) {
  if (descriptor) {
    Object.defineProperty(globalThis, name, descriptor);
    return;
  }

  delete (globalThis as Record<string, unknown>)[name];
}

describe("EngineMapPlacementService", () => {
  afterEach(() => {
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }
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
    restoreGlobalDescriptor(
      "EngineMapPlacement",
      originalEngineMapPlacementDescriptor,
    );
    restoreGlobalDescriptor("mapCoordinates", originalMapCoordinatesDescriptor);
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

  it("keeps global placement targets behind module implementations", () => {
    const originalGraphWidth = globalThis.graphWidth;
    const originalGraphHeight = globalThis.graphHeight;
    const originalMapCoordinates = globalThis.mapCoordinates;
    globalThis.graphWidth = 1440;
    globalThis.graphHeight = 900;
    const targets = createGlobalMapPlacementTargets();

    targets.defineMapSize("africa-centric");
    targets.calculateMapCoordinates({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });

    expect(globalThis.mapCoordinates).toEqual({
      latT: 144,
      latN: 73.8,
      latS: -70.2,
      lonT: 230.4,
      lonE: 108.7,
      lonW: -121.7,
    });
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.mapCoordinates = originalMapCoordinates;
  });

  it("keeps global placement targets safe when public helpers are absent", () => {
    globalThis.defineMapSize =
      undefined as unknown as typeof globalThis.defineMapSize;
    globalThis.calculateMapCoordinates =
      undefined as unknown as typeof globalThis.calculateMapCoordinates;
    globalThis.graphWidth = 100;
    globalThis.graphHeight = 100;
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
    globalThis.graphWidth = 100;
    globalThis.graphHeight = 100;
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

  it("resolves fixed map placement templates without runtime globals", () => {
    const values = resolveEngineMapPlacementValues("world-from-pacific", {
      hasBorderLand: () => false,
      probability: vi.fn(),
      gaussian: vi.fn(),
    });

    expect(values).toEqual({ size: 75, latitude: 32, longitude: 30 });
  });

  it("resolves generated map placement values with injected randomness", () => {
    const gaussian = vi.fn().mockReturnValueOnce(64).mockReturnValueOnce(42);

    const values = resolveEngineMapPlacementValues("pangea", {
      hasBorderLand: () => true,
      probability: () => true,
      gaussian,
    });

    expect(values).toEqual({ size: 64, latitude: 42, longitude: 50 });
    expect(gaussian).toHaveBeenNthCalledWith(1, 70, 20, 30, 80);
    expect(gaussian).toHaveBeenNthCalledWith(2, 40, 20, 25, 75);
  });

  it("defines map size through targeted input writes", () => {
    const writes: Array<[string, number]> = [];
    const targets: EngineMapSizeRuntimeTargets = {
      getHeightmapTemplateId: () => "world",
      hasBorderLand: () => false,
      isDefaultOptionsRequested: () => false,
      isLocked: (settingId) => settingId === "latitude",
      probability: vi.fn(),
      gaussian: vi.fn(),
      setMapPlacementValue: (key, value) => {
        writes.push([key, value]);
      },
    };

    const values = defineEngineMapSize(undefined, targets);

    expect(values).toEqual({ size: 78, latitude: 27, longitude: 40 });
    expect(writes).toEqual([
      ["mapSize", 78],
      ["longitude", 40],
    ]);
  });

  it("ignores locked map placement inputs when URL options request defaults", () => {
    const writes: Array<[string, number]> = [];
    const targets: EngineMapSizeRuntimeTargets = {
      getHeightmapTemplateId: () => "world",
      hasBorderLand: () => false,
      isDefaultOptionsRequested: () => true,
      isLocked: () => true,
      probability: vi.fn(),
      gaussian: vi.fn(),
      setMapPlacementValue: (key, value) => {
        writes.push([key, value]);
      },
    };

    defineEngineMapSize(undefined, targets);

    expect(writes).toEqual([
      ["mapSize", 78],
      ["latitude", 27],
      ["longitude", 40],
    ]);
  });

  it("calculates map coordinates through the module runtime targets", () => {
    const setMapCoordinates = vi.fn();

    const coordinates = calculateEngineMapCoordinates(
      {
        mapSizePercent: 80,
        latitudePercent: 45,
        longitudePercent: 55,
      },
      {
        getGraphSize: () => ({ width: 1440, height: 900 }),
        getMapSizePercent: vi.fn(),
        getLatitudePercent: vi.fn(),
        getLongitudePercent: vi.fn(),
        round: (value, decimals) => {
          const factor = 10 ** decimals;
          return Math.round(value * factor) / factor;
        },
        setMapCoordinates,
      },
    );

    expect(coordinates).toEqual({
      latT: 144,
      latN: 73.8,
      latS: -70.2,
      lonT: 230.4,
      lonE: 108.7,
      lonW: -121.7,
    });
    expect(setMapCoordinates).toHaveBeenCalledWith(coordinates);
  });

  it("falls back to map placement inputs when coordinate settings are omitted", () => {
    const coordinates = calculateEngineMapCoordinates(
      {},
      {
        getGraphSize: () => ({ width: 1200, height: 600 }),
        getMapSizePercent: () => 50,
        getLatitudePercent: () => 25,
        getLongitudePercent: () => 75,
        round: (value, decimals) => {
          const factor = 10 ** decimals;
          return Math.round(value * factor) / factor;
        },
        setMapCoordinates: vi.fn(),
      },
    );

    expect(coordinates).toEqual({
      latT: 90,
      latN: 67.5,
      latS: -22.5,
      lonT: 180,
      lonE: 45,
      lonW: -135,
    });
  });

  it("mounts legacy map placement compatibility entrypoints from the module", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
    });
    globalThis.graphWidth = 1440;
    globalThis.graphHeight = 900;
    restoreGlobalDescriptor("EngineMapPlacement", undefined);
    restoreGlobalDescriptor("defineMapSize", undefined);
    restoreGlobalDescriptor("calculateMapCoordinates", undefined);
    restoreGlobalDescriptor("mapCoordinates", undefined);

    await import("./engine-map-placement-service");

    globalThis.defineMapSize("africa-centric");
    globalThis.calculateMapCoordinates({
      mapSizePercent: 80,
      latitudePercent: 45,
      longitudePercent: 55,
    });

    expect(globalThis.mapCoordinates).toEqual({
      latT: 144,
      latN: 73.8,
      latS: -70.2,
      lonT: 230.4,
      lonE: 108.7,
      lonW: -121.7,
    });
    expect(globalThis.EngineMapPlacement).toBeDefined();
  });
});
