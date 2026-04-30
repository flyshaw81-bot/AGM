import type { DirectBurgFilterMode } from "../types";
import {
  createNativeDirtyTrackerByIds,
  readNativeEntityPickerId,
  readNativeInputValue,
  readNativeNumberValue,
} from "./directEditorDom";
import type { DirectEditorEventsOptions } from "./directEditorEventTypes";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import {
  bindActionClick,
  bindInputValue,
  bindSelectValue,
} from "./studioEventBinding";

type NativeBurgEditorEventsOptions = Pick<
  DirectEditorEventsOptions,
  | "jumpToDirectWorkbench"
  | "onDirectBurgApply"
  | "onDirectBurgListChange"
  | "onDirectBurgReset"
  | "onDirectBurgSelect"
>;

export function bindNativeBurgEditorEvents({
  jumpToDirectWorkbench,
  onDirectBurgApply,
  onDirectBurgListChange,
  onDirectBurgReset,
  onDirectBurgSelect,
}: NativeBurgEditorEventsOptions) {
  bindActionClick("direct-burg-select", (button) => {
    onDirectBurgSelect(Number(button.dataset.burgId));
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.burgs);
  });

  bindActionClick("direct-burg-filter-state", () => {
    onDirectBurgListChange({
      burgFilterMode: "selected-state",
      burgSearchQuery: "",
    });
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.burgs);
  });

  bindInputValue("studioBurgSearchInput", (burgSearchQuery) =>
    onDirectBurgListChange({ burgSearchQuery }),
  );
  bindSelectValue<DirectBurgFilterMode>(
    "studioBurgFilterSelect",
    (burgFilterMode) => onDirectBurgListChange({ burgFilterMode }),
  );

  const nativeBurgDirtyTracker = createNativeDirtyTrackerByIds(
    "studioBurgEditStatus",
    [
      "studioBurgNameInput",
      "studioBurgTypeInput",
      "studioBurgStateInput",
      "studioBurgCultureInput",
      "studioBurgPopulationInput",
    ],
  );

  bindActionClick("direct-burg-apply", (button) => {
    onDirectBurgApply(Number(button.dataset.burgId), {
      name: readNativeInputValue("studioBurgNameInput"),
      type: readNativeInputValue("studioBurgTypeInput"),
      state: readNativeEntityPickerId("studioBurgStateInput"),
      culture: readNativeEntityPickerId("studioBurgCultureInput"),
      population: readNativeNumberValue("studioBurgPopulationInput"),
    });
    nativeBurgDirtyTracker.markSaved();
  });

  bindActionClick("direct-burg-reset", (button) =>
    onDirectBurgReset(Number(button.dataset.burgId)),
  );
}
