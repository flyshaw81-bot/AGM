import type { EngineRuntimeContext } from "./engine-runtime-context";

type EngineStatesModule = {
  generateCampaign: (state: any, context?: EngineRuntimeContext) => any[];
  getPoles: (context?: EngineRuntimeContext) => void;
};

export type EngineStateServiceTargets = {
  getStatesModule: () => EngineStatesModule | undefined;
  getStateContext?: () => EngineRuntimeContext | undefined;
};

export type EngineStateService = {
  generateCampaign: (state: any) => any[];
  getPoles: () => void;
};

export function createEngineStateService(
  targets: EngineStateServiceTargets,
): EngineStateService {
  return {
    generateCampaign: (state) =>
      targets
        .getStatesModule()
        ?.generateCampaign(state, targets.getStateContext?.()) ?? [],
    getPoles: () => {
      targets.getStatesModule()?.getPoles(targets.getStateContext?.());
    },
  };
}

export function createGlobalStateServiceTargets(): EngineStateServiceTargets {
  return {
    getStatesModule: () => globalThis.States,
  };
}

export function createGlobalStateService(): EngineStateService {
  return createEngineStateService(createGlobalStateServiceTargets());
}

export function createRuntimeStateService(
  context: EngineRuntimeContext,
  statesModule: EngineStatesModule | undefined = globalThis.States,
): EngineStateService {
  return createEngineStateService({
    getStatesModule: () => statesModule,
    getStateContext: () => context,
  });
}
