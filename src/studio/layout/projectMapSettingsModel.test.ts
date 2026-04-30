import { describe, expect, it } from "vitest";
import {
  formatProjectPercent,
  formatProjectTemperature,
  formatProjectWind,
  PROJECT_MAP_EMPTY_VALUE,
  PROJECT_MAP_WIND_TIER_SETTINGS,
} from "./projectMapSettingsModel";

describe("projectMapSettingsModel", () => {
  it("formats map setting display values", () => {
    expect(formatProjectTemperature("22", "72°F")).toBe("22°C / 72°F");
    expect(formatProjectTemperature("", "")).toBe(PROJECT_MAP_EMPTY_VALUE);
    expect(formatProjectPercent("50")).toBe("50%");
    expect(formatProjectPercent("")).toBe(PROJECT_MAP_EMPTY_VALUE);
    expect(formatProjectWind("315")).toBe("315°");
  });

  it("keeps wind tier inputs and summary keys aligned", () => {
    expect(PROJECT_MAP_WIND_TIER_SETTINGS).toHaveLength(6);
    expect(
      PROJECT_MAP_WIND_TIER_SETTINGS.map((setting) => setting.inputId),
    ).toEqual([
      "studioProjectWindTier0Input",
      "studioProjectWindTier1Input",
      "studioProjectWindTier2Input",
      "studioProjectWindTier3Input",
      "studioProjectWindTier4Input",
      "studioProjectWindTier5Input",
    ]);
  });
});
