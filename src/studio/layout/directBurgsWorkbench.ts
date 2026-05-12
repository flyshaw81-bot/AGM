import type { EngineEntitySummary } from "../bridge/engineActionTypes";
import type {
  DirectBurgFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderDirectBurgDetail } from "./directBurgsWorkbenchDetail";
import {
  filterAndSortDirectBurgs,
  getActiveDirectBurgs,
  selectDirectBurg,
} from "./directBurgsWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  DIRECT_WORKBENCH_ROW_LIMITS,
  limitDirectWorkbenchRows,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchToolbar } from "./directWorkbenchToolbar";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { t } from "./shellShared";

function renderNativeBurgListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "城镇列表", "Burg list")}</h3>
    </div>
    <strong>${visibleCount}/${activeCount}</strong>
  </div>`;
}

export function renderDirectBurgsWorkbench(
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeBurgs = getActiveDirectBurgs(entitySummary.burgs);
  const query = normalizeWorkbenchQuery(directEditor.burgSearchQuery);
  const stateOptions = entitySummary.states.filter(
    (state) => state.id > 0 && state.name && state.name !== "Neutrals",
  );
  const cultureOptions = entitySummary.cultures.filter(
    (culture) => culture.id > 0 && culture.name,
  );
  const getStateName = (stateId?: number) =>
    stateOptions.find((state) => state.id === stateId)?.name ||
    (stateId ? `#${stateId}` : "-");
  const getCultureName = (cultureId?: number) =>
    cultureOptions.find((culture) => culture.id === cultureId)?.name ||
    (cultureId ? `#${cultureId}` : "-");
  const filteredBurgs = filterAndSortDirectBurgs(
    activeBurgs,
    directEditor,
    query,
    getStateName,
    getCultureName,
  );
  const selectedBurg = selectDirectBurg(
    filteredBurgs,
    activeBurgs,
    directEditor.selectedBurgId,
  );
  const filterOptions: { value: DirectBurgFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部城镇", "All burgs") },
    {
      value: "selected-state",
      label: t(language, "当前国家", "Selected state"),
    },
    { value: "populated", label: t(language, "有人口", "Populated") },
  ];
  const visibleBurgs = limitDirectWorkbenchRows(
    filteredBurgs,
    DIRECT_WORKBENCH_ROW_LIMITS.burgs,
  );

  return `
    <section id="studioDirectBurgsWorkbench" class="studio-native-identity studio-native-identity--burgs studio-direct-editor" data-native-place-drawer="burgs" data-direct-workbench="burgs">
      ${renderDirectWorkbenchToolbar({
        filterId: "studioBurgFilterSelect",
        filterOptions,
        filterValue: directEditor.burgFilterMode,
        language,
        searchId: "studioBurgSearchInput",
        searchPlaceholder: t(
          language,
          "搜索城镇、ID、国家或文化",
          "Search burg, ID, state, or culture",
        ),
        searchValue: directEditor.burgSearchQuery,
      })}
      <aside class="studio-native-identity__list">
        ${renderNativeBurgListHeader(language, activeBurgs.length, filteredBurgs.length)}
        <div class="studio-native-identity__rows">
          ${
            visibleBurgs
              .map((burg) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-burg-select",
                  color: "var(--studio-native-accent)",
                  id: burg.id,
                  idDataAttribute: "burg-id",
                  meta: `${getStateName(burg.state)} · ${burg.type || t(language, "城镇", "Burg")}`,
                  metric: `#${burg.id}`,
                  selected: burg.id === selectedBurg?.id,
                  swatchClass: "studio-state-row__swatch--burg",
                  title: burg.name,
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的城镇", "No matching burgs")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      ${renderDirectBurgDetail({
        cultureOptions,
        getCultureName,
        getStateName,
        language,
        directEditor,
        selectedBurg,
        stateOptions,
      })}
    </section>
  `;
}
