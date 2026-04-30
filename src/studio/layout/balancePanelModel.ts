import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;
type PlayabilitySummary = WorldDraftPreview["playability"];

export function getAppliedPreviewSummary(
  appliedPreviewChanges: PlayabilitySummary["appliedPreviewChanges"],
  limit = 4,
) {
  const seenDraftIds = new Set<string>();

  return appliedPreviewChanges
    .filter((change) => {
      if (seenDraftIds.has(change.draftId)) return false;
      seenDraftIds.add(change.draftId);
      return true;
    })
    .slice(0, limit);
}

export function getBalancePanelSummary(
  playability: PlayabilitySummary,
  resources: WorldDraftPreview["resources"],
  previewState: StudioState["autoFixPreview"],
) {
  const biomeRuleSummary = resources.biomes
    .filter(
      (biome) =>
        biome.agmRuleWeight !== undefined || biome.agmResourceTag !== undefined,
    )
    .slice(0, 4);
  const warningCount = playability.balanceHints.filter(
    (hint) => hint.severity === "warning",
  ).length;
  const generationImpactCount =
    (playability.generationProfileImpact?.changes.length || 0) +
    (playability.generationProfileImpact?.resultMetrics.length || 0);

  return {
    appliedPreviewSummary: getAppliedPreviewSummary(
      playability.appliedPreviewChanges,
    ),
    biomeRuleSummary,
    generationImpactCount,
    lastHistoryEntry: previewState.undoStack.at(-1),
    nextRedoEntry: previewState.redoStack.at(-1),
    topCandidates: playability.spawnCandidates.slice(0, 3),
    topSpawn: playability.spawnCandidates[0],
    warningCount,
  };
}
