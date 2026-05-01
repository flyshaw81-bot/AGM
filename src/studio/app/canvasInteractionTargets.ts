import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import { syncEngineViewport } from "../bridge/engineMapHost";
import type { StudioState } from "../types";
import {
  createRuntimeCanvasInteractionGeometryTargets,
  getCanvasPaintPreviewAt,
  getCanvasSelectionAt,
} from "./canvasInteractionGeometry";
import { syncCanvasPaintPreview, syncCanvasToolHud } from "./canvasOverlaySync";
import { isPaintCanvasTool } from "./canvasPaintEditing";

export type CanvasInteractionTargets = {
  getCanvasFrame: () => HTMLElement | null;
  getMapHost: () => HTMLElement | null;
  isControlEvent: (event: Event) => boolean;
  getPaintPreviewAt: typeof getCanvasPaintPreviewAt;
  getSelectionAt: typeof getCanvasSelectionAt;
  syncPaintPreview: (state: StudioState) => void;
  syncToolHud: (state: StudioState) => void;
  syncViewport: typeof syncEngineViewport;
  isPaintTool: typeof isPaintCanvasTool;
};

export function createCanvasInteractionTargets(
  targets: CanvasInteractionTargets,
): CanvasInteractionTargets {
  return targets;
}

function isCanvasControlEvent(event: Event) {
  if (typeof globalThis.Element !== "function") return false;
  return (
    event.target instanceof Element &&
    Boolean(
      event.target.closest(
        "[data-canvas-tool-hud='true'], [data-canvas-selection-card='true'], [data-studio-map-tools='true']",
      ),
    )
  );
}

export function createGlobalCanvasInteractionTargets(): CanvasInteractionTargets {
  return createCanvasInteractionTargets({
    getCanvasFrame: () => getCanvasFrameElement(),
    getMapHost: () => getMapHostElement(),
    isControlEvent: isCanvasControlEvent,
    getPaintPreviewAt: getCanvasPaintPreviewAt,
    getSelectionAt: getCanvasSelectionAt,
    syncPaintPreview: syncCanvasPaintPreview,
    syncToolHud: syncCanvasToolHud,
    syncViewport: syncEngineViewport,
    isPaintTool: isPaintCanvasTool,
  });
}

export function createRuntimeCanvasInteractionTargets(
  context: EngineRuntimeContext,
): CanvasInteractionTargets {
  const geometryTargets =
    createRuntimeCanvasInteractionGeometryTargets(context);
  return createCanvasInteractionTargets({
    getCanvasFrame: () => getCanvasFrameElement(),
    getMapHost: () => getMapHostElement(),
    isControlEvent: isCanvasControlEvent,
    getPaintPreviewAt: (event, state) =>
      getCanvasPaintPreviewAt(event, state, geometryTargets),
    getSelectionAt: (event, state) =>
      getCanvasSelectionAt(event, state, geometryTargets),
    syncPaintPreview: syncCanvasPaintPreview,
    syncToolHud: syncCanvasToolHud,
    syncViewport: syncEngineViewport,
    isPaintTool: isPaintCanvasTool,
  });
}

function getCanvasFrameElement(): HTMLElement | null {
  return globalThis.document?.getElementById("studioCanvasFrame") ?? null;
}

function getMapHostElement(): HTMLElement | null {
  return globalThis.document?.getElementById("studioMapHost") ?? null;
}
