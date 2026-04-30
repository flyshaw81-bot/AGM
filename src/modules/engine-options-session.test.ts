import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type EngineOptionsControlAdapter,
  type EngineOptionsNamingAdapter,
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
    ).generateEra();

    expect(writer.setEra).toHaveBeenCalledWith("Copper Moon Era");
    expect(writer.syncEraOptions).toHaveBeenCalled();
  });
});
