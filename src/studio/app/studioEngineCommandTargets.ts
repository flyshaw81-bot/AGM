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

export type StudioStyleCommandAdapter = {
  applyStylePreset: (preset: string) => void;
  getStyleSettings: typeof getEngineStyleSettings;
  setStyleToggle: (action: StudioStyleToggleAction, enabled: boolean) => void;
};

export type StudioExportCommandAdapter = {
  setExportSetting: (setting: EngineExportSetting, value: number) => void;
  exportWithEngine: (format: EngineExportFormat) => void;
};

export type StudioBridgeActionCommandAdapter = {
  runTopbarAction: (action: TopbarAction) => Promise<void>;
  toggleLayer: (action: LayerAction) => void;
  runDataAction: (action: DataAction) => Promise<void>;
  runLayersPresetAction: (action: StudioLayersPresetAction) => void;
};

export type StudioDocumentCommandAdapter = {
  markDocumentClean: () => void;
  updateProjectCenter: (
    state: StudioState,
    options?: { saved?: boolean; exportReady?: boolean },
  ) => void;
  syncDocument: (state: StudioState) => void;
};

export type StudioGenerationProfileCommandAdapter = {
  applyGenerationProfileOverrides: (state: StudioState) => void;
  createGenerationProfileResultSample: typeof createGenerationProfileResultSample;
  createGenerationProfileResultMetrics: typeof createGenerationProfileResultMetrics;
};

export function createGlobalStudioStyleCommandAdapter(): StudioStyleCommandAdapter {
  return {
    applyStylePreset: applyEngineStylePreset,
    getStyleSettings: getEngineStyleSettings,
    setStyleToggle: setEngineStyleToggle,
  };
}

export function createGlobalStudioExportCommandAdapter(): StudioExportCommandAdapter {
  return {
    setExportSetting: setEngineExportSetting,
    exportWithEngine,
  };
}

export function createGlobalStudioBridgeActionCommandAdapter(): StudioBridgeActionCommandAdapter {
  return {
    runTopbarAction: runEngineTopbarAction,
    toggleLayer: toggleEngineLayer,
    runDataAction: runEngineDataAction,
    runLayersPresetAction: runEngineLayersPresetAction,
  };
}

export function createGlobalStudioDocumentCommandAdapter(): StudioDocumentCommandAdapter {
  return {
    markDocumentClean: markEngineDocumentClean,
    updateProjectCenter: updateProjectCenterState,
    syncDocument: syncDocumentState,
  };
}

export function createGlobalStudioGenerationProfileCommandAdapter(): StudioGenerationProfileCommandAdapter {
  return {
    applyGenerationProfileOverrides:
      applyGenerationProfileOverridesToEngineSettings,
    createGenerationProfileResultSample,
    createGenerationProfileResultMetrics,
  };
}

export function createStudioEngineCommandTargets(
  styleAdapter: StudioStyleCommandAdapter,
  exportAdapter: StudioExportCommandAdapter,
  actionAdapter: StudioBridgeActionCommandAdapter,
  documentAdapter: StudioDocumentCommandAdapter,
  generationProfileAdapter: StudioGenerationProfileCommandAdapter,
): StudioEngineCommandTargets {
  return {
    applyStylePreset: styleAdapter.applyStylePreset,
    getStyleSettings: styleAdapter.getStyleSettings,
    setStyleToggle: styleAdapter.setStyleToggle,
    setExportSetting: exportAdapter.setExportSetting,
    exportWithEngine: exportAdapter.exportWithEngine,
    runTopbarAction: actionAdapter.runTopbarAction,
    toggleLayer: actionAdapter.toggleLayer,
    runDataAction: actionAdapter.runDataAction,
    runLayersPresetAction: actionAdapter.runLayersPresetAction,
    markDocumentClean: documentAdapter.markDocumentClean,
    updateProjectCenter: documentAdapter.updateProjectCenter,
    syncDocument: documentAdapter.syncDocument,
    applyGenerationProfileOverrides:
      generationProfileAdapter.applyGenerationProfileOverrides,
    createGenerationProfileResultSample:
      generationProfileAdapter.createGenerationProfileResultSample,
    createGenerationProfileResultMetrics:
      generationProfileAdapter.createGenerationProfileResultMetrics,
  };
}

export function createGlobalStudioEngineCommandTargets(): StudioEngineCommandTargets {
  return createStudioEngineCommandTargets(
    createGlobalStudioStyleCommandAdapter(),
    createGlobalStudioExportCommandAdapter(),
    createGlobalStudioBridgeActionCommandAdapter(),
    createGlobalStudioDocumentCommandAdapter(),
    createGlobalStudioGenerationProfileCommandAdapter(),
  );
}
