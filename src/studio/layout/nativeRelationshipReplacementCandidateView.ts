import type { StudioLanguage } from "../types";
import { renderDirectRelationshipReplacementCandidateAttributes } from "./nativeRelationshipDataAttributes";
import type { RelationshipReplacementCandidate } from "./nativeRelationshipIssueTypes";
import { escapeHtml, t } from "./shellShared";

export function renderDirectRelationshipReplacementCandidate(
  candidate: RelationshipReplacementCandidate,
  language: StudioLanguage,
) {
  return `<span class="studio-direct-workbench-directory__issue-candidate-wrap" data-candidate-rank="${candidate.rank}" data-candidate-recommended="${candidate.recommended}"><button class="studio-ghost studio-direct-workbench-directory__issue-candidate" ${renderDirectRelationshipReplacementCandidateAttributes(candidate)}>${candidate.recommended ? `<span class="studio-direct-workbench-directory__issue-candidate-badge" data-direct-relationship-candidate-badge="true">${t(language, "推荐", "Recommended")}</span>` : ""}${escapeHtml(candidate.label)}</button><small class="studio-direct-workbench-directory__issue-candidate-preview" data-direct-relationship-candidate-preview="true"><strong>${escapeHtml(candidate.previewField)}</strong><code>${escapeHtml(candidate.previewCurrent)} → ${escapeHtml(candidate.previewTarget)}</code><em data-direct-relationship-candidate-reason="true">#${candidate.rank} · ${escapeHtml(candidate.reason)}</em></small></span>`;
}

export const renderNativeRelationshipReplacementCandidate =
  renderDirectRelationshipReplacementCandidate;
