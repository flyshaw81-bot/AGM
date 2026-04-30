import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { formatStateArea } from "./directStatesWorkbenchModel";
import { formatEntityPickerValue } from "./directWorkbenchShared";
import { escapeHtml, t } from "./shellShared";

type NativeStateDetailContentOptions = {
  cultureOptions: EngineEntitySummaryItem[];
  entitySummary: EngineEntitySummary;
  language: StudioLanguage;
  selectedColor: string;
  selectedState: EngineEntitySummaryItem | undefined;
};

function getColorInputValue(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#ff7a1a";
}

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

function renderNativeStateReadonlyGrid(
  selectedState: EngineEntitySummaryItem,
  language: StudioLanguage,
) {
  return `<div class="studio-state-readonly-grid">
      <div class="studio-kv"><span>${t(language, "国家 ID", "State ID")}</span><strong>${selectedState.id}</strong></div>
      <div class="studio-kv"><span>${t(language, "Cells", "Cells")}</span><strong>${selectedState.cells ?? "-"}</strong></div>
      <div class="studio-kv"><span>${t(language, "面积", "Area")}</span><strong>${formatStateArea(selectedState.area)}</strong></div>
      <div class="studio-kv"><span>${t(language, "Neighbor count", "Neighbor count")}</span><strong>${selectedState.neighbors?.length ?? 0}</strong></div>
      <div class="studio-kv"><span>${t(language, "外交记录", "Diplomacy records")}</span><strong>${selectedState.diplomacy?.length ?? 0}</strong></div>
    </div>`;
}

export function renderDirectStateDetailContent({
  cultureOptions,
  entitySummary,
  language,
  selectedColor,
  selectedState,
}: NativeStateDetailContentOptions) {
  if (!selectedState) {
    return "";
  }

  const currentCulture = cultureOptions.find(
    (culture) => culture.id === selectedState.culture,
  );
  const capitalOptions = getCapitalOptions(entitySummary, selectedState);
  const currentCapital =
    capitalOptions.find((burg) => burg.id === selectedState.capital) ||
    entitySummary.burgs.find((burg) => burg.id === selectedState.capital);

  return `
    <div class="studio-state-editor-grid">
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "短名", "Short name")}</span>
        <input id="studioStateNameInput" value="${escapeHtml(selectedState.name)}" autocomplete="off" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "全名", "Full name")}</span>
        <input id="studioStateFullNameInput" value="${escapeHtml(selectedState.fullName || selectedState.name)}" autocomplete="off" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "政体类别", "Form category")}</span>
        <input id="studioStateFormInput" value="${escapeHtml(selectedState.form || selectedState.type || "")}" autocomplete="off" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "政体名称", "Form name")}</span>
        <input id="studioStateFormNameInput" value="${escapeHtml(selectedState.formName || selectedState.type || "")}" autocomplete="off" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "颜色", "Color")}</span>
        <input id="studioStateColorInput" type="color" value="${escapeHtml(getColorInputValue(selectedColor))}" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "文化", "Culture")}</span>
        <input id="studioStateCultureInput" list="studioStateCultureOptions" value="${escapeHtml(formatEntityPickerValue(currentCulture, selectedState.culture))}" placeholder="${t(language, "搜索文化名称或输入 ID", "Search culture or type an ID")}" autocomplete="off" data-entity-id="${selectedState.culture ?? ""}" />
        <datalist id="studioStateCultureOptions">
          ${cultureOptions.map((culture) => `<option value="${escapeHtml(formatEntityPickerValue(culture, culture.id))}" label="#${culture.id}"></option>`).join("")}
        </datalist>
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "首都", "Capital")}</span>
        <input id="studioStateCapitalInput" list="studioStateCapitalOptions" value="${escapeHtml(formatEntityPickerValue(currentCapital, selectedState.capital))}" placeholder="${t(language, "搜索城镇名称或输入 ID", "Search burg or type an ID")}" autocomplete="off" data-entity-id="${selectedState.capital ?? ""}" />
        <datalist id="studioStateCapitalOptions">
          ${capitalOptions.map((burg) => `<option value="${escapeHtml(formatEntityPickerValue(burg, burg.id))}" label="${escapeHtml([burg.state ? `${t(language, "国家", "State")} ${burg.state}` : "", `#${burg.id}`].filter(Boolean).join(" · "))}"></option>`).join("")}
        </datalist>
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "人口", "Population")}</span>
        <input id="studioStatePopulationInput" type="number" min="0" step="1" value="${selectedState.population ?? ""}" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "农村人口", "Rural population")}</span>
        <input id="studioStateRuralInput" type="number" min="0" step="1" value="${selectedState.rural ?? ""}" />
      </label>
      <label class="studio-stack-field studio-state-field">
        <span>${t(language, "城市人口", "Urban population")}</span>
        <input id="studioStateUrbanInput" type="number" min="0" step="1" value="${selectedState.urban ?? ""}" />
      </label>
      <label class="studio-stack-field studio-state-field studio-state-field--wide">
        <span>${t(language, "邻国 ID", "Neighbor IDs")}</span>
        <input id="studioStateNeighborsInput" value="${escapeHtml(selectedState.neighbors?.join(", ") || "")}" placeholder="${t(language, "用逗号或空格分隔国家 ID", "Separate state IDs with commas or spaces")}" autocomplete="off" />
      </label>
      <label class="studio-stack-field studio-state-field studio-state-field--wide">
        <span>${t(language, "外交记录", "Diplomacy records")}</span>
        <textarea id="studioStateDiplomacyInput" rows="3" placeholder="${t(language, "One diplomacy record per line", "One diplomacy record per line")}">${escapeHtml(selectedState.diplomacy?.join("\n") || "")}</textarea>
      </label>
    </div>
    ${renderNativeStateReadonlyGrid(selectedState, language)}
  `;
}
