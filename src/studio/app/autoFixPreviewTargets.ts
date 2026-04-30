import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
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
import { createRuntimeBiomeWritebackTargets } from "../bridge/engineAutoFixBiomeTargets";
import { createRuntimeRouteWritebackTargets } from "../bridge/engineAutoFixRouteTargets";
import { createRuntimeSettlementWritebackTargets } from "../bridge/engineAutoFixSettlementTargets";
import { createRuntimeStateWritebackTargets } from "../bridge/engineAutoFixStateTargets";
import { createRuntimeAutoFixUndoTargets } from "../bridge/engineAutoFixUndoTargets";
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

export function createRuntimeAutoFixWritebackAdapter(
  context: EngineRuntimeContext,
): AutoFixWritebackAdapter {
  const stateTargets = createRuntimeStateWritebackTargets(context);
  const settlementTargets = createRuntimeSettlementWritebackTargets(context);
  const routeTargets = createRuntimeRouteWritebackTargets(context);
  const biomeTargets = createRuntimeBiomeWritebackTargets(context);
  const undoTargets = createRuntimeAutoFixUndoTargets(context);

  return {
    applyStatePreviewChanges: (changes) =>
      applyEngineStatePreviewChanges(changes, stateTargets),
    applySettlementPreviewChanges: (changes) =>
      applyEngineSettlementPreviewChanges(
        changes,
        undefined,
        settlementTargets,
      ),
    applyRoutePreviewChanges: (changes) =>
      applyEngineRoutePreviewChanges(
        changes,
        undefined,
        undefined,
        routeTargets,
      ),
    applyBiomePreviewChanges: (changes) =>
      applyEngineBiomePreviewChanges(changes, biomeTargets),
    undoWriteback: (writeback) =>
      undoEngineAutoFixWriteback(writeback, undefined, undefined, undoTargets),
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

export function createRuntimeAutoFixPreviewTargets(
  context: EngineRuntimeContext,
): AutoFixPreviewTargets {
  return createAutoFixPreviewTargets(
    createGlobalAutoFixProjectAdapter(),
    createGlobalAutoFixDraftAdapter(),
    createRuntimeAutoFixWritebackAdapter(context),
  );
}
