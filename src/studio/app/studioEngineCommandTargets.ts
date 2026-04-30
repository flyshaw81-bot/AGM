import type {
  DataAction,
  LayerAction,
  TopbarAction,
} from "../bridge/engineActions";
import {
  runEngineDataAction,
  runEngineLayersPresetAction,
  runEngineTopbarAction,
  toggleEngineLayer,
} from "../bridge/engineActions";
import {
  exportWithEngine,
  setEngineExportSetting,
} from "../bridge/engineExport";
import type {
  EngineExportFormat,
  EngineExportSetting,
} from "../bridge/engineExportTargets";
import { markEngineDocumentClean } from "../bridge/engineMapHost";
import {
  applyEngineStylePreset,
  getEngineStyleSettings,
  setEngineStyleToggle,
} from "../bridge/engineStyle";
import type { StudioState } from "../types";
import { syncDocumentState } from "./documentState";
import {
  applyGenerationProfileOverridesToEngineSettings,
  createGenerationProfileResultMetrics,
  createGenerationProfileResultSample,
} from "./generationProfile";
import { updateProjectCenterState } from "./projectCenter";

export type StudioStyleToggleAction = "hide-labels" | "rescale-labels";
export type StudioLayersPresetAction = "save" | "remove";

export type StudioEngineCommandTargets = {
  applyStylePreset: (preset: string) => void;
  getStyleSettings: typeof getEngineStyleSettings;
  setStyleToggle: (action: StudioStyleToggleAction, enabled: boolean) => void;
  setExportSetting: (setting: EngineExportSetting, value: number) => void;
  exportWithEngine: (format: EngineExportFormat) => void;
  runTopbarAction: (action: TopbarAction) => Promise<void>;
  toggleLayer: (action: LayerAction) => void;
  runDataAction: (action: DataAction) => Promise<void>;
  runLayersPresetAction: (action: StudioLayersPresetAction) => void;
  markDocumentClean: () => void;
  updateProjectCenter: (
    state: StudioState,
    options?: { saved?: boolean; exportReady?: boolean },
  ) => void;
  syncDocument: (state: StudioState) => void;
  applyGenerationProfileOverrides: (state: StudioState) => void;
  createGenerationProfileResultSample: typeof createGenerationProfileResultSample;
  createGenerationProfileResultMetrics: typeof createGenerationProfileResultMetrics;
};

export function createGlobalStudioEngineCommandTargets(): StudioEngineCommandTargets {
  return {
    applyStylePreset: applyEngineStylePreset,
    getStyleSettings: getEngineStyleSettings,
    setStyleToggle: setEngineStyleToggle,
    setExportSetting: setEngineExportSetting,
    exportWithEngine,
    runTopbarAction: runEngineTopbarAction,
    toggleLayer: toggleEngineLayer,
    runDataAction: runEngineDataAction,
    runLayersPresetAction: runEngineLayersPresetAction,
    markDocumentClean: markEngineDocumentClean,
    updateProjectCenter: updateProjectCenterState,
    syncDocument: syncDocumentState,
    applyGenerationProfileOverrides:
      applyGenerationProfileOverridesToEngineSettings,
    createGenerationProfileResultSample,
    createGenerationProfileResultMetrics,
  };
}
