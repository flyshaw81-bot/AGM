import type { DataAction } from "./engineActionTypes";
import { getEngineDataActions, runEngineDataAction } from "./engineDataActions";

export type EngineTopbarDataActionSummary = Pick<
  ReturnType<typeof getEngineDataActions>,
  "canCreateNew" | "canOpenFile" | "canSaveToMachine"
>;

export type EngineTopbarTargets = {
  getDataActions: () => EngineTopbarDataActionSummary;
  runDataAction: (action: DataAction) => Promise<void>;
};

export function createGlobalEngineTopbarTargets(): EngineTopbarTargets {
  return {
    getDataActions: getEngineDataActions,
    runDataAction: runEngineDataAction,
  };
}
