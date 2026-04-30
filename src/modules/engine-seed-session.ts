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
  resolve(precreatedSeed?: string): string {
    return resolveEngineSeed({
      precreatedSeed,
      hasHistory: Boolean(globalThis.mapHistory?.[0]),
      searchParams: new URL(globalThis.location.href).searchParams,
    });
  }

  apply(precreatedSeed?: string): string {
    const nextSeed = this.resolve(precreatedSeed);
    globalThis.seed = nextSeed;

    const optionsSeed = document.getElementById(
      "optionsSeed",
    ) as HTMLInputElement | null;
    if (optionsSeed) optionsSeed.value = nextSeed;

    Math.random = aleaPRNG(nextSeed);
    return nextSeed;
  }
}

if (typeof window !== "undefined") {
  window.EngineSeedSession = new EngineSeedSessionModule();
}
