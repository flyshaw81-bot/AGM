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

export type AutoFixProjectAdapter = {
  getProjectSummary: () => EngineProjectSummary;
};

export type AutoFixDraftAdapter = {
  createWorldDraft: (
    state: StudioState,
    projectSummary: EngineProjectSummary,
  ) => WorldDocumentDraft;
};

export type AutoFixWritebackAdapter = {
  applyStatePreviewChanges: AutoFixPreviewTargets["applyStatePreviewChanges"];
  applySettlementPreviewChanges: AutoFixPreviewTargets["applySettlementPreviewChanges"];
  applyRoutePreviewChanges: AutoFixPreviewTargets["applyRoutePreviewChanges"];
  applyBiomePreviewChanges: AutoFixPreviewTargets["applyBiomePreviewChanges"];
  undoWriteback: AutoFixPreviewTargets["undoWriteback"];
};

export function createGlobalAutoFixProjectAdapter(): AutoFixProjectAdapter {
  return {
    getProjectSummary: getEngineProjectSummary,
  };
}

export function createGlobalAutoFixDraftAdapter(): AutoFixDraftAdapter {
  return {
    createWorldDraft: createWorldDocumentDraft,
  };
}

export function createGlobalAutoFixWritebackAdapter(): AutoFixWritebackAdapter {
  return {
    applyStatePreviewChanges: applyEngineStatePreviewChanges,
    applySettlementPreviewChanges: applyEngineSettlementPreviewChanges,
    applyRoutePreviewChanges: applyEngineRoutePreviewChanges,
    applyBiomePreviewChanges: applyEngineBiomePreviewChanges,
    undoWriteback: undoEngineAutoFixWriteback,
  };
}

export function createAutoFixPreviewTargets(
  projectAdapter: AutoFixProjectAdapter,
  draftAdapter: AutoFixDraftAdapter,
  writebackAdapter: AutoFixWritebackAdapter,
): AutoFixPreviewTargets {
  return {
    getProjectSummary: projectAdapter.getProjectSummary,
    createWorldDraft: draftAdapter.createWorldDraft,
    applyStatePreviewChanges: writebackAdapter.applyStatePreviewChanges,
    applySettlementPreviewChanges:
      writebackAdapter.applySettlementPreviewChanges,
    applyRoutePreviewChanges: writebackAdapter.applyRoutePreviewChanges,
    applyBiomePreviewChanges: writebackAdapter.applyBiomePreviewChanges,
    undoWriteback: writebackAdapter.undoWriteback,
  };
}

export function createGlobalAutoFixPreviewTargets(): AutoFixPreviewTargets {
  return createAutoFixPreviewTargets(
    createGlobalAutoFixProjectAdapter(),
    createGlobalAutoFixDraftAdapter(),
    createGlobalAutoFixWritebackAdapter(),
  );
}
