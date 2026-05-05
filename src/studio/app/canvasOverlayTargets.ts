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

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalCanvasOverlayDomTargets(): CanvasOverlayTargets {
  return {
    getPaintPreviewOverlay: () =>
      getDocument()?.querySelector<HTMLElement>(
        "[data-canvas-paint-preview='true']",
      ) ?? null,
    getToolHud: () =>
      getDocument()?.querySelector<HTMLElement>(
        "[data-canvas-tool-hud='true']",
      ) ?? null,
    getCanvasFrame: () =>
      getDocument()?.getElementById("studioCanvasFrame") ?? null,
  };
}

export function createGlobalCanvasOverlayTargets(): CanvasOverlayTargets {
  return createCanvasOverlayTargets(createGlobalCanvasOverlayDomTargets());
}
