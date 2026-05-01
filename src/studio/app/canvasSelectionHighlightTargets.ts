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

export function createGlobalCanvasSelectionHighlightTargets(): CanvasSelectionHighlightTargets {
  return createCanvasSelectionHighlightTargets({
    getSelectedStateElements: () =>
      Array.from(
        globalThis.document?.querySelectorAll<SVGElement>(
          "[data-studio-selected-state='true']",
        ) ?? [],
      ),
    getSelectedStateBorderElements: () =>
      Array.from(
        globalThis.document?.querySelectorAll<SVGElement>(
          "[data-studio-selected-state-border='true']",
        ) ?? [],
      ),
    getCanvasFrame: () =>
      globalThis.document?.getElementById("studioCanvasFrame") ?? null,
    getMapHost: () =>
      globalThis.document?.getElementById("studioMapHost") ?? null,
    getStatePath: (stateId) => {
      const element = globalThis.document?.getElementById(`state${stateId}`);
      return isSvgElement(element) ? element : null;
    },
    getStateBorder: (stateId) => {
      const element = globalThis.document?.getElementById(
        `state-border${stateId}`,
      );
      return isSvgElement(element) ? element : null;
    },
    appendToParent: (element) => {
      element.parentElement?.appendChild(element);
    },
  });
}

function isSvgElement(
  element: Element | null | undefined,
): element is SVGElement {
  return (
    typeof globalThis.SVGElement === "function" &&
    element instanceof globalThis.SVGElement
  );
}
