import type { Burg } from "./burgs-generator";
import type { EngineRuntimeContext } from "./engine-runtime-context";

type EngineBurgModule = {
  add?: (point: [number, number]) => number | null;
  remove?: (burgId: number) => void;
  getType?: (
    cellId: number,
    port?: number,
    context?: EngineRuntimeContext,
  ) => string;
};

export type EngineBurgServiceTargets = {
  getBurgModule: () => EngineBurgModule | undefined;
  getBurgs: () => (Burg | undefined)[] | undefined;
  getTypeContext?: () => EngineRuntimeContext | undefined;
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
    add: (point) => targets.getBurgModule()?.add?.(point) ?? null,
    remove: (burgId) => {
      targets.getBurgModule()?.remove?.(burgId);
    },
    findById: (burgId) => targets.getBurgs()?.[burgId],
    getType: (cellId, port) =>
      targets
        .getBurgModule()
        ?.getType?.(cellId, port, targets.getTypeContext?.()) ?? "Generic",
  };
}

export function createGlobalBurgService(): EngineBurgService {
  return createEngineBurgService({
    getBurgModule: () => globalThis.Burgs,
    getBurgs: () => globalThis.pack?.burgs as (Burg | undefined)[] | undefined,
  });
}

export function createRuntimeBurgService(
  context: EngineRuntimeContext,
  burgModule: EngineBurgModule | undefined = globalThis.Burgs,
): EngineBurgService {
  return createEngineBurgService({
    getBurgModule: () => burgModule,
    getBurgs: () => context.pack.burgs as (Burg | undefined)[] | undefined,
    getTypeContext: () => context,
  });
}
