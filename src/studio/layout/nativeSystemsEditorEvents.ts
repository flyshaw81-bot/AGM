import type {
  DirectBiomeFilterMode,
  DirectDiplomacyFilterMode,
} from "../types";
import {
  createNativeDirtyTrackerByIds,
  readNativeNumberValue,
  readNativeSelectValue,
} from "./directEditorDom";
import type { DirectEditorEventsOptions } from "./directEditorEventTypes";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import {
  bindActionClick,
  bindInputValue,
  bindSelectValue,
} from "./studioEventBinding";

type NativeSystemsEditorEventsOptions = Pick<
  DirectEditorEventsOptions,
  | "jumpToDirectWorkbench"
  | "onDirectBiomeApply"
  | "onDirectBiomeListChange"
  | "onDirectBiomeReset"
  | "onDirectBiomeSelect"
  | "onDirectDiplomacyApply"
  | "onDirectDiplomacyListChange"
  | "onDirectDiplomacyObjectSelect"
  | "onDirectDiplomacyReset"
  | "onDirectDiplomacySubjectSelect"
>;

export function bindNativeSystemsEditorEvents({
  jumpToDirectWorkbench,
  onDirectBiomeApply,
  onDirectBiomeListChange,
  onDirectBiomeReset,
  onDirectBiomeSelect,
  onDirectDiplomacyApply,
  onDirectDiplomacyListChange,
  onDirectDiplomacyObjectSelect,
  onDirectDiplomacyReset,
  onDirectDiplomacySubjectSelect,
}: NativeSystemsEditorEventsOptions) {
  bindActionClick("direct-diplomacy-open-state", (button) => {
    onDirectDiplomacySubjectSelect(Number(button.dataset.stateId));
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.diplomacy);
  });

  bindSelectValue("studioDiplomacySubjectSelect", (value) =>
    onDirectDiplomacySubjectSelect(Number(value)),
  );

  bindActionClick("direct-diplomacy-object-select", (button) =>
    onDirectDiplomacyObjectSelect(Number(button.dataset.stateId)),
  );

  bindInputValue("studioDiplomacySearchInput", (diplomacySearchQuery) =>
    onDirectDiplomacyListChange({ diplomacySearchQuery }),
  );
  bindSelectValue<DirectDiplomacyFilterMode>(
    "studioDiplomacyFilterSelect",
    (diplomacyFilterMode) =>
      onDirectDiplomacyListChange({ diplomacyFilterMode }),
  );

  const nativeDiplomacyDirtyTracker = createNativeDirtyTrackerByIds(
    "studioDiplomacyEditStatus",
    ["studioDiplomacyRelationSelect"],
  );

  bindActionClick("direct-diplomacy-apply", (button) => {
    nativeDiplomacyDirtyTracker.markSaved();
    onDirectDiplomacyApply(
      Number(button.dataset.subjectId),
      Number(button.dataset.objectId),
      {
        relation: readNativeSelectValue(
          "studioDiplomacyRelationSelect",
          "Neutral",
        ),
      },
    );
  });

  bindActionClick("direct-diplomacy-reset", (button) =>
    onDirectDiplomacyReset(
      Number(button.dataset.subjectId),
      Number(button.dataset.objectId),
    ),
  );

  bindActionClick("direct-biome-select", (button) =>
    onDirectBiomeSelect(Number(button.dataset.biomeId)),
  );

  bindInputValue("studioBiomeSearchInput", (biomeSearchQuery) =>
    onDirectBiomeListChange({ biomeSearchQuery }),
  );
  bindSelectValue<DirectBiomeFilterMode>(
    "studioBiomeFilterSelect",
    (biomeFilterMode) => onDirectBiomeListChange({ biomeFilterMode }),
  );

  const nativeBiomeDirtyTracker = createNativeDirtyTrackerByIds(
    "studioBiomeEditStatus",
    [
      "studioBiomeHabitabilityInput",
      "studioBiomeRuleWeightInput",
      "studioBiomeResourceTagSelect",
    ],
  );

  bindActionClick("direct-biome-apply", (button) => {
    nativeBiomeDirtyTracker.markSaved();
    onDirectBiomeApply(Number(button.dataset.biomeId), {
      habitability: readNativeNumberValue("studioBiomeHabitabilityInput"),
      agmRuleWeight: readNativeNumberValue("studioBiomeRuleWeightInput"),
      agmResourceTag: readNativeSelectValue(
        "studioBiomeResourceTagSelect",
        "starter-biome",
      ),
    });
  });

  bindActionClick("direct-biome-reset", (button) =>
    onDirectBiomeReset(Number(button.dataset.biomeId)),
  );
}
