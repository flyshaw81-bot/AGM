import {
  getEngineDataActions,
  getEngineEntitySummary,
  getEngineProjectSummary,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import { getEngineExportSettings } from "../bridge/engineExport";
import type { StudioState } from "../types";
import { renderCanvasInspectorPanel } from "./canvasInspectorPanel";
import { renderDataPanel } from "./dataPanel";
import { createRelationshipRepairHealthFromSummaries } from "./directRelationshipRepairHealth";
import { renderDirectWorkbenchDirectory } from "./directWorkbenches";
import { renderEditorsPanel } from "./editorsPanel";
import { renderExportPanel } from "./exportPanel";
import { renderLayersInspectorPanel } from "./layersInspectorPanel";
import { renderProjectInspectorPanel } from "./projectInspectorPanel";
import { renderStyleInspectorPanel } from "./styleInspectorPanel";

export { getEditorStatusText } from "./editorsPanel";

export function renderInspector(state: StudioState) {
  switch (state.section) {
    case "project": {
      return renderProjectInspectorPanel(state);
    }
    case "canvas": {
      return renderCanvasInspectorPanel(state);
    }
    case "style": {
      return renderStyleInspectorPanel(state);
    }
    case "layers": {
      return renderLayersInspectorPanel(state);
    }
    case "export": {
      return renderExportPanel(
        state,
        getEngineExportSettings(),
        createRelationshipRepairHealthFromSummaries({
          directEditor: state.directEditor,
          entitySummary: getEngineEntitySummary(),
          language: state.language,
          worldResources: getEngineWorldResourceSummary(),
        }),
      );
    }
    case "data": {
      const dataActions = getEngineDataActions();
      const projectSummary = getEngineProjectSummary();

      return renderDataPanel(state, dataActions, projectSummary);
    }
    case "repair": {
      const entitySummary = getEngineEntitySummary();
      const worldResources = getEngineWorldResourceSummary();

      return `
        ${renderDirectWorkbenchDirectory(entitySummary, worldResources, state.directEditor, state.language, "repair")}
      `;
    }
    case "editors": {
      return renderEditorsPanel(state);
    }
  }
}
