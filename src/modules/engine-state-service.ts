export type EngineStateService = {
  generateCampaign: (state: any) => any[];
  getPoles: () => void;
};

export function createGlobalStateService(): EngineStateService {
  return {
    generateCampaign: (state) => States.generateCampaign(state),
    getPoles: () => {
      States.getPoles();
    },
  };
}
