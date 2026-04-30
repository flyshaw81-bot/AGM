import type {
  AgmWritableBiomeData,
  AgmWritableProvince,
} from "./engineActionTypes";
import { getEngineBiomeData } from "./engineResourceSummary";

export type AgmWritableState = {
  agmFairStart?: boolean;
  agmFairStartScore?: number;
  agmPriority?: string;
  removed?: boolean;
} & Record<string, unknown>;

export type EngineAutoFixUndoTargets = {
  getWritableProvince: (provinceId: number) => AgmWritableProvince | undefined;
  getWritableState: (stateId: number) => AgmWritableState | undefined;
  getWritableBiomeData: () => AgmWritableBiomeData | undefined;
};

export function createGlobalAutoFixUndoTargets(): EngineAutoFixUndoTargets {
  return {
    getWritableProvince: (provinceId) => {
      const province = globalThis.pack?.provinces?.[provinceId] as unknown as
        | AgmWritableProvince
        | undefined;
      if (!province || province.removed) return undefined;
      return province;
    },
    getWritableState: (stateId) => {
      const state = globalThis.pack?.states?.[stateId] as unknown as
        | AgmWritableState
        | undefined;
      if (!state || state.removed) return undefined;
      return state;
    },
    getWritableBiomeData: () => {
      const biomeData = getEngineBiomeData() as
        | AgmWritableBiomeData
        | undefined;
      if (!biomeData?.habitability) return undefined;
      return biomeData;
    },
  };
}
