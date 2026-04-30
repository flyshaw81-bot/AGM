import type { EditorAction } from "../bridge/engineActionTypes";
import type { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioLanguage } from "../types";
import { renderEditorEntry } from "./balancePanelHelpers";
import { renderFocusButton } from "./focusControls";
import { localizeGeneratedText } from "./generatedText";
import { escapeHtml, t } from "./shellShared";

type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

export function renderSpawnDrillDownSection(
  topCandidates: WorldDraftPreview["playability"]["spawnCandidates"],
  editorAvailability: Record<EditorAction, boolean>,
  language: StudioLanguage,
) {
  return `
      <div class="studio-panel__eyebrow">${t(language, "出生点下钻", "Spawn drill-down")}</div>
      <div class="studio-balance-list">
        ${topCandidates
          .map(
            (candidate) => `
              <article class="studio-balance-card">
                <div class="studio-balance-card__title">${escapeHtml(candidate.id)} · ${candidate.score}/100</div>
                <div class="studio-balance-card__refs">
                  ${candidate.state === undefined ? "" : `<span>${t(language, "国家", "state")}: ${candidate.state}</span>`}
                  ${candidate.province === undefined ? "" : `<span>${t(language, "省份", "province")}: ${candidate.province}</span>`}
                  ${candidate.burg === undefined ? "" : `<span>${t(language, "城镇", "burg")}: ${candidate.burg}</span>`}
                  ${candidate.biome === undefined ? "" : `<span>${t(language, "生物群系", "biome")}: ${candidate.biome}</span>`}
                </div>
                <ul class="studio-balance-card__reasons">
                  ${candidate.reasons.map((reason) => `<li>${escapeHtml(localizeGeneratedText(reason, language))}</li>`).join("")}
                </ul>
                <div class="studio-panel__actions">
                  ${renderFocusButton("province", candidate.province, candidate.id, "focus", language)}
                  ${renderFocusButton("state", candidate.state, candidate.id, "focus", language)}
                  ${renderFocusButton("burg", candidate.burg, candidate.id, "focus", language)}
                  ${renderFocusButton("biome", candidate.biome, candidate.id, "focus", language)}
                  ${renderFocusButton(candidate.province === undefined ? "state" : "province", candidate.province ?? candidate.state, candidate.id, "adjust", language)}
                  ${renderEditorEntry(candidate.province === undefined ? "editStates" : "editProvinces", editorAvailability, t(language, "检查出生区域", "Review spawn region"), language)}
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
}
