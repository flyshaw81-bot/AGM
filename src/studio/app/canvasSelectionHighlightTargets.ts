export type CanvasSelectionHighlightTargets = {
  getSelectedStateElements: () => SVGElement[];
  getSelectedStateBorderElements: () => SVGElement[];
  getCanvasFrame: () => HTMLElement | null;
  getMapHost: () => HTMLElement | null;
  getStatePath: (stateId: number) => SVGElement | null;
  getStateBorder: (stateId: number) => SVGElement | null;
  appendToParent: (element: SVGElement) => void;
};

export function createCanvasSelectionHighlightTargets(
  targets: CanvasSelectionHighlightTargets,
): CanvasSelectionHighlightTargets {
  return targets;
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalCanvasSelectionHighlightDomTargets(): CanvasSelectionHighlightTargets {
  return {
    getSelectedStateElements: () =>
      Array.from(
        getDocument()?.querySelectorAll<SVGElement>(
          "[data-studio-selected-state='true']",
        ) ?? [],
      ),
    getSelectedStateBorderElements: () =>
      Array.from(
        getDocument()?.querySelectorAll<SVGElement>(
          "[data-studio-selected-state-border='true']",
        ) ?? [],
      ),
    getCanvasFrame: () =>
      getDocument()?.getElementById("studioCanvasFrame") ?? null,
    getMapHost: () => getDocument()?.getElementById("studioMapHost") ?? null,
    getStatePath: (stateId) => {
      const element = getDocument()?.getElementById(`state${stateId}`);
      return isSvgElement(element) ? element : null;
    },
    getStateBorder: (stateId) => {
      const element = getDocument()?.getElementById(`state-border${stateId}`);
      return isSvgElement(element) ? element : null;
    },
    appendToParent: (element) => {
      element.parentElement?.appendChild(element);
    },
  };
}

export function createGlobalCanvasSelectionHighlightTargets(): CanvasSelectionHighlightTargets {
  return createCanvasSelectionHighlightTargets(
    createGlobalCanvasSelectionHighlightDomTargets(),
  );
}

function isSvgElement(
  element: Element | null | undefined,
): element is SVGElement {
  return (
    typeof globalThis.SVGElement === "function" &&
    element instanceof globalThis.SVGElement
  );
}
