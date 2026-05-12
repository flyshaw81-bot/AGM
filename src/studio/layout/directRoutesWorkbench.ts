import type { EngineRouteSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectRouteFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderDirectRouteDetail } from "./directRoutesWorkbenchDetail";
import {
  filterAndSortDirectRoutes,
  getActiveDirectRoutes,
  selectDirectRoute,
} from "./directRoutesWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { escapeHtml, studioIcon, t } from "./shellShared";

function renderNativeRouteListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "路线列表", "Route list")}</h3>
    </div>
    <strong>${visibleCount}/${activeCount}</strong>
  </div>`;
}

function getRouteTitle(
  route: EngineRouteSummaryItem,
  language: StudioLanguage,
) {
  return (
    route.group || `${t(language, "未命名路线", "Unnamed route")} #${route.id}`
  );
}

function getRouteMeta(route: EngineRouteSummaryItem, language: StudioLanguage) {
  return `${t(language, "路径点", "Points")} ${route.pointCount ?? 0} / ${t(language, "地物", "Feature")} ${route.feature ?? "-"}`;
}

export function renderDirectRoutesWorkbench(
  routes: EngineRouteSummaryItem[],
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeRoutes = getActiveDirectRoutes(routes);
  const query = normalizeWorkbenchQuery(directEditor.routeSearchQuery);
  const filteredRoutes = filterAndSortDirectRoutes(
    activeRoutes,
    directEditor,
    query,
  );
  const selectedRoute = selectDirectRoute(
    filteredRoutes,
    activeRoutes,
    directEditor.selectedRouteId,
  );
  const filterOptions: { value: DirectRouteFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部路线", "All routes") },
    { value: "has-feature", label: t(language, "有关联地物", "Has feature") },
    { value: "has-points", label: t(language, "有路径点", "Has points") },
  ];
  const visibleRoutes = limitDirectWorkbenchRows(filteredRoutes);

  return `
    <section id="studioDirectRoutesWorkbench" class="studio-native-identity studio-native-identity--routes studio-direct-editor studio-direct-route-editor" data-native-route-drawer="true" data-direct-workbench="routes">
      <aside class="studio-native-identity__list">
        ${renderNativeRouteListHeader(language, activeRoutes.length, filteredRoutes.length)}
        <label class="studio-native-identity__search">
          ${studioIcon("search", "studio-native-identity__search-icon")}
          <input id="studioRouteSearchInput" type="search" value="${escapeHtml(directEditor.routeSearchQuery)}" placeholder="${t(language, "搜索路线、ID、地物或单元", "Search route, ID, feature, or cell")}" autocomplete="off" />
        </label>
        <div class="studio-native-identity__filters">
          <label class="studio-native-identity__select">
            <span>${t(language, "筛选", "Filter")}</span>
            <select id="studioRouteFilterSelect">
              ${renderDirectSelectOptions(filterOptions, directEditor.routeFilterMode)}
            </select>
          </label>
          <div class="studio-native-identity__count"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredRoutes.length}</strong></div>
        </div>
        <div class="studio-native-identity__rows">
          ${
            visibleRoutes
              .map((route) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-route-select",
                  color: "var(--studio-native-accent)",
                  id: route.id,
                  idDataAttribute: "route-id",
                  meta: getRouteMeta(route, language),
                  metric: `#${route.id}`,
                  selected: route.id === selectedRoute?.id,
                  swatchClass: "studio-state-row__swatch--burg",
                  title: getRouteTitle(route, language),
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的路线", "No matching routes")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      ${renderDirectRouteDetail({
        language,
        directEditor,
        selectedRoute,
      })}
    </section>
  `;
}
