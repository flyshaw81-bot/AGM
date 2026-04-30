import type { StudioState } from "../types";

export type CanvasSelectionHighlightTargets = {
  getSelectedStateElements: () => SVGElement[];
  getSelectedStateBorderElements: () => SVGElement[];
  getCanvasFrame: () => HTMLElement | null;
  getMapHost: () => HTMLElement | null;
  getStatePath: (stateId: number) => SVGElement | null;
  getStateBorder: (stateId: number) => SVGElement | null;
  appendToParent: (element: SVGElement) => void;
};

export function createGlobalCanvasSelectionHighlightTargets(): CanvasSelectionHighlightTargets {
  return {
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
  };
}

function clearCanvasSelectionHighlight(
  targets: Pick<
    CanvasSelectionHighlightTargets,
    "getSelectedStateElements" | "getSelectedStateBorderElements"
  >,
) {
  targets.getSelectedStateElements().forEach((element) => {
    element.classList.remove("is-studio-selected-state");
    delete element.dataset.studioSelectedState;
  });
  targets.getSelectedStateBorderElements().forEach((element) => {
    element.classList.remove("is-studio-selected-state-border");
    delete element.dataset.studioSelectedStateBorder;
  });
}

export function syncCanvasSelectionHighlight(
  state: StudioState,
  targets: CanvasSelectionHighlightTargets = createGlobalCanvasSelectionHighlightTargets(),
) {
  clearCanvasSelectionHighlight(targets);
  const selectedStateId =
    state.viewport.selectedCanvasEntity?.targetType === "state"
      ? state.viewport.selectedCanvasEntity.targetId
      : null;
  const selectedStateValue = selectedStateId ? String(selectedStateId) : "";
  targets
    .getCanvasFrame()
    ?.setAttribute("data-selected-state-id", selectedStateValue);
  targets
    .getMapHost()
    ?.setAttribute("data-selected-state-id", selectedStateValue);
  if (!selectedStateId) return;

  const statePath = targets.getStatePath(selectedStateId);
  if (statePath) {
    statePath.classList.add("is-studio-selected-state");
    statePath.dataset.studioSelectedState = "true";
    targets.appendToParent(statePath);
  }

  const stateBorder = targets.getStateBorder(selectedStateId);
  if (stateBorder) {
    stateBorder.classList.add("is-studio-selected-state-border");
    stateBorder.dataset.studioSelectedStateBorder = "true";
    targets.appendToParent(stateBorder);
  }
}
