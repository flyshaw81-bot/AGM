import type {
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
  EngineProjectSummary,
} from "../bridge/engineActions";
import {
  applyEngineBiomePreviewChanges,
  applyEngineRoutePreviewChanges,
  applyEngineSettlementPreviewChanges,
  applyEngineStatePreviewChanges,
  getEngineProjectSummary,
  undoEngineAutoFixWriteback,
} from "../bridge/engineActions";
import {
  createWorldDocumentDraft,
  type WorldDocumentDraft,
} from "../state/worldDocumentDraft";
import type { StudioState } from "../types";

export type AutoFixPreviewTargets = {
  getProjectSummary: () => EngineProjectSummary;
  createWorldDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => WorldDocumentDraft;
  applyStatePreviewChanges: (
    changes: EngineAutoFixPreviewChange[],
  ) => EngineAutoFixWritebackResult;
  applySettlementPreviewChanges: (
    changes: EngineAutoFixPreviewChange[],
  ) => EngineAutoFixWritebackResult;
  applyRoutePreviewChanges: (
    changes: EngineAutoFixPreviewChange[],
  ) => EngineAutoFixWritebackResult;
  applyBiomePreviewChanges: (
    changes: EngineAutoFixPreviewChange[],
  ) => EngineAutoFixWritebackResult;
  undoWriteback: (writeback?: EngineAutoFixWritebackResult) => void;
};

export function createGlobalAutoFixPreviewTargets(): AutoFixPreviewTargets {
  return {
    getProjectSummary: getEngineProjectSummary,
    createWorldDraft: createWorldDocumentDraft,
    applyStatePreviewChanges: applyEngineStatePreviewChanges,
    applySettlementPreviewChanges: applyEngineSettlementPreviewChanges,
    applyRoutePreviewChanges: applyEngineRoutePreviewChanges,
    applyBiomePreviewChanges: applyEngineBiomePreviewChanges,
    undoWriteback: undoEngineAutoFixWriteback,
  };
}
