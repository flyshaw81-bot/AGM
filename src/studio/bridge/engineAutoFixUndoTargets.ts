import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type {
  AgmWritableBiomeData,
  AgmWritableProvince,
} from "./engineActionTypes";
import { getBrowserPack } from "./engineBrowserPackAdapter";
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

export type EngineAutoFixUndoProvinceAdapter = {
  getProvince: (provinceId: number) => AgmWritableProvince | undefined;
};

export type EngineAutoFixUndoStateAdapter = {
  getState: (stateId: number) => AgmWritableState | undefined;
};

export type EngineAutoFixUndoBiomeAdapter = {
  getBiomeData: () => AgmWritableBiomeData | undefined;
};

function writableProvinceOrUndefined(
  province: AgmWritableProvince | undefined,
) {
  if (!province || province.removed) return undefined;
  return province;
}

function writableStateOrUndefined(state: AgmWritableState | undefined) {
  if (!state || state.removed) return undefined;
  return state;
}

function writableBiomeDataOrUndefined(
  biomeData: AgmWritableBiomeData | undefined,
) {
  if (!biomeData?.habitability) return undefined;
  return biomeData;
}

export function createGlobalAutoFixUndoProvinceAdapter(): EngineAutoFixUndoProvinceAdapter {
  return {
    getProvince: (provinceId) =>
      getBrowserPack()?.provinces?.[provinceId] as unknown as
        | AgmWritableProvince
        | undefined,
  };
}

export function createRuntimeAutoFixUndoProvinceAdapter(
  context: EngineRuntimeContext,
): EngineAutoFixUndoProvinceAdapter {
  return {
    getProvince: (provinceId) =>
      context.pack?.provinces?.[provinceId] as unknown as
        | AgmWritableProvince
        | undefined,
  };
}

export function createGlobalAutoFixUndoStateAdapter(): EngineAutoFixUndoStateAdapter {
  return {
    getState: (stateId) =>
      getBrowserPack()?.states?.[stateId] as unknown as
        | AgmWritableState
        | undefined,
  };
}

export function createRuntimeAutoFixUndoStateAdapter(
  context: EngineRuntimeContext,
): EngineAutoFixUndoStateAdapter {
  return {
    getState: (stateId) =>
      context.pack?.states?.[stateId] as unknown as
        | AgmWritableState
        | undefined,
  };
}

export function createGlobalAutoFixUndoBiomeAdapter(): EngineAutoFixUndoBiomeAdapter {
  return {
    getBiomeData: () =>
      getEngineBiomeData() as AgmWritableBiomeData | undefined,
  };
}

export function createRuntimeAutoFixUndoBiomeAdapter(
  context: EngineRuntimeContext,
): EngineAutoFixUndoBiomeAdapter {
  return {
    getBiomeData: () =>
      context.biomesData as unknown as AgmWritableBiomeData | undefined,
  };
}

export function createAutoFixUndoTargets(
  provinceAdapter: EngineAutoFixUndoProvinceAdapter,
  stateAdapter: EngineAutoFixUndoStateAdapter,
  biomeAdapter: EngineAutoFixUndoBiomeAdapter,
): EngineAutoFixUndoTargets {
  return {
    getWritableProvince: (provinceId) =>
      writableProvinceOrUndefined(provinceAdapter.getProvince(provinceId)),
    getWritableState: (stateId) =>
      writableStateOrUndefined(stateAdapter.getState(stateId)),
    getWritableBiomeData: () =>
      writableBiomeDataOrUndefined(biomeAdapter.getBiomeData()),
  };
}

export function createGlobalAutoFixUndoTargets(): EngineAutoFixUndoTargets {
  return createAutoFixUndoTargets(
    createGlobalAutoFixUndoProvinceAdapter(),
    createGlobalAutoFixUndoStateAdapter(),
    createGlobalAutoFixUndoBiomeAdapter(),
  );
}

export function createRuntimeAutoFixUndoTargets(
  context: EngineRuntimeContext,
): EngineAutoFixUndoTargets {
  return createAutoFixUndoTargets(
    createRuntimeAutoFixUndoProvinceAdapter(context),
    createRuntimeAutoFixUndoStateAdapter(context),
    createRuntimeAutoFixUndoBiomeAdapter(context),
  );
}
