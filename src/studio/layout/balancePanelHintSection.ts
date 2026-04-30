import type { EditorAction } from "../bridge/engineActionTypes";
import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage } from "../types";
import {
  getBalanceHintEditorAction,
  renderEditorEntry,
  renderReferenceFocusButtons,
  renderReferenceList,
} from "./balancePanelHelpers";
import { localizeGeneratedText } from "./generatedText";
import { escapeHtml, t } from "./shellShared";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

export function renderBalanceHintDrillDownSection(
  balanceHints: WorldDraftPreview["playability"]["balanceHints"],
  editorAvailability: Record<EditorAction, boolean>,
  language: StudioLanguage,
) {
  return `
      <div class="studio-panel__eyebrow">${t(language, "平衡提示下钻", "Balance hint drill-down")}</div>
      <div class="studio-balance-list">
        ${balanceHints
          .map((hint) => {
            const editorAction = getBalanceHintEditorAction(hint.category);
            return `
              <article class="studio-balance-card studio-balance-card--${hint.severity}">
                <div class="studio-balance-card__title">${escapeHtml(hint.category)} · ${escapeHtml(hint.severity)}</div>
                <div class="studio-panel__text">${escapeHtml(localizeGeneratedText(hint.message, language))}</div>
                ${renderReferenceList(hint.refs, language)}
                <div class="studio-panel__actions">
                  ${renderReferenceFocusButtons(hint.refs, hint.id, language)}
                  ${renderEditorEntry(editorAction, editorAvailability, undefined, language)}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
}
