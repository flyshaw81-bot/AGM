import { getActiveEngineRuntimeContext } from "../modules/engine-runtime-active-context";
import type { EngineRuntimeContext } from "../modules/engine-runtime-context";

type RendererBrowserGlobals = {
  grid?: EngineRuntimeContext["grid"];
  pack?: EngineRuntimeContext["pack"];
  options?: EngineRuntimeContext["options"];
  seed?: EngineRuntimeContext["seed"];
  biomesData?: EngineRuntimeContext["biomesData"];
  graphWidth?: number;
  graphHeight?: number;
  TIME?: boolean;
};

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

export function createBrowserRendererContext(): EngineRuntimeContext {
  const activeContext = getActiveEngineRuntimeContext();
  if (activeContext) return activeContext;

  const runtime = globalThis as RendererBrowserGlobals;

  return {
    grid: runtime.grid ?? ({} as EngineRuntimeContext["grid"]),
    pack: runtime.pack ?? ({} as EngineRuntimeContext["pack"]),
    options: runtime.options ?? ({} as EngineRuntimeContext["options"]),
    seed: runtime.seed ?? ("" as EngineRuntimeContext["seed"]),
    worldSettings: {
      graphWidth: getNumber(runtime.graphWidth) ?? 0,
      graphHeight: getNumber(runtime.graphHeight) ?? 0,
    },
    generationSettings: {} as EngineRuntimeContext["generationSettings"],
    populationSettings: {
      populationRate: 0,
      urbanDensity: 0,
      urbanization: 0,
    },
    naming: {} as EngineRuntimeContext["naming"],
    burgs: {} as EngineRuntimeContext["burgs"],
    routes: {} as EngineRuntimeContext["routes"],
    states: {} as EngineRuntimeContext["states"],
    units: { height: "m" },
    heraldry: {} as EngineRuntimeContext["heraldry"],
    mapStore: {} as EngineRuntimeContext["mapStore"],
    seedSession: {} as EngineRuntimeContext["seedSession"],
    graphSession: {} as EngineRuntimeContext["graphSession"],
    optionsSession: {} as EngineRuntimeContext["optionsSession"],
    gridSession: {} as EngineRuntimeContext["gridSession"],
    sessionLifecycle: {} as EngineRuntimeContext["sessionLifecycle"],
    generationSession: {} as EngineRuntimeContext["generationSession"],
    lifecycle: {} as EngineRuntimeContext["lifecycle"],
    notes: {} as EngineRuntimeContext["notes"],
    random: {} as EngineRuntimeContext["random"],
    timing: { shouldTime: Boolean(runtime.TIME) },
    biomesData:
      runtime.biomesData ?? ({} as EngineRuntimeContext["biomesData"]),
  };
}
