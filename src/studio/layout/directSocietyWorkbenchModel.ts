import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type {
  DirectCultureFilterMode,
  DirectReligionFilterMode,
} from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export type NativeSocietyFilterMode =
  | DirectCultureFilterMode
  | DirectReligionFilterMode;

export function getActiveDirectSocietyItems(
  items: readonly EngineEntitySummaryItem[],
) {
  return items.filter((item) => item.id > 0 && item.name);
}

export function filterAndSortDirectSocietyItems(
  activeItems: readonly EngineEntitySummaryItem[],
  filterMode: NativeSocietyFilterMode,
  query: string,
) {
  return [...activeItems]
    .filter((item) => {
      if (filterMode === "populated" && !(item.cells && item.cells > 0)) {
        return false;
      }
      if (
        filterMode === "has-center" &&
        item.capital === undefined &&
        item.state === undefined
      ) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        item.name,
        item.formName,
        item.form,
        item.type,
        String(item.id),
        String(item.cells ?? ""),
      ]);
    })
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.id - right.id,
    );
}

export function selectDirectSocietyItem(
  filteredItems: EngineEntitySummaryItem[],
  activeItems: EngineEntitySummaryItem[],
  selectedId: number | null,
) {
  return selectVisibleWorkbenchItem(filteredItems, activeItems, selectedId);
}

export function getDirectSocietyColor(
  selectedItem: EngineEntitySummaryItem | undefined,
  fallbackColor: string,
) {
  return selectedItem?.color && /^#[0-9a-f]{6}$/i.test(selectedItem.color)
    ? selectedItem.color
    : fallbackColor;
}
