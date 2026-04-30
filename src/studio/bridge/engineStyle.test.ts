import { describe, expect, it, vi } from "vitest";
import {
  applyEngineStylePreset,
  getEngineStylePreset,
  getEngineStyleSettings,
  setEngineStyleToggle,
} from "./engineStyle";
import type { EngineStyleTargets } from "./engineStyleTargets";

function createTargets(
  overrides: Partial<EngineStyleTargets> = {},
): EngineStyleTargets {
  return {
    getCurrentPresetValue: vi.fn(() => ""),
    getStoredPresetValue: vi.fn(() => null),
    storePresetValue: vi.fn(),
    isToggleChecked: vi.fn(() => false),
    setToggleChecked: vi.fn(() => true),
    dispatchChange: vi.fn(),
    requestStylePresetChange: vi.fn(() => false),
    changeStyle: vi.fn(() => false),
    invokeActiveZooming: vi.fn(),
    ...overrides,
  };
}

describe("engine style bridge", () => {
  it("prefers the active preset value over stored preset fallback", () => {
    const targets = createTargets({
      getCurrentPresetValue: vi.fn(() => "night"),
      getStoredPresetValue: vi.fn(() => "atlas"),
    });

    expect(getEngineStylePreset(targets)).toBe("night");
  });

  it("builds style settings from injected targets", () => {
    const targets = createTargets({
      getCurrentPresetValue: vi.fn(() => "custom-style"),
      isToggleChecked: vi.fn((id) => id === "hideLabels"),
    });

    expect(getEngineStyleSettings(targets)).toEqual({
      preset: "custom-style",
      hideLabels: true,
      rescaleLabels: false,
      presetKind: "custom",
    });
  });

  it("applies presets through request hook before changeStyle or storage", () => {
    const targets = createTargets({
      requestStylePresetChange: vi.fn(() => true),
    });

    applyEngineStylePreset("atlas", targets);

    expect(targets.requestStylePresetChange).toHaveBeenCalledWith("atlas");
    expect(targets.changeStyle).not.toHaveBeenCalled();
    expect(targets.storePresetValue).not.toHaveBeenCalled();
  });

  it("falls back to storage when no style apply hooks are available", () => {
    const targets = createTargets();

    applyEngineStylePreset("atlas", targets);

    expect(targets.storePresetValue).toHaveBeenCalledWith("atlas");
  });

  it("updates label toggles and refreshes active zooming", () => {
    const targets = createTargets();

    setEngineStyleToggle("rescale-labels", true, targets);

    expect(targets.setToggleChecked).toHaveBeenCalledWith(
      "rescaleLabels",
      true,
    );
    expect(targets.invokeActiveZooming).toHaveBeenCalledWith();
  });
});
