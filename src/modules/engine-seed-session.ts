import { generateSeed } from "../utils/probabilityUtils";

export type EngineSeedHistoryEntry = {
  seed?: string;
};

export type EngineSeedResolutionInput = {
  precreatedSeed?: string;
  hasHistory: boolean;
  searchParams: URLSearchParams;
  createSeed?: () => string;
};

export type EngineSeedSessionTargets = {
  hasHistory: () => boolean;
  getSearchParams: () => URLSearchParams;
  setSeed: (seed: string) => void;
  setOptionsSeed: (seed: string) => void;
  setRandomGenerator: (seed: string) => void;
  createSeed: () => string;
};

declare global {
  var EngineSeedSession: EngineSeedSessionModule;
}

export function resolveEngineSeed({
  precreatedSeed,
  hasHistory,
  searchParams,
  createSeed = generateSeed,
}: EngineSeedResolutionInput): string {
  if (precreatedSeed) return precreatedSeed;

  const isFirstMap = !hasHistory;
  const urlSeed = searchParams.get("seed");

  if (
    isFirstMap &&
    searchParams.get("from") === "MFCG" &&
    urlSeed?.length === 13
  ) {
    return urlSeed.slice(0, -4);
  }

  if (isFirstMap && urlSeed) return urlSeed;

  return createSeed();
}

export class EngineSeedSessionModule {
  resolve: (precreatedSeed?: string) => string;
  apply: (precreatedSeed?: string) => string;

  constructor(
    targets: EngineSeedSessionTargets = createGlobalSeedSessionTargets(),
  ) {
    this.resolve = (precreatedSeed?: string) =>
      resolveEngineSeed({
        precreatedSeed,
        hasHistory: targets.hasHistory(),
        searchParams: targets.getSearchParams(),
        createSeed: targets.createSeed,
      });

    this.apply = (precreatedSeed?: string) => {
      const nextSeed = this.resolve(precreatedSeed);
      targets.setSeed(nextSeed);
      targets.setOptionsSeed(nextSeed);
      targets.setRandomGenerator(nextSeed);
      return nextSeed;
    };
  }
}

export function createGlobalSeedSessionTargets(): EngineSeedSessionTargets {
  return {
    hasHistory: () => Boolean(globalThis.mapHistory?.[0]),
    getSearchParams: () => new URL(globalThis.location.href).searchParams,
    setSeed: (nextSeed) => {
      globalThis.seed = nextSeed;
    },
    setOptionsSeed: (nextSeed) => {
      const optionsSeed = document.getElementById(
        "optionsSeed",
      ) as HTMLInputElement | null;
      if (optionsSeed) optionsSeed.value = nextSeed;
    },
    setRandomGenerator: (nextSeed) => {
      Math.random = aleaPRNG(nextSeed);
    },
    createSeed: generateSeed,
  };
}

if (typeof window !== "undefined") {
  window.EngineSeedSession = new EngineSeedSessionModule();
}
