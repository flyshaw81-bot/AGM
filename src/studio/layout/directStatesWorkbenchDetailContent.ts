import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { formatStateArea } from "./directStatesWorkbenchModel";
import { formatEntityPickerValue } from "./directWorkbenchShared";
import { getDirectEditorFieldsByScope } from "./editorResponsibilityModel";
import { escapeHtml, studioIcon, t } from "./shellShared";

type NativeStateDetailContentOptions = {
  cultureOptions: EngineEntitySummaryItem[];
  entitySummary: EngineEntitySummary;
  language: StudioLanguage;
  selectedColor: string;
  selectedState: EngineEntitySummaryItem | undefined;
};

function getCapitalOptions(
  entitySummary: EngineEntitySummary,
  selectedState: EngineEntitySummaryItem,
) {
  const stateBurgs = entitySummary.burgs.filter(
    (burg) => burg.state === selectedState.id,
  );
  const otherBurgs = entitySummary.burgs.filter(
    (burg) => burg.state !== selectedState.id,
  );

  return [...stateBurgs, ...otherBurgs]
    .filter(
      (burg, index, options) =>
        burg.id > 0 &&
        burg.name &&
        options.findIndex((option) => option.id === burg.id) === index,
    )
    .slice(0, 120);
}

function renderNativeStateSectionLabel(label: string, icon: string) {
  return `<div class="studio-native-state-detail__section-label">${studioIcon(icon, "studio-native-state-detail__section-icon")}<span>${escapeHtml(label)}</span></div>`;
}

function renderResponsibilityFieldsAttribute(
  scope: "owned" | "related" | "readonly",
) {
  const labels = getDirectEditorFieldsByScope("states", scope).map(
    (field) => field.label,
  );
  return `data-editor-fields="${escapeHtml(labels.join(","))}"`;
}

function renderStateFact(label: string, value: string | number | undefined) {
  return `<div class="studio-native-state-detail__kv studio-kv"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "-"))}</strong></div>`;
}

function getDiplomacyRecordCount(selectedState: EngineEntitySummaryItem) {
  return selectedState.diplomacy?.filter(Boolean).length ?? 0;
}

function getColorInputValue(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#ff7a1a";
}

function renderNativeStateColorField(
  selectedColor: string,
  language: StudioLanguage,
) {
  const safeColor = getColorInputValue(selectedColor);
  return `<label class="studio-native-state-field studio-stack-field studio-state-field studio-native-color-field">
    <span>${t(language, "\u989c\u8272", "Color")}</span>
    <span class="studio-native-color-control">
      <code>${escapeHtml(safeColor.toUpperCase())}</code>
      <input id="studioStateColorInput" type="color" value="${escapeHtml(safeColor)}" aria-label="${t(language, "\u66f4\u6362\u56fd\u5bb6\u989c\u8272", "Change state color")}" />
    </span>
  </label>`;
}

export function renderDirectStateDetailContent({
  cultureOptions,
  entitySummary,
  language,
  selectedColor,
  selectedState,
}: NativeStateDetailContentOptions) {
  if (!selectedState) return "";

  const currentCulture = cultureOptions.find(
    (culture) => culture.id === selectedState.culture,
  );
  const capitalOptions = getCapitalOptions(entitySummary, selectedState);
  const currentCapital =
    capitalOptions.find((burg) => burg.id === selectedState.capital) ||
    entitySummary.burgs.find((burg) => burg.id === selectedState.capital);

  return `
    <section class="studio-native-state-detail__section" data-editor-scope="readonly" ${renderResponsibilityFieldsAttribute("readonly")}>
      <div class="studio-native-state-detail__readonly studio-state-readonly-grid">
        ${renderStateFact(t(language, "\u56fd\u5bb6 ID", "State ID"), selectedState.id)}
        ${renderStateFact(t(language, "\u5355\u5143\u683c", "Cells"), selectedState.cells)}
        ${renderStateFact(t(language, "\u9762\u79ef", "Area"), formatStateArea(selectedState.area))}
        ${renderStateFact(t(language, "\u5916\u4ea4\u8bb0\u5f55", "Diplomacy records"), getDiplomacyRecordCount(selectedState))}
      </div>
    </section>

    <section class="studio-native-state-detail__section" data-editor-scope="owned" ${renderResponsibilityFieldsAttribute("owned")}>
      ${renderNativeStateSectionLabel(t(language, "\u56fd\u5bb6\u8eab\u4efd", "State identity"), "flag")}
      <div class="studio-native-state-detail__form studio-state-editor-grid">
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u77ed\u540d", "Short name")}</span>
          <input id="studioStateNameInput" class="studio-input" value="${escapeHtml(selectedState.name)}" autocomplete="off" />
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u5168\u540d", "Full name")}</span>
          <input id="studioStateFullNameInput" class="studio-input" value="${escapeHtml(selectedState.fullName || selectedState.name)}" autocomplete="off" />
        </label>
        ${renderNativeStateColorField(selectedColor, language)}
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u653f\u4f53\u7c7b\u522b", "Form category")}</span>
          <input id="studioStateFormInput" class="studio-input" value="${escapeHtml(selectedState.form || selectedState.type || "")}" autocomplete="off" />
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u653f\u4f53\u540d\u79f0", "Form name")}</span>
          <input id="studioStateFormNameInput" class="studio-input" value="${escapeHtml(selectedState.formName || selectedState.type || "")}" autocomplete="off" />
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u4eba\u53e3", "Population")}</span>
          <input id="studioStatePopulationInput" class="studio-input" type="number" min="0" step="1" value="${selectedState.population ?? ""}" />
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u519c\u6751\u4eba\u53e3", "Rural population")}</span>
          <input id="studioStateRuralInput" class="studio-input" type="number" min="0" step="1" value="${selectedState.rural ?? ""}" />
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u57ce\u5e02\u4eba\u53e3", "Urban population")}</span>
          <input id="studioStateUrbanInput" class="studio-input" type="number" min="0" step="1" value="${selectedState.urban ?? ""}" />
        </label>
      </div>
    </section>

    <section class="studio-native-state-detail__section" data-editor-scope="related" ${renderResponsibilityFieldsAttribute("related")}>
      ${renderNativeStateSectionLabel(t(language, "\u5173\u8054\u5bf9\u8c61", "Relations"), "sparkles")}
      <div class="studio-native-state-detail__related-grid">
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u6587\u5316\u5f52\u5c5e", "Culture assignment")}</span>
          <input id="studioStateCultureInput" class="studio-input" list="studioStateCultureOptions" value="${escapeHtml(formatEntityPickerValue(currentCulture, selectedState.culture))}" placeholder="${t(language, "\u641c\u7d22\u6587\u5316\u540d\u79f0\u6216\u8f93\u5165 ID", "Search culture or type an ID")}" autocomplete="off" data-entity-id="${selectedState.culture ?? ""}" />
          <datalist id="studioStateCultureOptions">
            ${cultureOptions.map((culture) => `<option value="${escapeHtml(formatEntityPickerValue(culture, culture.id))}" label="#${culture.id}"></option>`).join("")}
          </datalist>
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u9996\u90fd\u57ce\u9547", "Capital town")}</span>
          <input id="studioStateCapitalInput" class="studio-input" list="studioStateCapitalOptions" value="${escapeHtml(formatEntityPickerValue(currentCapital, selectedState.capital))}" placeholder="${t(language, "\u641c\u7d22\u57ce\u9547\u540d\u79f0\u6216\u8f93\u5165 ID", "Search burg or type an ID")}" autocomplete="off" data-entity-id="${selectedState.capital ?? ""}" />
          <datalist id="studioStateCapitalOptions">
            ${capitalOptions.map((burg) => `<option value="${escapeHtml(formatEntityPickerValue(burg, burg.id))}" label="${escapeHtml([burg.state ? `${t(language, "\u56fd\u5bb6", "State")} ${burg.state}` : "", `#${burg.id}`].filter(Boolean).join(" / "))}"></option>`).join("")}
          </datalist>
        </label>
        <label class="studio-native-state-field studio-stack-field studio-state-field">
          <span>${t(language, "\u90bb\u56fd ID", "Neighbor IDs")}</span>
          <input id="studioStateNeighborsInput" class="studio-input" value="${escapeHtml(selectedState.neighbors?.join(", ") || "")}" placeholder="${t(language, "\u7528\u9017\u53f7\u6216\u7a7a\u683c\u5206\u9694\u56fd\u5bb6 ID", "Separate state IDs with commas or spaces")}" autocomplete="off" />
        </label>
      </div>
    </section>
  `;
}
