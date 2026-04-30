import type { Burg } from "./burgs-generator";

export type EngineBurgService = {
  add: (point: [number, number]) => number | null;
  remove: (burgId: number) => void;
  findById: (burgId: number) => Burg | undefined;
};

export function createGlobalBurgService(): EngineBurgService {
  return {
    add: (point) => globalThis.Burgs?.add?.(point) ?? null,
    remove: (burgId) => {
      globalThis.Burgs?.remove?.(burgId);
    },
    findById: (burgId) => globalThis.pack?.burgs?.[burgId] as Burg | undefined,
  };
}
