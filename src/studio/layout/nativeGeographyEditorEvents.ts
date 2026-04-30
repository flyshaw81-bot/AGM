import type {
  DirectProvinceFilterMode,
  DirectRouteFilterMode,
  DirectZoneFilterMode,
} from "../types";
import {
  createNativeDirtyTrackerByIds,
  readNativeEntityPickerId,
  readNativeInputValue,
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

type NativeGeographyEditorEventsOptions = Pick<
  DirectEditorEventsOptions,
  | "jumpToDirectWorkbench"
  | "onDirectProvinceApply"
  | "onDirectProvinceListChange"
  | "onDirectProvinceReset"
  | "onDirectProvinceSelect"
  | "onDirectRouteApply"
  | "onDirectRouteListChange"
  | "onDirectRouteReset"
  | "onDirectRouteSelect"
  | "onDirectStateSelect"
  | "onDirectZoneApply"
  | "onDirectZoneListChange"
  | "onDirectZoneReset"
  | "onDirectZoneSelect"
>;

export function bindNativeGeographyEditorEvents({
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
}: NativeGeographyEditorEventsOptions) {
  bindActionClick("direct-province-filter-state", (button) => {
    onDirectStateSelect(Number(button.dataset.stateId));
    onDirectProvinceListChange({
      provinceFilterMode: "selected-state",
      provinceSearchQuery: "",
    });
    jumpToDirectWorkbench(DIRECT_WORKBENCH_TARGETS.provinces);
  });

  bindActionClick("direct-province-select", (button) =>
    onDirectProvinceSelect(Number(button.dataset.provinceId)),
  );

  bindInputValue("studioProvinceSearchInput", (provinceSearchQuery) =>
    onDirectProvinceListChange({ provinceSearchQuery }),
  );
  bindSelectValue<DirectProvinceFilterMode>(
    "studioProvinceFilterSelect",
    (provinceFilterMode) => onDirectProvinceListChange({ provinceFilterMode }),
  );

  const nativeProvinceDirtyTracker = createNativeDirtyTrackerByIds(
    "studioProvinceEditStatus",
    [
      "studioProvinceNameInput",
      "studioProvinceFullNameInput",
      "studioProvinceTypeInput",
      "studioProvinceStateInput",
      "studioProvinceBurgInput",
      "studioProvinceColorInput",
    ],
  );

  bindActionClick("direct-province-apply", (button) => {
    onDirectProvinceApply(Number(button.dataset.provinceId), {
      name: readNativeInputValue("studioProvinceNameInput"),
      fullName: readNativeInputValue("studioProvinceFullNameInput"),
      type: readNativeInputValue("studioProvinceTypeInput"),
      state: readNativeEntityPickerId("studioProvinceStateInput"),
      burg: readNativeEntityPickerId("studioProvinceBurgInput"),
      color: readNativeInputValue("studioProvinceColorInput"),
    });
    nativeProvinceDirtyTracker.markSaved();
  });

  bindActionClick("direct-province-reset", (button) =>
    onDirectProvinceReset(Number(button.dataset.provinceId)),
  );

  bindActionClick("direct-route-select", (button) =>
    onDirectRouteSelect(Number(button.dataset.routeId)),
  );

  bindInputValue("studioRouteSearchInput", (routeSearchQuery) =>
    onDirectRouteListChange({ routeSearchQuery }),
  );
  bindSelectValue<DirectRouteFilterMode>(
    "studioRouteFilterSelect",
    (routeFilterMode) => onDirectRouteListChange({ routeFilterMode }),
  );

  const nativeRouteDirtyTracker = createNativeDirtyTrackerByIds(
    "studioRouteEditStatus",
    ["studioRouteGroupInput", "studioRouteFeatureInput"],
  );

  bindActionClick("direct-route-apply", (button) => {
    nativeRouteDirtyTracker.markSaved();
    onDirectRouteApply(Number(button.dataset.routeId), {
      group: readNativeInputValue("studioRouteGroupInput"),
      feature: readNativeNumberValue("studioRouteFeatureInput"),
    });
  });

  bindActionClick("direct-route-reset", (button) =>
    onDirectRouteReset(Number(button.dataset.routeId)),
  );

  bindActionClick("direct-zone-select", (button) =>
    onDirectZoneSelect(Number(button.dataset.zoneId)),
  );

  bindInputValue("studioZoneSearchInput", (zoneSearchQuery) =>
    onDirectZoneListChange({ zoneSearchQuery }),
  );
  bindSelectValue<DirectZoneFilterMode>(
    "studioZoneFilterSelect",
    (zoneFilterMode) => onDirectZoneListChange({ zoneFilterMode }),
  );

  const nativeZoneDirtyTracker = createNativeDirtyTrackerByIds(
    "studioZoneEditStatus",
    [
      "studioZoneNameInput",
      "studioZoneTypeInput",
      "studioZoneColorInput",
      "studioZoneHiddenSelect",
    ],
  );

  bindActionClick("direct-zone-apply", (button) => {
    nativeZoneDirtyTracker.markSaved();
    onDirectZoneApply(Number(button.dataset.zoneId), {
      name: readNativeInputValue("studioZoneNameInput"),
      type: readNativeInputValue("studioZoneTypeInput"),
      color: readNativeInputValue("studioZoneColorInput"),
      hidden: readNativeSelectValue("studioZoneHiddenSelect") === "true",
    });
  });

  bindActionClick("direct-zone-reset", (button) =>
    onDirectZoneReset(Number(button.dataset.zoneId)),
  );
}
