import type { EngineRouteSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export function getActiveDirectRoutes(
  routes: readonly EngineRouteSummaryItem[],
) {
  return routes.filter((route) => route.id > 0);
}

export function filterAndSortDirectRoutes(
  activeRoutes: readonly EngineRouteSummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
) {
  return [...activeRoutes]
    .filter((route) => {
      if (
        directEditor.routeFilterMode === "has-feature" &&
        route.feature === undefined
      ) {
        return false;
      }
      if (
        directEditor.routeFilterMode === "has-points" &&
        !(route.pointCount && route.pointCount > 0)
      ) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        route.group,
        String(route.id),
        String(route.feature ?? ""),
        String(route.pointCount ?? ""),
        String(route.startCell ?? ""),
      ]);
    })
    .sort(
      (left, right) =>
        (left.group || "").localeCompare(right.group || "") ||
        left.id - right.id,
    );
}

export function selectDirectRoute(
  filteredRoutes: EngineRouteSummaryItem[],
  activeRoutes: EngineRouteSummaryItem[],
  selectedRouteId: number | null,
) {
  return selectVisibleWorkbenchItem(
    filteredRoutes,
    activeRoutes,
    selectedRouteId,
  );
}
