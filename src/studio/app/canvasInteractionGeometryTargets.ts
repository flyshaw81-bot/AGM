import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { CanvasPaintPreviewState } from "../types";
import {
  type CanvasPaintEditingTargets,
  createRuntimeCanvasPaintEditingTargets,
  getCanvasPaintPreviewForCell,
} from "./canvasPaintEditing";
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
  getPaintPreviewForCell: (
    tool: CanvasPaintPreviewState["tool"],
    cellId: number,
  ) => CanvasPaintPreviewState | null;
};

export function createCanvasInteractionGeometryTargets(
  targets: CanvasInteractionGeometryTargets,
): CanvasInteractionGeometryTargets {
  return targets;
}

export function createGlobalCanvasInteractionGeometryTargets(): CanvasInteractionGeometryTargets {
  return createCanvasInteractionGeometryTargets({
    getCanvasFrame: () => getCanvasFrameElement(),
    getGraphSize: getEngineCanvasGraphSize,
    getPack: () => getEnginePack() as CanvasInteractionPack | undefined,
    getPaintPreviewForCell: getCanvasPaintPreviewForCell,
  });
}

export function createRuntimeCanvasInteractionGeometryTargets(
  context: EngineRuntimeContext,
): CanvasInteractionGeometryTargets {
  const paintTargets: CanvasPaintEditingTargets =
    createRuntimeCanvasPaintEditingTargets(context);
  return createCanvasInteractionGeometryTargets({
    getCanvasFrame: () => getCanvasFrameElement(),
    getGraphSize: () => ({
      width: Number(context.worldSettings.graphWidth) || 0,
      height: Number(context.worldSettings.graphHeight) || 0,
    }),
    getPack: () => context.pack as CanvasInteractionPack | undefined,
    getPaintPreviewForCell: (tool, cellId) =>
      getCanvasPaintPreviewForCell(tool, cellId, paintTargets),
  });
}

function getCanvasFrameElement(): HTMLElement | null {
  return globalThis.document?.getElementById("studioCanvasFrame") ?? null;
}
