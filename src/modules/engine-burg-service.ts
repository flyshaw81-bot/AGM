import type { Burg } from "./burgs-generator";

type EngineBurgModule = {
  add?: (point: [number, number]) => number | null;
  remove?: (burgId: number) => void;
};

export type EngineBurgServiceTargets = {
  getBurgModule: () => EngineBurgModule | undefined;
  getBurgs: () => (Burg | undefined)[] | undefined;
};

export type EngineBurgService = {
  add: (point: [number, number]) => number | null;
  remove: (burgId: number) => void;
  findById: (burgId: number) => Burg | undefined;
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
  };
}

export function createGlobalBurgService(): EngineBurgService {
  return createEngineBurgService({
    getBurgModule: () => globalThis.Burgs,
    getBurgs: () => globalThis.pack?.burgs as (Burg | undefined)[] | undefined,
  });
}
