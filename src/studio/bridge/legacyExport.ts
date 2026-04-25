export function getLegacyExportSettings() {
  const pngResolution = Number((document.getElementById("pngResolutionInput") as HTMLInputElement | null)?.value || 1);
  const tileCols = Number((document.getElementById("tileColsOutput") as HTMLInputElement | null)?.value || 8);
  const tileRows = Number((document.getElementById("tileRowsOutput") as HTMLInputElement | null)?.value || 8);
  const tileScale = Number((document.getElementById("tileScaleOutput") as HTMLInputElement | null)?.value || 1);

  return {
    pngResolution,
    tileCols,
    tileRows,
    tileScale,
  };
}

export function setLegacyExportSetting(setting: "png-resolution" | "tile-cols" | "tile-rows" | "tile-scale", value: number) {
  const inputId =
    setting === "png-resolution"
      ? "pngResolutionInput"
      : setting === "tile-cols"
      ? "tileColsOutput"
      : setting === "tile-rows"
      ? "tileRowsOutput"
      : "tileScaleOutput";

  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (!input) return;

  input.value = String(value);
  input.dispatchEvent(new Event("input", {bubbles: true}));
  input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function exportWithLegacy(format: "svg" | "png" | "jpeg") {
  if (format === "svg" && typeof (window as any).exportToSvg === "function") {
    (window as any).exportToSvg();
    return;
  }
  if (format === "png" && typeof (window as any).exportToPng === "function") {
    (window as any).exportToPng();
    return;
  }
  if (format === "jpeg" && typeof (window as any).exportToJpeg === "function") {
    (window as any).exportToJpeg();
    return;
  }
}
