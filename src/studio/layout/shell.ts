import type { StudioState } from "../types";
import { renderInspector } from "./inspectorPanel";
import { renderStudioNavigation } from "./shellNavigation";
import { renderStudioStage } from "./shellStage";
import { renderStudioStatusbar } from "./shellStatusbar";
import { renderStudioTopbar } from "./shellTopbar";

export { bindStudioShellEvents } from "./shellEvents";

export function renderStudioShell(state: StudioState) {
  const navigationCollapsed = state.shell.navigationCollapsed;

  return `
    <div id="studioApp" class="studio-app${navigationCollapsed ? " is-nav-collapsed" : ""}" data-navigation-collapsed="${navigationCollapsed ? "true" : "false"}">
      ${renderStudioTopbar(state)}
      <div class="studio-body">
        ${renderStudioNavigation(state)}
        ${renderStudioStage(state)}
        <aside class="studio-sidebar studio-sidebar--right">
          ${renderInspector(state)}
        </aside>
      </div>
      ${renderStudioStatusbar(state)}
    </div>
  `;
}
