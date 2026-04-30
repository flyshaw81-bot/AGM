import type { EngineBiomeSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectBiomeFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import {
  filterAndSortDirectBiomes,
  getActiveDirectBiomes,
  getDirectBiomeColor,
  selectDirectBiome,
} from "./directBiomesWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  getDirectWorkbenchEditStatus,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

export function renderDirectBiomesWorkbench(
  biomes: EngineBiomeSummaryItem[],
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeBiomes = getActiveDirectBiomes(biomes);
  const query = normalizeWorkbenchQuery(directEditor.biomeSearchQuery);
  const filteredBiomes = filterAndSortDirectBiomes(
    activeBiomes,
    directEditor,
    query,
  );
  const selectedBiome = selectDirectBiome(
    filteredBiomes,
    activeBiomes,
    directEditor.selectedBiomeId,
  );
  const selectedColor = getDirectBiomeColor(selectedBiome);
  const biomeStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedBiome && directEditor.lastAppliedBiomeId === selectedBiome.id,
    ),
  );
  const filterOptions: { value: DirectBiomeFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部生物群系", "All biomes") },
    {
      value: "resource-tagged",
      label: t(language, "Resource tagged", "Resource tagged"),
    },
    { value: "habitable", label: t(language, "Habitable", "Habitable") },
  ];
  const resourceTagOptions = [
    "starter-biome",
    "food",
    "timber",
    "stone",
    "metal",
    "rare-resource",
    "hazard",
    "sacred",
    "trade",
  ];
  const renderBiomeRow = (biome: EngineBiomeSummaryItem, selected: boolean) => `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="direct-biome-select" data-biome-id="${biome.id}">
      <span class="studio-state-row__swatch" style="background: ${escapeHtml(getDirectBiomeColor(biome))}"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(biome.name)}</strong><small>${t(language, "适居", "habitability")} ${biome.habitability ?? "-"} · ${escapeHtml(biome.agmResourceTag || t(language, "untagged", "untagged"))}</small></span>
      <span class="studio-state-row__metric">#${biome.id}</span>
    </button>
  `;

  return `
    <section id="studioDirectBiomesWorkbench" class="studio-panel studio-direct-editor studio-direct-biome-editor" data-direct-workbench="biomes">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "AGM editor", "AGM editor")}</div>
          <h2 class="studio-panel__hero">${t(language, "Biomes / Resources Workbench", "Biomes / Resources Workbench")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "直接编辑", "Direct edit")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "Bring biome resource rules into AGM: search biomes, focus the map, and maintain habitability, rule weight, and resource tags directly.", "Bring biome resource rules into AGM: search biomes, focus the map, and maintain habitability, rule weight, and resource tags directly.")}</p>
      <div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
          <span>${t(language, "搜索生物群系", "Search biomes")}</span>
          <input id="studioBiomeSearchInput" class="studio-input" type="search" value="${escapeHtml(directEditor.biomeSearchQuery)}" placeholder="${t(language, "Name, ID or resource tag", "Name, ID or resource tag")}" autocomplete="off" />
        </label>
        <label class="studio-stack-field">
          <span>${t(language, "Filter", "Filter")}</span>
          <select id="studioBiomeFilterSelect">
            ${renderDirectSelectOptions(filterOptions, directEditor.biomeFilterMode)}
          </select>
        </label>
        <div class="studio-kv"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredBiomes.length}</strong></div>
      </div>
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredBiomes)
              .map((biome) =>
                renderBiomeRow(biome, biome.id === selectedBiome?.id),
              )
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching biomes", "No matching biomes")}</div>`
          }
        </div>
        <div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(selectedColor)}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedBiome ? escapeHtml(selectedBiome.name) : "-"}</h3>
            </div>
          </div>
          ${
            selectedBiome
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "Habitability", "Habitability")}</span>
                <input id="studioBiomeHabitabilityInput" type="number" min="0" max="100" step="1" value="${selectedBiome.habitability ?? 0}" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "规则权重", "Rule weight")}</span>
                <input id="studioBiomeRuleWeightInput" type="number" min="0" max="5" step="0.1" value="${selectedBiome.agmRuleWeight ?? 1}" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "资源标签", "Resource tag")}</span>
                <select id="studioBiomeResourceTagSelect">
                  ${renderDirectSelectOptions(
                    resourceTagOptions.map((option) => ({
                      value: option,
                      label: option,
                    })),
                    selectedBiome.agmResourceTag || "starter-biome",
                  )}
                </select>
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "生物群系 ID", "Biome ID")}</span><strong>${selectedBiome.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "移动成本", "Movement cost")}</span><strong>${selectedBiome.movementCost ?? "-"}</strong></div>
              <div class="studio-kv"><span>${t(language, "图标密度", "Icon density")}</span><strong>${selectedBiome.iconDensity ?? "-"}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedBiome ? renderDirectWorkbenchEditStatus("studioBiomeEditStatus", language, biomeStatus) : ""}
            ${selectedBiome ? `<button class="studio-primary-action" data-studio-action="direct-biome-apply" data-biome-id="${selectedBiome.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedBiome ? `<button class="studio-ghost" data-studio-action="direct-biome-reset" data-biome-id="${selectedBiome.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedBiome ? renderFocusButton("biome", selectedBiome.id, selectedBiome.name, "focus", language) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}
