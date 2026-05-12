import type { DataAction } from "./engineActionTypes";
import { getEngineDataActions, runEngineDataAction } from "./engineDataActions";

export type EngineTopbarDataActionSummary = Pick<
  ReturnType<typeof getEngineDataActions>,
  "canCreateGeneratedWorld" | "canOpenFile" | "canDownloadProject"
>;

export type EngineTopbarTargets = {
  getDataActions: () => EngineTopbarDataActionSummary;
  runDataAction: (action: DataAction) => Promise<void>;
};

export type EngineTopbarDataActionAdapter = {
  getActions: () => EngineTopbarDataActionSummary;
  runAction: (action: DataAction) => Promise<void>;
};

export function createEngineTopbarDataActionAdapter(): EngineTopbarDataActionAdapter {
  return {
    getActions: getEngineDataActions,
    runAction: runEngineDataAction,
  };
}

export function createEngineTopbarTargets(
  dataActions: EngineTopbarDataActionAdapter,
): EngineTopbarTargets {
  return {
    getDataActions: dataActions.getActions,
    runDataAction: dataActions.runAction,
  };
}

export function createGlobalEngineTopbarTargets(): EngineTopbarTargets {
  return createEngineTopbarTargets(createEngineTopbarDataActionAdapter());
}
