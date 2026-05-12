import type { StudioShellEventHandlers } from "./shellEventTypes";

type DirectEditorHandlerKey =
  | "onDirectStateSelect"
  | "onDirectStateApply"
  | "onDirectStateReset"
  | "onDirectStateListChange"
  | "onDirectBurgSelect"
  | "onDirectBurgApply"
  | "onDirectBurgReset"
  | "onDirectBurgListChange"
  | "onDirectCultureSelect"
  | "onDirectCultureApply"
  | "onDirectCultureReset"
  | "onDirectCultureListChange"
  | "onDirectReligionSelect"
  | "onDirectReligionApply"
  | "onDirectReligionReset"
  | "onDirectReligionListChange"
  | "onDirectProvinceSelect"
  | "onDirectProvinceApply"
  | "onDirectProvinceReset"
  | "onDirectProvinceListChange"
  | "onDirectRouteSelect"
  | "onDirectRouteApply"
  | "onDirectRouteReset"
  | "onDirectRouteListChange"
  | "onDirectZoneSelect"
  | "onDirectZoneApply"
  | "onDirectZoneReset"
  | "onDirectZoneListChange"
  | "onDirectMarkerSelect"
  | "onDirectMarkerApply"
  | "onDirectMarkerReset"
  | "onDirectMarkerListChange"
  | "onDirectDiplomacySubjectSelect"
  | "onDirectDiplomacyObjectSelect"
  | "onDirectDiplomacyApply"
  | "onDirectDiplomacyReset"
  | "onDirectDiplomacyListChange"
  | "onDirectMilitaryListChange"
  | "onDirectBiomeSelect"
  | "onDirectBiomeApply"
  | "onDirectBiomeReset"
  | "onDirectBiomeListChange";

export type DirectEditorEventsOptions = Pick<
  StudioShellEventHandlers,
  DirectEditorHandlerKey
> & {
  jumpToDirectWorkbench: (targetId: string) => void;
};
