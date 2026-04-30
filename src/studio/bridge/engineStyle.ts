import {
  createGlobalStyleTargets,
  type EngineStyleTargets,
} from "./engineStyleTargets";

const SYSTEM_STYLE_PRESETS = new Set([
  "default",
  "ancient",
  "gloom",
  "pale",
  "light",
  "watercolor",
  "clean",
  "atlas",
  "darkSeas",
  "cyberpunk",
  "night",
  "monochrome",
]);

export function getEngineStylePreset(
  targets: EngineStyleTargets = createGlobalStyleTargets(),
) {
  return (
    targets.getCurrentPresetValue() ||
    targets.getStoredPresetValue() ||
    "default"
  );
}

export function getEngineStyleSettings(
  targets: EngineStyleTargets = createGlobalStyleTargets(),
) {
  const preset = getEngineStylePreset(targets);
  const hideLabels = targets.isToggleChecked("hideLabels");
  const rescaleLabels = targets.isToggleChecked("rescaleLabels");

  return {
    preset,
    hideLabels,
    rescaleLabels,
    presetKind: SYSTEM_STYLE_PRESETS.has(preset) ? "system" : "custom",
  } as const;
}

export function applyEngineStylePreset(
  preset: string,
  targets: EngineStyleTargets = createGlobalStyleTargets(),
) {
  if (targets.requestStylePresetChange(preset)) return;
  if (targets.changeStyle(preset)) return;
  targets.storePresetValue(preset);
}

export function setEngineStyleToggle(
  action: "hide-labels" | "rescale-labels",
  enabled: boolean,
  targets: EngineStyleTargets = createGlobalStyleTargets(),
) {
  const inputId = action === "hide-labels" ? "hideLabels" : "rescaleLabels";
  if (!targets.setToggleChecked(inputId, enabled)) return;
  targets.invokeActiveZooming();
}
