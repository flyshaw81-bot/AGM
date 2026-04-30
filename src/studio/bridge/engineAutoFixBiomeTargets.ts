import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { AgmWritableBiomeData } from "./engineActionTypes";
import { getEngineBiomeData } from "./engineResourceSummary";

export type EngineBiomeWritebackTargets = {
  getWritableBiomeData: () => AgmWritableBiomeData | undefined;
  redrawBiomes: () => void;
};

export type EngineBiomeDataLookupAdapter = {
  getBiomeData: () => AgmWritableBiomeData | undefined;
};

export type EngineBiomeRedrawAdapter = {
  redrawBiomes: () => void;
};

function writableBiomeDataOrUndefined(
  biomeData: AgmWritableBiomeData | undefined,
) {
  if (!biomeData?.habitability) return undefined;
  return biomeData;
}

export function createGlobalBiomeDataLookupAdapter(): EngineBiomeDataLookupAdapter {
  return {
    getBiomeData: () =>
      getEngineBiomeData() as AgmWritableBiomeData | undefined,
  };
}

export function createRuntimeBiomeDataLookupAdapter(
  context: EngineRuntimeContext,
): EngineBiomeDataLookupAdapter {
  return {
    getBiomeData: () =>
      context.biomesData as unknown as AgmWritableBiomeData | undefined,
  };
}

export function createGlobalBiomeRedrawAdapter(): EngineBiomeRedrawAdapter {
  return {
    redrawBiomes: () => {
      if (typeof (globalThis as any).drawBiomes === "function")
        (globalThis as any).drawBiomes();
    },
  };
}

export function createBiomeWritebackTargets(
  biomeDataLookupAdapter: EngineBiomeDataLookupAdapter,
  redrawAdapter: EngineBiomeRedrawAdapter,
): EngineBiomeWritebackTargets {
  return {
    getWritableBiomeData: () =>
      writableBiomeDataOrUndefined(biomeDataLookupAdapter.getBiomeData()),
    redrawBiomes: redrawAdapter.redrawBiomes,
  };
}

export function createGlobalBiomeWritebackTargets(): EngineBiomeWritebackTargets {
  return createBiomeWritebackTargets(
    createGlobalBiomeDataLookupAdapter(),
    createGlobalBiomeRedrawAdapter(),
  );
}

export function createRuntimeBiomeWritebackTargets(
  context: EngineRuntimeContext,
  redrawAdapter: EngineBiomeRedrawAdapter = createGlobalBiomeRedrawAdapter(),
): EngineBiomeWritebackTargets {
  return createBiomeWritebackTargets(
    createRuntimeBiomeDataLookupAdapter(context),
    redrawAdapter,
  );
}
