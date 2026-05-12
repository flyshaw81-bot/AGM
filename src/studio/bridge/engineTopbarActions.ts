import type { TopbarAction } from "./engineActionTypes";
import {
  createGlobalEngineTopbarTargets,
  type EngineTopbarTargets,
} from "./engineTopbarTargets";

export function getEngineTopbarActions(
  targets = createGlobalEngineTopbarTargets(),
) {
  const dataActions = targets.getDataActions();
  return {
    new: dataActions.canCreateGeneratedWorld,
    open: dataActions.canOpenFile,
    save: dataActions.canDownloadProject,
    export: true,
  } satisfies Record<TopbarAction, boolean>;
}

export async function runEngineTopbarAction(
  action: TopbarAction,
  targets: EngineTopbarTargets = createGlobalEngineTopbarTargets(),
) {
  if (action === "new") return targets.runDataAction("create-generated-world");
  if (action === "open") return targets.runDataAction("open-file");
  if (action === "save") return targets.runDataAction("download-project");
}
