import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "./engineActionTypes";
import {
  getInputValue,
  getLayersPresetOptions,
  hasVisibleInlineDisplay,
  readEngineProjectForm,
} from "./engineProjectForm";
import type { EngineProjectFormTargets } from "./engineProjectFormTargets";

function createSelect(value: string) {
  return { value } as HTMLSelectElement;
}

function createTargets(
  overrides: Partial<EngineProjectFormTargets> = {},
): EngineProjectFormTargets {
  const selectById = new Map<string, HTMLSelectElement | null>([
    ["templateInput", createSelect("volcano")],
    ["culturesSet", createSelect("european")],
    ["stateLabelsModeInput", createSelect("auto")],
    ["layersPreset", createSelect("default")],
  ]);
  const inputs = new Map<string, string>([
    ["pointsInput", "10000"],
    ["statesNumber", "12"],
    ["provincesRatio", "40"],
    ["sizeVariety", "3"],
    ["growthRate", "1.2"],
    ["precInput", "120"],
    ["culturesInput", "8"],
    ["manorsInput", "1000"],
    ["religionsNumber", "4"],
  ]);

  return {
    getInputValue: vi.fn((id, fallback = "") => inputs.get(id) || fallback),
    getOutputValue: vi.fn((id, fallback = "") =>
      id === "pointsOutputFormatted"
        ? "10k"
        : id === "manorsOutput"
          ? "auto"
          : fallback,
    ),
    getTextValue: vi.fn((_id, fallback = "") => fallback),
    getSelect: vi.fn((id) => selectById.get(id) ?? null),
    getSelectValue: vi.fn((select, fallback = "") => select?.value || fallback),
    getSelectedOptionLabel: vi.fn((_select, fallback = "") => fallback),
    getSelectOptions: vi.fn((select) =>
      select?.value === "default"
        ? [{ value: "default", label: "Default" }]
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
    getWindOption: vi.fn((tier) => (tier === 1 ? "45" : "")),
    ...overrides,
  };
}

describe("engine project form", () => {
  it("reads project summary values through injected targets", () => {
    const targets = createTargets();

    const form = readEngineProjectForm(undefined, targets);

    expect(form.pendingPoints).toBe("10000");
    expect(form.pendingCellsLabel).toBe("10k");
    expect(form.pendingTemperatureEquatorF).toBe("82°F");
    expect(form.pendingWindTier1).toBe("45");
    expect(form.pendingBurgsLabel).toBe("auto");
    expect(form.pendingCultureSetLabel).toBe("European");
    expect(form.pendingTemplateLabel).toBe("Volcano");
  });

  it("falls back to cached summary values when live form values are missing", () => {
    const targets = createTargets({
      getInputValue: vi.fn((_id, fallback = "") => fallback),
      getOutputValue: vi.fn((_id, fallback = "") => fallback),
      getTextValue: vi.fn((_id, fallback = "") => fallback),
      getSelectValue: vi.fn((_select, fallback = "") => fallback),
      getSelectedOptionLabel: vi.fn((_select, fallback = "") => fallback),
      getSelectOptions: vi.fn(() => []),
      getCultureSetOptions: vi.fn(() => []),
      getTemperatureValue: vi.fn((_key, fallback = "") => fallback),
      getTemperatureFahrenheitLabel: vi.fn((_key, fallback = "") => fallback),
      getWindOption: vi.fn(() => ""),
    });

    const cachedSummary = {
      pendingPoints: "cached-points",
      pendingWindTier2: "90",
      pendingTemplate: "cached-template",
      pendingTemplateLabel: "Cached Template",
      availableTemplates: [{ value: "cached-template", label: "Cached" }],
    } as EngineProjectSummary;

    const form = readEngineProjectForm(cachedSummary, targets);

    expect(form.pendingPoints).toBe("cached-points");
    expect(form.pendingWindTier2).toBe("90");
    expect(form.pendingTemplate).toBe("cached-template");
    expect(form.pendingTemplateLabel).toBe("Cached Template");
    expect(form.availableTemplates).toEqual([
      { value: "cached-template", label: "Cached" },
    ]);
  });

  it("keeps exported helper functions on the same target boundary", () => {
    const targets = createTargets();

    expect(getInputValue("pointsInput", "", targets)).toBe("10000");
    expect(getLayersPresetOptions(targets)).toEqual(["default"]);
    expect(hasVisibleInlineDisplay("savePresetButton", false, targets)).toBe(
      true,
    );
  });
});
