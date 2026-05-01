export type CanvasOverlayTargets = {
  getPaintPreviewOverlay: () => HTMLElement | null;
  getToolHud: () => HTMLElement | null;
  getCanvasFrame: () => HTMLElement | null;
};

export function createCanvasOverlayTargets(
  targets: CanvasOverlayTargets,
): CanvasOverlayTargets {
  return targets;
}

export function createGlobalCanvasOverlayTargets(): CanvasOverlayTargets {
  return createCanvasOverlayTargets({
    getPaintPreviewOverlay: () =>
      globalThis.document?.querySelector<HTMLElement>(
        "[data-canvas-paint-preview='true']",
      ) ?? null,
    getToolHud: () =>
      globalThis.document?.querySelector<HTMLElement>(
        "[data-canvas-tool-hud='true']",
      ) ?? null,
    getCanvasFrame: () =>
      globalThis.document?.getElementById("studioCanvasFrame") ?? null,
  });
}
