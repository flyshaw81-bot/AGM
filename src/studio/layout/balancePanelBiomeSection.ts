import type { StudioLanguage } from "../types";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

type BiomeRuleSummaryItem = {
  agmResourceTag?: string;
  agmRuleWeight?: number;
  id: number;
  name: string;
};

export function renderBiomeRuleMetadataSection(
  biomeRuleSummary: BiomeRuleSummaryItem[],
  language: StudioLanguage,
) {
  return `
      <div class="studio-panel__eyebrow">${t(language, "AGM 生物群系规则元数据", "AGM biome rule metadata")}</div>
      <div class="studio-balance-list">
        ${
          biomeRuleSummary.length
            ? biomeRuleSummary
                .map(
                  (biome) => `
                  <article class="studio-balance-card" data-biome-rule-id="${biome.id}">
                    <div class="studio-balance-card__title">${escapeHtml(biome.name)} · ${t(language, "生物群系", "biome")} ${biome.id}</div>
                    <label class="studio-stack-field">
                      <span>${t(language, "规则权重", "Rule weight")}</span>
                      <input class="studio-input" data-biome-rule-weight="${biome.id}" type="number" min="0" max="5" step="0.1" value="${escapeHtml(String(biome.agmRuleWeight ?? 1))}" />
                    </label>
                    <label class="studio-stack-field">
                      <span>${t(language, "资源标签", "Resource tag")}</span>
                      <select data-biome-resource-tag="${biome.id}">
                        <option value="starter-biome"${biome.agmResourceTag === "starter-biome" ? " selected" : ""}>starter-biome</option>
                        <option value="challenge-biome"${biome.agmResourceTag === "challenge-biome" ? " selected" : ""}>challenge-biome</option>
                        <option value="neutral-biome"${biome.agmResourceTag === "neutral-biome" ? " selected" : ""}>neutral-biome</option>
                      </select>
                    </label>
                    <div class="studio-balance-card__refs">
                      <span>${t(language, "规则权重", "rule weight")}: ${escapeHtml(String(biome.agmRuleWeight ?? "-"))}</span>
                      <span>${t(language, "资源标签", "resource tag")}: ${escapeHtml(biome.agmResourceTag ?? "-")}</span>
                    </div>
                    <div class="studio-panel__actions">
                      ${renderFocusButton("biome", biome.id, "biome-rule-metadata", "adjust", language)}
                      <button class="studio-ghost studio-ghost--primary" data-studio-action="biome-rule-adjust" data-biome-id="${biome.id}">${t(language, "调整生物群系规则", "Adjust biome rule")}</button>
                    </div>
                  </article>
                `,
                )
                .join("")
            : `<div class="studio-panel__text">${t(language, "尚未应用 AGM 生物群系规则元数据", "No AGM biome rule metadata applied yet")}</div>`
        }
      </div>
    `;
}
