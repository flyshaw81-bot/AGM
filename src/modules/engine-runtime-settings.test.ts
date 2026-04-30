import { afterEach, describe, expect, it } from "vitest";
import {
  createGlobalPopulationSettings,
  createGlobalTimingSettings,
  createGlobalUnitSettings,
  createGlobalWorldSettings,
} from "./engine-runtime-settings";

const originalDocument = globalThis.document;
const originalMapCoordinates = globalThis.mapCoordinates;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalPopulationRate = globalThis.populationRate;
const originalUrbanDensity = globalThis.urbanDensity;
const originalUrbanization = globalThis.urbanization;
const originalHeightUnit = globalThis.heightUnit;
const originalTime = globalThis.TIME;

function installDocument(
  controls: Record<string, Partial<HTMLInputElement>>,
): void {
  globalThis.document = {
    getElementById: (id: string) => controls[id] ?? null,
  } as unknown as Document;
}

describe("runtime setting adapters", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.mapCoordinates = originalMapCoordinates;
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.populationRate = originalPopulationRate;
    globalThis.urbanDensity = originalUrbanDensity;
    globalThis.urbanization = originalUrbanization;
    globalThis.heightUnit = originalHeightUnit;
    globalThis.TIME = originalTime;
  });

  it("reads world settings from current map globals and DOM controls", () => {
    installDocument({
      mapSizeOutput: { value: "72" },
      latitudeOutput: { value: "41" },
      longitudeOutput: { value: "63" },
    });
    globalThis.mapCoordinates = { latN: 10 } as typeof mapCoordinates;
    globalThis.graphWidth = 200;
    globalThis.graphHeight = 120;

    expect(createGlobalWorldSettings()).toEqual({
      mapCoordinates: { latN: 10 },
      graphWidth: 200,
      graphHeight: 120,
      mapSizePercent: 72,
      latitudePercent: 41,
      longitudePercent: 63,
    });
  });

  it("reads population, unit, and timing settings from runtime globals", () => {
    installDocument({});
    globalThis.populationRate = 2;
    globalThis.urbanDensity = 3;
    globalThis.urbanization = 4;
    globalThis.heightUnit = { value: "ft" } as HTMLSelectElement;
    globalThis.TIME = true;

    expect(createGlobalPopulationSettings()).toEqual({
      populationRate: 2,
      urbanDensity: 3,
      urbanization: 4,
    });
    expect(createGlobalUnitSettings()).toEqual({ height: "ft" });
    expect(createGlobalTimingSettings()).toEqual({ shouldTime: true });
  });
});
