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

export function createGlobalHeraldryService(): EngineHeraldryService {
  return {
    generate: (parent, kinship, dominion, type) =>
      COA.generate(parent as any, kinship, dominion as any, type),
    getShield: (culture, state) => COA.getShield(culture, state),
    getRandomShield: () => {
      const type = rw(COA.shields.types);
      return rw(COA.shields[type]);
    },
  };
}
