import { STUDIO_CANVAS_PRESETS } from "../canvas/presets";
import type { StudioLanguage, StudioState, StudioTheme } from "../types";
import type { StudioShellEventHandlers } from "./shellEventTypes";
import { bindActionClick, bindSelectValue } from "./studioEventBinding";

type ShellPreferenceHandlers = Pick<
  StudioShellEventHandlers,
  | "onViewportChange"
  | "onStyleChange"
  | "onStyleToggle"
  | "onLanguageChange"
  | "onThemeChange"
  | "onNavigationCollapseChange"
>;

export function bindShellPreferenceEvents(
  state: StudioState,
  {
    onViewportChange,
    onStyleChange,
    onStyleToggle,
    onLanguageChange,
    onThemeChange,
    onNavigationCollapseChange,
  }: ShellPreferenceHandlers,
) {
  const presetSelects = [
    "studioInspectorPresetSelect",
    "studioTopbarPresetSelect",
  ];
  presetSelects.forEach((id) => {
    const presetSelect = document.getElementById(
      id,
    ) as HTMLSelectElement | null;
    if (!presetSelect) return;
    presetSelect.value = state.viewport.presetId;
    bindSelectValue(id, (presetId) => {
      const preset = STUDIO_CANVAS_PRESETS.find((item) => item.id === presetId);
      onViewportChange({
        presetId,
        ...(preset ? { orientation: preset.orientation } : {}),
      });
    });
  });

  const stylePresetSelect = document.getElementById(
    "studioStylePresetSelect",
  ) as HTMLSelectElement | null;
  if (stylePresetSelect) {
    stylePresetSelect.value = state.document.stylePreset;
    bindSelectValue("studioStylePresetSelect", onStyleChange);
  }

  bindActionClick("language", (button) =>
    onLanguageChange(button.dataset.value as StudioLanguage),
  );

  bindActionClick("language-toggle", (button) =>
    onLanguageChange(button.dataset.value as StudioLanguage),
  );

  const themeSelect = document.getElementById(
    "studioThemeSelect",
  ) as HTMLSelectElement | null;
  if (themeSelect) {
    themeSelect.value = state.theme;
    bindSelectValue<StudioTheme>("studioThemeSelect", onThemeChange);
  }

  bindActionClick("theme-toggle", (button) =>
    onThemeChange(button.dataset.value as StudioTheme),
  );

  bindActionClick("toggle-navigation-collapse", () =>
    onNavigationCollapseChange(!state.shell.navigationCollapsed),
  );

  bindActionClick("style-toggle", (button) =>
    onStyleToggle(button.dataset.value as "hide-labels" | "rescale-labels"),
  );
}
