import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type {
  DirectCultureFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import {
  filterAndSortDirectSocietyItems,
  getActiveDirectSocietyItems,
  getDirectSocietyColor,
  selectDirectSocietyItem,
} from "./directSocietyWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  getDirectWorkbenchEditStatus,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

export function renderDirectCulturesWorkbench(
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeCultures = getActiveDirectSocietyItems(entitySummary.cultures);
  const query = normalizeWorkbenchQuery(directEditor.cultureSearchQuery);
  const filteredCultures = filterAndSortDirectSocietyItems(
    activeCultures,
    directEditor.cultureFilterMode,
    query,
  );
  const selectedCulture = selectDirectSocietyItem(
    filteredCultures,
    activeCultures,
    directEditor.selectedCultureId,
  );
  const selectedColor = getDirectSocietyColor(selectedCulture, "#b38a58");
  const cultureStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedCulture &&
        directEditor.lastAppliedCultureId === selectedCulture.id,
    ),
  );
  const filterOptions: { value: DirectCultureFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部文化", "All cultures") },
    { value: "populated", label: t(language, "有覆盖单元格", "Populated") },
    { value: "has-center", label: t(language, "Has center", "Has center") },
  ];
  const renderCultureRow = (
    culture: EngineEntitySummaryItem,
    selected: boolean,
  ) => `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="direct-culture-select" data-culture-id="${culture.id}">
      <span class="studio-state-row__swatch" style="background: ${escapeHtml(culture.color || "#b38a58")}"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(culture.name)}</strong><small>${escapeHtml(culture.type || culture.formName || culture.form || t(language, "文化", "Culture"))} · ${t(language, "cells", "cells")} ${culture.cells ?? "-"}</small></span>
      <span class="studio-state-row__metric">#${culture.id}</span>
    </button>
  `;

  return `
    <section id="studioDirectCulturesWorkbench" class="studio-panel studio-direct-editor studio-direct-culture-editor" data-direct-workbench="cultures">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "AGM editor", "AGM editor")}</div>
          <h2 class="studio-panel__hero">${t(language, "Cultures Workbench", "Cultures Workbench")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "直接编辑", "Direct edit")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "Search cultures in the AGM panel, filter by coverage, focus the map, and maintain name, form, and color directly.", "Search cultures in the AGM panel, filter by coverage, focus the map, and maintain name, form, and color directly.")}</p>
      <div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
          <span>${t(language, "搜索文化", "Search cultures")}</span>
          <input id="studioCultureSearchInput" class="studio-input" type="search" value="${escapeHtml(directEditor.cultureSearchQuery)}" placeholder="${t(language, "Name, ID or form", "Name, ID or form")}" autocomplete="off" />
        </label>
        <label class="studio-stack-field">
          <span>${t(language, "Filter", "Filter")}</span>
          <select id="studioCultureFilterSelect">
            ${renderDirectSelectOptions(filterOptions, directEditor.cultureFilterMode)}
          </select>
        </label>
        <div class="studio-kv"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredCultures.length}</strong></div>
      </div>
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredCultures)
              .map((culture) =>
                renderCultureRow(culture, culture.id === selectedCulture?.id),
              )
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching cultures", "No matching cultures")}</div>`
          }
        </div>
        <div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(selectedColor)}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedCulture ? escapeHtml(selectedCulture.name) : "-"}</h3>
            </div>
          </div>
          ${
            selectedCulture
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "名称", "Name")}</span>
                <input id="studioCultureNameInput" value="${escapeHtml(selectedCulture.name)}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "Form", "Form")}</span>
                <input id="studioCultureTypeInput" value="${escapeHtml(selectedCulture.type || selectedCulture.formName || selectedCulture.form || "")}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "颜色", "Color")}</span>
                <input id="studioCultureColorInput" type="color" value="${escapeHtml(selectedColor)}" />
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "文化 ID", "Culture ID")}</span><strong>${selectedCulture.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "Cells", "Cells")}</span><strong>${selectedCulture.cells ?? "-"}</strong></div>
              <div class="studio-kv"><span>${t(language, "面积", "Area")}</span><strong>${selectedCulture.area ?? "-"}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedCulture ? renderDirectWorkbenchEditStatus("studioCultureEditStatus", language, cultureStatus) : ""}
            ${selectedCulture ? `<button class="studio-primary-action" data-studio-action="direct-culture-apply" data-culture-id="${selectedCulture.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedCulture ? `<button class="studio-ghost" data-studio-action="direct-culture-reset" data-culture-id="${selectedCulture.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedCulture ? renderFocusButton("culture", selectedCulture.id, selectedCulture.name, "focus", language) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}
