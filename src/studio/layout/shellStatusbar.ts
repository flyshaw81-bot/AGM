import type { StudioState } from "../types";
import { getEditorStatusText } from "./inspectorPanel";
import { renderLanguageSwitch, renderThemeSelect } from "./shellChrome";
import {
  FIT_MODE_LABELS,
  GAME_WORLD_PROFILE_UI_LABELS,
  SHELL_LABELS,
  VIEWPORT_PRESET_LABELS,
} from "./shellConstants";
import { t } from "./shellShared";

export function renderStudioStatusbar(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  const fitModeLabels = FIT_MODE_LABELS[state.language];

  return `
    <footer class="studio-statusbar">
      <div class="studio-statusbar__meta">
        <span>${VIEWPORT_PRESET_LABELS[state.language][state.viewport.presetId] ?? state.viewport.presetId}</span>
        <span>${state.viewport.orientation === "landscape" ? labels.landscape : labels.portrait}</span>
        <span>${fitModeLabels[state.viewport.fitMode]}</span>
        <span>${state.viewport.width} × ${state.viewport.height}</span>
        <span>${labels.gameProfile}: ${GAME_WORLD_PROFILE_UI_LABELS[state.language][state.document.gameProfile]}</span>
        <span>${labels.editor}: ${getEditorStatusText(state)}</span>
      </div>
      <div class="studio-statusbar__preferences" aria-label="${t(state.language, "外观与语言", "Appearance and language")}">
        ${renderThemeSelect(state.theme, state.language)}
        ${renderLanguageSwitch(state.language)}
      </div>
    </footer>
  `;
}
