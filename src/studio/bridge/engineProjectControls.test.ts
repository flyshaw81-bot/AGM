import { describe, expect, it, vi } from "vitest";
import {
  setEngineLatitude,
  setEngineLongitude,
  setEngineMapSize,
  setEnginePrecipitation,
  setEngineTemperatureEquator,
  setEngineWindTier0,
} from "./engineProjectControls";
import type { EngineProjectControlTargets } from "./engineProjectControlTargets";

function createTargets(
  overrides: Partial<EngineProjectControlTargets> = {},
): EngineProjectControlTargets {
  return {
    setOptionNumber: vi.fn(),
    applyWindTierToRuntime: vi.fn(() => false),
    setPrecipitationPercent: vi.fn(),
    setMapPlacementPercent: vi.fn(),
    ...overrides,
  };
}

describe("engine project controls", () => {
  it("rounds wind tier values and writes runtime wind settings", () => {
    const targets = createTargets();

    setEngineWindTier0(88, targets);

    expect(targets.applyWindTierToRuntime).toHaveBeenCalledWith(0, 90);
  });

  it("writes precipitation through the runtime target", () => {
    const targets = createTargets();

    setEnginePrecipitation(120.6, targets);

    expect(targets.setPrecipitationPercent).toHaveBeenCalledWith(121);
  });

  it("writes temperature values through runtime options", () => {
    const targets = createTargets();

    setEngineTemperatureEquator(64.2, targets);

    expect(targets.setOptionNumber).toHaveBeenCalledWith(
      "temperatureEquator",
      50,
    );
  });

  it("writes map placement values through the runtime target", () => {
    const targets = createTargets();

    setEngineMapSize(150, targets);
    setEngineLatitude(-10, targets);
    setEngineLongitude(62.26, targets);

    expect(targets.setMapPlacementPercent).toHaveBeenCalledWith("mapSize", 100);
    expect(targets.setMapPlacementPercent).toHaveBeenCalledWith("latitude", 0);
    expect(targets.setMapPlacementPercent).toHaveBeenCalledWith(
      "longitude",
      62.3,
    );
  });
});
