import { rw } from "../utils/probabilityUtils";
import EmblemGeneratorModule, {
  createGlobalEmblemShapeTargets,
  createRuntimeEmblemRuntimeTargets,
} from "./emblem/generator";
import type { EngineRuntimeContext } from "./engine-runtime-context";

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
  getHeraldryModule: () => EngineHeraldryModule | undefined;
  pickWeighted: typeof rw;
};

export function createEngineHeraldryService(
  targets: EngineHeraldryServiceTargets,
): EngineHeraldryService {
  return {
    generate: (parent, kinship, dominion, type) =>
      targets
        .getHeraldryModule()
        ?.generate(parent as any, kinship, dominion as any, type) ?? {},
    getShield: (culture, state) =>
      targets.getHeraldryModule()?.getShield(culture, state) ?? "heater",
    getRandomShield: () => {
      const heraldry = targets.getHeraldryModule();
      if (!heraldry) return "heater";
      const type = targets.pickWeighted(heraldry.shields.types);
      return targets.pickWeighted(heraldry.shields[type]);
    },
  };
}

export function createGlobalHeraldryServiceTargets(): EngineHeraldryServiceTargets {
  return {
    getHeraldryModule: () => getGlobalValue<EngineHeraldryModule>("COA"),
    pickWeighted: rw,
  };
}

export function createGlobalHeraldryService(): EngineHeraldryService {
  return createEngineHeraldryService(createGlobalHeraldryServiceTargets());
}

export function createRuntimeHeraldryServiceTargets(
  context: EngineRuntimeContext,
): EngineHeraldryServiceTargets {
  const module = new EmblemGeneratorModule(
    createGlobalEmblemShapeTargets(),
    createRuntimeEmblemRuntimeTargets(context),
  ) as EngineHeraldryModule;

  return {
    getHeraldryModule: () => module,
    pickWeighted: rw,
  };
}

export function createRuntimeHeraldryService(
  context: EngineRuntimeContext,
): EngineHeraldryService {
  return createEngineHeraldryService(
    createRuntimeHeraldryServiceTargets(context),
  );
}

function getGlobalValue<T>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}
