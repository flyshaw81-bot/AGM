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

export function getLegacyStylePreset() {
  return (window as any).stylePreset?.value || localStorage.getItem("presetStyle") || "default";
}

export function getLegacyStyleSettings() {
  const preset = getLegacyStylePreset();
  const hideLabels = Boolean((document.getElementById("hideLabels") as HTMLInputElement | null)?.checked);
  const rescaleLabels = Boolean((document.getElementById("rescaleLabels") as HTMLInputElement | null)?.checked);

  return {
    preset,
    hideLabels,
    rescaleLabels,
    presetKind: SYSTEM_STYLE_PRESETS.has(preset) ? "system" : "custom",
  } as const;
}

export function applyLegacyStylePreset(preset: string) {
  const requestChange = (window as any).requestStylePresetChange;
  const changeStyle = (window as any).changeStyle;
  if (typeof requestChange === "function") {
    requestChange(preset);
    return;
  }
  if (typeof changeStyle === "function") {
    changeStyle(preset);
    return;
  }
  localStorage.setItem("presetStyle", preset);
}

export function setLegacyStyleToggle(action: "hide-labels" | "rescale-labels", enabled: boolean) {
  const inputId = action === "hide-labels" ? "hideLabels" : "rescaleLabels";
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (!input) return;

  input.checked = enabled;
  input.dispatchEvent(new Event("change", {bubbles: true}));
  if (typeof (window as any).invokeActiveZooming === "function") {
    (window as any).invokeActiveZooming();
  }
}
