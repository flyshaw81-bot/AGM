import { describe, expect, it, vi } from "vitest";
import { setEngineWindTier0 } from "./engineProjectControls";
import type { EngineProjectControlTargets } from "./engineProjectControlTargets";

function createTargets(
  overrides: Partial<EngineProjectControlTargets> = {},
): EngineProjectControlTargets {
  return {
    getTemperatureLabel: vi.fn(() => null),
    setOptionNumber: vi.fn(),
    convertTemperature: vi.fn(),
    getWindTransform: vi.fn(() => "rotate(225 210 6)"),
    setWindTransform: vi.fn(),
    applyWindTierToRuntime: vi.fn(() => false),
    ...overrides,
  };
}

describe("engine project controls", () => {
  it("rounds wind tier values and preserves the transform center", () => {
    const targets = createTargets();

    setEngineWindTier0(88, targets);

    expect(targets.setWindTransform).toHaveBeenCalledWith(
      0,
      "rotate(90 210 6)",
    );
    expect(targets.applyWindTierToRuntime).toHaveBeenCalledWith(0, 90);
  });

  it("does not update runtime wind settings when the wind path is missing", () => {
    const targets = createTargets({
      getWindTransform: vi.fn(() => null),
    });

    setEngineWindTier0(88, targets);

    expect(targets.setWindTransform).not.toHaveBeenCalled();
    expect(targets.applyWindTierToRuntime).not.toHaveBeenCalled();
  });
});
