import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "./engineActionTypes";
import type { EngineProjectFormTargets } from "./engineProjectFormTargets";
import {
  getEngineProjectSummary,
  syncEngineProjectSummary,
} from "./engineProjectSummary";
import type { EngineProjectSummaryTargets } from "./engineProjectSummaryTargets";

function createSelect(value: string) {
  return { value } as HTMLSelectElement;
}

function createFormTargets(
  overrides: Partial<EngineProjectFormTargets> = {},
): EngineProjectFormTargets {
  return {
    getInputValue: vi.fn((id, fallback = "") => {
      const values: Record<string, string> = {
        autosaveIntervalOutput: "5",
        optionsSeed: "seed-1",
        pointsInput: "10000",
        pointsOutputFormatted: "10k",
        statesNumber: "12",
        provincesRatio: "40",
        sizeVariety: "3",
        growthRate: "1.2",
        precInput: "120",
        culturesInput: "8",
        manorsInput: "1000",
        religionsNumber: "4",
        mapWidthInput: "1200",
        mapHeightInput: "800",
      };
      return values[id] || fallback;
    }),
    getOutputValue: vi.fn((id, fallback = "") =>
      id === "pointsOutputFormatted"
        ? "10k"
        : id === "manorsOutput"
          ? "auto"
          : fallback,
    ),
    getTextValue: vi.fn((id, fallback = "") => {
      const values: Record<string, string> = {};
      return values[id] || fallback;
    }),
    getSelect: vi.fn((id) =>
      id === "layersPreset"
        ? createSelect("political")
        : id === "templateInput"
          ? createSelect("volcano")
          : id === "culturesSet"
            ? createSelect("european")
            : id === "stateLabelsModeInput"
              ? createSelect("auto")
              : null,
    ),
    getSelectValue: vi.fn((select, fallback = "") => select?.value || fallback),
    getSelectedOptionLabel: vi.fn((_select, fallback = "") => fallback),
    getSelectOptions: vi.fn((select) =>
      select?.value === "political"
        ? [{ value: "political", label: "Political" }]
        : [{ value: "volcano", label: "Volcano" }],
    ),
    getCultureSetOptions: vi.fn(() => [
      { value: "european", label: "European", max: "12" },
    ]),
    getTemperatureValue: vi.fn(
      (
        key:
          | "temperatureEquator"
          | "temperatureNorthPole"
          | "temperatureSouthPole",
        fallback = "",
      ) =>
        ({
          temperatureEquator: "28",
          temperatureNorthPole: "-10",
          temperatureSouthPole: "-20",
        })[key] ?? fallback,
    ),
    getTemperatureFahrenheitLabel: vi.fn(
      (
        key:
          | "temperatureEquator"
          | "temperatureNorthPole"
          | "temperatureSouthPole",
        fallback = "",
      ) =>
        ({
          temperatureEquator: "82°F",
          temperatureNorthPole: "14°F",
          temperatureSouthPole: "-4°F",
        })[key] ?? fallback,
    ),
    getMapPlacementValue: vi.fn(
      (key: "mapSize" | "latitude" | "longitude", fallback = "") =>
        ({ mapSize: "80", latitude: "45", longitude: "15" })[key] ?? fallback,
    ),
    hasVisibleInlineDisplay: vi.fn(() => true),
    getWindOption: vi.fn(() => ""),
    ...overrides,
  };
}

function createTargets(
  overrides: Partial<EngineProjectSummaryTargets> = {},
): EngineProjectSummaryTargets {
  let cachedSummary = overrides.getCachedSummary?.();
  return {
    form: createFormTargets(),
    getCachedSummary: vi.fn(() => cachedSummary),
    setCachedSummary: vi.fn((summary) => {
      cachedSummary = summary;
    }),
    getLocalStorageItem: vi.fn((key) =>
      key === "presetStyle"
        ? "contrast"
        : key === "preset"
          ? "stored-preset"
          : null,
    ),
    getSessionStorageItem: vi.fn(() => null),
    hasElement: vi.fn((id) =>
      [
        "optionsMapHistory",
        "optionsCopySeed",
        "optionsSeed",
        "restoreDefaultCanvasSize",
      ].includes(id),
    ),
    readLocalDatabaseSnapshot: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("engine project summary", () => {
  it("syncs live project summary through injected targets", async () => {
    const targets = createTargets({
      getLocalStorageItem: vi.fn((key) =>
        key === "lastMap"
          ? "snapshot"
          : key === "presetStyle"
            ? "contrast"
            : null,
      ),
    });

    await expect(syncEngineProjectSummary(targets)).resolves.toBe(true);

    expect(targets.setCachedSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        hasLocalSnapshot: true,
        stylePreset: "contrast",
        lastLayersPreset: "political",
        autosaveInterval: "5",
        pendingSeed: "seed-1",
        pendingWidth: "1200",
        pendingHeight: "800",
        canOpenSeedHistory: true,
      }),
    );
  });

  it("uses the local database snapshot fallback when storage is empty", async () => {
    const targets = createTargets({
      getLocalStorageItem: vi.fn(() => null),
      getSessionStorageItem: vi.fn(() => null),
      readLocalDatabaseSnapshot: vi.fn(async () => ({ id: "lastMap" })),
    });

    await syncEngineProjectSummary(targets);

    expect(targets.readLocalDatabaseSnapshot).toHaveBeenCalledWith();
    expect(targets.setCachedSummary).toHaveBeenCalledWith(
      expect.objectContaining({ hasLocalSnapshot: true }),
    );
  });

  it("merges live values with cached fallback summary", () => {
    const cachedSummary = {
      hasLocalSnapshot: true,
      stylePreset: "cached-style",
      lastLayersPreset: "cached-layer",
      autosaveInterval: "10",
      pendingSeed: "cached-seed",
      availableLayersPresets: ["cached-layer"],
      canCopySeedUrl: true,
    } as EngineProjectSummary;
    const targets = createTargets({
      getCachedSummary: vi.fn(() => cachedSummary),
      form: createFormTargets({
        getSelect: vi.fn(() => null),
        getInputValue: vi.fn((_id, fallback = "") => fallback),
        getSelectOptions: vi.fn(() => []),
        hasVisibleInlineDisplay: vi.fn((_id, fallback = false) => fallback),
      }),
      getLocalStorageItem: vi.fn(() => null),
      hasElement: vi.fn(() => false),
    });

    const summary = getEngineProjectSummary(targets);

    expect(summary.hasLocalSnapshot).toBe(true);
    expect(summary.stylePreset).toBe("cached-style");
    expect(summary.lastLayersPreset).toBe("cached-layer");
    expect(summary.autosaveInterval).toBe("10");
    expect(summary.pendingSeed).toBe("cached-seed");
    expect(summary.availableLayersPresets).toEqual(["cached-layer"]);
    expect(summary.canCopySeedUrl).toBe(true);
  });
});
