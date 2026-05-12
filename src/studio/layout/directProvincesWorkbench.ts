import type {
  EngineEntitySummary,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import type {
  DirectProvinceFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderDirectProvinceDetail } from "./directProvincesWorkbenchDetail";
import {
  filterAndSortDirectProvinces,
  getActiveDirectProvinces,
  getDirectProvinceColor,
  selectDirectProvince,
} from "./directProvincesWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import { limitDirectWorkbenchRows } from "./directWorkbenchShared";
import { renderDirectWorkbenchToolbar } from "./directWorkbenchToolbar";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { t } from "./shellShared";

function renderNativeProvinceListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "省份列表", "Province list")}</h3>
    </div>
    <strong>${visibleCount}/${activeCount}</strong>
  </div>`;
}

export function renderDirectProvincesWorkbench(
  provinces: EngineProvinceSummaryItem[],
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeProvinces = getActiveDirectProvinces(provinces);
  const query = normalizeWorkbenchQuery(directEditor.provinceSearchQuery);
  const stateOptions = entitySummary.states.filter(
    (state) => state.id > 0 && state.name && state.name !== "Neutrals",
  );
  const burgOptions = entitySummary.burgs.filter(
    (burg) => burg.id > 0 && burg.name,
  );
  const getStateName = (stateId?: number) =>
    stateOptions.find((state) => state.id === stateId)?.name ||
    (stateId ? `#${stateId}` : "-");
  const getBurgName = (burgId?: number) =>
    burgOptions.find((burg) => burg.id === burgId)?.name ||
    (burgId ? `#${burgId}` : "-");
  const filteredProvinces = filterAndSortDirectProvinces(
    activeProvinces,
    directEditor,
    query,
    getStateName,
    getBurgName,
  );
  const selectedProvince = selectDirectProvince(
    filteredProvinces,
    activeProvinces,
    directEditor.selectedProvinceId,
  );
  const selectedColor = getDirectProvinceColor(selectedProvince);
  const filterOptions: { value: DirectProvinceFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部省份", "All provinces") },
    {
      value: "selected-state",
      label: t(language, "当前国家", "Selected state"),
    },
    { value: "has-burg", label: t(language, "有关联城镇", "Has burg") },
  ];
  const visibleProvinces = limitDirectWorkbenchRows(filteredProvinces);

  return `
    <section id="studioDirectProvincesWorkbench" class="studio-native-identity studio-native-identity--provinces studio-direct-editor" data-native-place-drawer="provinces" data-direct-workbench="provinces">
      ${renderDirectWorkbenchToolbar({
        filterId: "studioProvinceFilterSelect",
        filterOptions,
        filterValue: directEditor.provinceFilterMode,
        language,
        searchId: "studioProvinceSearchInput",
        searchPlaceholder: t(
          language,
          "搜索省份、ID、国家或城镇",
          "Search province, ID, state, or burg",
        ),
        searchValue: directEditor.provinceSearchQuery,
      })}
      <aside class="studio-native-identity__list">
        ${renderNativeProvinceListHeader(language, activeProvinces.length, filteredProvinces.length)}
        <div class="studio-native-identity__rows">
          ${
            visibleProvinces
              .map((province) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-province-select",
                  color: province.color || "#8fbf7a",
                  id: province.id,
                  idDataAttribute: "province-id",
                  meta: `${getStateName(province.state)} / ${province.type || t(language, "省份", "Province")}`,
                  metric: `#${province.id}`,
                  selected: province.id === selectedProvince?.id,
                  title: province.name,
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的省份", "No matching provinces")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      ${renderDirectProvinceDetail({
        burgOptions,
        getBurgName,
        getStateName,
        language,
        directEditor,
        selectedColor,
        selectedProvince,
        stateOptions,
      })}
    </section>
  `;
}
