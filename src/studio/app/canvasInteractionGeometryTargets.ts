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

export type CanvasInteractionGeometryDomTargets = Pick<
  CanvasInteractionGeometryTargets,
  "getCanvasFrame"
>;

export function createCanvasInteractionGeometryTargets(
  targets: CanvasInteractionGeometryTargets,
): CanvasInteractionGeometryTargets {
  return targets;
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalCanvasInteractionGeometryDomTargets(): CanvasInteractionGeometryDomTargets {
  return {
    getCanvasFrame: () => getCanvasFrameElement(),
  };
}

export function createGlobalCanvasInteractionGeometryTargets(): CanvasInteractionGeometryTargets {
  return createCanvasInteractionGeometryTargets({
    ...createGlobalCanvasInteractionGeometryDomTargets(),
    getGraphSize: getEngineCanvasGraphSize,
    getPack: () => getEnginePack() as CanvasInteractionPack | undefined,
    getPaintPreviewForCell: getCanvasPaintPreviewForCell,
  });
}

export function createRuntimeCanvasInteractionGeometryTargets(
  context: EngineRuntimeContext,
  domTargets: CanvasInteractionGeometryDomTargets = createGlobalCanvasInteractionGeometryDomTargets(),
): CanvasInteractionGeometryTargets {
  const paintTargets: CanvasPaintEditingTargets =
    createRuntimeCanvasPaintEditingTargets(context);
  return createCanvasInteractionGeometryTargets({
    ...domTargets,
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
  return getDocument()?.getElementById("studioCanvasFrame") ?? null;
}
