import type { StudioSection, StudioState } from "../types";
import { bindDirectWorkbenchDirectoryEvents } from "./directWorkbenchDirectoryEvents";
import { bindNativeRelationshipQueueEvents } from "./nativeRelationshipQueueEvents";
import { bindNativeRelationshipReferenceEvents } from "./nativeRelationshipReferenceEvents";

type NativeRelationshipEventsOptions = {
  state: StudioState;
  onSectionChange: (section: StudioSection) => void;
  openDirectWorkbench: (targetId: string) => void;
  onDirectStateSelect: (stateId: number) => void;
  onDirectStateApply: (
    stateId: number,
    next: {
      name: string;
      formName: string;
      fullName: string;
      form?: string;
      color?: string;
      culture?: number;
      capital?: number;
      population?: number;
      rural?: number;
      urban?: number;
      neighbors?: number[];
      diplomacy?: string[];
    },
  ) => void;
  onDirectStateListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "stateSearchQuery" | "stateSortMode" | "stateFilterMode"
      >
    >,
  ) => void;
  onDirectBurgSelect: (burgId: number) => void;
  onDirectBurgApply: (
    burgId: number,
    next: {
      name: string;
      type?: string;
      state?: number;
      culture?: number;
      population?: number;
    },
  ) => void;
  onDirectBurgListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "burgSearchQuery" | "burgFilterMode">
    >,
  ) => void;
  onDirectCultureListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "cultureSearchQuery" | "cultureFilterMode"
      >
    >,
  ) => void;
  onDirectReligionListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "religionSearchQuery" | "religionFilterMode"
      >
    >,
  ) => void;
  onDirectProvinceSelect: (provinceId: number) => void;
  onDirectProvinceApply: (
    provinceId: number,
    next: {
      name: string;
      fullName?: string;
      type?: string;
      state?: number;
      burg?: number;
      color?: string;
    },
  ) => void;
  onDirectProvinceListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "provinceSearchQuery" | "provinceFilterMode"
      >
    >,
  ) => void;
  onDirectRouteListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "routeSearchQuery" | "routeFilterMode">
    >,
  ) => void;
  onDirectZoneListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "zoneSearchQuery" | "zoneFilterMode">
    >,
  ) => void;
  onDirectDiplomacyListChange: (
    patch: Partial<
      Pick<
        StudioState["directEditor"],
        "diplomacySearchQuery" | "diplomacyFilterMode"
      >
    >,
  ) => void;
  onDirectBiomeListChange: (
    patch: Partial<
      Pick<StudioState["directEditor"], "biomeSearchQuery" | "biomeFilterMode">
    >,
  ) => void;
  onDirectRelationshipQueueHistoryChange: (
    history: StudioState["directEditor"]["relationshipQueueHistory"],
  ) => void;
};

export function bindNativeRelationshipEvents({
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
}: NativeRelationshipEventsOptions) {
  const {
    applyNativeRelationshipButtonPayload,
    selectNativeRelationshipSource,
  } = bindNativeRelationshipReferenceEvents({
    openDirectWorkbench,
    onDirectStateSelect,
    onDirectStateApply,
    onDirectBurgSelect,
    onDirectBurgApply,
    onDirectProvinceSelect,
    onDirectProvinceApply,
  });

  bindNativeRelationshipQueueEvents({
    state,
    openDirectWorkbench,
    selectNativeRelationshipSource,
    applyNativeRelationshipButtonPayload,
    onDirectRelationshipQueueHistoryChange,
  });

  bindDirectWorkbenchDirectoryEvents({
    onSectionChange,
    onDirectStateListChange,
    onDirectBurgListChange,
    onDirectCultureListChange,
    onDirectReligionListChange,
    onDirectProvinceListChange,
    onDirectRouteListChange,
    onDirectZoneListChange,
    onDirectDiplomacyListChange,
    onDirectBiomeListChange,
  });
}
