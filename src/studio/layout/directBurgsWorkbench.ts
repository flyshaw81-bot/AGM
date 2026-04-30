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
import {
  renderDirectWorkbenchEntityRow,
  renderDirectWorkbenchHeader,
  renderDirectWorkbenchSearchControls,
} from "./directWorkbenchViewParts";
import { t } from "./shellShared";

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
    { value: "populated", label: t(language, "Populated", "Populated") },
  ];

  return `
    <section id="studioDirectBurgsWorkbench" class="studio-panel studio-direct-editor studio-direct-burg-editor" data-direct-workbench="burgs">
      ${renderDirectWorkbenchHeader({
        eyebrow: t(language, "AGM editor", "AGM editor"),
        title: t(language, "Burgs Workbench", "Burgs Workbench"),
        badge: t(language, "直接编辑", "Direct edit"),
      })}
      <p class="studio-panel__text">${t(language, "Bring high-frequency burg editing into AGM: search burgs, filter by selected state, focus the map, and edit name, type, state, culture, and population directly.", "Bring high-frequency burg editing into AGM: search burgs, filter by selected state, focus the map, and edit name, type, state, culture, and population directly.")}</p>
      ${renderDirectWorkbenchSearchControls({
        searchId: "studioBurgSearchInput",
        searchLabel: t(language, "搜索城镇", "Search burgs"),
        searchPlaceholder: t(
          language,
          "输入名称、ID、国家或文化",
          "Name, ID, state or culture",
        ),
        searchValue: directEditor.burgSearchQuery,
        selects: [
          {
            id: "studioBurgFilterSelect",
            label: t(language, "Filter", "Filter"),
            options: filterOptions,
            value: directEditor.burgFilterMode,
          },
        ],
        summary: {
          label: t(language, "当前列表", "Current list"),
          value: filteredBurgs.length,
        },
      })}
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(
              filteredBurgs,
              DIRECT_WORKBENCH_ROW_LIMITS.burgs,
            )
              .map((burg) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-burg-select",
                  color: "var(--studio-accent-muted)",
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
            `<div class="studio-panel__text">${t(language, "No matching burgs", "No matching burgs")}</div>`
          }
        </div>
        ${renderDirectBurgDetail({
          cultureOptions,
          getCultureName,
          getStateName,
          language,
          directEditor,
          selectedBurg,
          stateOptions,
        })}
      </div>
    </section>
  `;
}
