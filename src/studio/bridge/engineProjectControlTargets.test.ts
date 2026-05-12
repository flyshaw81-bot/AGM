import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalProjectControlTargets,
  createProjectControlTargets,
} from "./engineProjectControlTargets";

type TestControlGlobals = typeof globalThis & {
  precipitationPercent?: number;
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
  mapCoordinates?: {
    latN?: number;
    latS?: number;
  };
  d3?: {
    range?: (start: number, stop: number, step: number) => number[];
  };
};

const testGlobals = globalThis as TestControlGlobals;
const originalDocument = globalThis.document;
const originalOptions = globalThis.options;
const originalLocalStorage = globalThis.localStorage;
const originalPrecipitationPercent = testGlobals.precipitationPercent;
const originalMapSizePercent = testGlobals.mapSizePercent;
const originalLatitudePercent = testGlobals.latitudePercent;
const originalLongitudePercent = testGlobals.longitudePercent;
const originalMapCoordinates = testGlobals.mapCoordinates;
const originalD3 = (globalThis as any).d3;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalOptionsDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "options",
);
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalMapCoordinatesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "mapCoordinates",
);
const originalD3Descriptor = Object.getOwnPropertyDescriptor(globalThis, "d3");
const originalPrecipitationPercentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "precipitationPercent",
);
const originalMapSizePercentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "mapSizePercent",
);
const originalLatitudePercentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "latitudePercent",
);
const originalLongitudePercentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "longitudePercent",
);

describe("createGlobalProjectControlTargets", () => {
  afterEach(() => {
    if (originalDocumentDescriptor) {
      Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: originalDocument,
      });
    }
    if (originalOptionsDescriptor) {
      Object.defineProperty(globalThis, "options", originalOptionsDescriptor);
    } else {
      Object.defineProperty(globalThis, "options", {
        configurable: true,
        writable: true,
        value: originalOptions,
      });
    }
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    if (originalMapCoordinatesDescriptor) {
      Object.defineProperty(
        globalThis,
        "mapCoordinates",
        originalMapCoordinatesDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "mapCoordinates", {
        configurable: true,
        writable: true,
        value: originalMapCoordinates,
      });
    }
    if (originalD3Descriptor) {
      Object.defineProperty(globalThis, "d3", originalD3Descriptor);
    } else {
      Object.defineProperty(globalThis, "d3", {
        configurable: true,
        writable: true,
        value: originalD3,
      });
    }
    if (originalPrecipitationPercentDescriptor) {
      Object.defineProperty(
        globalThis,
        "precipitationPercent",
        originalPrecipitationPercentDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "precipitationPercent", {
        configurable: true,
        writable: true,
        value: originalPrecipitationPercent,
      });
    }
    if (originalMapSizePercentDescriptor) {
      Object.defineProperty(
        globalThis,
        "mapSizePercent",
        originalMapSizePercentDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "mapSizePercent", {
        configurable: true,
        writable: true,
        value: originalMapSizePercent,
      });
    }
    if (originalLatitudePercentDescriptor) {
      Object.defineProperty(
        globalThis,
        "latitudePercent",
        originalLatitudePercentDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "latitudePercent", {
        configurable: true,
        writable: true,
        value: originalLatitudePercent,
      });
    }
    if (originalLongitudePercentDescriptor) {
      Object.defineProperty(
        globalThis,
        "longitudePercent",
        originalLongitudePercentDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "longitudePercent", {
        configurable: true,
        writable: true,
        value: originalLongitudePercent,
      });
    }
  });

  it("forwards option writes to the runtime", () => {
    globalThis.options = {};

    const targets = createGlobalProjectControlTargets();

    targets.setOptionNumber("temperatureEquator", 10);
    expect(globalThis.options.temperatureEquator).toBe(10);
  });

  it("writes precipitation to the runtime", () => {
    const targets = createGlobalProjectControlTargets();

    targets.setPrecipitationPercent(120);

    expect(testGlobals.precipitationPercent).toBe(120);
  });

  it("writes map placement percentages to the runtime", () => {
    const targets = createGlobalProjectControlTargets();

    targets.setMapPlacementPercent("mapSize", 78);
    targets.setMapPlacementPercent("latitude", 27);
    targets.setMapPlacementPercent("longitude", 40);

    expect(testGlobals.mapSizePercent).toBe(78);
    expect(testGlobals.latitudePercent).toBe(27);
    expect(testGlobals.longitudePercent).toBe(40);
  });

  it("persists wind options and reports whether the tier affects the current map", () => {
    const setItem = vi.fn();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { setItem },
    });
    globalThis.options = {
      winds: [0, 0, 0, 0, 0, 0],
    };
    testGlobals.mapCoordinates = {
      latN: 90,
      latS: -90,
    };

    const targets = createGlobalProjectControlTargets();

    expect(targets.applyWindTierToRuntime(2, 135)).toBe(true);
    expect(globalThis.options.winds[2]).toBe(135);
    expect(setItem).toHaveBeenCalledWith("winds", "0,0,135,0,0,0");
  });

  it("keeps wind persistence safe when browser storage access throws", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("localStorage blocked");
      },
    });
    globalThis.options = {
      winds: [0, 0, 0],
    };

    const targets = createGlobalProjectControlTargets();

    expect(targets.applyWindTierToRuntime(1, 90)).toBe(false);
    expect(globalThis.options.winds[1]).toBe(90);
  });

  it("keeps project control globals safe when browser/runtime access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "options", {
      configurable: true,
      get: () => {
        throw new Error("options blocked");
      },
    });
    Object.defineProperty(globalThis, "mapCoordinates", {
      configurable: true,
      get: () => {
        throw new Error("map coordinates blocked");
      },
    });
    Object.defineProperty(globalThis, "d3", {
      configurable: true,
      get: () => {
        throw new Error("d3 blocked");
      },
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        setItem: () => {
          throw new Error("storage write blocked");
        },
      },
    });

    const targets = createGlobalProjectControlTargets();

    expect(() =>
      targets.setOptionNumber("temperatureEquator", 10),
    ).not.toThrow();
    expect(targets.applyWindTierToRuntime(1, 90)).toBe(false);
    expect(() => targets.setPrecipitationPercent(120)).not.toThrow();
    expect(() => targets.setMapPlacementPercent("mapSize", 80)).not.toThrow();
  });

  it("composes project control targets from injected DOM, runtime, and storage adapters", () => {
    const setOptionNumber = vi.fn();
    const setWindOptions = vi.fn();
    const targets = createProjectControlTargets(
      {},
      {
        setOptionNumber,
        setWindTierValue: () => [0, 90, 0],
        isWindTierInCurrentMap: () => true,
        setPrecipitationPercent: vi.fn(),
        setMapPlacementPercent: vi.fn(),
      },
      {
        setWindOptions,
      },
    );

    targets.setOptionNumber("temperatureEquator", 20);
    expect(setOptionNumber).toHaveBeenCalledWith("temperatureEquator", 20);
    expect(targets.applyWindTierToRuntime(1, 90)).toBe(true);
    expect(setWindOptions).toHaveBeenCalledWith([0, 90, 0]);
  });
});
