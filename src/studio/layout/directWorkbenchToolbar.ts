import type { StudioLanguage } from "../types";
import { renderDirectSelectOptions } from "./directWorkbenchShared";
import { escapeHtml, studioIcon, t } from "./shellShared";

type DirectWorkbenchToolbarOption = {
  value: string | number;
  label: string;
};

export function renderDirectWorkbenchToolbar({
  filterId,
  filterOptions,
  filterValue,
  language,
  searchId,
  searchPlaceholder,
  searchValue,
}: {
  filterId: string;
  filterOptions: DirectWorkbenchToolbarOption[];
  filterValue: string | number;
  language: StudioLanguage;
  searchId: string;
  searchPlaceholder: string;
  searchValue: string;
}) {
  return `<div class="studio-native-states__toolbar studio-native-identity__toolbar" data-direct-workbench-toolbar="true">
    <label class="studio-native-states__search studio-native-identity__search">
      ${studioIcon("search", "studio-native-states__search-icon studio-native-identity__search-icon")}
      <input id="${escapeHtml(searchId)}" type="search" value="${escapeHtml(searchValue)}" placeholder="${escapeHtml(searchPlaceholder)}" autocomplete="off" />
    </label>
    <div class="studio-native-states__filters studio-native-identity__filters">
      <label class="studio-native-states__select studio-native-states__select--filter studio-native-identity__select">
        ${studioIcon("filter", "studio-native-states__select-icon")}
        <span>${t(language, "筛选", "Filter")}</span>
        <select id="${escapeHtml(filterId)}">${renderDirectSelectOptions(filterOptions, filterValue)}</select>
      </label>
    </div>
  </div>`;
}
