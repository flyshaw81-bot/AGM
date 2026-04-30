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
import {
  renderDirectWorkbenchEntityRow,
  renderDirectWorkbenchHeader,
  renderDirectWorkbenchSearchControls,
} from "./directWorkbenchViewParts";
import { t } from "./shellShared";

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
    { value: "has-burg", label: t(language, "Has burg", "Has burg") },
  ];

  return `
    <section id="studioDirectProvincesWorkbench" class="studio-panel studio-direct-editor studio-direct-province-editor" data-direct-workbench="provinces">
      ${renderDirectWorkbenchHeader({
        eyebrow: t(language, "AGM editor", "AGM editor"),
        title: t(language, "Provinces Workbench", "Provinces Workbench"),
        badge: t(language, "直接编辑", "Direct edit"),
      })}
      <p class="studio-panel__text">${t(language, "Province editing moves into the AGM native panel: search provinces, filter by selected state, focus the map, and maintain name, type, state, linked burg, and color directly.", "Province editing moves into the AGM native panel: search provinces, filter by selected state, focus the map, and maintain name, type, state, linked burg, and color directly.")}</p>
      ${renderDirectWorkbenchSearchControls({
        searchId: "studioProvinceSearchInput",
        searchLabel: t(language, "搜索省份", "Search provinces"),
        searchPlaceholder: t(
          language,
          "输入名称、ID、国家或城镇",
          "Name, ID, state or burg",
        ),
        searchValue: directEditor.provinceSearchQuery,
        selects: [
          {
            id: "studioProvinceFilterSelect",
            label: t(language, "Filter", "Filter"),
            options: filterOptions,
            value: directEditor.provinceFilterMode,
          },
        ],
        summary: {
          label: t(language, "当前列表", "Current list"),
          value: filteredProvinces.length,
        },
      })}
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredProvinces)
              .map((province) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-province-select",
                  color: province.color || "#8fbf7a",
                  id: province.id,
                  idDataAttribute: "province-id",
                  meta: `${getStateName(province.state)} · ${province.type || t(language, "省份", "Province")}`,
                  metric: `#${province.id}`,
                  selected: province.id === selectedProvince?.id,
                  title: province.name,
                }),
              )
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching provinces", "No matching provinces")}</div>`
          }
        </div>
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
      </div>
    </section>
  `;
}
