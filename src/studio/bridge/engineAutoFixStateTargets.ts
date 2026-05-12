import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { AgmWritableState } from "./engineAutoFixUndoTargets";
import { getBrowserPack } from "./engineBrowserPackAdapter";

export type EngineStateWritebackTargets = {
  getWritableState: (stateId: number) => AgmWritableState | undefined;
};

export type EngineStateLookupAdapter = {
  getState: (stateId: number) => AgmWritableState | undefined;
};

function writableStateOrUndefined(state: AgmWritableState | undefined) {
  if (!state || state.removed) return undefined;
  return state;
}

export function createGlobalStateLookupAdapter(): EngineStateLookupAdapter {
  return {
    getState: (stateId) =>
      getBrowserPack()?.states?.[stateId] as unknown as
        | AgmWritableState
        | undefined,
  };
}

export function createRuntimeStateLookupAdapter(
  context: EngineRuntimeContext,
): EngineStateLookupAdapter {
  return {
    getState: (stateId) =>
      context.pack?.states?.[stateId] as unknown as
        | AgmWritableState
        | undefined,
  };
}

export function createStateWritebackTargets(
  stateLookupAdapter: EngineStateLookupAdapter,
): EngineStateWritebackTargets {
  return {
    getWritableState: (stateId) =>
      writableStateOrUndefined(stateLookupAdapter.getState(stateId)),
  };
}

export function createGlobalStateWritebackTargets(): EngineStateWritebackTargets {
  return createStateWritebackTargets(createGlobalStateLookupAdapter());
}

export function createRuntimeStateWritebackTargets(
  context: EngineRuntimeContext,
): EngineStateWritebackTargets {
  return createStateWritebackTargets(createRuntimeStateLookupAdapter(context));
}
