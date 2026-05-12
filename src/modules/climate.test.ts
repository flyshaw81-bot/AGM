import { afterEach, describe, expect, it, vi } from "vitest";
import { ClimateModule, type ClimateRuntimeContext } from "./climate";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalClimateDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Climate",
);
const originalCalculateTemperaturesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "calculateTemperatures",
);
const originalGeneratePrecipitationDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "generatePrecipitation",
);

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

function createPrecipitationLayer() {
  const events: string[] = [];
  const textNode = {
    attr: () => textNode,
    text: (value: string) => {
      events.push(value);
      return textNode;
    },
  };
  const group = {
    attr: () => group,
    append: () => textNode,
  };

  return {
    events,
    layer: {
      append: () => group,
      selectAll: () => ({
        remove: () => events.push("clear"),
      }),
    },
  };
}

function createClimateContext(): ClimateRuntimeContext {
  const precipitation = createPrecipitationLayer();
  const cells = {
    h: new Uint8Array([10, 10, 10, 30, 45, 30, 10, 10, 10]),
    i: Array.from({ length: 9 }, (_, index) => index),
  };

  return {
    coordinates: { latN: 45, latS: -45, latT: 90 },
    debugTemperature: false,
    graphHeight: 90,
    graphWidth: 90,
    grid: {
      cells,
      cellsX: 3,
      cellsY: 3,
      points: [
        [0, 0],
        [45, 0],
        [90, 0],
        [0, 45],
        [45, 45],
        [90, 45],
        [0, 90],
        [45, 90],
        [90, 90],
      ],
    },
    heightExponent: 1,
    options: {
      temperatureEquator: 30,
      temperatureNorthPole: -20,
      temperatureSouthPole: -10,
      winds: [90, 90, 90, 90, 90, 90],
    },
    pointsCount: 10000,
    precipitationLayer:
      precipitation.layer as unknown as ClimateRuntimeContext["precipitationLayer"],
    precipitationPercent: 100,
    shouldTime: false,
  } as ClimateRuntimeContext;
}

describe("ClimateModule", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }
    restoreGlobalDescriptor("Climate", originalClimateDescriptor);
    restoreGlobalDescriptor(
      "calculateTemperatures",
      originalCalculateTemperaturesDescriptor,
    );
    restoreGlobalDescriptor(
      "generatePrecipitation",
      originalGeneratePrecipitationDescriptor,
    );
  });

  it("can be imported when window access throws", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./climate")).resolves.toBeDefined();
  });

  it("calculates temperatures from an explicit runtime context", () => {
    const context = createClimateContext();

    new ClimateModule().calculateTemperatures(context);

    expect(context.grid.cells.temp).toBeInstanceOf(Int8Array);
    expect(context.grid.cells.temp).toHaveLength(9);
    expect(context.grid.cells.temp[3]).toBeGreaterThan(
      context.grid.cells.temp[0],
    );
    expect(context.grid.cells.temp[3]).toBeGreaterThan(
      context.grid.cells.temp[6],
    );
  });

  it("generates precipitation from an explicit runtime context", () => {
    const context = createClimateContext();
    const climate = new ClimateModule();

    climate.calculateTemperatures(context);
    climate.generatePrecipitation(context);

    expect(context.grid.cells.prec).toBeInstanceOf(Uint8Array);
    expect(context.grid.cells.prec).toHaveLength(9);
    const precipitationValues = Array.from(
      context.grid.cells.prec as Uint8Array,
    );
    expect(precipitationValues.some((value) => value > 0)).toBe(true);
  });

  it("mounts legacy climate compatibility entrypoints from the module", async () => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
    });
    restoreGlobalDescriptor("Climate", undefined);
    restoreGlobalDescriptor("calculateTemperatures", undefined);
    restoreGlobalDescriptor("generatePrecipitation", undefined);

    await import("./climate");
    const temperaturesSpy = vi
      .spyOn(globalThis.Climate, "calculateTemperatures")
      .mockReturnValue(undefined);
    const precipitationSpy = vi
      .spyOn(globalThis.Climate, "generatePrecipitation")
      .mockReturnValue(undefined);

    globalThis.calculateTemperatures();
    globalThis.generatePrecipitation();

    expect(temperaturesSpy).toHaveBeenCalledOnce();
    expect(precipitationSpy).toHaveBeenCalledOnce();
  });
});
