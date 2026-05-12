import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type {
  DirectDiplomacyFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import { renderDirectDiplomacyDetail } from "./directDiplomacyWorkbenchDetail";
import {
  filterDirectDiplomacyRelations,
  getActiveDirectDiplomacyStates,
  getDirectDiplomacyRelation,
  selectDirectDiplomacyObject,
  selectDirectDiplomacySubject,
} from "./directDiplomacyWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
} from "./directWorkbenchShared";
import { renderDirectWorkbenchToolbar } from "./directWorkbenchToolbar";
import { renderDirectWorkbenchEntityRow } from "./directWorkbenchViewParts";
import { t } from "./shellShared";

function renderNativeDiplomacyListHeader(
  language: StudioLanguage,
  activeCount: number,
  visibleCount: number,
) {
  return `<div class="studio-native-identity__list-title">
    <div>
      <h3>${t(language, "外交关系", "Diplomacy")}</h3>
    </div>
    <strong>${visibleCount}/${Math.max(activeCount - 1, 0)}</strong>
  </div>`;
}

function renderDiplomacySubjectSelect(
  states: EngineEntitySummaryItem[],
  subject: EngineEntitySummaryItem | undefined,
  language: StudioLanguage,
) {
  return `<label class="studio-native-identity__select">
    <span>${t(language, "主体国家", "Subject state")}</span>
    <select id="studioDiplomacySubjectSelect">
      ${renderDirectSelectOptions(
        states.map((state) => ({
          value: state.id,
          label: `${state.name} #${state.id}`,
        })),
        subject?.id ?? 0,
      )}
    </select>
  </label>`;
}

export function renderDirectDiplomacyWorkbench(
  entitySummary: EngineEntitySummary,
  worldResources: EngineWorldResourceSummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const states = getActiveDirectDiplomacyStates(entitySummary.states);
  const subject = selectDirectDiplomacySubject(
    states,
    directEditor.selectedDiplomacySubjectId,
  );
  const object = selectDirectDiplomacyObject(
    states,
    subject,
    directEditor.selectedDiplomacyObjectId,
  );
  const query = normalizeWorkbenchQuery(directEditor.diplomacySearchQuery);
  const relationFor = (state: EngineEntitySummaryItem) =>
    getDirectDiplomacyRelation(subject, state);
  const filteredRelations = filterDirectDiplomacyRelations(
    states,
    subject,
    directEditor.diplomacyFilterMode,
    query,
  );
  const filterOptions: { value: DirectDiplomacyFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部关系", "All relations") },
    { value: "conflict", label: t(language, "冲突关系", "Conflict") },
    { value: "positive", label: t(language, "正向关系", "Positive") },
  ];
  const visibleRelations = limitDirectWorkbenchRows(filteredRelations);

  return `
    <section id="studioDirectDiplomacyWorkbench" class="studio-native-identity studio-native-identity--diplomacy studio-direct-editor studio-direct-diplomacy-editor" data-native-diplomacy-drawer="true" data-direct-workbench="diplomacy">
      ${renderDirectWorkbenchToolbar({
        filterId: "studioDiplomacyFilterSelect",
        filterOptions,
        filterValue: directEditor.diplomacyFilterMode,
        language,
        searchId: "studioDiplomacySearchInput",
        searchPlaceholder: t(
          language,
          "搜索国家、ID 或关系",
          "Search state, ID, or relation",
        ),
        searchValue: directEditor.diplomacySearchQuery,
      })}
      <aside class="studio-native-identity__list studio-native-identity__list--relations">
        ${renderNativeDiplomacyListHeader(language, states.length, filteredRelations.length)}
        ${renderDiplomacySubjectSelect(states, subject, language)}
        <div class="studio-native-identity__rows">
          ${
            visibleRelations
              .map((state) =>
                renderDirectWorkbenchEntityRow({
                  action: "direct-diplomacy-object-select",
                  color: state.color || "var(--studio-native-accent)",
                  id: state.id,
                  idDataAttribute: "state-id",
                  meta: relationFor(state),
                  metric: `#${state.id}`,
                  selected: state.id === object?.id,
                  title: state.name,
                }),
              )
              .join("") ||
            `<div class="studio-native-identity__empty">${t(language, "没有匹配的外交关系", "No matching relations")}</div>`
          }
        </div>
      </aside>
      <div class="studio-native-identity__divider"></div>
      ${renderDirectDiplomacyDetail({
        language,
        directEditor,
        object,
        subject,
        worldResources,
      })}
    </section>
  `;
}
