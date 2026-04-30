import type { DirectStateFilterMode, DirectStateSortMode } from "../types";
import {
  createNativeDirtyTrackerByIds,
  readNativeEntityPickerId,
  readNativeIdList,
  readNativeInputValue,
  readNativeLineList,
  readNativeNumberValue,
} from "./directEditorDom";
import type { DirectEditorEventsOptions } from "./directEditorEventTypes";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import { bindCanvasStateSelectionEvents } from "./nativeCanvasSelectionEvents";
import {
  bindActionClick,
  bindInputValue,
  bindSelectValue,
} from "./studioEventBinding";

type NativeStateEditorEventsOptions = Pick<
  DirectEditorEventsOptions,
  | "jumpToDirectWorkbench"
  | "onDirectStateApply"
  | "onDirectStateListChange"
  | "onDirectStateReset"
  | "onDirectStateSelect"
>;

export function bindNativeStateEditorEvents({
  jumpToDirectWorkbench,
  onDirectStateApply,
  onDirectStateListChange,
  onDirectStateReset,
  onDirectStateSelect,
}: NativeStateEditorEventsOptions) {
  bindActionClick("direct-state-select", (button) =>
    onDirectStateSelect(Number(button.dataset.stateId)),
  );
  bindInputValue("studioStateSearchInput", (stateSearchQuery) =>
    onDirectStateListChange({ stateSearchQuery }),
  );
  bindSelectValue<DirectStateFilterMode>(
    "studioStateFilterSelect",
    (stateFilterMode) => onDirectStateListChange({ stateFilterMode }),
  );
  bindSelectValue<DirectStateSortMode>(
    "studioStateSortSelect",
    (stateSortMode) => onDirectStateListChange({ stateSortMode }),
  );

  const nativeStateDirtyTracker = createNativeDirtyTrackerByIds(
    "studioStateEditStatus",
    [
      "studioStateNameInput",
      "studioStateFormInput",
      "studioStateFormNameInput",
      "studioStateFullNameInput",
      "studioStateColorInput",
      "studioStateCultureInput",
      "studioStateCapitalInput",
      "studioStatePopulationInput",
      "studioStateRuralInput",
      "studioStateUrbanInput",
      "studioStateNeighborsInput",
      "studioStateDiplomacyInput",
    ],
  );

  bindCanvasStateSelectionEvents({
    jumpToDirectWorkbench,
    onDirectStateApply,
    onDirectStateSelect,
  });

  bindActionClick("direct-state-apply", (button) => {
    onDirectStateApply(Number(button.dataset.stateId), {
      name: readNativeInputValue("studioStateNameInput"),
      form: readNativeInputValue("studioStateFormInput"),
      formName: readNativeInputValue("studioStateFormNameInput"),
      fullName: readNativeInputValue("studioStateFullNameInput"),
      color: readNativeInputValue("studioStateColorInput"),
      culture: readNativeEntityPickerId("studioStateCultureInput"),
      capital: readNativeEntityPickerId("studioStateCapitalInput"),
      population: readNativeNumberValue("studioStatePopulationInput"),
      rural: readNativeNumberValue("studioStateRuralInput"),
      urban: readNativeNumberValue("studioStateUrbanInput"),
      neighbors: readNativeIdList("studioStateNeighborsInput"),
      diplomacy: readNativeLineList("studioStateDiplomacyInput"),
    });
    nativeStateDirtyTracker.markSaved();
  });

  bindActionClick("direct-state-reset", (button) =>
    onDirectStateReset(Number(button.dataset.stateId)),
  );

  bindActionClick("direct-state-open", (button) => {
    onDirectStateSelect(Number(button.dataset.stateId));
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.states);
  });
}
