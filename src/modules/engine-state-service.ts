type EngineStatesModule = {
  generateCampaign: (state: any) => any[];
  getPoles: () => void;
};

export type EngineStateServiceTargets = {
  getStatesModule: () => EngineStatesModule;
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
      targets.getStatesModule().generateCampaign(state),
    getPoles: () => {
      targets.getStatesModule().getPoles();
    },
  };
}

export function createGlobalStateService(): EngineStateService {
  return createEngineStateService({
    getStatesModule: () => States,
  });
}
