import type { StudioShellEventHandlers } from "../layout/shellEvents";
import type { StudioState } from "../types";
import {
  createGlobalDirectEditorActionTargets,
  type DirectEditorActionTargets,
} from "./directEditorActionTargets";

type DirectEditorEntityActionHandlers = Pick<
  StudioShellEventHandlers,
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
  | "onDirectBiomeSelect"
  | "onDirectBiomeApply"
  | "onDirectBiomeReset"
  | "onDirectBiomeListChange"
>;

type DirectEditorEntityActionHandlersContext = {
  state: StudioState;
  syncAndRender: () => void;
  targets?: DirectEditorActionTargets;
};

export function createDirectEditorEntityActionHandlers({
  state,
  syncAndRender,
  targets = createGlobalDirectEditorActionTargets(),
}: DirectEditorEntityActionHandlersContext): DirectEditorEntityActionHandlers {
  const applyDirectEditorPatch = (
    patch: Partial<StudioState["directEditor"]>,
  ) => {
    state.directEditor = { ...state.directEditor, ...patch };
    syncAndRender();
  };
  const setDirectEditorValue = (key: string, value: number | string | null) => {
    (state.directEditor as unknown as Record<string, number | string | null>)[
      key
    ] = value;
  };
  const selectNativeEntity = (
    id: number,
    config: {
      selectedKey: string;
      lastAppliedKey: string;
      targetType: NonNullable<StudioState["balanceFocus"]>["targetType"];
      sourceLabel: string;
    },
  ) => {
    if (!Number.isFinite(id)) return;
    setDirectEditorValue(config.selectedKey, id);
    setDirectEditorValue(config.lastAppliedKey, null);
    state.balanceFocus = targets.resolveFocusGeometry({
      targetType: config.targetType,
      targetId: id,
      sourceLabel: config.sourceLabel,
      action: "focus",
    });
    state.section = "editors";
    syncAndRender();
  };
  const applyNativeEntity = <Next>(
    id: number,
    next: Next,
    config: {
      selectedKey: string;
      lastAppliedKey: string;
      update: (id: number, next: Next) => void;
    },
  ) => {
    if (!Number.isFinite(id)) return;
    setDirectEditorValue(config.selectedKey, id);
    config.update(id, next);
    setDirectEditorValue(config.lastAppliedKey, id);
    state.document.source = "core";
    syncAndRender();
  };
  const resetNativeEntity = (
    id: number,
    config: { selectedKey: string; lastAppliedKey: string },
  ) => {
    if (!Number.isFinite(id)) return;
    setDirectEditorValue(config.selectedKey, id);
    setDirectEditorValue(config.lastAppliedKey, null);
    syncAndRender();
  };
  const nativeEntityConfigs = {
    state: {
      selectedKey: "selectedStateId",
      lastAppliedKey: "lastAppliedStateId",
      targetType: "state",
      sourceLabel: "direct-states-workbench",
      update: targets.updateState,
    },
    burg: {
      selectedKey: "selectedBurgId",
      lastAppliedKey: "lastAppliedBurgId",
      targetType: "burg",
      sourceLabel: "direct-burgs-workbench",
      update: targets.updateBurg,
    },
    culture: {
      selectedKey: "selectedCultureId",
      lastAppliedKey: "lastAppliedCultureId",
      targetType: "culture",
      sourceLabel: "direct-cultures-workbench",
      update: targets.updateCulture,
    },
    religion: {
      selectedKey: "selectedReligionId",
      lastAppliedKey: "lastAppliedReligionId",
      targetType: "religion",
      sourceLabel: "direct-religions-workbench",
      update: targets.updateReligion,
    },
    province: {
      selectedKey: "selectedProvinceId",
      lastAppliedKey: "lastAppliedProvinceId",
      targetType: "province",
      sourceLabel: "direct-provinces-workbench",
      update: targets.updateProvince,
    },
    route: {
      selectedKey: "selectedRouteId",
      lastAppliedKey: "lastAppliedRouteId",
      targetType: "route",
      sourceLabel: "direct-routes-workbench",
      update: targets.updateRoute,
    },
    zone: {
      selectedKey: "selectedZoneId",
      lastAppliedKey: "lastAppliedZoneId",
      targetType: "zone",
      sourceLabel: "direct-zones-workbench",
      update: targets.updateZone,
    },
    biome: {
      selectedKey: "selectedBiomeId",
      lastAppliedKey: "lastAppliedBiomeId",
      targetType: "biome",
      sourceLabel: "direct-biomes-workbench",
      update: targets.updateBiome,
    },
  } as const;

  return {
    onDirectStateSelect: (stateId) =>
      selectNativeEntity(stateId, nativeEntityConfigs.state),
    onDirectStateApply: (stateId, next) =>
      applyNativeEntity(stateId, next, nativeEntityConfigs.state),
    onDirectStateReset: (stateId) =>
      resetNativeEntity(stateId, nativeEntityConfigs.state),
    onDirectStateListChange: applyDirectEditorPatch,
    onDirectBurgSelect: (burgId) =>
      selectNativeEntity(burgId, nativeEntityConfigs.burg),
    onDirectBurgApply: (burgId, next) =>
      applyNativeEntity(burgId, next, nativeEntityConfigs.burg),
    onDirectBurgReset: (burgId) =>
      resetNativeEntity(burgId, nativeEntityConfigs.burg),
    onDirectBurgListChange: applyDirectEditorPatch,
    onDirectCultureSelect: (cultureId) =>
      selectNativeEntity(cultureId, nativeEntityConfigs.culture),
    onDirectCultureApply: (cultureId, next) =>
      applyNativeEntity(cultureId, next, nativeEntityConfigs.culture),
    onDirectCultureReset: (cultureId) =>
      resetNativeEntity(cultureId, nativeEntityConfigs.culture),
    onDirectCultureListChange: applyDirectEditorPatch,
    onDirectReligionSelect: (religionId) =>
      selectNativeEntity(religionId, nativeEntityConfigs.religion),
    onDirectReligionApply: (religionId, next) =>
      applyNativeEntity(religionId, next, nativeEntityConfigs.religion),
    onDirectReligionReset: (religionId) =>
      resetNativeEntity(religionId, nativeEntityConfigs.religion),
    onDirectReligionListChange: applyDirectEditorPatch,
    onDirectProvinceSelect: (provinceId) =>
      selectNativeEntity(provinceId, nativeEntityConfigs.province),
    onDirectProvinceApply: (provinceId, next) =>
      applyNativeEntity(provinceId, next, nativeEntityConfigs.province),
    onDirectProvinceReset: (provinceId) =>
      resetNativeEntity(provinceId, nativeEntityConfigs.province),
    onDirectProvinceListChange: applyDirectEditorPatch,
    onDirectRouteSelect: (routeId) =>
      selectNativeEntity(routeId, nativeEntityConfigs.route),
    onDirectRouteApply: (routeId, next) =>
      applyNativeEntity(routeId, next, nativeEntityConfigs.route),
    onDirectRouteReset: (routeId) =>
      resetNativeEntity(routeId, nativeEntityConfigs.route),
    onDirectRouteListChange: applyDirectEditorPatch,
    onDirectZoneSelect: (zoneId) =>
      selectNativeEntity(zoneId, nativeEntityConfigs.zone),
    onDirectZoneApply: (zoneId, next) =>
      applyNativeEntity(zoneId, next, nativeEntityConfigs.zone),
    onDirectZoneReset: (zoneId) =>
      resetNativeEntity(zoneId, nativeEntityConfigs.zone),
    onDirectZoneListChange: applyDirectEditorPatch,
    onDirectBiomeSelect: (biomeId) =>
      selectNativeEntity(biomeId, nativeEntityConfigs.biome),
    onDirectBiomeApply: (biomeId, next) =>
      applyNativeEntity(biomeId, next, nativeEntityConfigs.biome),
    onDirectBiomeReset: (biomeId) =>
      resetNativeEntity(biomeId, nativeEntityConfigs.biome),
    onDirectBiomeListChange: applyDirectEditorPatch,
  };
}
