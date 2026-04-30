import {
  getEngineDataActions,
  getEngineEditorAvailability,
  getEngineProjectSummary,
  getEngineTopbarActions,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderProjectAdvancedGenerationSection } from "./projectAdvancedGenerationSection";
import { renderProjectCenter } from "./projectPanel";

export function renderProjectInspectorPanel(state: StudioState) {
  const dataActions = getEngineDataActions();
  const editorAvailability = getEngineEditorAvailability();
  const projectSummary = getEngineProjectSummary();
  const topbarActions = getEngineTopbarActions();

  return `
    ${renderProjectCenter(state, projectSummary, dataActions, topbarActions)}
    ${renderProjectAdvancedGenerationSection(
      state,
      projectSummary,
      topbarActions,
      editorAvailability,
    )}
  `;
}
