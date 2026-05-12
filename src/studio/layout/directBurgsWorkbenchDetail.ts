import type { EngineEntitySummaryItem } from "../bridge/engineActionTypes";
import type { StudioLanguage, StudioState } from "../types";
import {
  formatEntityPickerValue,
  getDirectWorkbenchEditStatus,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeBurgDetailOptions = {
  cultureOptions: EngineEntitySummaryItem[];
  getCultureName: (cultureId?: number) => string;
  getStateName: (stateId?: number) => string;
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedBurg: EngineEntitySummaryItem | undefined;
  stateOptions: EngineEntitySummaryItem[];
};

function renderPlaceSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-identity-detail__section-label">${studioIcon(icon, "studio-native-identity-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderResponsibilityFieldsAttribute(scope: "owned" | "related") {
  const labels = getDirectEditorFieldsByScope("burgs", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

function renderNativeBurgReadonlyGrid(
  selectedBurg: EngineEntitySummaryItem | undefined,
  language: StudioLanguage,
) {
  if (!selectedBurg) return "";
  const rows = [
    { label: t(language, "城镇 ID", "Burg ID"), value: selectedBurg.id },
    { label: t(language, "单元格", "Cells"), value: selectedBurg.cells ?? "-" },
  ];

  return `<div class="studio-native-identity__readonly">
    ${rows.map((row) => `<div class="studio-native-identity__kv"><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(String(row.value))}</strong></div>`).join("")}
  </div>`;
}

export function renderDirectBurgDetail({
  cultureOptions,
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

  return `<article class="studio-native-identity__detail-wrap">
          <div class="studio-native-identity-detail" data-native-place-detail="burg">
          ${
            selectedBurg
              ? `
            <section class="studio-native-identity-detail__section" data-editor-scope="owned" ${renderResponsibilityFieldsAttribute("owned")}>
              ${renderPlaceSectionLabel(t(language, "核心城镇字段", "Core town fields"), "building-2")}
              <div class="studio-native-identity-detail__form">
                <label class="studio-native-identity-field">
                  <span>${t(language, "名称", "Name")}</span>
                  <input id="studioBurgNameInput" class="studio-input" value="${escapeHtml(selectedBurg.name)}" autocomplete="off" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "类型", "Type")}</span>
                  <input id="studioBurgTypeInput" class="studio-input" value="${escapeHtml(selectedBurg.type || "")}" autocomplete="off" />
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "人口", "Population")}</span>
                  <input id="studioBurgPopulationInput" class="studio-input" type="number" min="0" step="1" value="${selectedBurg.population ?? ""}" />
                </label>
              </div>
            </section>
            <section class="studio-native-identity-detail__section" data-editor-scope="related" ${renderResponsibilityFieldsAttribute("related")}>
              ${renderPlaceSectionLabel(t(language, "关联对象", "Related objects"), "git-branch")}
              <div class="studio-native-identity-detail__related-grid">
                <label class="studio-native-identity-field">
                  <span>${t(language, "国家归属", "State assignment")}</span>
                  <input id="studioBurgStateInput" class="studio-input" list="studioBurgStateOptions" value="${escapeHtml(formatEntityPickerValue(currentBurgState, selectedBurg.state))}" placeholder="${t(language, "搜索国家名称或输入 ID", "Search state or type an ID")}" autocomplete="off" data-entity-id="${selectedBurg.state ?? ""}" />
                  <datalist id="studioBurgStateOptions">
                    ${stateOptions.map((state) => `<option value="${escapeHtml(formatEntityPickerValue(state, state.id))}" label="#${state.id}"></option>`).join("")}
                  </datalist>
                </label>
                <label class="studio-native-identity-field">
                  <span>${t(language, "文化归属", "Culture assignment")}</span>
                  <input id="studioBurgCultureInput" class="studio-input" list="studioBurgCultureOptions" value="${escapeHtml(formatEntityPickerValue(currentBurgCulture, selectedBurg.culture))}" placeholder="${t(language, "搜索文化名称或输入 ID", "Search culture or type an ID")}" autocomplete="off" data-entity-id="${selectedBurg.culture ?? ""}" />
                  <datalist id="studioBurgCultureOptions">
                    ${cultureOptions.map((culture) => `<option value="${escapeHtml(formatEntityPickerValue(culture, culture.id))}" label="#${culture.id}"></option>`).join("")}
                  </datalist>
                </label>
              </div>
            </section>
            <section class="studio-native-identity-detail__advanced" data-editor-scope="readonly" data-editor-fields="${escapeHtml(
              getDirectEditorFieldsByScope("burgs", "readonly")
                .map((field) => field.label)
                .join(","),
            )}">
              <div class="studio-native-identity-detail__advanced-title">
                ${studioIcon("book-open", "studio-native-identity-detail__section-icon")}
                <span>${t(language, "技术信息", "Technical info")}</span>
              </div>
              ${renderNativeBurgReadonlyGrid(selectedBurg, language)}
            </section>
          `
              : `<div class="studio-native-identity__empty">${t(language, "没有选中的城镇", "No burg selected")}</div>`
          }
          <div class="studio-native-identity-detail__actions">
            ${selectedBurg ? renderDirectWorkbenchEditStatus("studioBurgEditStatus", language, burgStatus) : ""}
            ${selectedBurg ? `<button class="studio-primary-action" data-studio-action="direct-burg-apply" data-burg-id="${selectedBurg.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
            ${selectedBurg ? `<button class="studio-ghost" data-studio-action="direct-burg-reset" data-burg-id="${selectedBurg.id}">${t(language, "重置", "Reset")}</button>` : ""}
          </div>
        </div>
        </article>`;
}
