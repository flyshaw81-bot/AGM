import type { getEngineProjectSummary } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  formatProjectWind,
  PROJECT_MAP_WIND_TIER_SETTINGS,
} from "./projectMapSettingsModel";
import { t } from "./shellShared";

type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;

export function renderProjectKv(label: string, value: string) {
  return `<div class="studio-kv"><span>${label}</span><strong>${value}</strong></div>`;
}

export function renderProjectInputSetting(
  label: string,
  value: string,
  inputLabel: string,
  id: string,
  type: string,
  attributes: string,
) {
  return `${renderProjectKv(label, value)}
      <label class="studio-stack-field">
        <span>${inputLabel}</span>
        <input id="${id}" class="studio-input" type="${type}" ${attributes} />
      </label>`;
}

export function renderProjectSelectSetting(
  label: string,
  value: string,
  selectLabel: string,
  id: string,
  options: string,
) {
  return `${renderProjectKv(label, value)}
      <label class="studio-stack-field">
        <span>${selectLabel}</span>
        <select id="${id}">
          ${options}
        </select>
      </label>`;
}

export function renderSelectOption(
  value: string,
  label: string,
  selectedValue: string,
) {
  return `<option value="${value}"${value === selectedValue ? " selected" : ""}>${label}</option>`;
}

export function renderWindTierSettings(
  projectSummary: ProjectSummary,
  language: StudioLanguage,
) {
  return PROJECT_MAP_WIND_TIER_SETTINGS.map(
    ({ index, summaryKey, fallback, inputId }) =>
      renderProjectInputSetting(
        `${t(language, "风带", "Wind tier")} ${index}`,
        formatProjectWind(projectSummary[summaryKey]),
        `${t(language, "修改风带", "Change wind tier")} ${index}`,
        inputId,
        "number",
        `min="0" max="315" step="45" value="${projectSummary[summaryKey] || fallback}"`,
      ),
  ).join("");
}
