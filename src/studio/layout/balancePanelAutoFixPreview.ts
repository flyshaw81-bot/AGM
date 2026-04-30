import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage } from "../types";
import { renderReferenceList } from "./balancePanelHelpers";
import { localizeGeneratedText } from "./generatedText";
import { escapeHtml } from "./shellShared";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

export function renderAutoFixPreviewDiff(
  diff:
    | WorldDraftPreview["playability"]["autoFixDrafts"][number]["previewDiff"]
    | undefined,
  language: StudioLanguage,
) {
  if (!diff) return "";

  return `
    <div class="studio-panel__eyebrow">Dry-run preview diff</div>
    <div class="studio-balance-preview">
      <div class="studio-kv"><span>Mode</span><strong>${escapeHtml(diff.mode)}</strong></div>
      <div class="studio-panel__text">${escapeHtml(localizeGeneratedText(diff.title, language))} - ${diff.changes.length} planned changes</div>
      <div class="studio-balance-list">
        ${diff.changes
          .map(
            (change) => `
              <div class="studio-balance-change">
                <div class="studio-balance-card__title">${escapeHtml(change.operation)} ${escapeHtml(change.entity)} - ${escapeHtml(change.id)}</div>
                <div class="studio-panel__text">${escapeHtml(localizeGeneratedText(change.summary, language))}</div>
                ${renderReferenceList(change.refs)}
                ${
                  change.fields
                    ? `<div class="studio-balance-card__refs">${Object.entries(
                        change.fields,
                      )
                        .map(
                          ([key, value]) =>
                            `<span>${escapeHtml(key)}: ${escapeHtml(String(value))}</span>`,
                        )
                        .join("")}</div>`
                    : ""
                }
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}
