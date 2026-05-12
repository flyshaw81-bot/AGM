import type {
  getEngineDataActions,
  getEngineProjectSummary,
  getEngineTopbarActions,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import type { RelationshipRepairHealth } from "./directRelationshipRepairHealth";
import { renderProjectCenterOverviewSection } from "./projectCenterOverviewSection";
import { renderProjectDeliveryStatusSection } from "./projectDeliveryStatusSection";
import { renderProjectDocumentSection } from "./projectDocumentSection";
import { renderProjectRecentProjectsSection } from "./projectRecentProjectsSection";

export function renderProjectCenter(
  state: StudioState,
  projectSummary: ReturnType<typeof getEngineProjectSummary>,
  dataActions: ReturnType<typeof getEngineDataActions>,
  topbarActions: ReturnType<typeof getEngineTopbarActions>,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  const activeProject = state.projectCenter.recentProjects.find(
    (project) => project.id === state.projectCenter.activeProjectId,
  );

  return `
    ${renderProjectCenterOverviewSection(state, topbarActions)}
    ${renderProjectDocumentSection(state, projectSummary, dataActions)}
    ${renderProjectRecentProjectsSection(state)}
    ${renderProjectDeliveryStatusSection(
      state,
      activeProject,
      relationshipRepairHealth,
    )}
  `;
}
