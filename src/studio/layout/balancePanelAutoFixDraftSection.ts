import type { EditorAction } from "../bridge/engineActionTypes";
import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage, StudioState } from "../types";
import { renderAutoFixPreviewDiff } from "./balancePanelAutoFixPreview";
import {
  getBalanceHintEditorAction,
  renderAutoFixTargetButton,
  renderEditorEntry,
  renderReferenceList,
} from "./balancePanelHelpers";
import { localizeGeneratedText } from "./generatedText";
import { escapeHtml, t } from "./shellShared";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

export function renderAutoFixDraftsSection(
  autoFixDrafts: WorldDraftPreview["playability"]["autoFixDrafts"],
  editorAvailability: Record<EditorAction, boolean>,
  previewState: StudioState["autoFixPreview"],
  language: StudioLanguage,
) {
  return `
      <div class="studio-panel__eyebrow">${t(language, "AGM 自动修复草稿", "AGM auto-fix drafts")}</div>
      <div class="studio-balance-list">
        ${autoFixDrafts
          .map((autoFixDraft) => {
            const editorAction = getBalanceHintEditorAction(
              autoFixDraft.category,
            );
            const isApplied = previewState.appliedDraftIds.includes(
              autoFixDraft.id,
            );
            const isDiscarded = previewState.discardedDraftIds.includes(
              autoFixDraft.id,
            );
            const previewStatus = isApplied
              ? "applied"
              : isDiscarded
                ? "discarded"
                : "pending";
            const previewChangeCount =
              autoFixDraft.previewDiff?.changes.length || 0;
            return `
              <article class="studio-balance-card studio-balance-card--draft" data-auto-fix-draft-id="${escapeHtml(autoFixDraft.id)}" data-preview-status="${previewStatus}">
                <div class="studio-balance-card__title">${escapeHtml(autoFixDraft.action)} · ${escapeHtml(autoFixDraft.status)}</div>
                <div class="studio-kv"><span>${t(language, "预览状态", "Preview status")}</span><strong>${previewStatus}</strong></div>
                <div class="studio-panel__text">${escapeHtml(localizeGeneratedText(autoFixDraft.summary, language))}</div>
                ${renderReferenceList(autoFixDraft.targetRefs, language)}
                <div class="studio-panel__eyebrow">${t(language, "建议步骤", "Suggested steps")}</div>
                <ul class="studio-balance-card__reasons">
                  ${autoFixDraft.steps.map((step) => `<li>${escapeHtml(localizeGeneratedText(step, language))}</li>`).join("")}
                </ul>
                <div class="studio-panel__eyebrow">${t(language, "风险", "Risks")}</div>
                <ul class="studio-balance-card__reasons">
                  ${autoFixDraft.risks.map((risk) => `<li>${escapeHtml(localizeGeneratedText(risk, language))}</li>`).join("")}
                </ul>
                ${renderAutoFixPreviewDiff(autoFixDraft.previewDiff, language)}
                <div class="studio-panel__actions">
                  ${renderAutoFixTargetButton(autoFixDraft.targetRefs, autoFixDraft.id, language)}
                  <button class="studio-ghost studio-ghost--primary" data-studio-action="auto-fix-preview" data-value="apply" data-draft-id="${escapeHtml(autoFixDraft.id)}" data-change-count="${previewChangeCount}"${autoFixDraft.previewDiff && !isApplied ? "" : " disabled"}>${t(language, "应用预览", "Apply preview")}</button>
                  <button class="studio-ghost" data-studio-action="auto-fix-preview" data-value="discard" data-draft-id="${escapeHtml(autoFixDraft.id)}" data-change-count="${previewChangeCount}"${autoFixDraft.previewDiff && !isDiscarded ? "" : " disabled"}>${t(language, "丢弃预览", "Discard preview")}</button>
                  ${renderEditorEntry(editorAction, editorAvailability, t(language, "检查草稿目标", "Review draft target"), language)}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
}
