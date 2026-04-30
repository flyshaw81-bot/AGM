import { describe, expect, it } from "vitest";
import {
  renderProjectInputSetting,
  renderProjectKv,
  renderProjectSelectSetting,
  renderSelectOption,
  renderWindTierSettings,
} from "./projectMapSettingsControls";

describe("projectMapSettingsControls", () => {
  it("renders shared key-value, input, and select controls", () => {
    expect(renderProjectKv("Autosave", "5 min")).toBe(
      '<div class="studio-kv"><span>Autosave</span><strong>5 min</strong></div>',
    );
    expect(
      renderProjectInputSetting(
        "States",
        "12",
        "Change states",
        "statesInput",
        "number",
        'min="0" value="12"',
      ),
    ).toContain('input id="statesInput"');
    expect(
      renderProjectSelectSetting(
        "Mode",
        "Auto",
        "Change mode",
        "modeSelect",
        renderSelectOption("auto", "Auto", "auto"),
      ),
    ).toContain('<option value="auto" selected>Auto</option>');
  });

  it("renders six wind tier settings from shared wind-tier config", () => {
    const summary = {
      pendingWindTier0: "180",
      pendingWindTier1: "",
      pendingWindTier2: "",
      pendingWindTier3: "",
      pendingWindTier4: "",
      pendingWindTier5: "",
    } as Parameters<typeof renderWindTierSettings>[0];

    const html = renderWindTierSettings(summary, "en");
    expect(html.match(/Change wind tier/g)).toHaveLength(6);
    expect(html).toContain('id="studioProjectWindTier0Input"');
    expect(html).toContain('value="180"');
    expect(html).toContain('value="45"');
  });
});
