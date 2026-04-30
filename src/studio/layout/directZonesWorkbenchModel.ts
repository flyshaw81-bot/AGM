import type { EngineZoneSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export function getActiveDirectZones(zones: readonly EngineZoneSummaryItem[]) {
  return zones.filter((zone) => zone.id >= 0 && zone.name);
}

export function filterAndSortDirectZones(
  activeZones: readonly EngineZoneSummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
) {
  return [...activeZones]
    .filter((zone) => {
      if (
        directEditor.zoneFilterMode === "populated" &&
        !(zone.population && zone.population > 0)
      ) {
        return false;
      }
      if (directEditor.zoneFilterMode === "hidden" && !zone.hidden) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        zone.name,
        zone.type,
        String(zone.id),
        String(zone.cellCount),
        String(zone.population ?? ""),
      ]);
    })
    .sort(
      (left, right) =>
        (left.type || "").localeCompare(right.type || "") ||
        left.name.localeCompare(right.name) ||
        left.id - right.id,
    );
}

export function selectDirectZone(
  filteredZones: EngineZoneSummaryItem[],
  activeZones: EngineZoneSummaryItem[],
  selectedZoneId: number | null,
) {
  return selectVisibleWorkbenchItem(filteredZones, activeZones, selectedZoneId);
}

export function getDirectZoneColor(
  selectedZone: EngineZoneSummaryItem | undefined,
) {
  return selectedZone?.color && /^#[0-9a-f]{6}$/i.test(selectedZone.color)
    ? selectedZone.color
    : "#b88f42";
}
