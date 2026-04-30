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
import type { GameWorldProfile, StudioState } from "../types";

const ENGINE_NUMBER_WORKSPACE_SETTERS: Record<string, (value: number) => void> =
  {
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
  };

const ENGINE_STRING_WORKSPACE_SETTERS: Record<string, (value: string) => void> =
  {
    "culture-set": setEngineCultureSet,
    "layers-preset": setEngineLayersPreset,
    seed: setEnginePendingSeed,
    "state-labels-mode": setEngineStateLabelsMode,
    template: setEnginePendingTemplate,
  };

export async function applyProjectWorkspaceChange(
  state: StudioState,
  action: string,
  value: string,
) {
  const stringSetter = ENGINE_STRING_WORKSPACE_SETTERS[action];
  const numberSetter = ENGINE_NUMBER_WORKSPACE_SETTERS[action];

  if (stringSetter) {
    stringSetter(value);
  } else if (numberSetter) {
    numberSetter(Number(value));
  } else if (action === "document-name") {
    state.document.name = setEngineDocumentName(value);
    state.document.source = "agm";
  } else if (action === "game-profile") {
    state.document.gameProfile = value as GameWorldProfile;
    state.generationProfileOverrides = {
      profile: state.document.gameProfile,
      values: {},
    };
    state.document.source = "agm";
  } else if (action === "design-intent") {
    state.document.designIntent = value.trim();
    state.document.source = "agm";
  } else if (action === "width" || action === "height") {
    setEnginePendingCanvasSize(action, Number(value));
  } else {
    setEngineAutosaveInterval(Number(value));
  }

  await syncEngineProjectSummary();
}
