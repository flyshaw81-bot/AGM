import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type EngineOptionsControlAdapter,
  type EngineOptionsNamingAdapter,
  type EngineOptionsRandomAdapter,
  type EngineOptionsReaderAdapter,
  EngineOptionsSessionModule,
  type EngineOptionsWriterAdapter,
  shouldForceDefaultOptions,
} from "./engine-options-session";

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
});
