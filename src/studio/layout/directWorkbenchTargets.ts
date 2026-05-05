export const DIRECT_WORKBENCH_TARGETS = {
  states: "studioDirectStatesWorkbench",
  burgs: "studioDirectBurgsWorkbench",
  cultures: "studioDirectCulturesWorkbench",
  religions: "studioDirectReligionsWorkbench",
  provinces: "studioDirectProvincesWorkbench",
  routes: "studioDirectRoutesWorkbench",
  zones: "studioDirectZonesWorkbench",
  diplomacy: "studioDirectDiplomacyWorkbench",
  biomes: "studioDirectBiomesWorkbench",
} as const;

export type DirectWorkbenchTargetId =
  (typeof DIRECT_WORKBENCH_TARGETS)[keyof typeof DIRECT_WORKBENCH_TARGETS];

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
