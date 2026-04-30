import type {
  ProjectCenterState,
  RecentProjectEntry,
  StudioState,
} from "../types";
import {
  createGlobalProjectCenterTargets,
  type ProjectCenterTargets,
} from "./projectCenterTargets";

export {
  createGlobalProjectCenterTargets,
  type ProjectCenterTargets,
} from "./projectCenterTargets";

export const PROJECT_CENTER_STORAGE_KEY = "agm.projectCenter.recentProjects";
const PROJECT_CENTER_MAX_RECENT = 6;

function createProjectId(name: string, seed: string) {
  return (
    `${name || "untitled"}-${seed || "draft"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "untitled-draft"
  );
}

function parseRecentProjectEntries(raw: string | null): RecentProjectEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is RecentProjectEntry => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        return false;
      const item = entry as Partial<RecentProjectEntry>;
      return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.updatedAt === "number"
      );
    });
  } catch (error) {
    console.warn("AGM Studio could not read recent projects.", error);
    return [];
  }
}

export function loadProjectCenterState(
  documentState: StudioState["document"],
  targets: Pick<
    ProjectCenterTargets,
    "getStorageItem"
  > = createGlobalProjectCenterTargets(),
): ProjectCenterState {
  const recentProjects = parseRecentProjectEntries(
    targets.getStorageItem(PROJECT_CENTER_STORAGE_KEY),
  );
  return {
    recentProjects,
    activeProjectId: createProjectId(documentState.name, documentState.seed),
    lastSavedAt: null,
  };
}

function persistProjectCenterState(
  projectCenter: ProjectCenterState,
  targets: Pick<ProjectCenterTargets, "setStorageItem">,
) {
  targets.setStorageItem(
    PROJECT_CENTER_STORAGE_KEY,
    JSON.stringify(projectCenter.recentProjects),
  );
}

export function updateProjectCenterState(
  state: StudioState,
  options: { saved?: boolean; exportReady?: boolean } = {},
  targets: ProjectCenterTargets = createGlobalProjectCenterTargets(),
) {
  const projectSummary = targets.getProjectSummary();
  const now = targets.now();
  const activeProjectId = createProjectId(
    state.document.name,
    state.document.seed || projectSummary.pendingSeed,
  );
  const status: RecentProjectEntry["status"] = options.exportReady
    ? "export-ready"
    : state.document.dirty
      ? "dirty"
      : "draft";
  const activeProject: RecentProjectEntry = {
    id: activeProjectId,
    name: state.document.name,
    gameProfile: state.document.gameProfile,
    designIntent: state.document.designIntent,
    width: state.document.documentWidth || state.viewport.width,
    height: state.document.documentHeight || state.viewport.height,
    seed: state.document.seed || projectSummary.pendingSeed || "",
    source: state.document.source,
    status,
    updatedAt: now,
    hasLocalSnapshot: projectSummary.hasLocalSnapshot,
    exportReady: Boolean(options.exportReady),
  };

  state.projectCenter = {
    activeProjectId,
    lastSavedAt: options.saved ? now : state.projectCenter.lastSavedAt,
    recentProjects: [
      activeProject,
      ...state.projectCenter.recentProjects.filter(
        (project) => project.id !== activeProjectId,
      ),
    ].slice(0, PROJECT_CENTER_MAX_RECENT),
  };
  persistProjectCenterState(state.projectCenter, targets);
}
