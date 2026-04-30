import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage } from "../types";
import { renderReferenceList } from "./balancePanelHelpers";
import { localizeGeneratedText } from "./generatedText";
import { escapeHtml } from "./shellShared";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

export function renderGeneratorProfileSuggestions(
  suggestions: WorldDraftPreview["playability"]["generatorProfileSuggestions"],
  language: StudioLanguage,
) {
  return `
    <div id="studioGeneratorProfileSuggestions">
      <div class="studio-panel__eyebrow">Profile generator suggestions</div>
      <div class="studio-balance-list">
        ${suggestions
          .map(
            (suggestion) => `
          <article class="studio-balance-card" data-generator-suggestion-id="${escapeHtml(suggestion.id)}">
            <div class="studio-balance-card__title">${escapeHtml(suggestion.target)} - ${escapeHtml(suggestion.priorityId)} - weight ${suggestion.weight}</div>
            <div class="studio-panel__text">${escapeHtml(localizeGeneratedText(suggestion.recommendation, language))}</div>
            <div class="studio-balance-card__refs">
              <label class="studio-stack-field">
                <span>${escapeHtml(suggestion.parameterDraft.label)} (${escapeHtml(suggestion.parameterDraft.unit)})</span>
                <input class="studio-input" data-generator-parameter-key="${escapeHtml(suggestion.parameterDraft.key)}" type="number" step="0.05" value="${escapeHtml(String(suggestion.parameterDraft.value))}" />
              </label>
              <span>source: ${escapeHtml(suggestion.parameterDraft.source)}</span>
              <span>override: ${suggestion.parameterDraft.overridden ? "custom" : "profile default"}</span>
            </div>
            ${renderReferenceList(suggestion.refs)}
          </article>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderGeneratorProfileImpact(
  impact: WorldDraftPreview["playability"]["generationProfileImpact"],
  _language?: StudioLanguage,
) {
  const hasParameterChanges = Boolean(impact?.changes.length);
  const hasResultMetrics = Boolean(impact?.resultMetrics.length);

  return `
    <div id="studioGenerationProfileImpact">
      <div class="studio-panel__eyebrow">Profile generation impact</div>
      ${
        hasParameterChanges
          ? `<div class="studio-balance-list">
            ${impact!.changes
              .map(
                (change) => `
              <article class="studio-balance-card" data-generation-impact-key="${escapeHtml(change.key)}">
                <div class="studio-balance-card__title">${escapeHtml(change.key)} &rarr; ${escapeHtml(change.target)}</div>
                <div class="studio-panel__text">Applied ${escapeHtml(impact!.profile)} profile parameters before generation.</div>
                <div class="studio-balance-card__refs">
                  <span>before: ${change.before === null ? "-" : escapeHtml(String(change.before))}</span>
                  <span>after: ${escapeHtml(String(change.after))}</span>
                </div>
              </article>
            `,
              )
              .join("")}
          </div>`
          : `<div class="studio-panel__text">No profile override impact has been applied to generation yet.</div>`
      }
      ${
        hasResultMetrics
          ? `<div class="studio-panel__eyebrow">Result metrics</div>
          <div class="studio-balance-list">
            ${impact!.resultMetrics
              .map(
                (metric) => `
              <article class="studio-balance-card" data-generation-result-metric="${escapeHtml(metric.key)}">
                <div class="studio-balance-card__title">${escapeHtml(metric.key)}</div>
                <div class="studio-panel__text">Generation result sampled before and after the ${escapeHtml(impact!.profile)} override run.</div>
                <div class="studio-balance-card__refs">
                  <span>before: ${escapeHtml(String(metric.before))}</span>
                  <span>after: ${escapeHtml(String(metric.after))}</span>
                  <span>delta: ${escapeHtml(String(metric.delta))}</span>
                </div>
              </article>
            `,
              )
              .join("")}
          </div>`
          : ""
      }
    </div>
  `;
}
