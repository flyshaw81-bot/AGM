import { getEngineEntitySummary } from "../bridge/engineActions";
import { type DirectEditStatus, setDirectEditStatus } from "./directEditorDom";
import type { DirectEditorEventsOptions } from "./directEditorEventTypes";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import { bindActionClick } from "./studioEventBinding";

type CanvasStateSelectionEventsOptions = Pick<
  DirectEditorEventsOptions,
  "jumpToDirectWorkbench" | "onDirectStateApply" | "onDirectStateSelect"
>;

export function bindCanvasStateSelectionEvents({
  jumpToDirectWorkbench,
  onDirectStateApply,
  onDirectStateSelect,
}: CanvasStateSelectionEventsOptions) {
  const canvasSelectionCard = document.querySelector<HTMLElement>(
    "[data-canvas-selection-card='true']",
  );
  const canvasStateFields = Array.from(
    document.querySelectorAll<HTMLInputElement>("[data-canvas-state-field]"),
  );
  const canvasStateStatus = document.querySelector<HTMLElement>(
    "[data-canvas-state-edit-status='true']",
  );
  const setCanvasStateStatus = (status: DirectEditStatus) =>
    setDirectEditStatus(canvasStateStatus, status);

  canvasStateFields.forEach((input) => {
    input.addEventListener("input", () => setCanvasStateStatus("dirty"));
  });

  bindActionClick("canvas-state-apply", (button) => {
    const stateId = Number(
      button.dataset.stateId || canvasSelectionCard?.dataset.selectedStateId,
    );
    if (!Number.isFinite(stateId)) return;

    const summary = getEngineEntitySummary();
    const current = summary.states.find((item) => item.id === stateId);
    const readCanvasField = (field: string) =>
      document.querySelector<HTMLInputElement>(
        `[data-canvas-state-field='${field}']`,
      )?.value || "";

    onDirectStateApply(stateId, {
      name: readCanvasField("name"),
      fullName: readCanvasField("fullName"),
      formName: readCanvasField("formName"),
      form: current?.form || current?.formName || "",
      color: readCanvasField("color"),
      culture: current?.culture,
      capital: current?.capital,
      population: Number(readCanvasField("population") || Number.NaN),
      rural: Number(readCanvasField("rural") || Number.NaN),
      urban: Number(readCanvasField("urban") || Number.NaN),
      neighbors: current?.neighbors || [],
      diplomacy: current?.diplomacy || [],
    });
    setCanvasStateStatus("saved");
  });

  bindActionClick("canvas-state-open-workbench", (button) => {
    onDirectStateSelect(
      Number(
        button.dataset.stateId || canvasSelectionCard?.dataset.selectedStateId,
      ),
    );
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.states);
  });
}
