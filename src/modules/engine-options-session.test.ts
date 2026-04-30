import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalOptionsControlAdapter,
  createGlobalOptionsWriterAdapter,
  createRuntimeOptionsNamingAdapter,
  createRuntimeOptionsRandomAdapter,
  createRuntimeOptionsSession,
  createRuntimeOptionsWriterAdapter,
  type EngineOptionsBrowserControlTargets,
  type EngineOptionsControlAdapter,
  type EngineOptionsNamingAdapter,
  type EngineOptionsRandomAdapter,
  type EngineOptionsReaderAdapter,
  EngineOptionsSessionModule,
  type EngineOptionsWriterAdapter,
  shouldForceDefaultOptions,
} from "./engine-options-session";
import type { EngineRuntimeContext } from "./engine-runtime-context";

function createControls(
  overrides: Partial<EngineOptionsControlAdapter> = {},
): EngineOptionsControlAdapter {
  return {
    getSearchParams: () => new URLSearchParams(),
    isLocked: () => false,
    isStored: () => true,
    usesUsUnits: () => false,
    ...overrides,
  };
}

function createWriter(): EngineOptionsWriterAdapter {
  return {
    setCellsDensity: vi.fn(),
    applyHeightmapTemplate: vi.fn(),
    setStatesCount: vi.fn(),
    setProvincesRatio: vi.fn(),
    setManorsAuto: vi.fn(),
    setReligionsCount: vi.fn(),
    setSizeVariety: vi.fn(),
    setGrowthRate: vi.fn(),
    setCulturesCount: vi.fn(),
    setCultureSet: vi.fn(),
    setTemperatureEquator: vi.fn(),
    setTemperatureNorthPole: vi.fn(),
    setTemperatureSouthPole: vi.fn(),
    setPrecipitation: vi.fn(),
    setDistanceScale: vi.fn(),
    setDistanceUnit: vi.fn(),
    setHeightUnit: vi.fn(),
    setTemperatureScale: vi.fn(),
    setYear: vi.fn(),
    setEra: vi.fn(),
    syncEraOptions: vi.fn(),
  };
}

function createReader(
  overrides: Partial<EngineOptionsReaderAdapter> = {},
): EngineOptionsReaderAdapter {
  return {
    getHeightmapTemplateWeights: () => ({ continental: 1 }),
    getHeightmapTemplateName: () => "Continental",
    getCultureSetWeights: () => ({ world: 1 }),
    ...overrides,
  };
}

function createNaming(
  overrides: Partial<EngineOptionsNamingAdapter> = {},
): EngineOptionsNamingAdapter {
  return {
    generateEraName: () => "Silver Dawn Era",
    ...overrides,
  };
}

function createRandom(
  overrides: Partial<EngineOptionsRandomAdapter> = {},
): EngineOptionsRandomAdapter {
  return {
    random: () => 0.25,
    gauss: ((expected = 100) =>
      expected) as EngineOptionsRandomAdapter["gauss"],
    rand: ((min = 0) => min) as EngineOptionsRandomAdapter["rand"],
    rw: ((weights) =>
      Object.keys(weights)[0]) as EngineOptionsRandomAdapter["rw"],
    ...overrides,
  };
}

function createRuntimeContext(
  randomValues: number[] = [0.25],
): EngineRuntimeContext {
  let index = 0;
  return {
    options: {},
    generationSettings: {
      pointsCount: 0,
      heightExponent: 1,
      lakeElevationLimit: 0,
      resolveDepressionsSteps: 0,
      religionsCount: 0,
      stateSizeVariety: 1,
      globalGrowthRate: 1,
      statesGrowthRate: 1,
    },
    units: {
      height: "m",
    },
    random: {
      next: () =>
        randomValues[index++] ?? randomValues[randomValues.length - 1],
    },
    naming: {
      getCulture: () => "",
      getCultureShort: () => "",
      getState: () => "",
      getBaseShort: (base: number) => `Base ${base}`,
      getNameBases: () => [{}, {}, {}] as never,
    },
  } as unknown as EngineRuntimeContext;
}

describe("shouldForceDefaultOptions", () => {
  it("detects URLs that should ignore stored options", () => {
    expect(
      shouldForceDefaultOptions(new URLSearchParams("options=default")),
    ).toBe(true);
    expect(
      shouldForceDefaultOptions(new URLSearchParams("options=stored")),
    ).toBe(false);
  });
});

describe("EngineOptionsSessionModule", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("applies the selected heightmap template through the runtime option adapter", () => {
    const writer = createWriter();

    new EngineOptionsSessionModule(
      createControls(),
      writer,
      createReader({
        getHeightmapTemplateWeights: () => ({
          continental: 1,
          island: 0,
        }),
        getHeightmapTemplateName: (template) =>
          template === "continental" ? "Continental" : "Island",
      }),
      createNaming(),
      createRandom({
        rw: ((weights) =>
          Object.keys(weights).find((key) => weights[key] > 0) ??
          Object.keys(weights)[0]) as EngineOptionsRandomAdapter["rw"],
      }),
    ).randomizeHeightmapTemplate();

    expect(writer.applyHeightmapTemplate).toHaveBeenCalledWith(
      "continental",
      "Continental",
    );
  });

  it("syncs existing year and era fields into engine options", () => {
    vi.stubGlobal("options", {});
    vi.stubGlobal("yearInput", { value: "1042" });
    vi.stubGlobal("eraInput", { value: "Silver Dawn" });

    new EngineOptionsSessionModule(createControls()).generateEra();

    expect(globalThis.options).toEqual({
      year: 1042,
      era: "Silver Dawn",
      eraShort: "SD",
    });
  });

  it("uses the control adapter to keep locked options untouched", () => {
    const changeCellsDensity = vi.fn();
    vi.stubGlobal("changeCellsDensity", changeCellsDensity);
    vi.stubGlobal("options", {});
    vi.stubGlobal("yearInput", { value: "1042" });
    vi.stubGlobal("eraInput", { value: "Silver Dawn" });

    new EngineOptionsSessionModule(
      createControls({
        isLocked: () => true,
      }),
    ).randomizeOptions();

    expect(changeCellsDensity).not.toHaveBeenCalled();
  });

  it("routes unit defaults through the writer adapter", () => {
    const writer = createWriter();

    new EngineOptionsSessionModule(
      createControls({
        isLocked: () => true,
        isStored: (settingId) =>
          !["distanceUnit", "heightUnit", "temperatureScale"].includes(
            settingId,
          ),
        usesUsUnits: () => true,
      }),
      writer,
      createReader(),
      createNaming(),
      createRandom(),
    ).randomizeOptions();

    expect(writer.setDistanceUnit).toHaveBeenCalledWith("mi");
    expect(writer.setHeightUnit).toHaveBeenCalledWith("ft");
    expect(writer.setTemperatureScale).toHaveBeenCalledWith("\u00b0F");
  });

  it("reads US unit preference through injected locale targets", () => {
    const controls = createGlobalOptionsControlAdapter({
      getLanguage: vi.fn(() => "en-US"),
    });

    expect(controls.usesUsUnits()).toBe(true);
  });

  it("writes unit and climate controls through injected browser targets", () => {
    const targets: EngineOptionsBrowserControlTargets = {
      setPrecipitation: vi.fn(),
      setDistanceScale: vi.fn(),
      setDistanceUnit: vi.fn(),
      setHeightUnit: vi.fn(),
      setTemperatureScale: vi.fn(),
    };
    const writer = createGlobalOptionsWriterAdapter(targets);

    writer.setPrecipitation(120);
    writer.setDistanceScale(2.5);
    writer.setDistanceUnit("mi");
    writer.setHeightUnit("ft");
    writer.setTemperatureScale("\u00b0F");

    expect(targets.setPrecipitation).toHaveBeenCalledWith(120);
    expect(targets.setDistanceScale).toHaveBeenCalledWith(2.5);
    expect(targets.setDistanceUnit).toHaveBeenCalledWith("mi");
    expect(targets.setHeightUnit).toHaveBeenCalledWith("ft");
    expect(targets.setTemperatureScale).toHaveBeenCalledWith("\u00b0F");
  });

  it("routes era generation through the naming adapter", () => {
    const writer = createWriter();

    new EngineOptionsSessionModule(
      createControls({
        isStored: (settingId) => settingId === "year",
      }),
      writer,
      createReader(),
      createNaming({
        generateEraName: () => "Copper Moon Era",
      }),
      createRandom(),
    ).generateEra();

    expect(writer.setEra).toHaveBeenCalledWith("Copper Moon Era");
    expect(writer.syncEraOptions).toHaveBeenCalled();
  });

  it("routes option randomization through the random adapter", () => {
    const writer = createWriter();

    new EngineOptionsSessionModule(
      createControls({
        isStored: (settingId) => settingId === "year",
      }),
      writer,
      createReader(),
      createNaming(),
      createRandom({
        random: () => 0.234,
        gauss: ((expected = 100) =>
          expected + 1) as EngineOptionsRandomAdapter["gauss"],
        rw: (() => "highFantasy") as EngineOptionsRandomAdapter["rw"],
      }),
    ).randomizeOptions();

    expect(writer.setStatesCount).toHaveBeenCalledWith(19);
    expect(writer.setGrowthRate).toHaveBeenCalledWith(1.2);
    expect(writer.setCultureSet).toHaveBeenCalledWith("highFantasy");
  });

  it("routes generated years through the random adapter", () => {
    const writer = createWriter();

    new EngineOptionsSessionModule(
      createControls({
        isStored: (settingId) => settingId !== "year",
      }),
      writer,
      createReader(),
      createNaming(),
      createRandom({
        rand: (() => 1492) as EngineOptionsRandomAdapter["rand"],
      }),
    ).generateEra();

    expect(writer.setYear).toHaveBeenCalledWith(1492);
    expect(writer.syncEraOptions).toHaveBeenCalled();
  });

  it("creates a runtime random adapter from the engine runtime context", () => {
    const random = createRuntimeOptionsRandomAdapter(
      createRuntimeContext([0.25, 0.9]),
    );

    expect(random.random()).toBe(0.25);
    expect(random.rand(1, 3)).toBe(3);
  });

  it("creates runtime era names from the engine naming context", () => {
    const naming = createRuntimeOptionsNamingAdapter(
      createRuntimeContext([0.9, 0.5]),
    );

    expect(naming.generateEraName()).toBe("Base 2 Era");
  });

  it("creates a runtime options session without global random or naming lookups", () => {
    const writer = createWriter();
    const session = createRuntimeOptionsSession(
      createRuntimeContext([0.2, 0.3, 0.4, 0.5]),
      createControls({
        isStored: (settingId) => settingId === "year",
      }),
      writer,
      createReader(),
    );

    session.generateEra();

    expect(writer.setEra).toHaveBeenCalledWith("Base 1 Era");
    expect(writer.syncEraOptions).toHaveBeenCalled();
  });

  it("writes runtime-owned options before delegating to the compatibility writer", () => {
    const context = createRuntimeContext();
    const fallback = createWriter();
    const writer = createRuntimeOptionsWriterAdapter(context, fallback);

    writer.setStatesCount(24);
    writer.setCultureSet("highFantasy");
    writer.setTemperatureEquator(31);
    writer.setHeightUnit("ft");
    writer.setEra("Copper Moon");
    writer.syncEraOptions();

    expect(context.generationSettings.statesCount).toBe(24);
    expect(context.generationSettings.cultureSet).toBe("highFantasy");
    expect(context.options.temperatureEquator).toBe(31);
    expect(context.units.height).toBe("ft");
    expect(context.options.eraShort).toBe("CM");
    expect(fallback.setStatesCount).toHaveBeenCalledWith(24);
    expect(fallback.setCultureSet).toHaveBeenCalledWith("highFantasy");
    expect(fallback.setTemperatureEquator).toHaveBeenCalledWith(31);
    expect(fallback.setHeightUnit).toHaveBeenCalledWith("ft");
    expect(fallback.syncEraOptions).toHaveBeenCalled();
  });

  it("patches generation settings through the runtime store when available", () => {
    const context = createRuntimeContext();
    const patch = vi.fn((nextPatch) => {
      context.generationSettings = {
        ...context.generationSettings,
        ...nextPatch,
      };
      return context.generationSettings;
    });
    context.generationSettingsStore = {
      get: () => context.generationSettings,
      replace: vi.fn(),
      patch,
      refresh: vi.fn(),
    };
    const fallback = createWriter();
    const writer = createRuntimeOptionsWriterAdapter(context, fallback);

    writer.setStatesCount(21);
    writer.setGrowthRate(1.4);

    expect(patch).toHaveBeenCalledWith({ statesCount: 21 });
    expect(patch).toHaveBeenCalledWith({ globalGrowthRate: 1.4 });
    expect(context.generationSettings.statesCount).toBe(21);
    expect(context.generationSettings.globalGrowthRate).toBe(1.4);
    expect(fallback.setStatesCount).toHaveBeenCalledWith(21);
    expect(fallback.setGrowthRate).toHaveBeenCalledWith(1.4);
  });
});
