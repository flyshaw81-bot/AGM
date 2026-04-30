import { getEngineDocumentState } from "../bridge/engineMapHost";
import { getEngineStylePreset } from "../bridge/engineStyle";
import { getPresetById } from "../canvas/presets";
import {
  createGlobalStudioPreferenceTargets,
  type StudioPreferenceTargets,
} from "./preferences";
import {
  createGlobalProjectCenterTargets,
  type ProjectCenterTargets,
} from "./projectCenter";

export type InitialStateTargets = {
  getEngineDocumentState: typeof getEngineDocumentState;
  getEngineStylePreset: typeof getEngineStylePreset;
  getPresetById: typeof getPresetById;
  preferences: StudioPreferenceTargets;
  projectCenter: Pick<ProjectCenterTargets, "getStorageItem">;
};

export function createInitialStateTargets(
  targets: InitialStateTargets,
): InitialStateTargets {
  return targets;
}

export function createGlobalInitialStateTargets(): InitialStateTargets {
  return createInitialStateTargets({
    getEngineDocumentState,
    getEngineStylePreset,
    getPresetById,
    preferences: createGlobalStudioPreferenceTargets(),
    projectCenter: createGlobalProjectCenterTargets(),
  });
}
