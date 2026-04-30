import type { StudioState } from "../types";

function clearCanvasSelectionHighlight() {
  document
    .querySelectorAll<SVGElement>("[data-studio-selected-state='true']")
    .forEach((element) => {
      element.classList.remove("is-studio-selected-state");
      delete element.dataset.studioSelectedState;
    });
  document
    .querySelectorAll<SVGElement>("[data-studio-selected-state-border='true']")
    .forEach((element) => {
      element.classList.remove("is-studio-selected-state-border");
      delete element.dataset.studioSelectedStateBorder;
    });
}

export function syncCanvasSelectionHighlight(state: StudioState) {
  clearCanvasSelectionHighlight();
  const selectedStateId =
    state.viewport.selectedCanvasEntity?.targetType === "state"
      ? state.viewport.selectedCanvasEntity.targetId
      : null;
  const selectedStateValue = selectedStateId ? String(selectedStateId) : "";
  document
    .getElementById("studioCanvasFrame")
    ?.setAttribute("data-selected-state-id", selectedStateValue);
  document
    .getElementById("studioMapHost")
    ?.setAttribute("data-selected-state-id", selectedStateValue);
  if (!selectedStateId) return;

  const statePath = document.getElementById(`state${selectedStateId}`);
  if (statePath instanceof SVGElement) {
    statePath.classList.add("is-studio-selected-state");
    statePath.dataset.studioSelectedState = "true";
    statePath.parentElement?.appendChild(statePath);
  }

  const stateBorder = document.getElementById(`state-border${selectedStateId}`);
  if (stateBorder instanceof SVGElement) {
    stateBorder.classList.add("is-studio-selected-state-border");
    stateBorder.dataset.studioSelectedStateBorder = "true";
    stateBorder.parentElement?.appendChild(stateBorder);
  }
}
