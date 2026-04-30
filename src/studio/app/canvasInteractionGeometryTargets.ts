import { getEngineCanvasGraphSize, getEnginePack } from "./engineCanvasAccess";

export type CanvasInteractionFrame = Pick<
  HTMLElement,
  "getBoundingClientRect" | "offsetHeight" | "offsetWidth"
>;

export type CanvasInteractionPack = {
  cells?: {
    i?: ArrayLike<number>;
    p?: Record<number, unknown>;
    state?: Record<number, number>;
  };
  states?: Record<number, { name?: string; removed?: boolean }>;
};

export type CanvasInteractionGeometryTargets = {
  getCanvasFrame: () => CanvasInteractionFrame | null;
  getGraphSize: typeof getEngineCanvasGraphSize;
  getPack: () => CanvasInteractionPack | undefined;
};

export function createCanvasInteractionGeometryTargets(
  targets: CanvasInteractionGeometryTargets,
): CanvasInteractionGeometryTargets {
  return targets;
}

export function createGlobalCanvasInteractionGeometryTargets(): CanvasInteractionGeometryTargets {
  return createCanvasInteractionGeometryTargets({
    getCanvasFrame: () => document.getElementById("studioCanvasFrame"),
    getGraphSize: getEngineCanvasGraphSize,
    getPack: () => getEnginePack() as CanvasInteractionPack | undefined,
  });
}
