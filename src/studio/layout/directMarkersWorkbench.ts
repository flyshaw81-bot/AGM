import type { EngineMarkerSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectMarkerFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderDirectMarkerDetail } from "./directMarkersWorkbenchDetail";
import {
  filterAndSortDirectMarkers,
  getActiveDirectMarkers,
  selectDirectMarker,
} from "./directMarkersWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { escapeHtml, studioIcon, t } from "./shellShared";

function renderNativeMarkerListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "地图标记", "Map markers")}</h3>
    </div>
    <strong>${visibleCount}/${activeCount}</strong>
  </div>`;
}

function getMarkerTitle(
  marker: EngineMarkerSummaryItem,
  language: StudioLanguage,
) {
  return (
    marker.type ||
    marker.icon ||
    `${t(language, "标记", "Marker")} #${marker.id}`
  );
}

function getMarkerMeta(
  marker: EngineMarkerSummaryItem,
  language: StudioLanguage,
) {
  const flags = [
    marker.pinned ? t(language, "固定", "pinned") : null,
    marker.locked ? t(language, "锁定", "locked") : null,
  ].filter(Boolean);
  const parts = [
    marker.cell === undefined
      ? null
      : t(language, `单元格 ${marker.cell}`, `cell ${marker.cell}`),
    marker.size === undefined
      ? null
      : t(language, `尺寸 ${marker.size}`, `size ${marker.size}`),
    flags.join(" / "),
  ].filter(Boolean);
  return parts.join(" / ") || t(language, "地图标记", "Map marker");
}

function getMarkerColor(marker: EngineMarkerSummaryItem) {
  const color = marker.fill || marker.stroke;
  return color && /^#[0-9a-f]{6}$/i.test(color)
    ? color
    : "var(--studio-native-accent)";
}

export function renderDirectMarkersWorkbench(
  markers: EngineMarkerSummaryItem[],
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeMarkers = getActiveDirectMarkers(markers);
  const query = normalizeWorkbenchQuery(directEditor.markerSearchQuery);
  const filteredMarkers = filterAndSortDirectMarkers(
    activeMarkers,
    directEditor,
    query,
  );
  const selectedMarker = selectDirectMarker(
    filteredMarkers,
    activeMarkers,
    directEditor.selectedMarkerId,
  );
  const filterOptions: { value: DirectMarkerFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部标记", "All markers") },
    { value: "pinned", label: t(language, "固定显示", "Pinned") },
    { value: "locked", label: t(language, "锁定生成", "Locked") },
  ];
  const visibleMarkers = limitDirectWorkbenchRows(filteredMarkers);

  return `
    <section id="studioDirectMarkersWorkbench" class="studio-native-identity studio-native-identity--markers studio-direct-editor studio-direct-marker-editor" data-native-marker-drawer="true" data-direct-workbench="markers">
      <aside class="studio-native-identity__list">
        ${renderNativeMarkerListHeader(language, activeMarkers.length, filteredMarkers.length)}
        <label class="studio-native-identity__search">
          ${studioIcon("search", "studio-native-identity__search-icon")}
          <input id="studioMarkerSearchInput" type="search" value="${escapeHtml(directEditor.markerSearchQuery)}" placeholder="${t(language, "搜索标记、ID、类型、图标或单元格", "Search marker, ID, type, icon, or cell")}" autocomplete="off" />
        </label>
        <div class="studio-native-identity__filters">
          <label class="studio-native-identity__select">
            <span>${t(language, "筛选", "Filter")}</span>
            <select id="studioMarkerFilterSelect">
              ${renderDirectSelectOptions(filterOptions, directEditor.markerFilterMode)}
            </select>
          </label>
          <div class="studio-native-identity__count"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredMarkers.length}</strong></div>
        </div>
        <div class="studio-native-identity__rows">
          ${
            visibleMarkers
              .map((marker) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-marker-select",
                  color: getMarkerColor(marker),
                  id: marker.id,
                  idDataAttribute: "marker-id",
                  meta: getMarkerMeta(marker, language),
                  metric: `#${marker.id}`,
                  selected: marker.id === selectedMarker?.id,
                  title: getMarkerTitle(marker, language),
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的标记", "No matching markers")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      ${renderDirectMarkerDetail({
        language,
        directEditor,
        selectedMarker,
      })}
    </section>
  `;
}
