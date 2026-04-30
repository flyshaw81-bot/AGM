import type { EngineAutoFixPreviewChange } from "../bridge/engineActionTypes";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  type AutoFixPreviewTargets,
  createGlobalAutoFixPreviewTargets,
} from "./autoFixPreviewTargets";

function setAutoFixPreviewMembership(
  values: string[],
  draftId: string,
  included: boolean,
) {
  const nextValues = values.filter((value) => value !== draftId);
  if (included) nextValues.push(draftId);
  return nextValues;
}

function createEngineAutoFixWriteback(
  state: StudioState,
  draftId: string,
  targets: AutoFixPreviewTargets,
) {
  const projectSummary = targets.getProjectSummary();
  const worldDraft = targets.createWorldDraft(state, projectSummary);
  const draft = worldDraft.playability.autoFixDrafts.find(
    (item) => item.id === draftId,
  );
  if (!draft?.previewDiff) return undefined;
  if (draft.category === "spawn")
    return targets.applyStatePreviewChanges(draft.previewDiff.changes);
  if (draft.category === "settlement")
    return targets.applySettlementPreviewChanges(draft.previewDiff.changes);
  if (draft.category === "connectivity")
    return targets.applyRoutePreviewChanges(draft.previewDiff.changes);
  if (draft.category === "habitability")
    return targets.applyBiomePreviewChanges(draft.previewDiff.changes);
  return undefined;
}

export function applyAutoFixPreviewAction(
  state: StudioState,
  draftId: string,
  action: "apply" | "discard",
  changeCount: number,
  targets: AutoFixPreviewTargets = createGlobalAutoFixPreviewTargets(),
) {
  const engineWriteback =
    action === "apply"
      ? createEngineAutoFixWriteback(state, draftId, targets)
      : undefined;
  state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(
    state.autoFixPreview.appliedDraftIds,
    draftId,
    action === "apply",
  );
  state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(
    state.autoFixPreview.discardedDraftIds,
    draftId,
    action === "discard",
  );
  state.autoFixPreview.undoStack = [
    ...state.autoFixPreview.undoStack,
    { draftId, action, changeCount, engineWriteback },
  ];
  state.autoFixPreview.redoStack = [];
  state.document.source = "agm";
}

function createManualBiomeRuleChange(
  state: StudioState,
  biomeId: number,
  ruleWeight: number,
  resourceTag: string,
  targets: AutoFixPreviewTargets,
): EngineAutoFixPreviewChange | undefined {
  const projectSummary = targets.getProjectSummary();
  const worldDraft = targets.createWorldDraft(state, projectSummary);
  const biome = worldDraft.resources.biomes.find((item) => item.id === biomeId);
  if (!biome || !Number.isFinite(ruleWeight)) return undefined;
  const currentHabitability =
    typeof biome.habitability === "number" ? biome.habitability : 50;
  return {
    id: `manual-biome-rule-${biomeId}`,
    operation: "update",
    entity: "biome",
    summary: `Adjust ${biome.name} AGM rule metadata from Studio controls.`,
    refs: { biomes: [biomeId] },
    fields: {
      habitability: currentHabitability,
      previousHabitability: currentHabitability,
      agmRuleWeight: Number(ruleWeight.toFixed(2)),
      agmResourceTag: resourceTag,
      tuningReason: "manual-biome-rule-adjustment",
    },
  };
}

export function applyManualBiomeRuleAdjustment(
  state: StudioState,
  biomeId: number,
  ruleWeight: number,
  resourceTag: string,
  targets: AutoFixPreviewTargets = createGlobalAutoFixPreviewTargets(),
) {
  const change = createManualBiomeRuleChange(
    state,
    biomeId,
    ruleWeight,
    resourceTag,
    targets,
  );
  if (!change) return;
  const engineWriteback = targets.applyBiomePreviewChanges([change]);
  const draftId = `manual-biome-rule-${biomeId}`;
  state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(
    state.autoFixPreview.appliedDraftIds,
    draftId,
    true,
  );
  state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(
    state.autoFixPreview.discardedDraftIds,
    draftId,
    false,
  );
  state.autoFixPreview.undoStack = [
    ...state.autoFixPreview.undoStack,
    { draftId, action: "apply", changeCount: 1, engineWriteback },
  ];
  state.autoFixPreview.redoStack = [];
  state.document.source = "agm";
}

export function applyRulesPackDraft(
  state: StudioState,
  rules: WorldDocumentDraft["rules"],
  targets: AutoFixPreviewTargets = createGlobalAutoFixPreviewTargets(),
) {
  const changes = rules.biomeRules
    .map((rule) =>
      createManualBiomeRuleChange(
        state,
        rule.biomeId,
        rule.ruleWeight,
        rule.resourceTag,
        targets,
      ),
    )
    .filter((change): change is EngineAutoFixPreviewChange => Boolean(change));
  if (!changes.length) return;
  const engineWriteback = targets.applyBiomePreviewChanges(changes);
  const draftId = `import-rules-pack-v${rules.version}`;
  state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(
    state.autoFixPreview.appliedDraftIds,
    draftId,
    true,
  );
  state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(
    state.autoFixPreview.discardedDraftIds,
    draftId,
    false,
  );
  state.autoFixPreview.undoStack = [
    ...state.autoFixPreview.undoStack,
    {
      draftId,
      action: "apply",
      changeCount: changes.length,
      engineWriteback,
      rulesPackImportVersion: rules.version,
    },
  ];
  state.autoFixPreview.redoStack = [];
  state.document.source = "agm";
}

export function undoAutoFixPreviewAction(
  state: StudioState,
  targets: AutoFixPreviewTargets = createGlobalAutoFixPreviewTargets(),
) {
  const entry = state.autoFixPreview.undoStack.at(-1);
  if (!entry) return;
  state.autoFixPreview.undoStack = state.autoFixPreview.undoStack.slice(0, -1);
  state.autoFixPreview.redoStack = [...state.autoFixPreview.redoStack, entry];
  if (entry.action === "apply") {
    targets.undoWriteback(entry.engineWriteback);
    state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(
      state.autoFixPreview.appliedDraftIds,
      entry.draftId,
      false,
    );
  } else {
    state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(
      state.autoFixPreview.discardedDraftIds,
      entry.draftId,
      false,
    );
  }
  state.document.source = "agm";
}

function createManualBiomeRuleWriteback(
  state: StudioState,
  draftId: string,
  engineWriteback:
    | ReturnType<AutoFixPreviewTargets["applyBiomePreviewChanges"]>
    | undefined,
  targets: AutoFixPreviewTargets,
) {
  const match = /^manual-biome-rule-(\d+)$/u.exec(draftId);
  if (!match) return undefined;
  const biomeId = Number(match[1]);
  const stored = engineWriteback?.updatedBiomes.at(-1);
  if (!Number.isFinite(biomeId) || !stored) return undefined;
  const change = createManualBiomeRuleChange(
    state,
    biomeId,
    stored.nextAgmRuleWeight,
    stored.nextAgmResourceTag,
    targets,
  );
  return change ? targets.applyBiomePreviewChanges([change]) : undefined;
}

export function redoAutoFixPreviewAction(
  state: StudioState,
  targets: AutoFixPreviewTargets = createGlobalAutoFixPreviewTargets(),
) {
  const entry = state.autoFixPreview.redoStack.at(-1);
  if (!entry) return;
  state.autoFixPreview.redoStack = state.autoFixPreview.redoStack.slice(0, -1);
  if (entry.action === "apply") {
    const engineWriteback =
      createManualBiomeRuleWriteback(
        state,
        entry.draftId,
        entry.engineWriteback,
        targets,
      ) ||
      createEngineAutoFixWriteback(state, entry.draftId, targets) ||
      entry.engineWriteback;
    const nextEntry = { ...entry, engineWriteback };
    state.autoFixPreview.undoStack = [
      ...state.autoFixPreview.undoStack,
      nextEntry,
    ];
    state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(
      state.autoFixPreview.appliedDraftIds,
      entry.draftId,
      true,
    );
    state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(
      state.autoFixPreview.discardedDraftIds,
      entry.draftId,
      false,
    );
  } else {
    state.autoFixPreview.undoStack = [...state.autoFixPreview.undoStack, entry];
    state.autoFixPreview.discardedDraftIds = setAutoFixPreviewMembership(
      state.autoFixPreview.discardedDraftIds,
      entry.draftId,
      true,
    );
    state.autoFixPreview.appliedDraftIds = setAutoFixPreviewMembership(
      state.autoFixPreview.appliedDraftIds,
      entry.draftId,
      false,
    );
  }
  state.document.source = "agm";
}
