import { syncEngineViewport } from "../bridge/engineMapHost";
import type { StudioState } from "../types";
import {
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

function isCanvasControlEvent(event: Event) {
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
  return {
    getCanvasFrame: () => document.getElementById("studioCanvasFrame"),
    getMapHost: () => document.getElementById("studioMapHost"),
    isControlEvent: isCanvasControlEvent,
    getPaintPreviewAt: getCanvasPaintPreviewAt,
    getSelectionAt: getCanvasSelectionAt,
    syncPaintPreview: syncCanvasPaintPreview,
    syncToolHud: syncCanvasToolHud,
    syncViewport: syncEngineViewport,
    isPaintTool: isPaintCanvasTool,
  };
}
