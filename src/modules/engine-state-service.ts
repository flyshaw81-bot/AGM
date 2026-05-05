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
    getStatesModule: () => getGlobalValue<EngineStatesModule>("States"),
  };
}

export function createGlobalStateService(): EngineStateService {
  return createEngineStateService(createGlobalStateServiceTargets());
}

export function createRuntimeStateService(
  context: EngineRuntimeContext,
  statesModule:
    | EngineStatesModule
    | undefined = getGlobalValue<EngineStatesModule>("States"),
): EngineStateService {
  return createEngineStateService({
    getStatesModule: () => statesModule,
    getStateContext: () => context,
  });
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}
