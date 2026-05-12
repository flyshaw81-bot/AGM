import { afterEach, describe, expect, it } from "vitest";
import {
  createClimateContext,
  createGlobalClimateContext,
  createGlobalClimateContextTargets,
  createGlobalClimateInputTargets,
} from "./engine-climate-context";

const originalGrid = globalThis.grid;
const originalMapCoordinates = globalThis.mapCoordinates;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalOptions = globalThis.options;
const originalHeightExponent = globalThis.heightExponent;
const originalPointsInput = globalThis.pointsInput;
const originalPrecipitationPercent = globalThis.precipitationPercent;
const originalHeightExponentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "heightExponent",
);
const originalPointsInputDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pointsInput",
);
const originalPrecipitationPercentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "precipitationPercent",
);
const originalPrec = globalThis.prec;
const originalDebug = globalThis.DEBUG;
const originalTime = globalThis.TIME;

describe("createGlobalClimateContext", () => {
  afterEach(() => {
    globalThis.grid = originalGrid;
    globalThis.mapCoordinates = originalMapCoordinates;
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.options = originalOptions;
    if (originalHeightExponentDescriptor) {
      Object.defineProperty(
        globalThis,
        "heightExponent",
        originalHeightExponentDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "heightExponent", {
        configurable: true,
        value: originalHeightExponent,
        writable: true,
      });
    }
    if (originalPointsInputDescriptor) {
      Object.defineProperty(
        globalThis,
        "pointsInput",
        originalPointsInputDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "pointsInput", {
        configurable: true,
        value: originalPointsInput,
        writable: true,
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
        value: originalPrecipitationPercent,
        writable: true,
      });
    }
    globalThis.prec = originalPrec;
    globalThis.DEBUG = originalDebug;
    globalThis.TIME = originalTime;
  });

  it("builds a climate runtime context from current globals", () => {
    globalThis.grid = { cells: { i: [0] } } as typeof grid;
    globalThis.mapCoordinates = { latT: 120, latN: 80, latS: -40 };
    globalThis.graphWidth = 480;
    globalThis.graphHeight = 320;
    globalThis.options = { temperatureEquator: 28 } as typeof options;
    globalThis.heightExponent = 1.4;
    globalThis.pointsInput = {
      dataset: { cells: "9000" },
    } as unknown as HTMLInputElement;
    globalThis.precipitationPercent = 75;
    globalThis.prec = { selectAll: () => ({ remove: () => {} }) } as any;
    globalThis.DEBUG = { temperature: true };
    globalThis.TIME = true;

    expect(createGlobalClimateContext()).toMatchObject({
      grid: globalThis.grid,
      coordinates: { latT: 120, latN: 80, latS: -40 },
      graphWidth: 480,
      graphHeight: 320,
      options: { temperatureEquator: 28 },
      heightExponent: 1.4,
      pointsCount: 9000,
      precipitationPercent: 75,
      precipitationLayer: globalThis.prec,
      debugTemperature: true,
      shouldTime: true,
    });
  });

  it("uses generation-safe defaults for optional climate input controls", () => {
    globalThis.grid = { cells: {} } as typeof grid;
    globalThis.mapCoordinates = { latT: 0, latN: 0, latS: 0 };
    globalThis.graphWidth = 0;
    globalThis.graphHeight = 0;
    globalThis.options = {} as typeof options;
    globalThis.heightExponent = undefined as unknown as number;
    globalThis.pointsInput = undefined as unknown as HTMLInputElement;
    globalThis.precipitationPercent = undefined as unknown as number;
    globalThis.prec = {} as typeof prec;
    globalThis.DEBUG = {};
    globalThis.TIME = false;

    expect(createGlobalClimateContext()).toMatchObject({
      heightExponent: 1,
      pointsCount: 0,
      precipitationPercent: 100,
      debugTemperature: false,
      shouldTime: false,
    });
  });

  it("keeps global climate input targets safe when control access throws", () => {
    Object.defineProperty(globalThis, "heightExponent", {
      configurable: true,
      get: () => {
        throw new Error("height exponent blocked");
      },
    });
    Object.defineProperty(globalThis, "pointsInput", {
      configurable: true,
      get: () => {
        throw new Error("points blocked");
      },
    });
    Object.defineProperty(globalThis, "precipitationPercent", {
      configurable: true,
      get: () => {
        throw new Error("precipitation blocked");
      },
    });

    const targets = createGlobalClimateInputTargets();

    expect(targets.getHeightExponent()).toBe(1);
    expect(targets.getPointsInput()).toBeUndefined();
    expect(targets.getPrecipitationPercent()).toBe(100);
  });

  it("routes climate input reads through injected input targets", () => {
    globalThis.grid = { cells: { i: [0] } } as typeof grid;
    globalThis.mapCoordinates = { latT: 120, latN: 80, latS: -40 };
    globalThis.graphWidth = 480;
    globalThis.graphHeight = 320;
    globalThis.options = { temperatureEquator: 28 } as typeof options;
    globalThis.prec = { selectAll: () => ({ remove: () => {} }) } as any;
    globalThis.DEBUG = {};
    globalThis.TIME = false;

    const context = createClimateContext(
      createGlobalClimateContextTargets({
        getHeightExponent: () => 2.1,
        getPointsInput: () =>
          ({ dataset: { cells: "16000" } }) as unknown as HTMLInputElement,
        getPrecipitationPercent: () => 65,
      }),
    );

    expect(context.heightExponent).toBe(2.1);
    expect(context.pointsCount).toBe(16000);
    expect(context.precipitationPercent).toBe(65);
  });

  it("builds a climate runtime context from injected targets", () => {
    const injectedGrid = { cells: { i: [1] } } as typeof grid;
    const injectedOptions = { temperatureEquator: 21 } as typeof options;
    const precipitationLayer = { selectAll: () => ({ remove: () => {} }) };

    expect(
      createClimateContext({
        getGrid: () => injectedGrid,
        getCoordinates: () => ({ latN: 70, latS: -50, latT: 120 }),
        getGraphWidth: () => 640,
        getGraphHeight: () => 420,
        getOptions: () => injectedOptions,
        getHeightExponent: () => 1.6,
        getPointsCount: () => 5000,
        getPrecipitationPercent: () => 80,
        getPrecipitationLayer: () =>
          precipitationLayer as unknown as typeof prec,
        getDebugTemperature: () => true,
        getShouldTime: () => false,
      }),
    ).toMatchObject({
      grid: injectedGrid,
      coordinates: { latN: 70, latS: -50, latT: 120 },
      graphWidth: 640,
      graphHeight: 420,
      options: injectedOptions,
      heightExponent: 1.6,
      pointsCount: 5000,
      precipitationPercent: 80,
      precipitationLayer,
      debugTemperature: true,
      shouldTime: false,
    });
  });
});
