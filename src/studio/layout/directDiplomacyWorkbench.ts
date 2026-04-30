import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type {
  DirectDiplomacyFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import {
  DIPLOMACY_RELATION_OPTIONS,
  filterDirectDiplomacyRelations,
  getActiveDirectDiplomacyStates,
  getDirectDiplomacyPairKey,
  getDirectDiplomacyRelation,
  selectDirectDiplomacyObject,
  selectDirectDiplomacySubject,
} from "./directDiplomacyWorkbenchModel";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import {
  getDirectWorkbenchEditStatus,
  limitDirectWorkbenchRows,
  renderDirectSelectOptions,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

export function renderDirectDiplomacyWorkbench(
  entitySummary: EngineEntitySummary,
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
  const selectedRelation = getDirectDiplomacyRelation(subject, object);
  const pairKey = getDirectDiplomacyPairKey(subject, object);
  const diplomacyStatus = getDirectWorkbenchEditStatus(
    Boolean(pairKey && directEditor.lastAppliedDiplomacyPair === pairKey),
  );
  const filterOptions: { value: DirectDiplomacyFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部关系", "All relations") },
    { value: "conflict", label: t(language, "冲突关系", "Conflict") },
    { value: "positive", label: t(language, "正向关系", "Positive") },
  ];
  const renderRelationRow = (
    state: EngineEntitySummaryItem,
    selected: boolean,
  ) => `
    <button class="studio-state-row${selected ? " is-active" : ""}" data-studio-action="direct-diplomacy-object-select" data-state-id="${state.id}">
      <span class="studio-state-row__swatch" style="background: ${escapeHtml(state.color || "var(--studio-accent)")}"></span>
      <span class="studio-state-row__main"><strong>${escapeHtml(state.name)}</strong><small>${escapeHtml(relationFor(state))}</small></span>
      <span class="studio-state-row__metric">#${state.id}</span>
    </button>
  `;

  return `
    <section id="studioDirectDiplomacyWorkbench" class="studio-panel studio-direct-editor studio-direct-diplomacy-editor" data-direct-workbench="diplomacy">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "AGM editor", "AGM editor")}</div>
          <h2 class="studio-panel__hero">${t(language, "Diplomacy Workbench", "Diplomacy Workbench")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "直接编辑", "Direct edit")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "Choose the subject state in the AGM panel, then maintain its relation to other states; vassal/suzerain writes the reciprocal relation automatically.", "Choose the subject state in the AGM panel, then maintain its relation to other states; vassal/suzerain writes the reciprocal relation automatically.")}</p>
      <div class="studio-direct-state-controls">
        <label class="studio-stack-field studio-state-search-field">
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
        </label>
        <label class="studio-stack-field studio-state-search-field">
          <span>${t(language, "搜索关系", "Search relations")}</span>
          <input id="studioDiplomacySearchInput" class="studio-input" type="search" value="${escapeHtml(directEditor.diplomacySearchQuery)}" placeholder="${t(language, "State, ID or relation", "State, ID or relation")}" autocomplete="off" />
        </label>
        <label class="studio-stack-field">
          <span>${t(language, "Filter", "Filter")}</span>
          <select id="studioDiplomacyFilterSelect">
            ${renderDirectSelectOptions(filterOptions, directEditor.diplomacyFilterMode)}
          </select>
        </label>
      </div>
      <div class="studio-direct-states">
        <div class="studio-direct-states__list">
          ${
            limitDirectWorkbenchRows(filteredRelations)
              .map((state) => renderRelationRow(state, state.id === object?.id))
              .join("") ||
            `<div class="studio-panel__text">${t(language, "No matching relations", "No matching relations")}</div>`
          }
        </div>
        <div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(subject?.color || "var(--studio-accent)")}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前关系", "Selected relation")}</div>
              <h3 class="studio-panel__title">${subject && object ? `${escapeHtml(subject.name)} - ${escapeHtml(object.name)}` : "-"}</h3>
            </div>
          </div>
          ${
            subject && object
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "关系", "Relation")}</span>
                <select id="studioDiplomacyRelationSelect">
                  ${renderDirectSelectOptions(
                    DIPLOMACY_RELATION_OPTIONS.map((relation) => ({
                      value: relation,
                      label: relation,
                    })),
                    selectedRelation,
                  )}
                </select>
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "主体", "Subject")}</span><strong>${escapeHtml(subject.fullName || subject.name)} #${subject.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "对象", "Object")}</span><strong>${escapeHtml(object.fullName || object.name)} #${object.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "当前关系", "Current relation")}</span><strong>${escapeHtml(selectedRelation)}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${subject && object ? renderDirectWorkbenchEditStatus("studioDiplomacyEditStatus", language, diplomacyStatus) : ""}
            ${subject && object ? `<button class="studio-primary-action" data-studio-action="direct-diplomacy-apply" data-subject-id="${subject.id}" data-object-id="${object.id}">${t(language, "应用关系", "Apply relation")}</button>` : ""}
            ${subject && object ? `<button class="studio-ghost" data-studio-action="direct-diplomacy-reset" data-subject-id="${subject.id}" data-object-id="${object.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${subject ? renderFocusButton("state", subject.id, "direct-diplomacy-subject", "focus", language) : ""}
            ${object ? renderFocusButton("state", object.id, "direct-diplomacy-object", "focus", language) : ""}
          </div>
        </div>
      </div>
    </section>
  `;
}
