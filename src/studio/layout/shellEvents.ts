import type { StudioState } from "../types";
import { bindDirectEditorEvents } from "./directEditorEvents";
import { bindDirectWorkbenchNavigationEvents } from "./directWorkbenchNavigationEvents";
import { bindNativeRelationshipEvents } from "./nativeRelationshipEvents";
import { bindShellActionEvents } from "./shellActionEvents";
import { bindShellCoreEvents } from "./shellCoreEvents";
import type { StudioShellEventHandlers } from "./shellEventTypes";
import { bindShellPreferenceEvents } from "./shellPreferenceEvents";

export type { StudioShellEventHandlers } from "./shellEventTypes";

export function bindStudioShellEvents(
  state: StudioState,
  handlers: StudioShellEventHandlers,
) {
  const {
    onSectionChange,
    onViewportChange,
    onExportFormatChange,
    onDirectStateSelect,
    onDirectStateApply,
    onDirectStateReset,
    onDirectStateListChange,
    onDirectBurgSelect,
    onDirectBurgApply,
    onDirectBurgReset,
    onDirectBurgListChange,
    onDirectCultureSelect,
    onDirectCultureApply,
    onDirectCultureReset,
    onDirectCultureListChange,
    onDirectReligionSelect,
    onDirectReligionApply,
    onDirectReligionReset,
    onDirectReligionListChange,
    onDirectProvinceSelect,
    onDirectProvinceApply,
    onDirectProvinceReset,
    onDirectProvinceListChange,
    onDirectRouteSelect,
    onDirectRouteApply,
    onDirectRouteReset,
    onDirectRouteListChange,
    onDirectZoneSelect,
    onDirectZoneApply,
    onDirectZoneReset,
    onDirectZoneListChange,
    onDirectDiplomacySubjectSelect,
    onDirectDiplomacyObjectSelect,
    onDirectDiplomacyApply,
    onDirectDiplomacyReset,
    onDirectDiplomacyListChange,
    onDirectBiomeSelect,
    onDirectBiomeApply,
    onDirectBiomeReset,
    onDirectBiomeListChange,
    onDirectRelationshipQueueHistoryChange,
    onBalanceFocus,
    onAutoFixPreviewAction,
    onAutoFixHistoryAction,
    onBiomeRuleAdjust,
    onCanvasEditAction,
    onGeneratorParameterOverride,
    onCloseEditor,
    onReturnToOrigin,
    onLayersPresetAction,
    onRunExport,
  } = handlers;

  bindShellPreferenceEvents(state, handlers);
  bindShellCoreEvents(state, handlers);
  const { jumpToDirectWorkbench, openDirectWorkbench } =
    bindDirectWorkbenchNavigationEvents({ onSectionChange });

  bindNativeRelationshipEvents({
    state,
    onSectionChange,
    openDirectWorkbench,
    onDirectStateSelect,
    onDirectStateApply,
    onDirectStateListChange,
    onDirectBurgSelect,
    onDirectBurgApply,
    onDirectBurgListChange,
    onDirectCultureListChange,
    onDirectReligionListChange,
    onDirectProvinceSelect,
    onDirectProvinceApply,
    onDirectProvinceListChange,
    onDirectRouteListChange,
    onDirectZoneListChange,
    onDirectDiplomacyListChange,
    onDirectBiomeListChange,
    onDirectRelationshipQueueHistoryChange,
  });

  bindDirectEditorEvents({
    jumpToDirectWorkbench,
    onDirectBiomeApply,
    onDirectBiomeListChange,
    onDirectBiomeReset,
    onDirectBiomeSelect,
    onDirectBurgApply,
    onDirectBurgListChange,
    onDirectBurgReset,
    onDirectBurgSelect,
    onDirectCultureApply,
    onDirectCultureListChange,
    onDirectCultureReset,
    onDirectCultureSelect,
    onDirectDiplomacyApply,
    onDirectDiplomacyListChange,
    onDirectDiplomacyObjectSelect,
    onDirectDiplomacyReset,
    onDirectDiplomacySubjectSelect,
    onDirectProvinceApply,
    onDirectProvinceListChange,
    onDirectProvinceReset,
    onDirectProvinceSelect,
    onDirectReligionApply,
    onDirectReligionListChange,
    onDirectReligionReset,
    onDirectReligionSelect,
    onDirectRouteApply,
    onDirectRouteListChange,
    onDirectRouteReset,
    onDirectRouteSelect,
    onDirectStateApply,
    onDirectStateListChange,
    onDirectStateReset,
    onDirectStateSelect,
    onDirectZoneApply,
    onDirectZoneListChange,
    onDirectZoneReset,
    onDirectZoneSelect,
  });

  bindShellActionEvents({
    state,
    onBalanceFocus,
    onAutoFixPreviewAction,
    onAutoFixHistoryAction,
    onBiomeRuleAdjust,
    onGeneratorParameterOverride,
    onCloseEditor,
    onReturnToOrigin,
    onLayersPresetAction,
    onViewportChange,
    onCanvasEditAction,
    onExportFormatChange,
    onRunExport,
  });
}
