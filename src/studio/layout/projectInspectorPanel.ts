import {
  getEngineDataActions,
  getEngineEditorAvailability,
  getEngineEntitySummary,
  getEngineProjectSummary,
  getEngineTopbarActions,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { createRelationshipRepairHealthFromSummaries } from "./directRelationshipRepairHealth";
import { renderProjectAdvancedGenerationSection } from "./projectAdvancedGenerationSection";
import { renderProjectCenter } from "./projectPanel";

export function renderProjectInspectorPanel(state: StudioState) {
  const dataActions = getEngineDataActions();
  const editorAvailability = getEngineEditorAvailability();
  const projectSummary = getEngineProjectSummary();
  const topbarActions = getEngineTopbarActions();
  const relationshipRepairHealth = createRelationshipRepairHealthFromSummaries({
    directEditor: state.directEditor,
    entitySummary: getEngineEntitySummary(),
    language: state.language,
    worldResources: getEngineWorldResourceSummary(),
  });

  return `
    ${renderProjectCenter(
      state,
      projectSummary,
      dataActions,
      topbarActions,
      relationshipRepairHealth,
    )}
    ${renderProjectAdvancedGenerationSection(
      state,
      projectSummary,
      topbarActions,
      editorAvailability,
    )}
  `;
}
