import type { StudioState } from "../types";
import {
  type CanvasSelectionHighlightTargets,
  createGlobalCanvasSelectionHighlightTargets,
} from "./canvasSelectionHighlightTargets";

export {
  type CanvasSelectionHighlightTargets,
  createCanvasSelectionHighlightTargets,
  createGlobalCanvasSelectionHighlightDomTargets,
  createGlobalCanvasSelectionHighlightTargets,
} from "./canvasSelectionHighlightTargets";

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
