import { describe, expect, it } from "vitest";
import type { EngineRouteSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  filterAndSortDirectRoutes,
  getActiveDirectRoutes,
  selectDirectRoute,
} from "./directRoutesWorkbenchModel";

const routes = [
  { id: 0, group: "ignored" },
  { id: 2, group: "Road", feature: 9, pointCount: 4, startCell: 12 },
  { id: 1, group: "Canal", pointCount: 0, startCell: 30 },
] satisfies EngineRouteSummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    routeFilterMode: "all",
    selectedRouteId: null,
    routeSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

describe("native routes workbench model", () => {
  it("filters inactive routes and sorts by group", () => {
    const activeRoutes = getActiveDirectRoutes(routes);

    expect(activeRoutes.map((route) => route.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectRoutes(activeRoutes, directEditor(), "").map(
        (route) => route.id,
      ),
    ).toEqual([1, 2]);
  });

  it("filters by feature, points, and query", () => {
    const activeRoutes = getActiveDirectRoutes(routes);

    expect(
      filterAndSortDirectRoutes(
        activeRoutes,
        directEditor({ routeFilterMode: "has-feature" }),
        "",
      ).map((route) => route.id),
    ).toEqual([2]);
    expect(
      filterAndSortDirectRoutes(
        activeRoutes,
        directEditor({ routeFilterMode: "has-points" }),
        "",
      ).map((route) => route.id),
    ).toEqual([2]);
    expect(
      filterAndSortDirectRoutes(activeRoutes, directEditor(), "30").map(
        (route) => route.id,
      ),
    ).toEqual([1]);
  });

  it("selects visible routes before falling back to active routes", () => {
    const activeRoutes = getActiveDirectRoutes(routes);
    const filteredRoutes = filterAndSortDirectRoutes(
      activeRoutes,
      directEditor(),
      "road",
    );

    expect(selectDirectRoute(filteredRoutes, activeRoutes, 2)?.id).toBe(2);
    expect(selectDirectRoute(filteredRoutes, activeRoutes, 1)?.id).toBe(1);
    expect(selectDirectRoute(filteredRoutes, activeRoutes, null)?.id).toBe(2);
  });
});
