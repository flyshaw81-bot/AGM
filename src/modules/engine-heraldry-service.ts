import { rw } from "../utils/probabilityUtils";

export type EngineHeraldryService = {
  generate: (
    parent: unknown,
    kinship: number | null,
    dominion: unknown,
    type?: string,
  ) => any;
  getShield: (culture: number, state?: number) => unknown;
  getRandomShield: () => string;
};

type EngineHeraldryModule = {
  generate: (
    parent: any,
    kinship: number | null,
    dominion: any,
    type?: string,
  ) => any;
  getShield: (culture: number, state?: number) => unknown;
  shields: {
    types: Record<string, number>;
    [type: string]: Record<string, number>;
  };
};

export type EngineHeraldryServiceTargets = {
  getHeraldryModule: () => EngineHeraldryModule;
  pickWeighted: typeof rw;
};

export function createEngineHeraldryService(
  targets: EngineHeraldryServiceTargets,
): EngineHeraldryService {
  return {
    generate: (parent, kinship, dominion, type) =>
      targets
        .getHeraldryModule()
        .generate(parent as any, kinship, dominion as any, type),
    getShield: (culture, state) =>
      targets.getHeraldryModule().getShield(culture, state),
    getRandomShield: () => {
      const heraldry = targets.getHeraldryModule();
      const type = targets.pickWeighted(heraldry.shields.types);
      return targets.pickWeighted(heraldry.shields[type]);
    },
  };
}

export function createGlobalHeraldryService(): EngineHeraldryService {
  return createEngineHeraldryService({
    getHeraldryModule: () => COA,
    pickWeighted: rw,
  });
}
