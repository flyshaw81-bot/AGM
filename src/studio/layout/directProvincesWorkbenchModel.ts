import type { EngineProvinceSummaryItem } from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export function getActiveDirectProvinces(
  provinces: readonly EngineProvinceSummaryItem[],
) {
  return provinces.filter((province) => province.id > 0 && province.name);
}

export function filterAndSortDirectProvinces(
  activeProvinces: readonly EngineProvinceSummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
  getStateName: (stateId?: number) => string,
  getBurgName: (burgId?: number) => string,
) {
  return [...activeProvinces]
    .filter((province) => {
      if (
        directEditor.provinceFilterMode === "selected-state" &&
        directEditor.selectedStateId !== null &&
        province.state !== directEditor.selectedStateId
      ) {
        return false;
      }
      if (directEditor.provinceFilterMode === "has-burg" && !province.burg) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        province.name,
        province.fullName,
        province.type,
        String(province.id),
        String(province.state ?? ""),
        getStateName(province.state),
        getBurgName(province.burg),
      ]);
    })
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.id - right.id,
    );
}

export function selectDirectProvince(
  filteredProvinces: EngineProvinceSummaryItem[],
  activeProvinces: EngineProvinceSummaryItem[],
  selectedProvinceId: number | null,
) {
  return selectVisibleWorkbenchItem(
    filteredProvinces,
    activeProvinces,
    selectedProvinceId,
  );
}

export function getDirectProvinceColor(
  selectedProvince: EngineProvinceSummaryItem | undefined,
) {
  return selectedProvince?.color &&
    /^#[0-9a-f]{6}$/i.test(selectedProvince.color)
    ? selectedProvince.color
    : "#8fbf7a";
}
