import type { EngineAutoFixWritebackResult } from "./engineActionTypes";

export function createEmptyEngineAutoFixWritebackResult(): EngineAutoFixWritebackResult {
  return {
    createdBurgIds: [],
    createdRouteIds: [],
    updatedBiomes: [],
    updatedStates: [],
    updatedProvinces: [],
  };
}
