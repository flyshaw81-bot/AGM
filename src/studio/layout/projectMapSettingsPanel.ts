import type {
  getEngineProjectSummary,
  getEngineTopbarActions,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import { renderProjectCanvasActions } from "./projectMapCanvasActions";
import { renderProjectClimateSettings } from "./projectMapClimateSettings";
import { renderProjectGenerationSettings } from "./projectMapGenerationSettings";
import { t } from "./shellShared";

type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;
type TopbarActions = ReturnType<typeof getEngineTopbarActions>;

export function renderProjectMapSettingsPanel(
  projectSummary: ProjectSummary,
  topbarActions: TopbarActions,
  language: StudioLanguage,
) {
  return `
    <section class="studio-panel" data-studio-project-map-settings="true">
      <h2 class="studio-panel__title">${t(language, "地图设置", "Map settings")}</h2>
      ${renderProjectGenerationSettings(projectSummary, language)}
      ${renderProjectClimateSettings(projectSummary, language)}
      ${renderProjectCanvasActions(projectSummary, topbarActions, language)}
    </section>
  `;
}
