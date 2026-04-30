import type { EngineProjectSummary } from "../bridge/engineActions";
import {
  getEngineProjectSummary,
  setEnginePendingBurgs,
  setEnginePendingGrowthRate,
  setEnginePendingProvincesRatio,
  setEnginePendingSizeVariety,
  setEnginePendingStates,
} from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";

export type GenerationProfileSummaryAdapter = {
  getProjectSummary: () => EngineProjectSummary;
};

export type GenerationProfileDraftAdapter = {
  createWorldDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => WorldDocumentDraft;
};

export type GenerationProfileSettingsAdapter = {
  setPendingStates: (value: number) => void;
  setPendingBurgs: (value: number) => void;
  setPendingGrowthRate: (value: number) => void;
  setPendingSizeVariety: (value: number) => void;
  setPendingProvincesRatio: (value: number) => void;
};

export type GenerationProfileClockAdapter = {
  now: () => number;
};

export type GenerationProfileTargets = GenerationProfileSummaryAdapter &
  GenerationProfileDraftAdapter &
  GenerationProfileSettingsAdapter &
  GenerationProfileClockAdapter;

export function createGlobalGenerationProfileSummaryAdapter(): GenerationProfileSummaryAdapter {
  return {
    getProjectSummary: getEngineProjectSummary,
  };
}

export function createGlobalGenerationProfileDraftAdapter(): GenerationProfileDraftAdapter {
  return {
    createWorldDraft: createWorldDocumentDraft,
  };
}

export function createGlobalGenerationProfileSettingsAdapter(): GenerationProfileSettingsAdapter {
  return {
    setPendingStates: setEnginePendingStates,
    setPendingBurgs: setEnginePendingBurgs,
    setPendingGrowthRate: setEnginePendingGrowthRate,
    setPendingSizeVariety: setEnginePendingSizeVariety,
    setPendingProvincesRatio: setEnginePendingProvincesRatio,
  };
}

export function createGlobalGenerationProfileClockAdapter(): GenerationProfileClockAdapter {
  return {
    now: () => Date.now(),
  };
}

export function createGenerationProfileTargets(
  summary: GenerationProfileSummaryAdapter,
  draft: GenerationProfileDraftAdapter,
  settings: GenerationProfileSettingsAdapter,
  clock: GenerationProfileClockAdapter,
): GenerationProfileTargets {
  return {
    getProjectSummary: summary.getProjectSummary,
    createWorldDraft: draft.createWorldDraft,
    setPendingStates: settings.setPendingStates,
    setPendingBurgs: settings.setPendingBurgs,
    setPendingGrowthRate: settings.setPendingGrowthRate,
    setPendingSizeVariety: settings.setPendingSizeVariety,
    setPendingProvincesRatio: settings.setPendingProvincesRatio,
    now: clock.now,
  };
}

export function createGlobalGenerationProfileTargets(): GenerationProfileTargets {
  return createGenerationProfileTargets(
    createGlobalGenerationProfileSummaryAdapter(),
    createGlobalGenerationProfileDraftAdapter(),
    createGlobalGenerationProfileSettingsAdapter(),
    createGlobalGenerationProfileClockAdapter(),
  );
}
