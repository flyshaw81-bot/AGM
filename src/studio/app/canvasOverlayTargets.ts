export type CanvasOverlayTargets = {
  getPaintPreviewOverlay: () => HTMLElement | null;
  getToolHud: () => HTMLElement | null;
  getCanvasFrame: () => HTMLElement | null;
};

export function createGlobalCanvasOverlayTargets(): CanvasOverlayTargets {
  return {
    getPaintPreviewOverlay: () =>
      document.querySelector<HTMLElement>("[data-canvas-paint-preview='true']"),
    getToolHud: () =>
      document.querySelector<HTMLElement>("[data-canvas-tool-hud='true']"),
    getCanvasFrame: () => document.getElementById("studioCanvasFrame"),
  };
}
