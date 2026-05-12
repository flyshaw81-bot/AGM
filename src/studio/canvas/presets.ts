import type { CanvasPreset, Orientation } from "../types";

export const STUDIO_CANVAS_PRESETS: CanvasPreset[] = [
  {
    id: "desktop-landscape",
    label: "Desktop 16:10",
    category: "desktop",
    orientation: "landscape",
    width: 1440,
    height: 900,
  },
  {
    id: "desktop-portrait",
    label: "10:16",
    category: "desktop",
    orientation: "portrait",
    width: 900,
    height: 1440,
  },
  {
    id: "widescreen-landscape",
    label: "16:9",
    category: "desktop",
    orientation: "landscape",
    width: 1600,
    height: 900,
  },
  {
    id: "widescreen-portrait",
    label: "9:16",
    category: "desktop",
    orientation: "portrait",
    width: 900,
    height: 1600,
  },
  {
    id: "classic-landscape",
    label: "4:3",
    category: "desktop",
    orientation: "landscape",
    width: 1200,
    height: 900,
  },
  {
    id: "classic-portrait",
    label: "3:4",
    category: "desktop",
    orientation: "portrait",
    width: 900,
    height: 1200,
  },
  {
    id: "square",
    label: "1:1",
    category: "custom",
    orientation: "portrait",
    width: 1024,
    height: 1024,
  },
  {
    id: "mobile-portrait",
    label: "Mobile Portrait",
    category: "mobile",
    orientation: "portrait",
    width: 390,
    height: 844,
  },
  {
    id: "mobile-landscape",
    label: "Mobile Landscape",
    category: "mobile",
    orientation: "landscape",
    width: 844,
    height: 390,
  },
];

export function getPresetById(id: string): CanvasPreset {
  return (
    STUDIO_CANVAS_PRESETS.find((preset) => preset.id === id) ||
    STUDIO_CANVAS_PRESETS[0]
  );
}

export function flipPresetOrientation(
  preset: CanvasPreset,
  orientation: Orientation,
): CanvasPreset {
  const isSame = preset.orientation === orientation;
  if (isSame) return { ...preset };

  return {
    ...preset,
    orientation,
    width: preset.height,
    height: preset.width,
  };
}
