import type { DirectEditorEventsOptions } from "./directEditorEventTypes";
import { bindNativeBurgEditorEvents } from "./nativeBurgEditorEvents";
import { bindNativeGeographyEditorEvents } from "./nativeGeographyEditorEvents";
import { bindNativeIdentityEditorEvents } from "./nativeIdentityEditorEvents";
import { bindNativeStateEditorEvents } from "./nativeStateEditorEvents";
import { bindNativeSystemsEditorEvents } from "./nativeSystemsEditorEvents";

export function bindDirectEditorEvents({
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
}: DirectEditorEventsOptions) {
  bindNativeStateEditorEvents({
    jumpToDirectWorkbench,
    onDirectStateApply,
    onDirectStateListChange,
    onDirectStateReset,
    onDirectStateSelect,
  });

  bindNativeBurgEditorEvents({
    jumpToDirectWorkbench,
    onDirectBurgApply,
    onDirectBurgListChange,
    onDirectBurgReset,
    onDirectBurgSelect,
  });

  bindNativeIdentityEditorEvents({
    jumpToDirectWorkbench,
    onDirectCultureApply,
    onDirectCultureListChange,
    onDirectCultureReset,
    onDirectCultureSelect,
    onDirectReligionApply,
    onDirectReligionListChange,
    onDirectReligionReset,
    onDirectReligionSelect,
  });

  bindNativeGeographyEditorEvents({
    jumpToDirectWorkbench,
    onDirectProvinceApply,
    onDirectProvinceListChange,
    onDirectProvinceReset,
    onDirectProvinceSelect,
    onDirectRouteApply,
    onDirectRouteListChange,
    onDirectRouteReset,
    onDirectRouteSelect,
    onDirectStateSelect,
    onDirectZoneApply,
    onDirectZoneListChange,
    onDirectZoneReset,
    onDirectZoneSelect,
  });

  bindNativeSystemsEditorEvents({
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
  });
}
