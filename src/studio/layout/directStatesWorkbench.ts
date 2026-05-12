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
  renderDirectSelectOptions,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeStateOption = { value: string; label: string };
type NativeStateSelectOptions = {
  className?: string;
  hidden?: boolean;
  icon?: string;
};

function renderNativeStateStat(label: string, value: string | number) {
  return `<div class="studio-native-states__stat"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`;
}

function renderNativeStateSelect(
  id: string,
  label: string,
  options: NativeStateOption[],
  value: string,
  selectOptions: NativeStateSelectOptions = {},
) {
  const classes = ["studio-native-states__select", selectOptions.className]
    .filter(Boolean)
    .join(" ");
  const displayLabel =
    id === "studioStateFilterSelect" && label !== "Filter" ? "筛选" : label;

  return `<label class="${escapeHtml(classes)}"${selectOptions.hidden ? ' aria-hidden="true"' : ""}>
    ${selectOptions.icon ? studioIcon(selectOptions.icon, "studio-native-states__select-icon") : ""}
    <span>${escapeHtml(displayLabel)}</span>
    <select id="${escapeHtml(id)}"${selectOptions.hidden ? ' tabindex="-1"' : ""}>${renderDirectSelectOptions(options, value)}</select>
  </label>`;
}

function renderNativeStateListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `
    <div class="studio-native-states__list-title">
      <div>
        <h3>${t(language, "国家列表", "State list")}</h3>
      </div>
      <strong>${visibleCount}/${activeCount}</strong>
    </div>
  `;
}

function renderNativeStateCreateStub(language: StudioLanguage) {
  return `<button class="studio-native-states__new" type="button" disabled title="${t(language, "需要下一步接入创建国家写回 API", "Requires the next create-state writeback API pass")}">${studioIcon("plus", "studio-native-states__new-icon")}<span>${t(language, "新建国家", "New state")}</span></button>`;
}

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
    { value: "populated", label: t(language, "有人口", "Populated") },
    {
      value: "neighbors",
      label: t(language, "有邻国", "Has neighbors"),
    },
  ];
  const sortOptions: { value: DirectStateSortMode; label: string }[] = [
    { value: "name", label: t(language, "名称", "Name") },
    { value: "population", label: t(language, "人口", "Population") },
    { value: "area", label: t(language, "面积", "Area") },
    { value: "id", label: "ID" },
  ];
  const visibleStates = limitDirectWorkbenchRows(
    filteredStates,
    DIRECT_WORKBENCH_ROW_LIMITS.states,
  );

  return `
    <section id="studioDirectStatesWorkbench" class="studio-native-states studio-direct-editor" data-native-states-drawer="true" data-direct-workbench="states">
      <div class="studio-native-states__toolbar studio-native-identity__toolbar" data-native-states-toolbar="true" data-direct-workbench-toolbar="true">
        <label class="studio-native-states__search studio-native-identity__search">
          ${studioIcon("search", "studio-native-states__search-icon")}
          <input id="studioStateSearchInput" type="search" value="${escapeHtml(directEditor.stateSearchQuery)}" placeholder="${t(language, "搜索国家、ID、文化或政体", "Search states...")}" autocomplete="off" />
        </label>
        <div class="studio-native-states__filters studio-native-identity__filters">
          ${renderNativeStateSelect(
            "studioStateFilterSelect",
            t(language, "筛选", "Filter"),
            filterOptions,
            directEditor.stateFilterMode,
            {
              className:
                "studio-native-states__select--filter studio-native-identity__select",
              icon: "filter",
            },
          )}
          ${renderNativeStateSelect(
            "studioStateSortSelect",
            t(language, "排序", "Sort"),
            sortOptions,
            directEditor.stateSortMode,
            {
              className: "studio-native-states__select--compat-sort",
              hidden: true,
            },
          )}
        </div>
      </div>
      <aside class="studio-native-states__list studio-direct-states__list">
        ${renderNativeStateListHeader(language, activeStates.length, filteredStates.length)}
        <div class="studio-native-states__list-section"><span>${t(language, "国家列表", "State list")}</span><strong>${visibleStates.length}</strong></div>
        <div class="studio-native-states__rows">
          ${
            visibleStates
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
            `<div class="studio-native-states__empty">${t(language, "没有匹配的国家", "No matching states")}</div>`
          }
        </div>
        ${renderNativeStateCreateStub(language)}
      </aside>
      <div class="studio-native-states__divider"></div>
      <article class="studio-native-states__detail-wrap">
        <div class="studio-native-states__stats">
          ${renderNativeStateStat(t(language, "国家", "States"), activeStates.length)}
          ${renderNativeStateStat(t(language, "当前列表", "Current list"), filteredStates.length)}
          ${renderNativeStateStat(t(language, "总人口", "Total population"), formatStatePopulation(totalPopulation))}
        </div>
        ${renderNativeStateDetail({
          cultureOptions,
          entitySummary,
          language,
          directEditor,
          selectedColor,
          selectedState,
        })}
      </article>
    </section>
  `;
}
