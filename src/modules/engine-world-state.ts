import type { PackedGraph } from "../types/PackedGraph";
import {
  createGlobalGenerationSettings,
  type EngineGenerationSettings,
} from "./engine-generation-settings";
import {
  createGlobalWorldSettings,
  type EngineWorldSettings,
} from "./engine-runtime-settings";

export type EngineBiomeData = {
  i: number[];
  name: string[];
  color: string[];
  biomesMatrix: Uint8Array[];
  habitability: number[];
  iconsDensity: number[];
  icons: string[][];
  cost: number[];
};

export type EngineRuntimeFlags = {
  debug?: Record<string, boolean>;
  shouldTime?: boolean;
  shouldLogInfo?: boolean;
  shouldLogWarnings?: boolean;
  shouldLogErrors?: boolean;
};

export type EngineGrid = any;
export type EnginePack = PackedGraph;
export type EngineOptions = any;
export type EngineSeed = string;

export type EngineWorldState = {
  grid: EngineGrid;
  pack: EnginePack;
  options: EngineOptions;
  seed: EngineSeed;
  biomesData: EngineBiomeData;
  worldSettings: EngineWorldSettings;
  generationSettings: EngineGenerationSettings;
  runtimeFlags: EngineRuntimeFlags;
};

export type EngineWorldStateInput = Partial<EngineWorldState>;

export function createEngineWorldState(
  input: EngineWorldStateInput = {},
): EngineWorldState {
  return {
    grid: input.grid ?? ({} as EngineGrid),
    pack: input.pack ?? ({} as PackedGraph),
    options: input.options ?? ({} as EngineOptions),
    seed: input.seed ?? "",
    biomesData: input.biomesData ?? createEmptyBiomeData(),
    worldSettings: input.worldSettings ?? createGlobalWorldSettings(),
    generationSettings:
      input.generationSettings ?? createGlobalGenerationSettings(),
    runtimeFlags: input.runtimeFlags ?? {},
  };
}

export function createBrowserEngineWorldState(): EngineWorldState {
  return createEngineWorldState({
    grid: getBrowserValue("grid", {} as EngineGrid),
    pack: getBrowserValue("pack", {} as PackedGraph),
    options: getBrowserValue("options", {} as EngineOptions),
    seed: getBrowserValue("seed", ""),
    biomesData: getBrowserValue("biomesData", createEmptyBiomeData()),
    worldSettings: createGlobalWorldSettings(),
    generationSettings: createGlobalGenerationSettings(),
    runtimeFlags: {
      debug: getBrowserValue("DEBUG", {}),
      shouldTime: getBrowserValue("TIME", false),
      shouldLogInfo: getBrowserValue("INFO", false),
      shouldLogWarnings: getBrowserValue("WARN", false),
      shouldLogErrors: getBrowserValue("ERROR", false),
    },
  });
}

export function createEmptyBiomeData(): EngineBiomeData {
  return {
    i: [],
    name: [],
    color: [],
    biomesMatrix: [],
    habitability: [],
    iconsDensity: [],
    icons: [],
    cost: [],
  };
}

function getBrowserValue<T>(name: string, fallback: T): T {
  try {
    return (
      ((globalThis as Record<string, unknown>)[name] as T | undefined) ??
      fallback
    );
  } catch {
    return fallback;
  }
}
