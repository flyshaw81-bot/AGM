import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

const EMPTY_VALUE = "-";

export function formatStatePopulation(value?: number) {
  if (!value) return EMPTY_VALUE;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(Math.round(value));
}

export function formatStateArea(value?: number) {
  return value ? `${Math.round(value)} km²` : EMPTY_VALUE;
}

export function getActiveDirectStates(
  states: readonly EngineEntitySummaryItem[],
) {
  return states.filter(
    (state) => state.id > 0 && state.name && state.name !== "Neutrals",
  );
}

export function filterAndSortDirectStates(
  activeStates: readonly EngineEntitySummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
) {
  return [...activeStates]
    .filter((state) => {
      if (
        directEditor.stateFilterMode === "populated" &&
        !(state.population && state.population > 0)
      ) {
        return false;
      }
      if (
        directEditor.stateFilterMode === "neighbors" &&
        !state.neighbors?.length
      ) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        state.name,
        state.fullName,
        state.formName,
        state.form,
        state.type,
        String(state.id),
        String(state.culture ?? ""),
      ]);
    })
    .sort((left, right) => {
      if (directEditor.stateSortMode === "population") {
        return (
          (right.population || 0) - (left.population || 0) || left.id - right.id
        );
      }
      if (directEditor.stateSortMode === "area") {
        return (right.area || 0) - (left.area || 0) || left.id - right.id;
      }
      if (directEditor.stateSortMode === "id") return left.id - right.id;
      return left.name.localeCompare(right.name) || left.id - right.id;
    });
}

export function selectDirectState(
  filteredStates: EngineEntitySummaryItem[],
  activeStates: EngineEntitySummaryItem[],
  selectedStateId: number | null,
) {
  return selectVisibleWorkbenchItem(
    filteredStates,
    activeStates,
    selectedStateId,
  );
}

export function getNativeStateTotalPopulation(
  activeStates: readonly EngineEntitySummaryItem[],
) {
  return activeStates.reduce(
    (total, state) => total + (state.population || 0),
    0,
  );
}

export function getNativeStateColor(
  selectedState: EngineEntitySummaryItem | undefined,
) {
  return selectedState?.color && /^#[0-9a-f]{6}$/i.test(selectedState.color)
    ? selectedState.color
    : "var(--studio-accent)";
}
