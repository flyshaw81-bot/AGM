import type { StudioEditorModule } from "../types";

export const DIRECT_WORKBENCH_TARGETS = {
  states: "studioDirectStatesWorkbench",
  burgs: "studioDirectBurgsWorkbench",
  cultures: "studioDirectCulturesWorkbench",
  religions: "studioDirectReligionsWorkbench",
  provinces: "studioDirectProvincesWorkbench",
  routes: "studioDirectRoutesWorkbench",
  military: "studioDirectMilitaryWorkbench",
  markers: "studioDirectMarkersWorkbench",
  zones: "studioDirectZonesWorkbench",
  diplomacy: "studioDirectDiplomacyWorkbench",
  biomes: "studioDirectBiomesWorkbench",
} as const;

export type DirectWorkbenchTargetId =
  (typeof DIRECT_WORKBENCH_TARGETS)[keyof typeof DIRECT_WORKBENCH_TARGETS];

export const DIRECT_WORKBENCH_TARGET_MODULES: Record<
  DirectWorkbenchTargetId,
  StudioEditorModule
> = {
  [DIRECT_WORKBENCH_TARGETS.states]: "states",
  [DIRECT_WORKBENCH_TARGETS.burgs]: "burgs",
  [DIRECT_WORKBENCH_TARGETS.cultures]: "cultures",
  [DIRECT_WORKBENCH_TARGETS.religions]: "religions",
  [DIRECT_WORKBENCH_TARGETS.provinces]: "provinces",
  [DIRECT_WORKBENCH_TARGETS.routes]: "routes",
  [DIRECT_WORKBENCH_TARGETS.military]: "military",
  [DIRECT_WORKBENCH_TARGETS.markers]: "markers",
  [DIRECT_WORKBENCH_TARGETS.zones]: "zones",
  [DIRECT_WORKBENCH_TARGETS.diplomacy]: "diplomacy",
  [DIRECT_WORKBENCH_TARGETS.biomes]: "biomes",
};

export function getDirectWorkbenchModuleForTarget(
  targetId: string,
): StudioEditorModule | null {
  return (
    DIRECT_WORKBENCH_TARGET_MODULES[targetId as DirectWorkbenchTargetId] ?? null
  );
}

export type DirectRelationshipSourceEntity = "state" | "burg" | "province";

export const DIRECT_RELATIONSHIP_SOURCE_WORKBENCH_TARGETS: Record<
  DirectRelationshipSourceEntity,
  DirectWorkbenchTargetId
> = {
  state: DIRECT_WORKBENCH_TARGETS.states,
  burg: DIRECT_WORKBENCH_TARGETS.burgs,
  province: DIRECT_WORKBENCH_TARGETS.provinces,
};

export function getDirectRelationshipSourceWorkbenchTarget(
  entity: string,
): DirectWorkbenchTargetId | null {
  if (entity === "state" || entity === "burg" || entity === "province") {
    return DIRECT_RELATIONSHIP_SOURCE_WORKBENCH_TARGETS[entity];
  }

  return null;
}

export type NativeRelationshipSourceEntity = DirectRelationshipSourceEntity;
export const NATIVE_RELATIONSHIP_SOURCE_WORKBENCH_TARGETS =
  DIRECT_RELATIONSHIP_SOURCE_WORKBENCH_TARGETS;
export const getNativeRelationshipSourceWorkbenchTarget =
  getDirectRelationshipSourceWorkbenchTarget;
