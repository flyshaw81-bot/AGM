import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type {
  DirectReligionFilterMode,
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

export function renderDirectReligionsWorkbench(
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeReligions = getActiveDirectSocietyItems(entitySummary.religions);
  const query = normalizeWorkbenchQuery(directEditor.religionSearchQuery);
  const filteredReligions = filterAndSortDirectSocietyItems(
    activeReligions,
    directEditor.religionFilterMode,
    query,
  );
  const selectedReligion = selectDirectSocietyItem(
    filteredReligions,
    activeReligions,
    directEditor.selectedReligionId,
  );
  const selectedColor = getDirectSocietyColor(selectedReligion, "#8d70c9");
  const religionStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedReligion &&
        directEditor.lastAppliedReligionId === selectedReligion.id,
    ),
  );
  const filterOptions: { value: DirectReligionFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部宗教", "All religions") },
    { value: "populated", label: t(language, "有覆盖单元格", "Populated") },
    { value: "has-center", label: t(language, "Has center", "Has center") },
  ];
  const renderReligionRow = (
    religion: EngineEntitySummaryItem,
    selected: boolean,
  ) => `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="direct-religion-select" data-religion-id="${religion.id}">
      <span class="studio-state-row__swatch" style="background: ${escapeHtml(religion.color || "#8d70c9")}"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(religion.name)}</strong><small>${escapeHtml(religion.type || religion.formName || religion.form || t(language, "宗教", "Religion"))} · ${t(language, "cells", "cells")} ${religion.cells ?? "-"}</small></span>
      <span class="studio-state-row__metric">#${religion.id}</span>
    </button>
  `;

  return `
    <section id="studioDirectReligionsWorkbench" class="studio-panel studio-direct-editor studio-direct-religion-editor" data-direct-workbench="religions">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "AGM editor", "AGM editor")}</div>
          <h2 class="studio-panel__hero">${t(language, "Religions Workbench", "Religions Workbench")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "直接编辑", "Direct edit")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "Search religions in the AGM panel, filter by coverage, focus the map, and maintain name, form, and color directly.", "Search religions in the AGM panel, filter by coverage, focus the map, and maintain name, form, and color directly.")}</p>
      <div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
          <span>${t(language, "搜索宗教", "Search religions")}</span>
          <input id="studioReligionSearchInput" class="studio-input" type="search" value="${escapeHtml(directEditor.religionSearchQuery)}" placeholder="${t(language, "Name, ID or form", "Name, ID or form")}" autocomplete="off" />
        </label>
        <label class="studio-stack-field">
          <span>${t(language, "Filter", "Filter")}</span>
          <select id="studioReligionFilterSelect">
            ${renderDirectSelectOptions(filterOptions, directEditor.religionFilterMode)}
          </select>
        </label>
        <div class="studio-kv"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredReligions.length}</strong></div>
      </div>
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredReligions)
              .map((religion) =>
                renderReligionRow(
                  religion,
                  religion.id === selectedReligion?.id,
                ),
              )
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching religions", "No matching religions")}</div>`
          }
        </div>
        <div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(selectedColor)}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedReligion ? escapeHtml(selectedReligion.name) : "-"}</h3>
            </div>
          </div>
          ${
            selectedReligion
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "名称", "Name")}</span>
                <input id="studioReligionNameInput" value="${escapeHtml(selectedReligion.name)}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "Form", "Form")}</span>
                <input id="studioReligionTypeInput" value="${escapeHtml(selectedReligion.type || selectedReligion.formName || selectedReligion.form || "")}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "颜色", "Color")}</span>
                <input id="studioReligionColorInput" type="color" value="${escapeHtml(selectedColor)}" />
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "宗教 ID", "Religion ID")}</span><strong>${selectedReligion.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "Cells", "Cells")}</span><strong>${selectedReligion.cells ?? "-"}</strong></div>
              <div class="studio-kv"><span>${t(language, "面积", "Area")}</span><strong>${selectedReligion.area ?? "-"}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedReligion ? renderDirectWorkbenchEditStatus("studioReligionEditStatus", language, religionStatus) : ""}
            ${selectedReligion ? `<button class="studio-primary-action" data-studio-action="direct-religion-apply" data-religion-id="${selectedReligion.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedReligion ? `<button class="studio-ghost" data-studio-action="direct-religion-reset" data-religion-id="${selectedReligion.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedReligion ? renderFocusButton("religion", selectedReligion.id, selectedReligion.name, "focus", language) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}
