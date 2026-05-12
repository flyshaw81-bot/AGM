import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import { renderDirectStateDetailActions } from "./directStatesWorkbenchDetailActions";
import { renderDirectStateDetailContent } from "./directStatesWorkbenchDetailContent";
import { getDirectWorkbenchEditStatus } from "./directWorkbenchShared";

type NativeStateDetailOptions = {
  cultureOptions: EngineEntitySummaryItem[];
  entitySummary: EngineEntitySummary;
  language: StudioLanguage;
  directEditor: StudioState["directEditor"];
  selectedColor: string;
  selectedState: EngineEntitySummaryItem | undefined;
};

export function renderNativeStateDetail({
  cultureOptions,
  entitySummary,
  language,
  directEditor,
  selectedColor,
  selectedState,
}: NativeStateDetailOptions) {
  const stateEditStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedState && directEditor.lastAppliedStateId === selectedState.id,
    ),
  );

  return `<div class="studio-native-state-detail studio-direct-states__detail" data-native-state-detail="true">
          <div class="studio-native-state-detail__scroll">
            ${renderDirectStateDetailContent({
              cultureOptions,
              entitySummary,
              language,
              selectedColor,
              selectedState,
            })}
          </div>
          ${renderDirectStateDetailActions({
            language,
            selectedState,
            stateEditStatus,
          })}
        </div>`;
}
