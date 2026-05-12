import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  type DirectWorkbenchEditStatus,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { t } from "./shellShared";

type NativeStateDetailActionsOptions = {
  language: StudioLanguage;
  selectedState: EngineEntitySummaryItem | undefined;
  stateEditStatus: DirectWorkbenchEditStatus;
};

export function renderDirectStateDetailActions({
  language,
  selectedState,
  stateEditStatus,
}: NativeStateDetailActionsOptions) {
  return `<div class="studio-native-state-detail__actions studio-panel__actions studio-state-inspector__actions">
      ${selectedState ? renderDirectWorkbenchEditStatus("studioStateEditStatus", language, stateEditStatus) : ""}
      ${selectedState ? `<button class="studio-primary-action" data-studio-action="direct-state-apply" data-state-id="${selectedState.id}">${t(language, "\u5e94\u7528\u4fee\u6539", "Apply changes")}</button>` : ""}
      ${selectedState ? `<button class="studio-ghost" data-studio-action="direct-state-reset" data-state-id="${selectedState.id}">${t(language, "\u91cd\u7f6e", "Reset")}</button>` : ""}
    </div>`;
}
