import type { EngineZoneSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectZoneFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { renderDirectZoneDetail } from "./directZonesWorkbenchDetail";
import {
  filterAndSortDirectZones,
  getActiveDirectZones,
  getDirectZoneColor,
  selectDirectZone,
} from "./directZonesWorkbenchModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

function renderNativeZoneListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "区域列表", "Zone list")}</h3>
    </div>
    <strong>${visibleCount}/${activeCount}</strong>
  </div>`;
}

function getZoneMeta(zone: EngineZoneSummaryItem, language: StudioLanguage) {
  return `${zone.type || t(language, "区域", "Zone")} / ${t(language, "单元格", "Cells")} ${zone.cellCount}`;
}

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
  const filterOptions: { value: DirectZoneFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部区域", "All zones") },
    { value: "populated", label: t(language, "有人口", "Populated") },
    { value: "hidden", label: t(language, "隐藏", "Hidden") },
  ];
  const visibleZones = limitDirectWorkbenchRows(filteredZones);

  return `
    <section id="studioDirectZonesWorkbench" class="studio-native-identity studio-native-identity--zones studio-direct-editor studio-direct-zone-editor" data-native-zone-drawer="true" data-direct-workbench="zones">
      <aside class="studio-native-identity__list">
        ${renderNativeZoneListHeader(language, activeZones.length, filteredZones.length)}
        <label class="studio-native-identity__search">
          ${studioIcon("search", "studio-native-identity__search-icon")}
          <input id="studioZoneSearchInput" type="search" value="${escapeHtml(directEditor.zoneSearchQuery)}" placeholder="${t(language, "搜索区域、ID、类型或规模", "Search zone, ID, type, or size")}" autocomplete="off" />
        </label>
        <div class="studio-native-identity__filters">
          <label class="studio-native-identity__select">
            <span>${t(language, "筛选", "Filter")}</span>
            <select id="studioZoneFilterSelect">
              ${renderDirectSelectOptions(filterOptions, directEditor.zoneFilterMode)}
            </select>
          </label>
          <div class="studio-native-identity__count"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredZones.length}</strong></div>
        </div>
        <div class="studio-native-identity__rows">
          ${
            visibleZones
              .map((zone) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-zone-select",
                  color: getDirectZoneColor(zone),
                  id: zone.id,
                  idDataAttribute: "zone-id",
                  meta: getZoneMeta(zone, language),
                  metric: `#${zone.id}`,
                  selected: zone.id === selectedZone?.id,
                  title: zone.name,
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的区域", "No matching zones")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      ${renderDirectZoneDetail({
        language,
        directEditor,
        selectedColor,
        selectedZone,
      })}
    </section>
  `;
}
