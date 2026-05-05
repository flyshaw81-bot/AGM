import type { Burg } from "./burgs-generator";
import type { EngineRuntimeContext } from "./engine-runtime-context";

type EngineBurgModule = {
  add?: (
    point: [number, number],
    context?: EngineRuntimeContext,
  ) => number | null;
  remove?: (burgId: number, context?: EngineRuntimeContext) => void;
  getType?: (
    cellId: number,
    port?: number,
    context?: EngineRuntimeContext,
  ) => string;
};

export type EngineBurgServiceTargets = {
  getBurgModule: () => EngineBurgModule | undefined;
  getBurgs: () => (Burg | undefined)[] | undefined;
  getBurgContext?: () => EngineRuntimeContext | undefined;
};

export type EngineBurgService = {
  add: (point: [number, number]) => number | null;
  remove: (burgId: number) => void;
  findById: (burgId: number) => Burg | undefined;
  getType: (cellId: number, port?: number) => string;
};

export function createEngineBurgService(
  targets: EngineBurgServiceTargets,
): EngineBurgService {
  return {
    add: (point) =>
      targets.getBurgModule()?.add?.(point, targets.getBurgContext?.()) ?? null,
    remove: (burgId) => {
      targets.getBurgModule()?.remove?.(burgId, targets.getBurgContext?.());
    },
    findById: (burgId) => targets.getBurgs()?.[burgId],
    getType: (cellId, port) =>
      targets
        .getBurgModule()
        ?.getType?.(cellId, port, targets.getBurgContext?.()) ?? "Generic",
  };
}

export function createGlobalBurgServiceTargets(): EngineBurgServiceTargets {
  return {
    getBurgModule: () => globalThis.Burgs,
    getBurgs: () => globalThis.pack?.burgs as (Burg | undefined)[] | undefined,
  };
}

export function createGlobalBurgService(): EngineBurgService {
  return createEngineBurgService(createGlobalBurgServiceTargets());
}

export function createRuntimeBurgService(
  context: EngineRuntimeContext,
  burgModule: EngineBurgModule | undefined = globalThis.Burgs,
): EngineBurgService {
  return createEngineBurgService({
    getBurgModule: () => burgModule,
    getBurgs: () => context.pack.burgs as (Burg | undefined)[] | undefined,
    getBurgContext: () => context,
  });
}
