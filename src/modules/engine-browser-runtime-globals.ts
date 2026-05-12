import type { PackedGraph } from "../types/PackedGraph";
import { getActiveEngineRuntimeContext } from "./engine-runtime-active-context";
import type {
  EngineBiomeData,
  EngineGrid,
  EngineOptions,
  EngineSeed,
} from "./engine-world-state";

export type EngineBrowserMapCoordinates = Record<string, any>;

export type EngineBrowserRuntimeGlobals = typeof globalThis & {
  biomesData?: EngineBiomeData;
  graphHeight?: number;
  graphWidth?: number;
  grid?: EngineGrid;
  mapCoordinates?: EngineBrowserMapCoordinates;
  options?: EngineOptions;
  pack?: PackedGraph;
  seed?: EngineSeed;
};

export function getBrowserRuntimeValue<
  K extends keyof EngineBrowserRuntimeGlobals,
>(key: K): EngineBrowserRuntimeGlobals[K] | undefined {
  try {
    return (globalThis as EngineBrowserRuntimeGlobals)[key];
  } catch {
    return undefined;
  }
}

export function setBrowserRuntimeValue<
  K extends keyof EngineBrowserRuntimeGlobals,
>(key: K, value: EngineBrowserRuntimeGlobals[K]): void {
  try {
    (globalThis as EngineBrowserRuntimeGlobals)[key] = value;
  } catch {
    // Browser compatibility slots are best-effort in isolated tests.
  }
}

export function getBrowserRuntimePack(): PackedGraph | undefined {
  return (
    getActiveEngineRuntimeContext()?.pack ?? getBrowserRuntimeValue("pack")
  );
}

export function getBrowserRuntimeGrid(): EngineGrid | undefined {
  return (
    getActiveEngineRuntimeContext()?.grid ?? getBrowserRuntimeValue("grid")
  );
}

export function getBrowserRuntimeSeed(): EngineSeed | undefined {
  return (
    getActiveEngineRuntimeContext()?.seed ?? getBrowserRuntimeValue("seed")
  );
}

export function getBrowserRuntimeGraphSize(): {
  width: number | undefined;
  height: number | undefined;
} {
  const activeSettings = getActiveEngineRuntimeContext()?.worldSettings;
  return {
    width: activeSettings?.graphWidth ?? getBrowserRuntimeValue("graphWidth"),
    height:
      activeSettings?.graphHeight ?? getBrowserRuntimeValue("graphHeight"),
  };
}

export function getBrowserRuntimeNumber(
  key: keyof EngineBrowserRuntimeGlobals,
  fallback: number,
): number {
  const value = getBrowserRuntimeValue(key);
  return typeof value === "number" ? value : fallback;
}
