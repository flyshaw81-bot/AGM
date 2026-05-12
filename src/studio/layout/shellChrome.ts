import { getEngineProjectSummary } from "../bridge/engineActions";
import { GAME_WORLD_PROFILE_LABELS } from "../state/worldDocumentConstants";
import type {
  GameWorldProfile,
  StudioLanguage,
  StudioSection,
  StudioState,
  StudioTheme,
} from "../types";
import {
  GAME_WORLD_PROFILE_UI_LABELS,
  LANGUAGE_LABELS,
  PRODUCT_NAV_LABELS,
  SHELL_LABELS,
  STUDIO_THEME_ACCENTS,
  STUDIO_THEME_LABELS,
  STUDIO_THEME_ORDER,
  TOPBAR_ACTION_LABELS,
  TOPBAR_ACTION_ZH_LABELS,
  VIEWPORT_PRESET_LABELS,
} from "./shellConstants";
import {
  escapeHtml,
  studioIcon,
  studioMaterialSymbolIcon,
  t,
} from "./shellShared";

export function sectionNavButton(
  section: StudioSection,
  activeSection: StudioSection,
  language: StudioLanguage,
) {
  const activeClass = section === activeSection ? " is-active" : "";
  const nav = PRODUCT_NAV_LABELS[language][section];
  return `<button class="studio-nav__item${activeClass}" data-studio-action="section" data-value="${section}" title="${escapeHtml(nav.hint)}"><span class="studio-nav__icon">${studioIcon(nav.icon, "studio-nav__svg")}</span><span class="studio-nav__label-wrap"><span class="studio-nav__label">${escapeHtml(nav.label)}</span><span class="studio-nav__hint">${escapeHtml(nav.hint)}</span></span></button>`;
}

function renderTopbarActionButton(
  action: keyof typeof TOPBAR_ACTION_LABELS,
  enabled: boolean,
  language: StudioLanguage,
) {
  const label =
    language === "zh-CN"
      ? TOPBAR_ACTION_ZH_LABELS[action]
      : TOPBAR_ACTION_LABELS[action];
  const actionClass =
    action === "new"
      ? " studio-ghost--generate"
      : action === "export"
        ? " studio-ghost--export"
        : "";
  const icon =
    action === "new"
      ? "bolt"
      : action === "save"
        ? "save"
        : action === "export"
          ? "upload"
          : "folder";
  return `<button class="studio-ghost${actionClass}" data-studio-action="topbar" data-value="${action}"${enabled ? "" : " disabled"}>${studioIcon(icon, "studio-ghost__icon")}${label}</button>`;
}

export function topbarActionButton(
  action: keyof typeof TOPBAR_ACTION_LABELS,
  enabled: boolean,
  language: StudioLanguage,
) {
  return renderTopbarActionButton(action, enabled, language);
}

export function viewportPresetOption(
  value: string,
  currentLanguage: StudioLanguage,
) {
  return `<option value="${value}">${VIEWPORT_PRESET_LABELS[currentLanguage][value] ?? value}</option>`;
}

export function gameProfileOption(
  value: GameWorldProfile,
  current: GameWorldProfile,
  language: StudioLanguage,
) {
  return `<option value="${value}"${value === current ? " selected" : ""}>${GAME_WORLD_PROFILE_UI_LABELS[language][value]}</option>`;
}
export function renderLanguageSwitch(currentLanguage: StudioLanguage) {
  return `
    <div class="studio-segment studio-language-switch" role="group" aria-label="${SHELL_LABELS[currentLanguage].language}">
      ${(Object.keys(LANGUAGE_LABELS) as StudioLanguage[])
        .map((language) =>
          segmentButton(
            LANGUAGE_LABELS[language],
            language,
            currentLanguage === language,
            "language",
          ),
        )
        .join("")}
    </div>
  `;
}

export function renderThemeSelect(
  currentTheme: StudioTheme,
  language: StudioLanguage,
) {
  return `
    <label class="studio-theme-select" for="studioThemeSelect">
      <span class="studio-theme-select__swatch" style="--theme-accent: ${STUDIO_THEME_ACCENTS[currentTheme]}"></span>
      <span class="studio-theme-select__label">${SHELL_LABELS[language].theme}</span>
      <select id="studioThemeSelect" data-studio-action="theme" aria-label="${SHELL_LABELS[language].theme}">
        ${STUDIO_THEME_ORDER.map(
          (theme) =>
            `<option value="${theme}"${theme === currentTheme ? " selected" : ""}>${STUDIO_THEME_LABELS[language][theme]}</option>`,
        ).join("")}
      </select>
    </label>
  `;
}

export function renderTopbarUtilityControls(state: StudioState) {
  const nextTheme: StudioTheme = state.theme === "night" ? "daylight" : "night";
  const themeIcon = state.theme === "night" ? "sun" : "moon";
  const nextLanguage: StudioLanguage =
    state.language === "zh-CN" ? "en" : "zh-CN";
  const themeLabel =
    nextTheme === "daylight"
      ? t(state.language, "切换白昼模式", "Switch to daylight mode")
      : t(state.language, "切换暗夜模式", "Switch to night mode");
  const languageLabel =
    nextLanguage === "en"
      ? t(state.language, "切换英文", "Switch to English")
      : t(state.language, "切换中文", "Switch to Chinese");
  const projectCenterLabel = t(state.language, "项目中心", "Project center");
  const projectCenterButton =
    state.section === "project"
      ? ""
      : `<button class="studio-ghost studio-ghost--icon studio-topbar__project-center" data-studio-action="section" data-value="project" aria-label="${projectCenterLabel}" title="${projectCenterLabel}">
        ${studioMaterialSymbolIcon("work", "studio-topbar__utility-icon studio-project-center-icon studio-material-symbol-icon")}
      </button>`;

  return `
    <div class="studio-topbar__utility-group" aria-label="${t(state.language, "外观与语言", "Appearance and language")}">
      ${projectCenterButton}
      <button class="studio-ghost studio-ghost--icon" data-studio-action="theme-toggle" data-value="${nextTheme}" aria-label="${themeLabel}" title="${themeLabel}">
        ${studioIcon(themeIcon, "studio-topbar__utility-icon studio-theme-toggle-icon")}
      </button>
      <button class="studio-ghost studio-ghost--language" data-studio-action="language-toggle" data-value="${nextLanguage}" aria-label="${languageLabel}" title="${languageLabel}">
        ${studioMaterialSymbolIcon("translate", "studio-topbar__utility-icon studio-language-icon studio-material-symbol-icon")}
      </button>
    </div>
  `;
}

export function renderTopbarContextControls(state: StudioState) {
  const projectSummary = getEngineProjectSummary();
  const seedValue = projectSummary.pendingSeed || state.document.seed || "";

  return `
    <div class="studio-topbar__context" aria-label="${t(state.language, "Current generation context", "Current generation context")}">
      <label class="studio-topbar-field studio-topbar-field--profile" for="studioTopbarGameProfileSelect">
        <span>${t(state.language, "Game type", "Game type")}</span>
        <select id="studioTopbarGameProfileSelect" aria-label="${t(state.language, "Game type", "Game type")}">
          ${Object.keys(GAME_WORLD_PROFILE_LABELS)
            .map((value) =>
              gameProfileOption(
                value as GameWorldProfile,
                state.document.gameProfile,
                state.language,
              ),
            )
            .join("")}
        </select>
      </label>
      <label class="studio-topbar-field studio-topbar-field--preset" for="studioTopbarPresetSelect">
        <span>${t(state.language, "Generation preset", "Generation preset")}</span>
        <select id="studioTopbarPresetSelect" aria-label="${t(state.language, "Generation preset", "Generation preset")}">
          ${Object.keys(VIEWPORT_PRESET_LABELS[state.language])
            .map((value) => viewportPresetOption(value, state.language))
            .join("")}
        </select>
      </label>
      <label class="studio-topbar-field studio-topbar-field--seed" for="studioTopbarSeedInput">
        <span>${t(state.language, "Seed", "Seed")}</span>
        <input id="studioTopbarSeedInput" type="number" min="1" max="999999999" step="1" value="${escapeHtml(String(seedValue))}" ${projectSummary.canSetSeed ? "" : "disabled"} />
      </label>
    </div>
  `;
}
export function segmentButton(
  label: string,
  value: string,
  selected: boolean,
  group: string,
) {
  const selectedClass = selected ? " is-selected" : "";
  return `<button class="studio-segment__button${selectedClass}" data-studio-action="${group}" data-value="${value}">${label}</button>`;
}
