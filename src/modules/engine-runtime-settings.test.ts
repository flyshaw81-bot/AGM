import { afterEach, describe, expect, it } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createGlobalPopulationSettings,
  createGlobalTimingSettings,
  createGlobalUnitSettings,
  createGlobalWorldSettings,
  createGlobalWorldSettingsTargets,
  createPopulationSettings,
  createRuntimeWorldSettingsStore,
  createSettingsInputNumberReader,
  createTimingSettings,
  createUnitSettings,
  createWorldSettings,
  createWorldSettingsStore,
  type EngineSettingsDomTargets,
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

  it("creates runtime settings from injected targets", () => {
    expect(
      createWorldSettings({
        getMapCoordinates: () => ({ latN: 50 }) as typeof mapCoordinates,
        getGraphWidth: () => 1024,
        getGraphHeight: () => 768,
        getMapSizePercent: () => 70,
        getLatitudePercent: () => 35,
        getLongitudePercent: () => 55,
      }),
    ).toEqual({
      mapCoordinates: { latN: 50 },
      graphWidth: 1024,
      graphHeight: 768,
      mapSizePercent: 70,
      latitudePercent: 35,
      longitudePercent: 55,
    });

    expect(
      createPopulationSettings({
        getPopulationRate: () => 5,
        getUrbanDensity: () => 6,
        getUrbanization: () => 7,
      }),
    ).toEqual({
      populationRate: 5,
      urbanDensity: 6,
      urbanization: 7,
    });
    expect(createUnitSettings({ getHeightUnit: () => "m" })).toEqual({
      height: "m",
    });
    expect(createTimingSettings({ getShouldTime: () => false })).toEqual({
      shouldTime: false,
    });
  });

  it("reads world setting inputs through injected DOM targets", () => {
    const domTargets: EngineSettingsDomTargets = {
      getInput: (id) =>
        (({
          mapSizeOutput: { value: "81" },
          latitudeOutput: { value: "42" },
        })[id] as HTMLInputElement | undefined) ?? null,
    };

    expect(
      createSettingsInputNumberReader(domTargets)("mapSizeOutput", 0),
    ).toBe(81);
    expect(
      createSettingsInputNumberReader(domTargets)("longitudeOutput", 12),
    ).toBe(12);

    globalThis.mapCoordinates = { latN: 15 } as typeof mapCoordinates;
    globalThis.graphWidth = 320;
    globalThis.graphHeight = 180;

    expect(
      createWorldSettings(createGlobalWorldSettingsTargets(domTargets)),
    ).toEqual({
      mapCoordinates: { latN: 15 },
      graphWidth: 320,
      graphHeight: 180,
      mapSizePercent: 81,
      latitudePercent: 42,
      longitudePercent: 0,
    });
  });

  it("stores, patches, and refreshes world settings through a runtime store", () => {
    const context = {
      worldSettings: createWorldSettings({
        getMapCoordinates: () => ({ latN: 40 }) as typeof mapCoordinates,
        getGraphWidth: () => 800,
        getGraphHeight: () => 600,
        getMapSizePercent: () => 0,
        getLatitudePercent: () => 0,
        getLongitudePercent: () => 0,
      }),
    } as unknown as EngineRuntimeContext;
    const store = createRuntimeWorldSettingsStore(context);

    store.patch({ graphWidth: 1024, graphHeight: 768 });

    expect(context.worldSettings.graphWidth).toBe(1024);
    expect(store.get().graphHeight).toBe(768);

    store.refresh({
      getMapCoordinates: () => ({ latN: 20 }) as typeof mapCoordinates,
      getGraphWidth: () => 1400,
      getGraphHeight: () => 900,
      getMapSizePercent: () => 66,
      getLatitudePercent: () => 33,
      getLongitudePercent: () => 0,
    });

    expect(context.worldSettings.mapCoordinates).toEqual({ latN: 20 });
    expect(context.worldSettings.graphWidth).toBe(1400);
    expect(context.worldSettings.graphHeight).toBe(900);
    expect(context.worldSettings.mapSizePercent).toBe(66);
    expect(context.worldSettings.latitudePercent).toBe(33);
  });

  it("can compose a world settings store from explicit getters and setters", () => {
    let settings = createWorldSettings({
      getMapCoordinates: () => ({ latN: 1 }) as typeof mapCoordinates,
      getGraphWidth: () => 100,
      getGraphHeight: () => 100,
      getMapSizePercent: () => 0,
      getLatitudePercent: () => 0,
      getLongitudePercent: () => 0,
    });
    const store = createWorldSettingsStore(
      () => settings,
      (nextSettings) => {
        settings = nextSettings;
      },
      () =>
        createWorldSettings({
          getMapCoordinates: () => ({ latN: 2 }) as typeof mapCoordinates,
          getGraphWidth: () => 200,
          getGraphHeight: () => 300,
          getMapSizePercent: () => 0,
          getLatitudePercent: () => 0,
          getLongitudePercent: () => 0,
        }),
    );

    expect(store.patch({ longitudePercent: 44 }).longitudePercent).toBe(44);
    expect(store.refresh().graphHeight).toBe(300);
    expect(settings.mapCoordinates).toEqual({ latN: 2 });
  });
});
