import type { EngineZoneSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectZoneFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  getDirectWorkbenchEditStatus,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import {
  filterAndSortDirectZones,
  getActiveDirectZones,
  getDirectZoneColor,
  selectDirectZone,
} from "./directZonesWorkbenchModel";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

export function renderDirectZonesWorkbench(
  zones: EngineZoneSummaryItem[],
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeZones = getActiveDirectZones(zones);
  const query = normalizeWorkbenchQuery(directEditor.zoneSearchQuery);
  const filteredZones = filterAndSortDirectZones(
    activeZones,
    directEditor,
    query,
  );
  const selectedZone = selectDirectZone(
    filteredZones,
    activeZones,
    directEditor.selectedZoneId,
  );
  const selectedColor = getDirectZoneColor(selectedZone);
  const zoneStatus = getDirectWorkbenchEditStatus(
    Boolean(selectedZone && directEditor.lastAppliedZoneId === selectedZone.id),
  );
  const filterOptions: { value: DirectZoneFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部区域", "All zones") },
    { value: "populated", label: t(language, "Populated", "Populated") },
    { value: "hidden", label: t(language, "Hidden", "Hidden") },
  ];
  const renderZoneRow = (zone: EngineZoneSummaryItem, selected: boolean) => `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="direct-zone-select" data-zone-id="${zone.id}">
      <span class="studio-state-row__swatch" style="background: ${escapeHtml(getDirectZoneColor(zone))}"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(zone.name)}</strong><small>${escapeHtml(zone.type || t(language, "区域", "Zone"))} · ${t(language, "cells", "cells")} ${zone.cellCount}</small></span>
      <span class="studio-state-row__metric">#${zone.id}</span>
    </button>
  `;

  return `
    <section id="studioDirectZonesWorkbench" class="studio-panel studio-direct-editor studio-direct-zone-editor" data-direct-workbench="zones">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "AGM editor", "AGM editor")}</div>
          <h2 class="studio-panel__hero">${t(language, "Zones Workbench", "Zones Workbench")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "直接编辑", "Direct edit")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "Search zones in the AGM panel, filter by status, focus the map, and maintain name, type, color and visibility directly.", "Search zones in the AGM panel, filter by status, focus the map, and maintain name, type, color and visibility directly.")}</p>
      <div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
          <span>${t(language, "搜索区域", "Search zones")}</span>
          <input id="studioZoneSearchInput" class="studio-input" type="search" value="${escapeHtml(directEditor.zoneSearchQuery)}" placeholder="${t(language, "输入名称、ID、类型或规模", "Name, ID, type or size")}" autocomplete="off" />
        </label>
        <label class="studio-stack-field">
          <span>${t(language, "Filter", "Filter")}</span>
          <select id="studioZoneFilterSelect">
            ${renderDirectSelectOptions(filterOptions, directEditor.zoneFilterMode)}
          </select>
        </label>
        <div class="studio-kv"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredZones.length}</strong></div>
      </div>
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredZones)
              .map((zone) => renderZoneRow(zone, zone.id === selectedZone?.id))
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching zones", "No matching zones")}</div>`
          }
        </div>
        <div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(selectedColor)}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedZone ? escapeHtml(selectedZone.name) : "-"}</h3>
            </div>
          </div>
          ${
            selectedZone
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "名称", "Name")}</span>
                <input id="studioZoneNameInput" value="${escapeHtml(selectedZone.name)}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "类型", "Type")}</span>
                <input id="studioZoneTypeInput" value="${escapeHtml(selectedZone.type || "")}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "颜色", "Color")}</span>
                <input id="studioZoneColorInput" type="color" value="${escapeHtml(selectedColor)}" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "隐藏区域", "Hide zone")}</span>
                <select id="studioZoneHiddenSelect">
                  ${renderDirectSelectOptions(
                    [
                      { value: "false", label: t(language, "显示", "Visible") },
                      { value: "true", label: t(language, "隐藏", "Hidden") },
                    ],
                    String(Boolean(selectedZone.hidden)),
                  )}
                </select>
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "区域 ID", "Zone ID")}</span><strong>${selectedZone.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "Cells", "Cells")}</span><strong>${selectedZone.cellCount}</strong></div>
              <div class="studio-kv"><span>${t(language, "面积", "Area")}</span><strong>${selectedZone.area ? Math.round(selectedZone.area) : "-"}</strong></div>
              <div class="studio-kv"><span>${t(language, "人口权重", "Population weight")}</span><strong>${selectedZone.population ? Math.round(selectedZone.population) : "-"}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedZone ? renderDirectWorkbenchEditStatus("studioZoneEditStatus", language, zoneStatus) : ""}
            ${selectedZone ? `<button class="studio-primary-action" data-studio-action="direct-zone-apply" data-zone-id="${selectedZone.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedZone ? `<button class="studio-ghost" data-studio-action="direct-zone-reset" data-zone-id="${selectedZone.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedZone ? renderFocusButton("zone", selectedZone.id, selectedZone.name, "focus", language) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}
