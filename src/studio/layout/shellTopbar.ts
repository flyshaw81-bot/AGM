import type { StudioState } from "../types";
import { renderTopbarUtilityControls } from "./shellChrome";
import { studioMaterialSymbolIcon, studioThemeLogoUrl, t } from "./shellShared";

export function renderStudioTopbar(state: StudioState) {
  const themeLogo = studioThemeLogoUrl(state.theme);
  const navigationToggleLabel = state.shell.navigationCollapsed
    ? t(state.language, "展开导航", "Expand navigation")
    : t(state.language, "收起导航", "Collapse navigation");

  return `
    <header class="studio-topbar studio-native-topbar">
      <div class="studio-topbar__group studio-topbar__group--brand">
        <button class="studio-topbar__native-menu" data-studio-action="toggle-navigation-collapse" aria-label="${navigationToggleLabel}" aria-expanded="${state.shell.navigationCollapsed ? "false" : "true"}" title="${navigationToggleLabel}">
          ${studioMaterialSymbolIcon("menu_open", "studio-topbar__native-menu-icon studio-material-symbol-icon")}
        </button>
        <button class="studio-brand studio-brand--native" data-studio-action="section" data-value="project" aria-label="AGM Studio">
          <img class="studio-brand__logo" src="${themeLogo}" alt="" />
        </button>
        <span class="studio-topbar__native-name">AGM 工作室</span>
      </div>
      <div class="studio-topbar__group studio-topbar__group--actions">
        ${renderTopbarUtilityControls(state)}
      </div>
    </header>
  `;
}
