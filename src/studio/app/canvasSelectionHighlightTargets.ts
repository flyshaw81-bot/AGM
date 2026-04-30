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
        document.querySelectorAll<SVGElement>(
          "[data-studio-selected-state='true']",
        ),
      ),
    getSelectedStateBorderElements: () =>
      Array.from(
        document.querySelectorAll<SVGElement>(
          "[data-studio-selected-state-border='true']",
        ),
      ),
    getCanvasFrame: () => document.getElementById("studioCanvasFrame"),
    getMapHost: () => document.getElementById("studioMapHost"),
    getStatePath: (stateId) => {
      const element = document.getElementById(`state${stateId}`);
      return element instanceof SVGElement ? element : null;
    },
    getStateBorder: (stateId) => {
      const element = document.getElementById(`state-border${stateId}`);
      return element instanceof SVGElement ? element : null;
    },
    appendToParent: (element) => {
      element.parentElement?.appendChild(element);
    },
  });
}
