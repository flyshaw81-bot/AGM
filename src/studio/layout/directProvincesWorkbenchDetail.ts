import type {
  EngineEntitySummaryItem,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import {
  formatEntityPickerValue,
  getDirectWorkbenchEditStatus,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
import { escapeHtml, t } from "./shellShared";

type NativeProvinceDetailOptions = {
  burgOptions: EngineEntitySummaryItem[];
  getBurgName: (burgId?: number) => string;
  getStateName: (stateId?: number) => string;
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedColor: string;
  selectedProvince: EngineProvinceSummaryItem | undefined;
  stateOptions: EngineEntitySummaryItem[];
};

function getColorInputValue(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#8fbf7a";
}

export function renderDirectProvinceDetail({
  burgOptions,
  getBurgName,
  getStateName,
  language,
  directEditor,
  selectedColor,
  selectedProvince,
  stateOptions,
}: NativeProvinceDetailOptions) {
  const currentProvinceState = stateOptions.find(
    (state) => state.id === selectedProvince?.state,
  );
  const sameStateBurgs = selectedProvince
    ? burgOptions.filter((burg) => burg.state === selectedProvince.state)
    : [];
  const provinceBurgOptions = [...sameStateBurgs, ...burgOptions]
    .filter(
      (burg, index, options) =>
        options.findIndex((option) => option.id === burg.id) === index,
    )
    .slice(0, 160);
  const currentProvinceBurg =
    provinceBurgOptions.find((burg) => burg.id === selectedProvince?.burg) ||
    burgOptions.find((burg) => burg.id === selectedProvince?.burg);
  const provinceStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedProvince &&
        directEditor.lastAppliedProvinceId === selectedProvince.id,
    ),
  );

  return `<div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(selectedColor)}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedProvince ? escapeHtml(selectedProvince.fullName || selectedProvince.name) : "-"}</h3>
            </div>
          </div>
          ${
            selectedProvince
              ? `
            <div class="studio-state-editor-grid">
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "名称", "Name")}</span>
                <input id="studioProvinceNameInput" value="${escapeHtml(selectedProvince.name)}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "全名", "Full name")}</span>
                <input id="studioProvinceFullNameInput" value="${escapeHtml(selectedProvince.fullName || selectedProvince.name)}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "类型", "Type")}</span>
                <input id="studioProvinceTypeInput" value="${escapeHtml(selectedProvince.type || "")}" autocomplete="off" />
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "State", "State")}</span>
                <input id="studioProvinceStateInput" list="studioProvinceStateOptions" value="${escapeHtml(formatEntityPickerValue(currentProvinceState, selectedProvince.state))}" placeholder="${t(language, "搜索国家名称或输入 ID", "Search state or type an ID")}" autocomplete="off" data-entity-id="${selectedProvince.state ?? ""}" />
                <datalist id="studioProvinceStateOptions">
                  ${stateOptions.map((state) => `<option value="${escapeHtml(formatEntityPickerValue(state, state.id))}" label="#${state.id}"></option>`).join("")}
                </datalist>
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "关联城镇", "Linked burg")}</span>
                <input id="studioProvinceBurgInput" list="studioProvinceBurgOptions" value="${escapeHtml(formatEntityPickerValue(currentProvinceBurg, selectedProvince.burg))}" placeholder="${t(language, "搜索城镇名称或输入 ID", "Search burg or type an ID")}" autocomplete="off" data-entity-id="${selectedProvince.burg ?? ""}" />
                <datalist id="studioProvinceBurgOptions">
                  ${provinceBurgOptions.map((burg) => `<option value="${escapeHtml(formatEntityPickerValue(burg, burg.id))}" label="${escapeHtml([burg.state ? `${t(language, "国家", "State")} ${burg.state}` : "", `#${burg.id}`].filter(Boolean).join(" · "))}"></option>`).join("")}
                </datalist>
              </label>
              <label class="studio-stack-field studio-state-field">
                <span>${t(language, "颜色", "Color")}</span>
                <input id="studioProvinceColorInput" type="color" value="${escapeHtml(getColorInputValue(selectedColor))}" />
              </label>
            </div>
            <div class="studio-state-readonly-grid">
              <div class="studio-kv"><span>${t(language, "省份 ID", "Province ID")}</span><strong>${selectedProvince.id}</strong></div>
              <div class="studio-kv"><span>${t(language, "国家", "State")}</span><strong>${escapeHtml(getStateName(selectedProvince.state))}</strong></div>
              <div class="studio-kv"><span>${t(language, "关联城镇", "Linked burg")}</span><strong>${escapeHtml(getBurgName(selectedProvince.burg))}</strong></div>
              <div class="studio-kv"><span>${t(language, "Center cell", "Center cell")}</span><strong>${selectedProvince.center ?? "-"}</strong></div>
            </div>
          `
              : ""
          }
          <div class="studio-panel__actions studio-state-inspector__actions">
            ${selectedProvince ? renderDirectWorkbenchEditStatus("studioProvinceEditStatus", language, provinceStatus) : ""}
            ${selectedProvince ? `<button class="studio-primary-action" data-studio-action="direct-province-apply" data-province-id="${selectedProvince.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedProvince ? `<button class="studio-ghost" data-studio-action="direct-province-reset" data-province-id="${selectedProvince.id}">${t(language, "重置", "Reset")}</button>` : ""}
            ${selectedProvince?.state ? `<button class="studio-ghost" data-studio-action="direct-state-open" data-state-id="${selectedProvince.state}">${t(language, "Open state", "Open state")}</button>` : ""}
            ${selectedProvince?.burg ? `<button class="studio-ghost" data-studio-action="direct-burg-select" data-burg-id="${selectedProvince.burg}">${t(language, "查看关联城镇", "Open linked burg")}</button>` : ""}
            ${selectedProvince ? renderFocusButton("province", selectedProvince.id, selectedProvince.name, "focus", language) : ""}
          </div>
        </div>`;
}
