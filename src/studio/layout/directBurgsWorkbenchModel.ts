import type { EngineEntitySummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export function getActiveDirectBurgs(
  burgs: readonly EngineEntitySummaryItem[],
) {
  return burgs.filter((burg) => burg.id > 0 && burg.name);
}

export function filterAndSortDirectBurgs(
  activeBurgs: readonly EngineEntitySummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
  getStateName: (stateId?: number) => string,
  getCultureName: (cultureId?: number) => string,
) {
  return [...activeBurgs]
    .filter((burg) => {
      if (
        directEditor.burgFilterMode === "selected-state" &&
        directEditor.selectedStateId !== null &&
        burg.state !== directEditor.selectedStateId
      ) {
        return false;
      }
      if (
        directEditor.burgFilterMode === "populated" &&
        !(burg.population && burg.population > 0)
      ) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        burg.name,
        burg.type,
        String(burg.id),
        String(burg.state ?? ""),
        getStateName(burg.state),
        getCultureName(burg.culture),
      ]);
    })
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.id - right.id,
    );
}

export function selectDirectBurg(
  filteredBurgs: EngineEntitySummaryItem[],
  activeBurgs: EngineEntitySummaryItem[],
  selectedBurgId: number | null,
) {
  return selectVisibleWorkbenchItem(filteredBurgs, activeBurgs, selectedBurgId);
}
