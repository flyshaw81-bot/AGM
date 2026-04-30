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

export type GenerationProfileTargets = {
  getProjectSummary: () => EngineProjectSummary;
  createWorldDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => WorldDocumentDraft;
  setPendingStates: (value: number) => void;
  setPendingBurgs: (value: number) => void;
  setPendingGrowthRate: (value: number) => void;
  setPendingSizeVariety: (value: number) => void;
  setPendingProvincesRatio: (value: number) => void;
  now: () => number;
};

export function createGlobalGenerationProfileTargets(): GenerationProfileTargets {
  return {
    getProjectSummary: getEngineProjectSummary,
    createWorldDraft: createWorldDocumentDraft,
    setPendingStates: setEnginePendingStates,
    setPendingBurgs: setEnginePendingBurgs,
    setPendingGrowthRate: setEnginePendingGrowthRate,
    setPendingSizeVariety: setEnginePendingSizeVariety,
    setPendingProvincesRatio: setEnginePendingProvincesRatio,
    now: () => Date.now(),
  };
}
