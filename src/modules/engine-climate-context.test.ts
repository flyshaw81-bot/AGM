import { afterEach, describe, expect, it } from "vitest";
import {
  createClimateContext,
  createGlobalClimateContext,
} from "./engine-climate-context";

const originalGrid = globalThis.grid;
const originalMapCoordinates = globalThis.mapCoordinates;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalOptions = globalThis.options;
const originalHeightExponentInput = globalThis.heightExponentInput;
const originalPointsInput = globalThis.pointsInput;
const originalPrecInput = globalThis.precInput;
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
    globalThis.heightExponentInput = originalHeightExponentInput;
    globalThis.pointsInput = originalPointsInput;
    globalThis.precInput = originalPrecInput;
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
    globalThis.heightExponentInput = { value: "1.4" } as HTMLInputElement;
    globalThis.pointsInput = {
      dataset: { cells: "9000" },
    } as unknown as HTMLInputElement;
    globalThis.precInput = { value: "75" } as HTMLInputElement;
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
    globalThis.heightExponentInput = undefined as unknown as HTMLInputElement;
    globalThis.pointsInput = undefined as unknown as HTMLInputElement;
    globalThis.precInput = undefined as unknown as HTMLInputElement;
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
        getPrecipitationLayer: () => precipitationLayer as typeof prec,
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
