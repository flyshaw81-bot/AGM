import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  type DirectWorkbenchEditStatus,
  renderDirectWorkbenchEditStatus,
} from "./directWorkbenchShared";
import { renderFocusButton } from "./focusControls";
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
  return `<div class="studio-panel__actions studio-state-inspector__actions">
      ${selectedState ? renderDirectWorkbenchEditStatus("studioStateEditStatus", language, stateEditStatus) : ""}
      ${selectedState ? `<button class="studio-primary-action" data-studio-action="direct-state-apply" data-state-id="${selectedState.id}">${t(language, "应用修改", "Apply changes")}</button>` : ""}
      ${selectedState ? `<button class="studio-ghost" data-studio-action="direct-state-reset" data-state-id="${selectedState.id}">${t(language, "重置", "Reset")}</button>` : ""}
      ${selectedState?.capital ? `<button class="studio-ghost" data-studio-action="direct-burg-select" data-burg-id="${selectedState.capital}">${t(language, "查看首都城镇", "Open capital burg")}</button>` : ""}
      ${selectedState ? `<button class="studio-ghost" data-studio-action="direct-burg-filter-state" data-state-id="${selectedState.id}">${t(language, "Filter state burgs", "Filter state burgs")}</button>` : ""}
      ${selectedState ? `<button class="studio-ghost" data-studio-action="direct-province-filter-state" data-state-id="${selectedState.id}">${t(language, "Filter state provinces", "Filter state provinces")}</button>` : ""}
      ${selectedState ? `<button class="studio-ghost" data-studio-action="direct-diplomacy-open-state" data-state-id="${selectedState.id}">${t(language, "查看该国外交", "Open state diplomacy")}</button>` : ""}
      ${selectedState ? renderFocusButton("state", selectedState.id, selectedState.name, "focus", language) : ""}
    </div>`;
}
