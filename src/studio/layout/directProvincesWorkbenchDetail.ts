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
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

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

function renderProvinceColorPicker(
  selectedColor: string,
  language: StudioLanguage,
) {
  const safeColor = getColorInputValue(selectedColor);
  return `<label class="studio-native-identity-field studio-native-color-field">
    <span>${t(language, "颜色", "Color")}</span>
    <span class="studio-native-color-control">
      <code>${escapeHtml(safeColor.toUpperCase())}</code>
      <input id="studioProvinceColorInput" type="color" value="${escapeHtml(safeColor)}" aria-label="${t(language, "更换省份颜色", "Change province color")}" />
    </span>
  </label>`;
}

function renderPlaceSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderResponsibilityFieldsAttribute(scope: "owned" | "related") {
  const labels = getDirectEditorFieldsByScope("provinces", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

function renderNativeProvinceReadonlyGrid(
  selectedProvince: EngineProvinceSummaryItem | undefined,
  language: StudioLanguage,
) {
  if (!selectedProvince) return "";
  const rows = [
    {
      label: t(language, "省份 ID", "Province ID"),
      value: selectedProvince.id,
    },
    {
      label: t(language, "中心单元格", "Center cell"),
      value: selectedProvince.center ?? "-",
    },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

export function renderDirectProvinceDetail({
  burgOptions,
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

  return `<article class="studio-native-identity__detail-wrap">
          <div class="studio-native-identity-detail" data-native-place-detail="province">
          ${
            selectedProvince
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderResponsibilityFieldsAttribute("owned")}>
              ${renderPlaceSectionLabel(t(language, "核心省份字段", "Core province fields"), "map-pin")}
              <div class="studio-native-identity-detail__form">
                <label class="studio-native-identity-field">
                  <span>${t(language, "名称", "Name")}</span>
                  <input id="studioProvinceNameInput" class="studio-input" value="${escapeHtml(selectedProvince.name)}" autocomplete="off" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "全名", "Full name")}</span>
                  <input id="studioProvinceFullNameInput" class="studio-input" value="${escapeHtml(selectedProvince.fullName || selectedProvince.name)}" autocomplete="off" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "类型", "Type")}</span>
                  <input id="studioProvinceTypeInput" class="studio-input" value="${escapeHtml(selectedProvince.type || "")}" autocomplete="off" />
                </label>
                ${renderProvinceColorPicker(selectedColor, language)}
              </div>
            </section>
            <section class="studio-native-identity-detail__section" data-editor-scope="related" ${renderResponsibilityFieldsAttribute("related")}>
              ${renderPlaceSectionLabel(t(language, "关联对象", "Related objects"), "git-branch")}
              <div class="studio-native-identity-detail__related-grid">
                <label class="studio-native-identity-field">
                  <span>${t(language, "国家归属", "State assignment")}</span>
                  <input id="studioProvinceStateInput" class="studio-input" list="studioProvinceStateOptions" value="${escapeHtml(formatEntityPickerValue(currentProvinceState, selectedProvince.state))}" placeholder="${t(language, "搜索国家名称或输入 ID", "Search state or type an ID")}" autocomplete="off" data-entity-id="${selectedProvince.state ?? ""}" />
                  <datalist id="studioProvinceStateOptions">
                    ${stateOptions.map((state) => `<option value="${escapeHtml(formatEntityPickerValue(state, state.id))}" label="#${state.id}"></option>`).join("")}
                  </datalist>
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "关联城镇", "Linked burg")}</span>
                  <input id="studioProvinceBurgInput" class="studio-input" list="studioProvinceBurgOptions" value="${escapeHtml(formatEntityPickerValue(currentProvinceBurg, selectedProvince.burg))}" placeholder="${t(language, "搜索城镇名称或输入 ID", "Search burg or type an ID")}" autocomplete="off" data-entity-id="${selectedProvince.burg ?? ""}" />
                  <datalist id="studioProvinceBurgOptions">
                    ${provinceBurgOptions.map((burg) => `<option value="${escapeHtml(formatEntityPickerValue(burg, burg.id))}" label="${escapeHtml([burg.state ? `${t(language, "国家", "State")} ${burg.state}` : "", `#${burg.id}`].filter(Boolean).join(" / "))}"></option>`).join("")}
                  </datalist>
                </label>
              </div>
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" data-editor-fields="${escapeHtml(
              getDirectEditorFieldsByScope("provinces", "readonly")
                .map((field) => field.label)
                .join(","),
            )}">
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeProvinceReadonlyGrid(selectedProvince, language)}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的省份", "No province selected")}</div>`
          }
          <div class="studio-native-identity-detail__actions">
            ${selectedProvince ? renderDirectWorkbenchEditStatus("studioProvinceEditStatus", language, provinceStatus) : ""}
            ${selectedProvince ? `<button class="studio-primary-action" data-studio-action="direct-province-apply" data-province-id="${selectedProvince.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedProvince ? `<button class="studio-ghost" data-studio-action="direct-province-reset" data-province-id="${selectedProvince.id}">${t(language, "重置", "Reset")}</button>` : ""}
          </div>
        </div>
        </article>`;
}
