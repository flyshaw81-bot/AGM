import type { StudioState } from "../types";
import { renderCanvasTools } from "./canvasPanel";
import { sectionNavButton } from "./shellChrome";
import {
  PRODUCT_NAV_ADVANCED_SECTIONS,
  PRODUCT_NAV_PRIMARY_SECTIONS,
} from "./shellConstants";
import { studioIcon, t } from "./shellShared";

export function renderStudioNavigation(state: StudioState) {
  const navigationCollapsed = state.shell.navigationCollapsed;
  const navigationToggleLabel = navigationCollapsed
    ? t(state.language, "展开导航", "Expand navigation")
    : t(state.language, "收起导航", "Collapse navigation");

  return `
    <aside class="studio-sidebar studio-sidebar--left" aria-label="${t(state.language, "主导航", "Primary navigation")}">
      <button class="studio-nav-collapse-toggle" data-studio-action="toggle-navigation-collapse" aria-label="${navigationToggleLabel}" aria-expanded="${navigationCollapsed ? "false" : "true"}" title="${navigationToggleLabel}">
        ${studioIcon("sidebar", "studio-nav-collapse-toggle__icon")}
        <span class="studio-nav-collapse-toggle__label">${navigationToggleLabel}</span>
      </button>
      <div class="studio-nav__group-label">${t(state.language, "业务流程", "Workflow")}</div>
      <nav class="studio-nav studio-nav--primary">
        ${PRODUCT_NAV_PRIMARY_SECTIONS.map((section) => sectionNavButton(section, state.section, state.language)).join("")}
      </nav>
      <div class="studio-nav__group-label">${t(state.language, "高级", "Advanced")}</div>
      <nav class="studio-nav studio-nav--advanced">
        ${PRODUCT_NAV_ADVANCED_SECTIONS.map((section) => sectionNavButton(section, state.section, state.language)).join("")}
      </nav>
      ${renderCanvasTools(state.viewport.canvasTool, state.language)}
    </aside>
  `;
}
