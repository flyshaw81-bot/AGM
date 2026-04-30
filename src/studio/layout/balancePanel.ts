import type { EditorAction } from "../bridge/engineActionTypes";
import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage, StudioState } from "../types";
import { renderAutoFixDraftsSection } from "./balancePanelAutoFixDraftSection";
import { renderBiomeRuleMetadataSection } from "./balancePanelBiomeSection";
import {
  renderGeneratorProfileImpact,
  renderGeneratorProfileSuggestions,
} from "./balancePanelGeneratorSections";
import { renderBalanceHintDrillDownSection } from "./balancePanelHintSection";
import { getBalancePanelSummary } from "./balancePanelModel";
import { renderBalancePanelOverview } from "./balancePanelOverviewSection";
import { renderSpawnDrillDownSection } from "./balancePanelSpawnSection";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

export function renderBalanceChecker(
  draft: WorldDraftPreview,
  editorAvailability: Record<EditorAction, boolean>,
  previewState: StudioState["autoFixPreview"],
  language: StudioLanguage,
) {
  const { playability } = draft;
  const summary = getBalancePanelSummary(
    playability,
    draft.resources,
    previewState,
  );

  return `
    <section id="studioBalanceCheckerPanel" class="studio-panel">
      ${renderBalancePanelOverview(playability, previewState, summary, language)}
      ${renderGeneratorProfileSuggestions(playability.generatorProfileSuggestions, language)}
      ${renderGeneratorProfileImpact(playability.generationProfileImpact, language)}
      ${renderBiomeRuleMetadataSection(summary.biomeRuleSummary, language)}
      ${renderSpawnDrillDownSection(summary.topCandidates, editorAvailability, language)}
      ${renderBalanceHintDrillDownSection(playability.balanceHints, editorAvailability, language)}
      ${renderAutoFixDraftsSection(playability.autoFixDrafts, editorAvailability, previewState, language)}
    </section>
  `;
}
