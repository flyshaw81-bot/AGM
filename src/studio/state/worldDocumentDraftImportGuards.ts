import { GAME_WORLD_PROFILE_LABELS } from "./worldDocumentConstants";
import type { WorldRulesDraft } from "./worldDocumentDraftTypes";

function isNumberList(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

export { isWorldPlayabilityHints } from "./worldDocumentPlayabilityImportGuards";

function isRulesPriority(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.weight === "number" &&
    Number.isFinite(item.weight) &&
    (item.target === "spawn" ||
      item.target === "settlement" ||
      item.target === "connectivity" ||
      item.target === "habitability" ||
      item.target === "resource")
  );
}

export function isWorldRulesDraft(value: unknown): value is WorldRulesDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rules = value as Record<string, unknown>;
  if (
    rules.schema !== "agm.rules.v0" ||
    rules.version !== 1 ||
    rules.source !== "agm-biome-summary"
  )
    return false;
  if (
    !Array.isArray(rules.biomeRules) ||
    !rules.biomeRules.every((rule) => {
      if (!rule || typeof rule !== "object" || Array.isArray(rule))
        return false;
      const item = rule as Record<string, unknown>;
      if (
        typeof item.id !== "string" ||
        typeof item.biomeId !== "number" ||
        !Number.isFinite(item.biomeId)
      )
        return false;
      if (
        typeof item.biomeName !== "string" ||
        typeof item.ruleWeight !== "number" ||
        !Number.isFinite(item.ruleWeight)
      )
        return false;
      if (typeof item.resourceTag !== "string") return false;
      if (
        item.source !== "agm-biome-summary" &&
        item.source !== "studio-metadata"
      )
        return false;
      return (
        (item.habitability === null ||
          (typeof item.habitability === "number" &&
            Number.isFinite(item.habitability))) &&
        (item.movementCost === null ||
          (typeof item.movementCost === "number" &&
            Number.isFinite(item.movementCost)))
      );
    })
  )
    return false;
  if (
    !Array.isArray(rules.resourceTags) ||
    !rules.resourceTags.every((tag) => {
      if (!tag || typeof tag !== "object" || Array.isArray(tag)) return false;
      const item = tag as Record<string, unknown>;
      return (
        typeof item.tag === "string" &&
        isNumberList(item.biomeIds) &&
        (item.role === "starter" ||
          item.role === "challenge" ||
          item.role === "neutral")
      );
    })
  )
    return false;
  if (
    !Array.isArray(rules.resourceRules) ||
    !rules.resourceRules.every((rule) => {
      if (!rule || typeof rule !== "object" || Array.isArray(rule))
        return false;
      const item = rule as Record<string, unknown>;
      return (
        typeof item.id === "string" &&
        typeof item.tag === "string" &&
        (item.role === "starter" ||
          item.role === "challenge" ||
          item.role === "neutral") &&
        item.distribution === "biome-tag-derived" &&
        (item.priority === "start-support" ||
          item.priority === "challenge-zone" ||
          item.priority === "neutral-coverage") &&
        isNumberList(item.biomeIds) &&
        isNumberList(item.provinceIds) &&
        isNumberList(item.routeIds) &&
        typeof item.routePointCount === "number" &&
        Number.isFinite(item.routePointCount) &&
        typeof item.coverageScore === "number" &&
        Number.isFinite(item.coverageScore)
      );
    })
  )
    return false;
  const profileRules = rules.profileRules;
  if (
    !profileRules ||
    typeof profileRules !== "object" ||
    Array.isArray(profileRules)
  )
    return false;
  const profileRecord = profileRules as Record<string, unknown>;
  if (
    typeof profileRecord.profile !== "string" ||
    !(profileRecord.profile in GAME_WORLD_PROFILE_LABELS)
  )
    return false;
  if (typeof profileRecord.profileLabel !== "string") return false;
  if (
    !Array.isArray(profileRecord.priorities) ||
    !profileRecord.priorities.every(isRulesPriority)
  )
    return false;
  if (
    !Array.isArray(profileRecord.sourceFields) ||
    !profileRecord.sourceFields.every((field) => typeof field === "string")
  )
    return false;
  const weights = rules.weights;
  if (!weights || typeof weights !== "object" || Array.isArray(weights))
    return false;
  const weightRecord = weights as Record<string, unknown>;
  const ruleWeightRange = weightRecord.ruleWeightRange;
  if (
    typeof weightRecord.defaultRuleWeight !== "number" ||
    !Number.isFinite(weightRecord.defaultRuleWeight)
  )
    return false;
  if (
    !ruleWeightRange ||
    typeof ruleWeightRange !== "object" ||
    Array.isArray(ruleWeightRange)
  )
    return false;
  const rangeRecord = ruleWeightRange as Record<string, unknown>;
  return (
    typeof rangeRecord.min === "number" &&
    Number.isFinite(rangeRecord.min) &&
    typeof rangeRecord.max === "number" &&
    Number.isFinite(rangeRecord.max) &&
    Array.isArray(weightRecord.sourceFields) &&
    weightRecord.sourceFields.every((field) => typeof field === "string")
  );
}

export function isGenerationProfileOverrides(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const overrides = value as Record<string, unknown>;
  if (
    typeof overrides.profile !== "string" ||
    !(overrides.profile in GAME_WORLD_PROFILE_LABELS)
  )
    return false;
  if (
    !overrides.values ||
    typeof overrides.values !== "object" ||
    Array.isArray(overrides.values)
  )
    return false;
  return Object.entries(overrides.values).every(
    ([key, field]) =>
      (key === "spawnFairnessWeight" ||
        key === "settlementDensityTarget" ||
        key === "routeConnectivityScore" ||
        key === "biomeFrictionWeight" ||
        key === "resourceCoverageTarget") &&
      typeof field === "number" &&
      Number.isFinite(field),
  );
}
