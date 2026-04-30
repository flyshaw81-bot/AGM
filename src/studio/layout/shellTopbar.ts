import { getEngineTopbarActions } from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  renderTopbarContextControls,
  renderTopbarUtilityControls,
  topbarActionButton,
} from "./shellChrome";
import { studioThemeLogoUrl, t } from "./shellShared";

const TOPBAR_ACTIONS = ["open", "save", "new", "export"] as const;

export function renderStudioTopbar(state: StudioState) {
  const topbarActions = getEngineTopbarActions();
  const themeLogo = studioThemeLogoUrl(state.theme);

  return `
    <header class="studio-topbar">
      <div class="studio-topbar__group studio-topbar__group--brand">
        <a class="studio-brand" href="#" aria-label="AGM Studio — Atlas Generation Matrix" title="AGM Studio — Atlas Generation Matrix">
          <img class="studio-brand__logo" src="${themeLogo}" alt="" />
        </a>
      </div>
      ${renderTopbarContextControls(state)}
      <div class="studio-topbar__group studio-topbar__group--actions">
        <div class="studio-topbar__command-group" aria-label="${t(state.language, "文件与生成命令", "File and generation commands")}">
          ${TOPBAR_ACTIONS.map((action) =>
            topbarActionButton(action, topbarActions[action], state.language),
          ).join("")}
        </div>
        ${renderTopbarUtilityControls(state)}
      </div>
    </header>
  `;
}
