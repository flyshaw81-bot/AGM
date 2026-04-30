import type { EngineWorldResourceSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import type {
  AppliedAutoFixPreviewChange,
  AutoFixDraft,
} from "./worldDocumentDraftTypes";

function createManualBiomeRuleAppliedChanges(
  state: StudioState,
  resources: EngineWorldResourceSummary,
  appliedAtByDraft: Map<string, number>,
): AppliedAutoFixPreviewChange[] {
  return state.autoFixPreview.appliedDraftIds.flatMap((draftId) => {
    const match = /^manual-biome-rule-(\d+)$/u.exec(draftId);
    if (!match) return [];
    const biomeId = Number(match[1]);
    const biome = resources.biomes.find((item) => item.id === biomeId);
    if (!biome) return [];
    const currentHabitability =
      typeof biome.habitability === "number" ? biome.habitability : 50;
    return [
      {
        draftId,
        appliedAt: appliedAtByDraft.get(draftId) || 0,
        id: draftId,
        operation: "update",
        entity: "biome",
        summary: `Manual AGM rule metadata adjustment for ${biome.name}.`,
        refs: { biomes: [biomeId] },
        fields: {
          habitability: currentHabitability,
          previousHabitability: currentHabitability,
          agmRuleWeight: biome.agmRuleWeight ?? 1,
          agmResourceTag: biome.agmResourceTag ?? "starter-biome",
          tuningReason: "manual-biome-rule-adjustment",
        },
      } satisfies AppliedAutoFixPreviewChange,
    ];
  });
}

function createRulesPackImportAppliedChanges(
  state: StudioState,
  resources: EngineWorldResourceSummary,
  appliedAtByDraft: Map<string, number>,
): AppliedAutoFixPreviewChange[] {
  return state.autoFixPreview.undoStack.flatMap((entry) => {
    const rulesPackImportVersion = entry.rulesPackImportVersion;
    if (
      entry.action !== "apply" ||
      !state.autoFixPreview.appliedDraftIds.includes(entry.draftId) ||
      rulesPackImportVersion === undefined
    )
      return [];
    return (
      entry.engineWriteback?.updatedBiomes.flatMap((update) => {
        const biome = resources.biomes.find(
          (item) => item.id === update.biomeId,
        );
        if (!biome) return [];
        return [
          {
            draftId: entry.draftId,
            appliedAt: appliedAtByDraft.get(entry.draftId) || 0,
            id: `${entry.draftId}-biome-${update.biomeId}`,
            operation: "update",
            entity: "biome",
            summary: `Imported AGM Rules Pack v${rulesPackImportVersion} metadata for ${biome.name}.`,
            refs: { biomes: [update.biomeId] },
            fields: {
              habitability: update.nextHabitability,
              previousHabitability: update.previousHabitability,
              agmRuleWeight: update.nextAgmRuleWeight,
              agmResourceTag: update.nextAgmResourceTag,
              tuningReason: "rules-pack-import",
              rulesPackVersion: rulesPackImportVersion,
            },
          } satisfies AppliedAutoFixPreviewChange,
        ];
      }) || []
    );
  });
}

export function createAppliedPreviewChanges(
  autoFixDrafts: AutoFixDraft[],
  state: StudioState,
  resources: EngineWorldResourceSummary,
): AppliedAutoFixPreviewChange[] {
  const appliedAtByDraft = new Map<string, number>();
  state.autoFixPreview.undoStack.forEach((entry, index) => {
    if (
      entry.action === "apply" &&
      state.autoFixPreview.appliedDraftIds.includes(entry.draftId)
    )
      appliedAtByDraft.set(entry.draftId, index + 1);
  });

  return [
    ...autoFixDrafts.flatMap((draft) => {
      if (
        !state.autoFixPreview.appliedDraftIds.includes(draft.id) ||
        !draft.previewDiff
      )
        return [];
      const appliedAt = appliedAtByDraft.get(draft.id) || 0;
      return draft.previewDiff.changes.map((change) => ({
        ...change,
        draftId: draft.id,
        appliedAt,
      }));
    }),
    ...createManualBiomeRuleAppliedChanges(state, resources, appliedAtByDraft),
    ...createRulesPackImportAppliedChanges(state, resources, appliedAtByDraft),
  ];
}
