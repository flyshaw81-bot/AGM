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
    getSelectedStateElements: () => {
      try {
        return Array.from(
          getDocument()?.querySelectorAll<SVGElement>(
            "[data-studio-selected-state='true']",
          ) ?? [],
        );
      } catch {
        return [];
      }
    },
    getSelectedStateBorderElements: () => {
      try {
        return Array.from(
          getDocument()?.querySelectorAll<SVGElement>(
            "[data-studio-selected-state-border='true']",
          ) ?? [],
        );
      } catch {
        return [];
      }
    },
    getCanvasFrame: () => {
      try {
        return getDocument()?.getElementById("studioCanvasFrame") ?? null;
      } catch {
        return null;
      }
    },
    getMapHost: () => {
      try {
        return getDocument()?.getElementById("studioMapHost") ?? null;
      } catch {
        return null;
      }
    },
    getStatePath: (stateId) => {
      try {
        const element = getDocument()?.getElementById(`state${stateId}`);
        return isSvgElement(element) ? element : null;
      } catch {
        return null;
      }
    },
    getStateBorder: (stateId) => {
      try {
        const element = getDocument()?.getElementById(`state-border${stateId}`);
        return isSvgElement(element) ? element : null;
      } catch {
        return null;
      }
    },
    appendToParent: (element) => {
      try {
        element.parentElement?.appendChild(element);
      } catch {
        // Selection highlight reordering can be skipped when SVG parents block writes.
      }
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
  try {
    return (
      typeof globalThis.SVGElement === "function" &&
      element instanceof globalThis.SVGElement
    );
  } catch {
    return false;
  }
}
