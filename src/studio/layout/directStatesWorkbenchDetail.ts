import type {
  EngineEntitySummary,
  EngineEntitySummaryItem,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import { renderDirectStateDetailActions } from "./directStatesWorkbenchDetailActions";
import { renderDirectStateDetailContent } from "./directStatesWorkbenchDetailContent";
import { getDirectWorkbenchEditStatus } from "./directWorkbenchShared";
import { escapeHtml, t } from "./shellShared";

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

  return `<div class="studio-direct-states__detail">
          <div class="studio-state-inspector__hero" style="--state-color: ${escapeHtml(selectedColor)}">
            <span class="studio-state-inspector__color-ring"></span>
            <div>
              <div class="studio-panel__eyebrow">${t(language, "当前选中", "Selected")}</div>
              <h3 class="studio-panel__title">${selectedState ? escapeHtml(selectedState.fullName || selectedState.name) : "-"}</h3>
            </div>
          </div>
          ${renderDirectStateDetailContent({
            cultureOptions,
            entitySummary,
            language,
            selectedColor,
            selectedState,
          })}
          ${renderDirectStateDetailActions({
            language,
            selectedState,
            stateEditStatus,
          })}
        </div>`;
}
