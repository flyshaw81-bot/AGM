import type { EngineEntitySummary } from "../bridge/engineActions";
import type {
  DirectStateFilterMode,
  DirectStateSortMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderNativeStateDetail } from "./directStatesWorkbenchDetail";
import {
  filterAndSortDirectStates,
  formatStatePopulation,
  getActiveDirectStates,
  getNativeStateColor,
  getNativeStateTotalPopulation,
  selectDirectState,
} from "./directStatesWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  DIRECT_WORKBENCH_ROW_LIMITS,
  limitDirectWorkbenchRows,
} from "./directWorkbenchShared";
import {
  renderDirectWorkbenchEntityRow,
  renderDirectWorkbenchHeader,
  renderDirectWorkbenchSearchControls,
  renderDirectWorkbenchStats,
} from "./directWorkbenchViewParts";
import { t } from "./shellShared";

export function renderDirectStatesWorkbench(
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeStates = getActiveDirectStates(entitySummary.states);
  const query = normalizeWorkbenchQuery(directEditor.stateSearchQuery);
  const filteredStates = filterAndSortDirectStates(
    activeStates,
    directEditor,
    query,
  );
  const selectedState = selectDirectState(
    filteredStates,
    activeStates,
    directEditor.selectedStateId,
  );
  const totalPopulation = getNativeStateTotalPopulation(activeStates);
  const selectedColor = getNativeStateColor(selectedState);
  const cultureOptions = entitySummary.cultures.filter(
    (culture) => culture.id > 0 && culture.name,
  );
  const filterOptions: { value: DirectStateFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部国家", "All states") },
    { value: "populated", label: t(language, "Populated", "Populated") },
    {
      value: "neighbors",
      label: t(language, "Has neighbors", "Has neighbors"),
    },
  ];
  const sortOptions: { value: DirectStateSortMode; label: string }[] = [
    { value: "name", label: t(language, "名称", "Name") },
    { value: "population", label: t(language, "人口", "Population") },
    { value: "area", label: t(language, "面积", "Area") },
    { value: "id", label: "ID" },
  ];

  return `
    <section id="studioDirectStatesWorkbench" class="studio-panel studio-direct-editor" data-direct-workbench="states">
      ${renderDirectWorkbenchHeader({
        eyebrow: t(language, "AGM editor", "AGM editor"),
        title: t(language, "States Workbench", "States Workbench"),
        badge: t(language, "直接编辑", "Direct edit"),
      })}
      <p class="studio-panel__text">${t(language, "Select a state, edit identity, form, color, population, and references in the inspector, then write back to the current map.", "Select a state, edit identity, form, color, population, and references in the inspector, then write back to the current map.")}</p>
      ${renderDirectWorkbenchStats([
        { label: t(language, "国家", "States"), value: activeStates.length },
        {
          label: t(language, "当前列表", "Current list"),
          value: filteredStates.length,
        },
        {
          label: t(language, "Total population", "Total population"),
          value: formatStatePopulation(totalPopulation),
        },
        {
          label: t(language, "排序", "Sort"),
          value:
            sortOptions.find(
              (option) => option.value === directEditor.stateSortMode,
            )?.label ?? "-",
        },
      ])}
      ${renderDirectWorkbenchSearchControls({
        searchId: "studioStateSearchInput",
        searchLabel: t(language, "搜索国家", "Search states"),
        searchPlaceholder: t(
          language,
          "输入名称、ID、文化或政体",
          "Name, ID, culture or form",
        ),
        searchValue: directEditor.stateSearchQuery,
        selects: [
          {
            id: "studioStateFilterSelect",
            label: t(language, "Filter", "Filter"),
            options: filterOptions,
            value: directEditor.stateFilterMode,
          },
          {
            id: "studioStateSortSelect",
            label: t(language, "排序", "Sort"),
            options: sortOptions,
            value: directEditor.stateSortMode,
          },
        ],
      })}
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(
              filteredStates,
              DIRECT_WORKBENCH_ROW_LIMITS.states,
            )
              .map((state) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-state-select",
                  color: state.color || "var(--studio-accent)",
                  id: state.id,
                  idDataAttribute: "state-id",
                  meta: `${state.formName || state.type || t(language, "国家", "State")} · ${t(language, "文化", "Culture")} ${state.culture ?? "-"}`,
                  metric: formatStatePopulation(state.population),
                  selected: state.id === selectedState?.id,
                  title: state.name,
                }),
              )
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching states", "No matching states")}</div>`
          }
        </div>
        ${renderNativeStateDetail({
          cultureOptions,
          entitySummary,
          language,
          directEditor,
          selectedColor,
          selectedState,
        })}
      </div>
    </section>
  `;
}
