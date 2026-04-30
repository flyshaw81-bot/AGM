import type { AgmWritableBiomeData } from "./engineActionTypes";
import { getEngineBiomeData } from "./engineResourceSummary";

export type EngineBiomeWritebackTargets = {
  getWritableBiomeData: () => AgmWritableBiomeData | undefined;
  redrawBiomes: () => void;
};

export function createGlobalBiomeWritebackTargets(): EngineBiomeWritebackTargets {
  return {
    getWritableBiomeData: () => {
      const biomeData = getEngineBiomeData() as
        | AgmWritableBiomeData
        | undefined;
      if (!biomeData?.habitability) return undefined;
      return biomeData;
    },
    redrawBiomes: () => {
      if (typeof (globalThis as any).drawBiomes === "function")
        (globalThis as any).drawBiomes();
    },
  };
}
