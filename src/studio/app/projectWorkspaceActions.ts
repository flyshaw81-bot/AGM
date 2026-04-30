import type { GameWorldProfile, StudioState } from "../types";
import {
  createGlobalProjectWorkspaceActionTargets,
  type ProjectWorkspaceActionTargets,
} from "./projectWorkspaceActionTargets";

export {
  createGlobalProjectWorkspaceActionTargets,
  createProjectWorkspaceActionTargets,
  type ProjectWorkspaceActionTargets,
} from "./projectWorkspaceActionTargets";

export async function applyProjectWorkspaceChange(
  state: StudioState,
  action: string,
  value: string,
  targets: ProjectWorkspaceActionTargets = createGlobalProjectWorkspaceActionTargets(),
) {
  const stringSetter = targets.stringSetters[action];
  const numberSetter = targets.numberSetters[action];

  if (stringSetter) {
    stringSetter(value);
  } else if (numberSetter) {
    numberSetter(Number(value));
  } else if (action === "document-name") {
    state.document.name = targets.setDocumentName(value);
    state.document.source = "agm";
  } else if (action === "game-profile") {
    state.document.gameProfile = value as GameWorldProfile;
    state.generationProfileOverrides = {
      profile: state.document.gameProfile,
      values: {},
    };
    state.document.source = "agm";
  } else if (action === "design-intent") {
    state.document.designIntent = value.trim();
    state.document.source = "agm";
  } else if (action === "width" || action === "height") {
    targets.setCanvasSize(action, Number(value));
  } else {
    targets.setAutosaveInterval(Number(value));
  }

  await targets.syncProjectSummary();
}
