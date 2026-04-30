import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage, StudioState } from "../types";
import type { getBalancePanelSummary } from "./balancePanelModel";
import { escapeHtml, t } from "./shellShared";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;
type BalancePanelSummary = ReturnType<typeof getBalancePanelSummary>;

export function renderBalancePanelOverview(
  playability: WorldDraftPreview["playability"],
  previewState: StudioState["autoFixPreview"],
  summary: BalancePanelSummary,
  language: StudioLanguage,
) {
  const {
    spawnCandidates,
    balanceHints,
    autoFixDrafts,
    appliedPreviewChanges,
    generatorProfileSuggestions,
  } = playability;
  const {
    appliedPreviewSummary,
    generationImpactCount,
    lastHistoryEntry,
    nextRedoEntry,
    topSpawn,
    warningCount,
  } = summary;

  return `
      <div class="studio-panel__eyebrow">${t(language, "AGM 可玩性", "AGM Playability")}</div>
      <h2 class="studio-panel__title">${t(language, "AGM 平衡检查器", "AGM Balance Checker")}</h2>
      <div class="studio-kv"><span>${t(language, "出生候选点", "Spawn candidates")}</span><strong>${spawnCandidates.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "平衡提示", "Balance hints")}</span><strong>${balanceHints.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "自动修复草稿", "Auto-fix drafts")}</span><strong>${autoFixDrafts.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "类型建议", "Profile suggestions")}</span><strong>${generatorProfileSuggestions.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "类型影响", "Profile impacts")}</span><strong>${generationImpactCount}</strong></div>
      <div class="studio-kv"><span>${t(language, "已应用预览", "Applied previews")}</span><strong>${previewState.appliedDraftIds.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "已应用变更", "Applied changes")}</span><strong>${appliedPreviewChanges.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "已丢弃预览", "Discarded previews")}</span><strong>${previewState.discardedDraftIds.length}</strong></div>
      <div class="studio-kv"><span>${t(language, "警告", "Warnings")}</span><strong>${warningCount}</strong></div>
      <div class="studio-kv"><span>${t(language, "最高出生评分", "Top spawn score")}</span><strong>${topSpawn ? `${topSpawn.score}/100` : "-"}</strong></div>
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="auto-fix-history" data-value="undo"${lastHistoryEntry ? "" : " disabled"}>${t(language, "撤销预览", "Undo preview")}</button>
        <button class="studio-ghost" data-studio-action="auto-fix-history" data-value="redo"${nextRedoEntry ? "" : " disabled"}>${t(language, "重做预览", "Redo preview")}</button>
      </div>
      <div class="studio-panel__text">${t(language, "历史", "History")}: ${lastHistoryEntry ? `${escapeHtml(lastHistoryEntry.action)} ${escapeHtml(lastHistoryEntry.draftId)} · ${lastHistoryEntry.changeCount} ${t(language, "项变更", "changes")}` : t(language, "尚未应用预览变更", "No preview changes applied")}</div>
      <div class="studio-panel__text">${t(language, "已应用变更队列", "Applied change queue")}: ${appliedPreviewSummary.length ? appliedPreviewSummary.map((change) => `${escapeHtml(change.draftId)} -> ${escapeHtml(change.operation)} ${escapeHtml(change.entity)} ${escapeHtml(change.id)}`).join("; ") : t(language, "没有待应用的变更", "No pending changes to apply")}</div>
    `;
}
