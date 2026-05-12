import type { EngineBiomeSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectBiomeFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderBiomeDistributionInsights } from "./biomeInsightsPanel";
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
  renderDirectWorkbenchFormActions,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

function renderNativeBiomeListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "生物群系列表", "Biome list")}</h3>
    </div>
    <strong>${visibleCount}/${activeCount}</strong>
  </div>`;
}

function renderBiomeSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderBiomeFieldsAttribute(scope: "owned" | "readonly") {
  const labels = getDirectEditorFieldsByScope("biomes", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

function renderNativeBiomeReadonlyGrid(
  selectedBiome: EngineBiomeSummaryItem,
  language: StudioLanguage,
) {
  const rows = [
    {
      label: t(language, "生物群系 ID", "Biome ID"),
      value: selectedBiome.id,
    },
    {
      label: t(language, "移动成本", "Movement cost"),
      value: selectedBiome.movementCost ?? "-",
    },
    {
      label: t(language, "图标密度", "Icon density"),
      value: selectedBiome.iconDensity ?? "-",
    },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

function getBiomeMeta(biome: EngineBiomeSummaryItem, language: StudioLanguage) {
  return `${t(language, "适居", "habitability")} ${biome.habitability ?? "-"} / ${escapeHtml(biome.agmResourceTag || t(language, "未标记", "untagged"))}`;
}

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
  const visibleBiomes = limitDirectWorkbenchRows(filteredBiomes);

  return `
    <section id="studioDirectBiomesWorkbench" class="studio-native-identity studio-native-identity--biomes studio-direct-editor studio-direct-biome-editor" data-native-biome-drawer="true" data-direct-workbench="biomes">
      <aside class="studio-native-identity__list">
        ${renderNativeBiomeListHeader(language, activeBiomes.length, filteredBiomes.length)}
        <label class="studio-native-identity__search">
          ${studioIcon("search", "studio-native-identity__search-icon")}
          <input id="studioBiomeSearchInput" type="search" value="${escapeHtml(directEditor.biomeSearchQuery)}" placeholder="${t(language, "Name, ID or resource tag", "Name, ID or resource tag")}" autocomplete="off" />
        </label>
        <div class="studio-native-identity__filters">
          <label class="studio-native-identity__select">
            <span>${t(language, "筛选", "Filter")}</span>
            <select id="studioBiomeFilterSelect">
              ${renderDirectSelectOptions(filterOptions, directEditor.biomeFilterMode)}
            </select>
          </label>
          <div class="studio-native-identity__count"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredBiomes.length}</strong></div>
        </div>
        <div class="studio-native-identity__rows">
          ${
            visibleBiomes
              .map((biome) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-biome-select",
                  color: getDirectBiomeColor(biome),
                  id: biome.id,
                  idDataAttribute: "biome-id",
                  meta: getBiomeMeta(biome, language),
                  metric: `#${biome.id}`,
                  selected: biome.id === selectedBiome?.id,
                  title: biome.name,
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的生物群系", "No matching biomes")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      <article class="studio-native-identity__detail-wrap">
        <div class="studio-native-identity-detail" data-native-biome-detail="true">
          ${renderBiomeDistributionInsights(language, selectedBiome?.id ?? null, { palette: "atlas" })}
          ${
            selectedBiome
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderBiomeFieldsAttribute("owned")}>
              ${renderBiomeSectionLabel(t(language, "AGM 资源规则", "AGM resource rules"), "leaf")}
              <div class="studio-native-identity-detail__form">
                <label class="studio-native-identity-field">
                  <span>${t(language, "Habitability", "Habitability")}</span>
                  <input id="studioBiomeHabitabilityInput" class="studio-input" type="number" min="0" max="100" step="1" value="${selectedBiome.habitability ?? 0}" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "规则权重", "Rule weight")}</span>
                  <input id="studioBiomeRuleWeightInput" class="studio-input" type="number" min="0" max="5" step="0.1" value="${selectedBiome.agmRuleWeight ?? 1}" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "资源标签", "Resource tag")}</span>
                  <select id="studioBiomeResourceTagSelect" class="studio-input">
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
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" ${renderBiomeFieldsAttribute("readonly")}>
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeBiomeReadonlyGrid(selectedBiome, language)}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的生物群系", "No biome selected")}</div>`
          }
          ${
            selectedBiome
              ? renderDirectWorkbenchFormActions({
                  applyAction: "direct-biome-apply",
                  attributes: { "biome-id": selectedBiome.id },
                  language,
                  resetAction: "direct-biome-reset",
                  status: biomeStatus,
                  statusId: "studioBiomeEditStatus",
                })
              : ""
          }
        </div>
      </article>
    </section>
  `;
}
