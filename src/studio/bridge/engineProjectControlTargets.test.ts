import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalProjectControlTargets,
  createProjectControlTargets,
} from "./engineProjectControlTargets";

type TestControlGlobals = typeof globalThis & {
  convertTemperature?: (value: number, unit: string) => unknown;
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
const originalConvertTemperature = testGlobals.convertTemperature;
const originalMapCoordinates = testGlobals.mapCoordinates;
const originalD3 = (globalThis as any).d3;

describe("createGlobalProjectControlTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.options = originalOptions;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    testGlobals.convertTemperature = originalConvertTemperature;
    testGlobals.mapCoordinates = originalMapCoordinates;
    (globalThis as any).d3 = originalD3;
  });

  it("forwards temperature label, option writes, and temperature conversion", () => {
    const label = { textContent: "" };
    globalThis.document = {
      getElementById: vi.fn(() => label),
    } as unknown as Document;
    globalThis.options = {};
    testGlobals.convertTemperature = vi.fn(() => "50°F");

    const targets = createGlobalProjectControlTargets();

    expect(targets.getTemperatureLabel("temperatureEquatorF")).toBe(label);
    targets.setOptionNumber("temperatureEquator", 10);
    expect(globalThis.options.temperatureEquator).toBe(10);
    expect(targets.convertTemperature(10, "°F")).toBe("50°F");
  });

  it("reads and updates wind path transforms", () => {
    const path = {
      getAttribute: vi.fn(() => "rotate(45 210 30)"),
      setAttribute: vi.fn(),
    };
    globalThis.document = {
      querySelector: vi.fn(() => path),
    } as unknown as Document;

    const targets = createGlobalProjectControlTargets();

    expect(targets.getWindTransform(1)).toBe("rotate(45 210 30)");
    targets.setWindTransform(1, "rotate(90 210 30)");
    expect(path.setAttribute).toHaveBeenCalledWith(
      "transform",
      "rotate(90 210 30)",
    );
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
    (globalThis as any).d3 = {
      range: vi.fn(() => [90, 60, 30, 0, -30, -60]),
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

  it("composes project control targets from injected DOM, runtime, and storage adapters", () => {
    const label = { textContent: "" } as HTMLElement;
    const setOptionNumber = vi.fn();
    const setWindTransform = vi.fn();
    const setWindOptions = vi.fn();
    const targets = createProjectControlTargets(
      {
        getTemperatureLabel: () => label,
        getWindTransform: () => "rotate(45 210 30)",
        setWindTransform,
      },
      {
        setOptionNumber,
        convertTemperature: () => "68\u00b0F",
        setWindTierValue: () => [0, 90, 0],
        isWindTierInCurrentMap: () => true,
      },
      {
        setWindOptions,
      },
    );

    expect(targets.getTemperatureLabel("temperatureEquatorF")).toBe(label);
    targets.setOptionNumber("temperatureEquator", 20);
    expect(setOptionNumber).toHaveBeenCalledWith("temperatureEquator", 20);
    expect(targets.convertTemperature(20, "\u00b0F")).toBe("68\u00b0F");
    expect(targets.getWindTransform(1)).toBe("rotate(45 210 30)");
    targets.setWindTransform(1, "rotate(90 210 30)");
    expect(setWindTransform).toHaveBeenCalledWith(1, "rotate(90 210 30)");
    expect(targets.applyWindTierToRuntime(1, 90)).toBe(true);
    expect(setWindOptions).toHaveBeenCalledWith([0, 90, 0]);
  });
});
