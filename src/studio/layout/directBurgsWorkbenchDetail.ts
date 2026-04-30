import type { EngineEntitySummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import {
  formatEntityPickerValue,
  getDirectWorkbenchEditStatus,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

type NativeBurgDetailOptions = {
  cultureOptions: EngineEntitySummaryItem[];
  getCultureName: (cultureId?: number) => string;
  getStateName: (stateId?: number) => string;
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedBurg: EngineEntitySummaryItem | undefined;
  stateOptions: EngineEntitySummaryItem[];
};

export function renderDirectBurgDetail({
  cultureOptions,
  getCultureName,
  getStateName,
  language,
  directEditor,
  selectedBurg,
  stateOptions,
}: NativeBurgDetailOptions) {
  const currentBurgState = stateOptions.find(
    (state) => state.id === selectedBurg?.state,
  );
  const currentBurgCulture = cultureOptions.find(
    (culture) => culture.id === selectedBurg?.culture,
  );
  const burgStatus = getDirectWorkbenchEditStatus(
    Boolean(selectedBurg && directEditor.lastAppliedBurgId === selectedBurg.id),
  );

  return `<div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedBurg ? escapeHtml(selectedBurg.name) : "-"}</h3>
            </div>
          </div>
          ${
            selectedBurg
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "名称", "Name")}</span>
                <input id="studioBurgNameInput" value="${escapeHtml(selectedBurg.name)}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "类型", "Type")}</span>
                <input id="studioBurgTypeInput" value="${escapeHtml(selectedBurg.type || "")}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "State", "State")}</span>
                <input id="studioBurgStateInput" list="studioBurgStateOptions" value="${escapeHtml(formatEntityPickerValue(currentBurgState, selectedBurg.state))}" placeholder="${t(language, "搜索国家名称或输入 ID", "Search state or type an ID")}" autocomplete="off" data-entity-id="${selectedBurg.state ?? ""}" />
                <datalist id="studioBurgStateOptions">
                  ${stateOptions.map((state) => `<option value="${escapeHtml(formatEntityPickerValue(state, state.id))}" label="#${state.id}"></option>`).join("")}
                </datalist>
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "文化", "Culture")}</span>
                <input id="studioBurgCultureInput" list="studioBurgCultureOptions" value="${escapeHtml(formatEntityPickerValue(currentBurgCulture, selectedBurg.culture))}" placeholder="${t(language, "搜索文化名称或输入 ID", "Search culture or type an ID")}" autocomplete="off" data-entity-id="${selectedBurg.culture ?? ""}" />
                <datalist id="studioBurgCultureOptions">
                  ${cultureOptions.map((culture) => `<option value="${escapeHtml(formatEntityPickerValue(culture, culture.id))}" label="#${culture.id}"></option>`).join("")}
                </datalist>
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "人口", "Population")}</span>
                <input id="studioBurgPopulationInput" type="number" min="0" step="1" value="${selectedBurg.population ?? ""}" />
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "城镇 ID", "Burg ID")}</span><strong>${selectedBurg.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "国家", "State")}</span><strong>${escapeHtml(getStateName(selectedBurg.state))}</strong></div>
              <div class="studio-kv"><span>${t(language, "文化", "Culture")}</span><strong>${escapeHtml(getCultureName(selectedBurg.culture))}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedBurg ? renderDirectWorkbenchEditStatus("studioBurgEditStatus", language, burgStatus) : ""}
            ${selectedBurg ? `<button class="studio-primary-action" data-studio-action="direct-burg-apply" data-burg-id="${selectedBurg.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedBurg ? `<button class="studio-ghost" data-studio-action="direct-burg-reset" data-burg-id="${selectedBurg.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedBurg?.state ? `<button class="studio-ghost" data-studio-action="direct-state-open" data-state-id="${selectedBurg.state}">${t(language, "Open state", "Open state")}</button>` : ""}
            ${selectedBurg?.culture ? `<button class="studio-ghost" data-studio-action="direct-culture-open" data-culture-id="${selectedBurg.culture}">${t(language, "查看文化", "Open culture")}</button>` : ""}
            ${selectedBurg ? renderFocusButton("burg", selectedBurg.id, selectedBurg.name, "focus", language) : ""}
          </div>
        </div>`;
}
