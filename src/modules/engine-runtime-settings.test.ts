import { afterEach, describe, expect, it } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  createGlobalPopulationRuntimeTargets,
  createGlobalPopulationSettings,
  createGlobalPopulationSettingsTargets,
  createGlobalSettingsDomTargets,
  createGlobalTimingRuntimeTargets,
  createGlobalTimingSettings,
  createGlobalTimingSettingsTargets,
  createGlobalUnitRuntimeTargets,
  createGlobalUnitSettings,
  createGlobalUnitSettingsTargets,
  createGlobalWorldRuntimeTargets,
  createGlobalWorldSettings,
  createGlobalWorldSettingsTargets,
  createPopulationSettings,
  createRuntimeWorldSettingsStore,
  createSettingsInputNumberReader,
  createTimingSettings,
  createUnitSettings,
  createWorldSettings,
  createWorldSettingsStore,
  type EnginePopulationRuntimeTargets,
  type EngineSettingsDomTargets,
  type EngineTimingRuntimeTargets,
  type EngineUnitRuntimeTargets,
  type EngineWorldRuntimeTargets,
} from "./engine-runtime-settings";

const originalDocument = globalThis.document;
const originalMapCoordinates = globalThis.mapCoordinates;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalMapSizePercent = globalThis.mapSizePercent;
const originalLatitudePercent = globalThis.latitudePercent;
const originalLongitudePercent = globalThis.longitudePercent;
const originalPopulationRate = globalThis.populationRate;
const originalUrbanDensity = globalThis.urbanDensity;
const originalUrbanization = globalThis.urbanization;
const originalHeightUnit = globalThis.heightUnit;
const originalTime = globalThis.TIME;

function installDocument(
  controls: Record<string, Partial<HTMLInputElement>>,
): void {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementById: (id: string) => controls[id] ?? null,
    } as unknown as Document,
    writable: true,
  });
}

describe("runtime setting adapters", () => {
  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    globalThis.mapCoordinates = originalMapCoordinates;
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.mapSizePercent = originalMapSizePercent;
    globalThis.latitudePercent = originalLatitudePercent;
    globalThis.longitudePercent = originalLongitudePercent;
    globalThis.populationRate = originalPopulationRate;
    globalThis.urbanDensity = originalUrbanDensity;
    globalThis.urbanization = originalUrbanization;
    globalThis.heightUnit = originalHeightUnit;
    globalThis.TIME = originalTime;
  });

  it("reads world settings from current map runtime globals", () => {
    installDocument({});
    globalThis.mapCoordinates = { latN: 10 } as typeof mapCoordinates;
    globalThis.graphWidth = 200;
    globalThis.graphHeight = 120;
    globalThis.mapSizePercent = 72;
    globalThis.latitudePercent = 41;
    globalThis.longitudePercent = 63;

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
    globalThis.heightUnit = "ft";
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

  it("keeps DOM input readers isolated from runtime world settings", () => {
    const domTargets: EngineSettingsDomTargets = {
      getInput: (id) =>
        (({
          numericOutput: { value: "81" },
        })[id] as HTMLInputElement | undefined) ?? null,
    };

    expect(
      createSettingsInputNumberReader(domTargets)("numericOutput", 0),
    ).toBe(81);
    expect(
      createSettingsInputNumberReader(domTargets)("missingOutput", 12),
    ).toBe(12);

    globalThis.mapCoordinates = { latN: 15 } as typeof mapCoordinates;
    globalThis.graphWidth = 320;
    globalThis.graphHeight = 180;
    globalThis.mapSizePercent = 82;
    globalThis.latitudePercent = 43;
    globalThis.longitudePercent = 64;

    expect(
      createWorldSettings(createGlobalWorldSettingsTargets(domTargets)),
    ).toEqual({
      mapCoordinates: { latN: 15 },
      graphWidth: 320,
      graphHeight: 180,
      mapSizePercent: 82,
      latitudePercent: 43,
      longitudePercent: 64,
    });
  });

  it("keeps global settings DOM targets safe when document is absent", () => {
    globalThis.document = undefined as unknown as Document;

    expect(
      createSettingsInputNumberReader(createGlobalSettingsDomTargets())(
        "numericOutput",
        27,
      ),
    ).toBe(27);
  });

  it("keeps global settings DOM targets safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(
      createSettingsInputNumberReader(createGlobalSettingsDomTargets())(
        "numericOutput",
        31,
      ),
    ).toBe(31);
  });

  it("keeps global settings DOM targets safe when element lookup throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById: () => {
          throw new Error("element lookup blocked");
        },
      },
      writable: true,
    });

    expect(
      createSettingsInputNumberReader(createGlobalSettingsDomTargets())(
        "numericOutput",
        33,
      ),
    ).toBe(33);
  });

  it("composes world settings from separate DOM and runtime targets", () => {
    const domTargets: EngineSettingsDomTargets = {
      getInput: () => null,
    };
    const runtimeTargets: EngineWorldRuntimeTargets = {
      getMapCoordinates: () => ({ latN: 25 }) as typeof mapCoordinates,
      getGraphWidth: () => 640,
      getGraphHeight: () => 360,
      getMapSizePercent: () => 75,
      getLatitudePercent: () => 38,
      getLongitudePercent: () => 61,
    };

    expect(
      createWorldSettings(
        createGlobalWorldSettingsTargets(domTargets, runtimeTargets),
      ),
    ).toEqual({
      mapCoordinates: { latN: 25 },
      graphWidth: 640,
      graphHeight: 360,
      mapSizePercent: 75,
      latitudePercent: 38,
      longitudePercent: 61,
    });
  });

  it("reads map runtime values through the explicit global runtime target", () => {
    globalThis.mapCoordinates = { latN: 12 } as typeof mapCoordinates;
    globalThis.graphWidth = 960;
    globalThis.graphHeight = 540;
    globalThis.mapSizePercent = 68;
    globalThis.latitudePercent = 44;
    globalThis.longitudePercent = 52;

    const targets = createGlobalWorldRuntimeTargets();

    expect(targets.getMapCoordinates()).toEqual({ latN: 12 });
    expect(targets.getGraphWidth()).toBe(960);
    expect(targets.getGraphHeight()).toBe(540);
    expect(targets.getMapSizePercent()).toBe(68);
    expect(targets.getLatitudePercent()).toBe(44);
    expect(targets.getLongitudePercent()).toBe(52);
  });

  it("composes population settings from explicit runtime targets", () => {
    const runtimeTargets: EnginePopulationRuntimeTargets = {
      getPopulationRate: () => 8,
      getUrbanDensity: () => 9,
      getUrbanization: () => 10,
    };

    expect(
      createPopulationSettings(
        createGlobalPopulationSettingsTargets(runtimeTargets),
      ),
    ).toEqual({
      populationRate: 8,
      urbanDensity: 9,
      urbanization: 10,
    });
  });

  it("reads population runtime values through the explicit global runtime target", () => {
    globalThis.populationRate = 11;
    globalThis.urbanDensity = 12;
    globalThis.urbanization = 13;

    const targets = createGlobalPopulationRuntimeTargets();

    expect(targets.getPopulationRate()).toBe(11);
    expect(targets.getUrbanDensity()).toBe(12);
    expect(targets.getUrbanization()).toBe(13);
  });

  it("composes unit and timing settings from explicit runtime targets", () => {
    const unitTargets: EngineUnitRuntimeTargets = {
      getHeightUnit: () => "ft",
    };
    const timingTargets: EngineTimingRuntimeTargets = {
      getShouldTime: () => true,
    };

    expect(
      createUnitSettings(createGlobalUnitSettingsTargets(unitTargets)),
    ).toEqual({ height: "ft" });
    expect(
      createTimingSettings(createGlobalTimingSettingsTargets(timingTargets)),
    ).toEqual({ shouldTime: true });
  });

  it("reads unit and timing values through explicit global runtime targets", () => {
    globalThis.heightUnit = "m";
    globalThis.TIME = false;

    expect(createGlobalUnitRuntimeTargets().getHeightUnit()).toBe("m");
    expect(createGlobalTimingRuntimeTargets().getShouldTime()).toBe(false);
  });

  it("keeps global runtime targets safe when runtime global access throws", () => {
    const descriptors = new Map<string, PropertyDescriptor | undefined>(
      [
        "mapCoordinates",
        "graphWidth",
        "graphHeight",
        "mapSizePercent",
        "latitudePercent",
        "longitudePercent",
        "populationRate",
        "urbanDensity",
        "urbanization",
        "heightUnit",
        "TIME",
      ].map((name) => [
        name,
        Object.getOwnPropertyDescriptor(globalThis, name),
      ]),
    );

    for (const name of descriptors.keys()) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }

    try {
      const worldTargets = createGlobalWorldRuntimeTargets();
      const populationTargets = createGlobalPopulationRuntimeTargets();

      expect(worldTargets.getMapCoordinates()).toEqual({});
      expect(worldTargets.getGraphWidth()).toBe(0);
      expect(worldTargets.getGraphHeight()).toBe(0);
      expect(worldTargets.getMapSizePercent()).toBe(0);
      expect(worldTargets.getLatitudePercent()).toBe(0);
      expect(worldTargets.getLongitudePercent()).toBe(0);
      expect(populationTargets.getPopulationRate()).toBe(0);
      expect(populationTargets.getUrbanDensity()).toBe(0);
      expect(populationTargets.getUrbanization()).toBe(0);
      expect(createGlobalUnitRuntimeTargets().getHeightUnit()).toBe("m");
      expect(createGlobalTimingRuntimeTargets().getShouldTime()).toBe(false);
    } finally {
      for (const [name, descriptor] of descriptors) {
        if (descriptor) {
          Object.defineProperty(globalThis, name, descriptor);
        }
      }
    }
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
