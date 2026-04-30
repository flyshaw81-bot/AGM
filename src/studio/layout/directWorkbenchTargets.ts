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

export type NativeRelationshipSourceEntity = "state" | "burg" | "province";

export const NATIVE_RELATIONSHIP_SOURCE_WORKBENCH_TARGETS: Record<
  NativeRelationshipSourceEntity,
  DirectWorkbenchTargetId
> = {
  state: DIRECT_WORKBENCH_TARGETS.states,
  burg: DIRECT_WORKBENCH_TARGETS.burgs,
  province: DIRECT_WORKBENCH_TARGETS.provinces,
};

export function getNativeRelationshipSourceWorkbenchTarget(
  entity: string,
): DirectWorkbenchTargetId | null {
  if (entity === "state" || entity === "burg" || entity === "province") {
    return NATIVE_RELATIONSHIP_SOURCE_WORKBENCH_TARGETS[entity];
  }

  return null;
}
