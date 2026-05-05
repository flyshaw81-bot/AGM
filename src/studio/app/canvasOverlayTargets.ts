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
    getPaintPreviewOverlay: () => {
      try {
        return (
          getDocument()?.querySelector<HTMLElement>(
            "[data-canvas-paint-preview='true']",
          ) ?? null
        );
      } catch {
        return null;
      }
    },
    getToolHud: () => {
      try {
        return (
          getDocument()?.querySelector<HTMLElement>(
            "[data-canvas-tool-hud='true']",
          ) ?? null
        );
      } catch {
        return null;
      }
    },
    getCanvasFrame: () => {
      try {
        return getDocument()?.getElementById("studioCanvasFrame") ?? null;
      } catch {
        return null;
      }
    },
  };
}

export function createGlobalCanvasOverlayTargets(): CanvasOverlayTargets {
  return createCanvasOverlayTargets(createGlobalCanvasOverlayDomTargets());
}
