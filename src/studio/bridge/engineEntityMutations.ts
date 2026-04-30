import {
  createGlobalEntityMutationTargets,
  type EngineEntityMutationTargets,
} from "./engineEntityMutationTargets";

const STATE_MUTATION_FIELDS = [
  "name",
  "formName",
  "fullName",
  "form",
  "color",
  "culture",
  "capital",
  "population",
  "rural",
  "urban",
  "neighbors",
  "diplomacy",
];
const NAMED_TYPE_MUTATION_FIELDS = [
  "name",
  "form",
  "formName",
  "type",
  "color",
];
const BURG_MUTATION_FIELDS = ["name", "type", "state", "culture", "population"];
const PROVINCE_MUTATION_FIELDS = [
  "name",
  "fullName",
  "formName",
  "type",
  "state",
  "burg",
  "color",
];
const ROUTE_MUTATION_FIELDS = ["group", "feature"];
const ZONE_MUTATION_FIELDS = ["name", "type", "color", "hidden"];

function createEngineEntitySnapshot(
  entity: Record<string, unknown>,
  fields: readonly string[],
) {
  return JSON.stringify(
    Object.fromEntries(fields.map((field) => [field, entity[field]])),
  );
}

export function updateEngineStateName(
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
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineState = targets.getState(stateId);
  if (!engineState) return false;

  const nextName = next.name.trim();
  const nextFormName = next.formName.trim();
  const nextFullName = next.fullName.trim();
  const nextForm = next.form?.trim();
  const nextColor = next.color?.trim();
  const previous = createEngineEntitySnapshot(
    engineState,
    STATE_MUTATION_FIELDS,
  );

  engineState.name = nextName;
  engineState.formName = nextFormName;
  engineState.fullName = nextFullName;
  if (nextForm) engineState.form = nextForm;
  if (nextColor) engineState.color = nextColor;
  if (Number.isFinite(next.culture)) engineState.culture = next.culture;
  if (Number.isFinite(next.capital)) engineState.capital = next.capital;
  if (Number.isFinite(next.population))
    engineState.population = next.population;
  if (Number.isFinite(next.rural)) engineState.rural = next.rural;
  if (Number.isFinite(next.urban)) engineState.urban = next.urban;
  if (Array.isArray(next.neighbors)) engineState.neighbors = next.neighbors;
  if (Array.isArray(next.diplomacy)) engineState.diplomacy = next.diplomacy;

  const changed =
    previous !== createEngineEntitySnapshot(engineState, STATE_MUTATION_FIELDS);

  if (changed) {
    targets.redrawStates();
    targets.redrawStateLabels([stateId]);
  }

  return changed;
}

export function updateEngineCulture(
  cultureId: number,
  next: { name: string; type?: string; color?: string },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineCulture = targets.getCulture(cultureId);
  if (!engineCulture) return false;

  const previous = createEngineEntitySnapshot(
    engineCulture,
    NAMED_TYPE_MUTATION_FIELDS,
  );
  const nextName = next.name.trim();
  const nextType = next.type?.trim();
  const nextColor = next.color?.trim();

  if (nextName) engineCulture.name = nextName;
  if (nextType) {
    engineCulture.form = nextType;
    engineCulture.formName = nextType;
    engineCulture.type = nextType;
  }
  if (nextColor) engineCulture.color = nextColor;

  const changed =
    previous !==
    createEngineEntitySnapshot(engineCulture, NAMED_TYPE_MUTATION_FIELDS);
  if (changed) {
    targets.redrawCultures();
    targets.redrawStates();
    targets.redrawLabels();
  }

  return changed;
}

export function updateEngineReligion(
  religionId: number,
  next: { name: string; type?: string; color?: string },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineReligion = targets.getReligion(religionId);
  if (!engineReligion) return false;

  const previous = createEngineEntitySnapshot(
    engineReligion,
    NAMED_TYPE_MUTATION_FIELDS,
  );
  const nextName = next.name.trim();
  const nextType = next.type?.trim();
  const nextColor = next.color?.trim();

  if (nextName) engineReligion.name = nextName;
  if (nextType) {
    engineReligion.form = nextType;
    engineReligion.formName = nextType;
    engineReligion.type = nextType;
  }
  if (nextColor) engineReligion.color = nextColor;

  const changed =
    previous !==
    createEngineEntitySnapshot(engineReligion, NAMED_TYPE_MUTATION_FIELDS);
  if (changed) {
    targets.redrawReligions();
    targets.redrawLabels();
  }

  return changed;
}

export function updateEngineBurg(
  burgId: number,
  next: {
    name: string;
    type?: string;
    state?: number;
    culture?: number;
    population?: number;
  },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineBurg = targets.getBurg(burgId);
  if (!engineBurg) return false;

  const previous = createEngineEntitySnapshot(engineBurg, BURG_MUTATION_FIELDS);
  const nextName = next.name.trim();
  const nextType = next.type?.trim();

  if (nextName) engineBurg.name = nextName;
  if (nextType) engineBurg.type = nextType;
  if (Number.isFinite(next.state)) engineBurg.state = next.state;
  if (Number.isFinite(next.culture)) engineBurg.culture = next.culture;
  if (Number.isFinite(next.population)) engineBurg.population = next.population;

  const changed =
    previous !== createEngineEntitySnapshot(engineBurg, BURG_MUTATION_FIELDS);
  if (changed) {
    targets.redrawBurgs();
    targets.redrawLabels();
  }

  return changed;
}

export function updateEngineProvince(
  provinceId: number,
  next: {
    name: string;
    fullName?: string;
    type?: string;
    state?: number;
    burg?: number;
    color?: string;
  },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineProvince = targets.getProvince(provinceId);
  if (!engineProvince) return false;

  const previous = createEngineEntitySnapshot(
    engineProvince,
    PROVINCE_MUTATION_FIELDS,
  );
  const nextName = next.name.trim();
  const nextFullName = next.fullName?.trim();
  const nextType = next.type?.trim();
  const nextColor = next.color?.trim();

  if (nextName) engineProvince.name = nextName;
  if (nextFullName) engineProvince.fullName = nextFullName;
  if (nextType) {
    engineProvince.formName = nextType;
    engineProvince.type = nextType;
  }
  if (Number.isFinite(next.state)) engineProvince.state = next.state;
  if (Number.isFinite(next.burg)) engineProvince.burg = next.burg;
  if (nextColor) engineProvince.color = nextColor;

  const changed =
    previous !==
    createEngineEntitySnapshot(engineProvince, PROVINCE_MUTATION_FIELDS);
  if (changed) {
    targets.redrawProvinces();
    targets.redrawStateLabels();
  }

  return changed;
}

export function updateEngineRoute(
  routeId: number,
  next: { group?: string; feature?: number },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineRoute = targets.getRoute(routeId);
  if (!engineRoute) return false;

  const previous = createEngineEntitySnapshot(
    engineRoute,
    ROUTE_MUTATION_FIELDS,
  );
  const nextGroup = next.group?.trim();

  if (nextGroup) engineRoute.group = nextGroup;
  if (Number.isFinite(next.feature)) engineRoute.feature = next.feature;

  const changed =
    previous !== createEngineEntitySnapshot(engineRoute, ROUTE_MUTATION_FIELDS);
  if (changed) targets.redrawRoute(engineRoute);

  return changed;
}

export function updateEngineZone(
  zoneId: number,
  next: { name: string; type?: string; color?: string; hidden?: boolean },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const engineZone = targets.getZone(zoneId);
  if (!engineZone) return false;

  const previous = createEngineEntitySnapshot(engineZone, ZONE_MUTATION_FIELDS);
  const nextName = next.name.trim();
  const nextType = next.type?.trim();
  const nextColor = next.color?.trim();

  if (nextName) engineZone.name = nextName;
  if (nextType) engineZone.type = nextType;
  if (nextColor) engineZone.color = nextColor;
  if (next.hidden) engineZone.hidden = true;
  else delete engineZone.hidden;

  const changed =
    previous !== createEngineEntitySnapshot(engineZone, ZONE_MUTATION_FIELDS);
  if (changed) targets.redrawZones();

  return changed;
}

const DIPLOMACY_RELATIONS = [
  "Ally",
  "Friendly",
  "Neutral",
  "Suspicion",
  "Enemy",
  "Unknown",
  "Rival",
  "Vassal",
  "Suzerain",
] as const;

export function updateEngineDiplomacy(
  subjectId: number,
  objectId: number,
  next: { relation: string },
  targets: EngineEntityMutationTargets = createGlobalEntityMutationTargets(),
) {
  const subject = targets.getState(subjectId) as
    | (Record<string, unknown> & { diplomacy?: string[] })
    | undefined;
  const object = targets.getState(objectId) as
    | (Record<string, unknown> & { diplomacy?: string[] })
    | undefined;
  if (!subject || !object || subjectId === objectId) return false;
  const relation = DIPLOMACY_RELATIONS.includes(
    next.relation as (typeof DIPLOMACY_RELATIONS)[number],
  )
    ? next.relation
    : "Neutral";
  const reciprocalRelation =
    relation === "Vassal"
      ? "Suzerain"
      : relation === "Suzerain"
        ? "Vassal"
        : relation;
  subject.diplomacy ||= [];
  object.diplomacy ||= [];
  const previous = JSON.stringify([
    subject.diplomacy[objectId],
    object.diplomacy[subjectId],
  ]);

  subject.diplomacy[objectId] = relation;
  object.diplomacy[subjectId] = reciprocalRelation;

  const changed =
    previous !==
    JSON.stringify([subject.diplomacy[objectId], object.diplomacy[subjectId]]);
  if (changed) targets.redrawStates();
  return changed;
}
