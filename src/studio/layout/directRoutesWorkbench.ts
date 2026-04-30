import type { EngineRouteSummaryItem } from "../bridge/engineActionTypes";
import type {
  DirectRouteFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import {
  filterAndSortDirectRoutes,
  getActiveDirectRoutes,
  selectDirectRoute,
} from "./directRoutesWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  getDirectWorkbenchEditStatus,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

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
  const routeStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedRoute && directEditor.lastAppliedRouteId === selectedRoute.id,
    ),
  );
  const filterOptions: { value: DirectRouteFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部路线", "All routes") },
    { value: "has-feature", label: t(language, "Has feature", "Has feature") },
    { value: "has-points", label: t(language, "有路径点", "Has points") },
  ];
  const renderRouteRow = (route: EngineRouteSummaryItem, selected: boolean) => `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="direct-route-select" data-route-id="${route.id}">
      <span class="studio-state-row__swatch studio-state-row__swatch--burg"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(route.group || t(language, "Unnamed route", "Unnamed route"))}</strong><small>${t(language, "points", "points")} ${route.pointCount ?? 0} · ${t(language, "地物", "feature")} ${route.feature ?? "-"}</small></span>
      <span class="studio-state-row__metric">#${route.id}</span>
    </button>
  `;

  return `
    <section id="studioDirectRoutesWorkbench" class="studio-panel studio-direct-editor studio-direct-route-editor" data-direct-workbench="routes">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "AGM editor", "AGM editor")}</div>
          <h2 class="studio-panel__hero">${t(language, "Routes Workbench", "Routes Workbench")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "直接编辑", "Direct edit")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "Search routes in the AGM panel, filter by path data, focus the map, and maintain route group and feature references directly.", "Search routes in the AGM panel, filter by path data, focus the map, and maintain route group and feature references directly.")}</p>
      <div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
          <span>${t(language, "搜索路线", "Search routes")}</span>
          <input id="studioRouteSearchInput" class="studio-input" type="search" value="${escapeHtml(directEditor.routeSearchQuery)}" placeholder="${t(language, "Group, ID, feature or cell", "Group, ID, feature or cell")}" autocomplete="off" />
        </label>
        <label class="studio-stack-field">
          <span>${t(language, "Filter", "Filter")}</span>
          <select id="studioRouteFilterSelect">
            ${renderDirectSelectOptions(filterOptions, directEditor.routeFilterMode)}
          </select>
        </label>
        <div class="studio-kv"><span>${t(language, "当前列表", "Current list")}</span><strong>${filteredRoutes.length}</strong></div>
      </div>
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredRoutes)
              .map((route) =>
                renderRouteRow(route, route.id === selectedRoute?.id),
              )
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching routes", "No matching routes")}</div>`
          }
        </div>
        <div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedRoute ? escapeHtml(selectedRoute.group || `${t(language, "路线", "Route")} #${selectedRoute.id}`) : "-"}</h3>
            </div>
          </div>
          ${
            selectedRoute
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "路线分组", "Route group")}</span>
                <input id="studioRouteGroupInput" value="${escapeHtml(selectedRoute.group || "")}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "地物 ID", "Feature ID")}</span>
                <input id="studioRouteFeatureInput" type="number" step="1" value="${selectedRoute.feature ?? ""}" />
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "路线 ID", "Route ID")}</span><strong>${selectedRoute.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "Points", "Points")}</span><strong>${selectedRoute.pointCount ?? 0}</strong></div>
              <div class="studio-kv"><span>${t(language, "Start cell", "Start cell")}</span><strong>${selectedRoute.startCell ?? "-"}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedRoute ? renderDirectWorkbenchEditStatus("studioRouteEditStatus", language, routeStatus) : ""}
            ${selectedRoute ? `<button class="studio-primary-action" data-studio-action="direct-route-apply" data-route-id="${selectedRoute.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedRoute ? `<button class="studio-ghost" data-studio-action="direct-route-reset" data-route-id="${selectedRoute.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedRoute ? renderFocusButton("route", selectedRoute.id, selectedRoute.group || `route-${selectedRoute.id}`, "focus", language) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}
