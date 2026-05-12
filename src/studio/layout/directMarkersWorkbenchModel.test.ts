import { describe, expect, it } from "vitest";
import type { EngineMarkerSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  filterAndSortDirectMarkers,
  getActiveDirectMarkers,
  selectDirectMarker,
} from "./directMarkersWorkbenchModel";

const markers = [
  { id: -1, type: "removed" },
  { id: 2, type: "ruins", icon: "R", cell: 4, locked: true },
  { id: 1, type: "mines", icon: "M", cell: 9, pinned: true },
] satisfies EngineMarkerSummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    markerFilterMode: "all",
    selectedMarkerId: null,
    markerSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

describe("native markers workbench model", () => {
  it("filters inactive markers and sorts by type then id", () => {
    const activeMarkers = getActiveDirectMarkers(markers);

    expect(activeMarkers.map((marker) => marker.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectMarkers(activeMarkers, directEditor(), "").map(
        (marker) => marker.id,
      ),
    ).toEqual([1, 2]);
  });

  it("filters by pinned, locked, and query", () => {
    const activeMarkers = getActiveDirectMarkers(markers);

    expect(
      filterAndSortDirectMarkers(
        activeMarkers,
        directEditor({ markerFilterMode: "pinned" }),
        "",
      ).map((marker) => marker.id),
    ).toEqual([1]);
    expect(
      filterAndSortDirectMarkers(
        activeMarkers,
        directEditor({ markerFilterMode: "locked" }),
        "",
      ).map((marker) => marker.id),
    ).toEqual([2]);
    expect(
      filterAndSortDirectMarkers(activeMarkers, directEditor(), "ruins").map(
        (marker) => marker.id,
      ),
    ).toEqual([2]);
  });

  it("selects fallback markers", () => {
    const activeMarkers = getActiveDirectMarkers(markers);
    const filteredMarkers = filterAndSortDirectMarkers(
      activeMarkers,
      directEditor(),
      "mines",
    );

    expect(selectDirectMarker(filteredMarkers, activeMarkers, 1)?.id).toBe(1);
    expect(selectDirectMarker(filteredMarkers, activeMarkers, 2)?.id).toBe(2);
  });
});
