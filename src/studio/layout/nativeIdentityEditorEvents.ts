import type {
  DirectCultureFilterMode,
  DirectReligionFilterMode,
} from "../types";
import {
  createNativeDirtyTrackerByIds,
  readNativeInputValue,
} from "./directEditorDom";
import type { DirectEditorEventsOptions } from "./directEditorEventTypes";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";
import {
  bindActionClick,
  bindInputValue,
  bindSelectValue,
} from "./studioEventBinding";

type NativeIdentityEditorEventsOptions = Pick<
  DirectEditorEventsOptions,
  | "jumpToDirectWorkbench"
  | "onDirectCultureApply"
  | "onDirectCultureListChange"
  | "onDirectCultureReset"
  | "onDirectCultureSelect"
  | "onDirectReligionApply"
  | "onDirectReligionListChange"
  | "onDirectReligionReset"
  | "onDirectReligionSelect"
>;

export function bindNativeIdentityEditorEvents({
  jumpToDirectWorkbench,
  onDirectCultureApply,
  onDirectCultureListChange,
  onDirectCultureReset,
  onDirectCultureSelect,
  onDirectReligionApply,
  onDirectReligionListChange,
  onDirectReligionReset,
  onDirectReligionSelect,
}: NativeIdentityEditorEventsOptions) {
  bindActionClick("direct-culture-select", (button) =>
    onDirectCultureSelect(Number(button.dataset.cultureId)),
  );

  bindActionClick("direct-culture-open", (button) => {
    onDirectCultureSelect(Number(button.dataset.cultureId));
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.cultures);
  });

  bindInputValue("studioCultureSearchInput", (cultureSearchQuery) =>
    onDirectCultureListChange({ cultureSearchQuery }),
  );
  bindSelectValue<DirectCultureFilterMode>(
    "studioCultureFilterSelect",
    (cultureFilterMode) => onDirectCultureListChange({ cultureFilterMode }),
  );

  const nativeCultureDirtyTracker = createNativeDirtyTrackerByIds(
    "studioCultureEditStatus",
    [
      "studioCultureNameInput",
      "studioCultureTypeInput",
      "studioCultureColorInput",
    ],
  );

  bindActionClick("direct-culture-apply", (button) => {
    nativeCultureDirtyTracker.markSaved();
    onDirectCultureApply(Number(button.dataset.cultureId), {
      name: readNativeInputValue("studioCultureNameInput"),
      type: readNativeInputValue("studioCultureTypeInput"),
      color: readNativeInputValue("studioCultureColorInput"),
    });
  });

  bindActionClick("direct-culture-reset", (button) =>
    onDirectCultureReset(Number(button.dataset.cultureId)),
  );

  bindActionClick("direct-religion-select", (button) =>
    onDirectReligionSelect(Number(button.dataset.religionId)),
  );

  bindInputValue("studioReligionSearchInput", (religionSearchQuery) =>
    onDirectReligionListChange({ religionSearchQuery }),
  );
  bindSelectValue<DirectReligionFilterMode>(
    "studioReligionFilterSelect",
    (religionFilterMode) => onDirectReligionListChange({ religionFilterMode }),
  );

  const nativeReligionDirtyTracker = createNativeDirtyTrackerByIds(
    "studioReligionEditStatus",
    [
      "studioReligionNameInput",
      "studioReligionTypeInput",
      "studioReligionColorInput",
    ],
  );

  bindActionClick("direct-religion-apply", (button) => {
    nativeReligionDirtyTracker.markSaved();
    onDirectReligionApply(Number(button.dataset.religionId), {
      name: readNativeInputValue("studioReligionNameInput"),
      type: readNativeInputValue("studioReligionTypeInput"),
      color: readNativeInputValue("studioReligionColorInput"),
    });
  });

  bindActionClick("direct-religion-reset", (button) =>
    onDirectReligionReset(Number(button.dataset.religionId)),
  );
}
