import type { EngineMarkerSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export function getActiveDirectMarkers(
  markers: readonly EngineMarkerSummaryItem[],
) {
  return markers.filter((marker) => marker.id >= 0);
}

export function filterAndSortDirectMarkers(
  activeMarkers: readonly EngineMarkerSummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
) {
  return [...activeMarkers]
    .filter((marker) => {
      if (directEditor.markerFilterMode === "pinned" && !marker.pinned) {
        return false;
      }
      if (directEditor.markerFilterMode === "locked" && !marker.locked) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        marker.type,
        marker.icon,
        marker.pin,
        marker.cell,
        marker.id,
        marker.size,
      ]);
    })
    .sort(
      (left, right) =>
        (left.type || "").localeCompare(right.type || "") || left.id - right.id,
    );
}

export function selectDirectMarker(
  filteredMarkers: EngineMarkerSummaryItem[],
  activeMarkers: EngineMarkerSummaryItem[],
  selectedMarkerId: number | null,
) {
  return selectVisibleWorkbenchItem(
    filteredMarkers,
    activeMarkers,
    selectedMarkerId,
  );
}
