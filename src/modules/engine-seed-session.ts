import { generateSeed } from "../utils/probabilityUtils";
import type { EngineRuntimeContext } from "./engine-runtime-context";

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

export type EngineSeedRuntimeTargets = {
  hasHistory: () => boolean;
  getSearchParams: () => URLSearchParams;
  setSeed: (seed: string) => void;
  setRandomGenerator: (seed: string) => void;
  createSeed: () => string;
};

export type EngineSeedDomTargets = {
  getOptionsSeedInput: () => HTMLInputElement | null;
};

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getWindow(): (Window & typeof globalThis) | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

function getMapHistory(): EngineSeedHistoryEntry[] | undefined {
  try {
    return globalThis.mapHistory;
  } catch {
    return undefined;
  }
}

function getLocationHref(): string {
  try {
    return globalThis.location?.href ?? "";
  } catch {
    return "";
  }
}

function getAleaPrng(): ((seed: string) => () => number) | undefined {
  try {
    return globalThis.aleaPRNG;
  } catch {
    return undefined;
  }
}

export function createGlobalSeedDomTargets(): EngineSeedDomTargets {
  return {
    getOptionsSeedInput: () =>
      getDocument()?.getElementById("optionsSeed") as HTMLInputElement | null,
  };
}

export function createGlobalSeedRuntimeTargets(): EngineSeedRuntimeTargets {
  return {
    hasHistory: () => Boolean(getMapHistory()?.[0]),
    getSearchParams: () =>
      new URL(getLocationHref(), "https://agm.local").searchParams,
    setSeed: (nextSeed) => {
      globalThis.seed = nextSeed;
    },
    setRandomGenerator: (nextSeed) => {
      const createRandom = getAleaPrng();
      if (createRandom) Math.random = createRandom(nextSeed);
    },
    createSeed: generateSeed,
  };
}

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

export function createSeedSessionTargets(
  runtimeTargets: EngineSeedRuntimeTargets,
  domTargets: EngineSeedDomTargets = createGlobalSeedDomTargets(),
): EngineSeedSessionTargets {
  return {
    hasHistory: runtimeTargets.hasHistory,
    getSearchParams: runtimeTargets.getSearchParams,
    setSeed: runtimeTargets.setSeed,
    setOptionsSeed: (nextSeed) => {
      const optionsSeed = domTargets.getOptionsSeedInput();
      if (optionsSeed) optionsSeed.value = nextSeed;
    },
    setRandomGenerator: runtimeTargets.setRandomGenerator,
    createSeed: runtimeTargets.createSeed,
  };
}

export function createGlobalSeedSessionTargets(
  domTargets: EngineSeedDomTargets = createGlobalSeedDomTargets(),
  runtimeTargets: EngineSeedRuntimeTargets = createGlobalSeedRuntimeTargets(),
): EngineSeedSessionTargets {
  return createSeedSessionTargets(runtimeTargets, domTargets);
}

export function createRuntimeSeedSessionTargets(
  context: EngineRuntimeContext,
  fallback: EngineSeedSessionTargets = createGlobalSeedSessionTargets(),
): EngineSeedSessionTargets {
  return {
    hasHistory: fallback.hasHistory,
    getSearchParams: fallback.getSearchParams,
    setSeed: (nextSeed) => {
      context.seed = nextSeed;
      fallback.setSeed(nextSeed);
    },
    setOptionsSeed: (nextSeed) => {
      context.options.seed = nextSeed;
      fallback.setOptionsSeed(nextSeed);
    },
    setRandomGenerator: fallback.setRandomGenerator,
    createSeed: () => String(Math.floor(context.random.next() * 1e9)),
  };
}

export function createRuntimeSeedSession(
  context: EngineRuntimeContext,
  targets: EngineSeedSessionTargets = createRuntimeSeedSessionTargets(context),
): EngineSeedSessionModule {
  return new EngineSeedSessionModule(targets);
}

const runtimeWindow = getWindow();
if (runtimeWindow)
  runtimeWindow.EngineSeedSession = new EngineSeedSessionModule();
