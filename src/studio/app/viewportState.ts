import { getPresetById } from "../canvas/presets";
import type { StudioState } from "../types";

export type ViewportPresetTargets = {
  getPresetById: typeof getPresetById;
};

export function createGlobalViewportPresetTargets(): ViewportPresetTargets {
  return {
    getPresetById,
  };
}

export function updateViewportDimensions(
  state: StudioState,
  targets: ViewportPresetTargets = createGlobalViewportPresetTargets(),
) {
  const preset = targets.getPresetById(state.viewport.presetId);
  const width =
    state.viewport.orientation === preset.orientation
      ? preset.width
      : preset.height;
  const height =
    state.viewport.orientation === preset.orientation
      ? preset.height
      : preset.width;
  state.viewport.width = width;
  state.viewport.height = height;
}
