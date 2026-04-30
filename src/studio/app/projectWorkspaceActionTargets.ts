import {
  setEngineAutosaveInterval,
  setEngineCultureSet,
  setEngineLatitude,
  setEngineLayersPreset,
  setEngineLongitude,
  setEngineMapSize,
  setEnginePendingBurgs,
  setEnginePendingCanvasSize,
  setEnginePendingCultures,
  setEnginePendingGrowthRate,
  setEnginePendingPoints,
  setEnginePendingProvincesRatio,
  setEnginePendingReligions,
  setEnginePendingSeed,
  setEnginePendingSizeVariety,
  setEnginePendingStates,
  setEnginePendingTemplate,
  setEnginePrecipitation,
  setEngineStateLabelsMode,
  setEngineTemperatureEquator,
  setEngineTemperatureNorthPole,
  setEngineTemperatureSouthPole,
  setEngineWindTier0,
  setEngineWindTier1,
  setEngineWindTier2,
  setEngineWindTier3,
  setEngineWindTier4,
  setEngineWindTier5,
  syncEngineProjectSummary,
} from "../bridge/engineActions";
import { setEngineDocumentName } from "../bridge/engineMapHost";

export type ProjectWorkspaceNumberSetter = (value: number) => void;
export type ProjectWorkspaceStringSetter = (value: string) => void;

export type ProjectWorkspaceActionTargets = {
  numberSetters: Record<string, ProjectWorkspaceNumberSetter>;
  stringSetters: Record<string, ProjectWorkspaceStringSetter>;
  setDocumentName: (value: string) => string;
  setCanvasSize: (dimension: "width" | "height", value: number) => void;
  setAutosaveInterval: (value: number) => void;
  syncProjectSummary: () => Promise<unknown> | unknown;
};

export function createProjectWorkspaceActionTargets(
  targets: ProjectWorkspaceActionTargets,
): ProjectWorkspaceActionTargets {
  return targets;
}

export function createGlobalProjectWorkspaceActionTargets(): ProjectWorkspaceActionTargets {
  return createProjectWorkspaceActionTargets({
    numberSetters: {
      burgs: setEnginePendingBurgs,
      cultures: setEnginePendingCultures,
      "growth-rate": setEnginePendingGrowthRate,
      latitude: setEngineLatitude,
      longitude: setEngineLongitude,
      "map-size": setEngineMapSize,
      points: setEnginePendingPoints,
      precipitation: setEnginePrecipitation,
      "provinces-ratio": setEnginePendingProvincesRatio,
      religions: setEnginePendingReligions,
      "size-variety": setEnginePendingSizeVariety,
      states: setEnginePendingStates,
      "temperature-equator": setEngineTemperatureEquator,
      "temperature-north-pole": setEngineTemperatureNorthPole,
      "temperature-south-pole": setEngineTemperatureSouthPole,
      "wind-tier-0": setEngineWindTier0,
      "wind-tier-1": setEngineWindTier1,
      "wind-tier-2": setEngineWindTier2,
      "wind-tier-3": setEngineWindTier3,
      "wind-tier-4": setEngineWindTier4,
      "wind-tier-5": setEngineWindTier5,
    },
    stringSetters: {
      "culture-set": setEngineCultureSet,
      "layers-preset": setEngineLayersPreset,
      seed: setEnginePendingSeed,
      "state-labels-mode": setEngineStateLabelsMode,
      template: setEnginePendingTemplate,
    },
    setDocumentName: setEngineDocumentName,
    setCanvasSize: setEnginePendingCanvasSize,
    setAutosaveInterval: setEngineAutosaveInterval,
    syncProjectSummary: syncEngineProjectSummary,
  });
}
