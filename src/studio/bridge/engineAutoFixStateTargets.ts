import type { AgmWritableState } from "./engineAutoFixUndoTargets";

export type EngineStateWritebackTargets = {
  getWritableState: (stateId: number) => AgmWritableState | undefined;
};

export function createGlobalStateWritebackTargets(): EngineStateWritebackTargets {
  return {
    getWritableState: (stateId) => {
      const state = globalThis.pack?.states?.[stateId] as unknown as
        | AgmWritableState
        | undefined;
      if (!state || state.removed) return undefined;
      return state;
    },
  };
}
