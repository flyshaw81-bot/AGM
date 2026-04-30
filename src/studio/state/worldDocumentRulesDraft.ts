import type { EngineWorldResourceSummary } from "../bridge/engineActionTypes";
import type { GameWorldProfile } from "../types";
import { GAME_WORLD_PROFILE_LABELS } from "./worldDocumentConstants";
import type {
  EffectiveProfileParameters,
  WorldRulesDraft,
} from "./worldDocumentDraftTypes";
import {
  createProfilePriorities,
  getProfilePriority,
} from "./worldDocumentProfilePriorities";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createCoverageBand(
  delta: number,
): WorldRulesDraft["resourceRules"][number]["profileCoverageBand"] {
  if (delta < -10) return "under-target";
  if (delta > 10) return "over-target";
  return "on-target";
}

function createFrictionBand(
  frictionWeight: number,
): WorldRulesDraft["biomeRules"][number]["profileFrictionBand"] {
  if (frictionWeight < 0.9) return "low-friction";
  if (frictionWeight > 1.2) return "high-friction";
  return "balanced-friction";
}

export function createWorldRulesDraft(
  resources: EngineWorldResourceSummary,
  profile: GameWorldProfile,
  parameters: EffectiveProfileParameters = {},
): WorldRulesDraft {
  const profileBiomeFrictionWeight = Number(
    (
      parameters.biomeFrictionWeight ??
      getProfilePriority(profile, "habitability")?.weight ??
      1
    ).toFixed(2),
  );
  const biomeRules = resources.biomes.map((biome) => {
    const hasStudioMetadata =
      biome.agmRuleWeight !== undefined || biome.agmResourceTag !== undefined;
    const habitability =
      typeof biome.habitability === "number" ? biome.habitability : null;
    const movementCost =
      typeof biome.movementCost === "number" ? biome.movementCost : null;
    const frictionPenalty = Math.max(
      0,
      Math.round(
        (profileBiomeFrictionWeight - 1) * 10 + (movementCost ?? 0) * 0.1,
      ),
    );
    return {
      id: `biome-rule-${biome.id}`,
      biomeId: biome.id,
      biomeName: biome.name,
      habitability,
      movementCost,
      ruleWeight: Number(
        (
          (biome.agmRuleWeight ?? 1) * Math.max(1, profileBiomeFrictionWeight)
        ).toFixed(2),
      ),
      resourceTag: biome.agmResourceTag ?? "neutral-biome",
      source: hasStudioMetadata ? "studio-metadata" : "agm-biome-summary",
      profileBiomeFrictionWeight,
      profileAdjustedHabitability:
        habitability === null
          ? null
          : clampScore(habitability - frictionPenalty),
      profileFrictionBand: createFrictionBand(profileBiomeFrictionWeight),
    } satisfies WorldRulesDraft["biomeRules"][number];
  });
  const resourceTags = Array.from(
    new Set(biomeRules.map((rule) => rule.resourceTag)),
  )
    .sort()
    .map(
      (tag) =>
        ({
          tag,
          biomeIds: biomeRules
            .filter((rule) => rule.resourceTag === tag)
            .map((rule) => rule.biomeId),
          role: tag.startsWith("starter")
            ? "starter"
            : tag.startsWith("challenge")
              ? "challenge"
              : "neutral",
        }) satisfies WorldRulesDraft["resourceTags"][number],
    );
  const routePointCount = resources.routes.reduce(
    (total, route) => total + (route.pointCount || 0),
    0,
  );
  const sampledProvinceIds = resources.provinces
    .map((item) => item.id)
    .slice(0, 12);
  const sampledRouteIds = resources.routes.map((item) => item.id).slice(0, 12);
  const profileRouteConnectivityScore =
    parameters.routeConnectivityScore ?? clampScore(routePointCount);
  const profileResourceCoverageTarget =
    parameters.resourceCoverageTarget ??
    clampScore(
      resourceTags.length * 10 + Math.min(sampledProvinceIds.length, 8) * 4,
    );
  const resourceRules = resourceTags.map((tag) => {
    const baseCoverageScore = clampScore(
      tag.biomeIds.length * 12 +
        Math.min(sampledProvinceIds.length, 8) * 4 +
        Math.min(routePointCount, 30),
    );
    const profileCoverageDelta =
      baseCoverageScore - profileResourceCoverageTarget;
    return {
      id: `resource-rule-${tag.tag}`,
      tag: tag.tag,
      role: tag.role,
      distribution: "biome-tag-derived",
      priority:
        tag.role === "starter"
          ? "start-support"
          : tag.role === "challenge"
            ? "challenge-zone"
            : "neutral-coverage",
      biomeIds: tag.biomeIds,
      provinceIds: sampledProvinceIds,
      routeIds: sampledRouteIds,
      routePointCount,
      coverageScore: clampScore(
        baseCoverageScore +
          (profileResourceCoverageTarget - baseCoverageScore) * 0.25,
      ),
      profileResourceCoverageTarget,
      profileCoverageDelta,
      profileCoverageBand: createCoverageBand(profileCoverageDelta),
    } satisfies WorldRulesDraft["resourceRules"][number];
  });
  const provinceStructure = sampledProvinceIds.map((provinceId, index) => {
    const province = resources.provinces.find((item) => item.id === provinceId);
    const hasSettlementAnchor = province?.burg !== undefined;
    const routeAnchorIds = sampledRouteIds.slice(
      0,
      Math.max(1, Math.min(4, Math.ceil(profileRouteConnectivityScore / 30))),
    );
    const linkedResourceRules = resourceRules.filter((rule) =>
      rule.provinceIds.includes(provinceId),
    );
    const structureScore = clampScore(
      (hasSettlementAnchor ? 18 : 6) +
        routeAnchorIds.length * 12 +
        linkedResourceRules.length * 8 +
        profileRouteConnectivityScore * 0.35 +
        profileResourceCoverageTarget * 0.15 -
        index,
    );
    return {
      id: `province-structure-${provinceId}`,
      provinceId,
      stateId: province?.state ?? null,
      hasSettlementAnchor,
      profileRouteConnectivityScore,
      profileResourceCoverageTarget,
      structureScore,
      connectorPriority:
        structureScore >= 75
          ? "primary-connector"
          : structureScore >= 50
            ? "secondary-connector"
            : "resource-frontier",
      routeAnchorIds,
      resourceRuleIds: linkedResourceRules.map((rule) => rule.id),
    } satisfies WorldRulesDraft["provinceStructure"][number];
  });

  return {
    schema: "agm.rules.v0",
    version: 1,
    source: "agm-biome-summary",
    biomeRules,
    resourceTags,
    provinceStructure,
    resourceRules,
    profileRules: {
      profile,
      profileLabel: GAME_WORLD_PROFILE_LABELS[profile],
      priorities: createProfilePriorities(profile),
      sourceFields: [
        "document.gameProfile",
        "resources.provinces",
        "resources.routes",
        "resources.biomes.agmResourceTag",
      ],
    },
    weights: {
      defaultRuleWeight: 1,
      ruleWeightRange: { min: 0, max: 5 },
      sourceFields: [
        "resources.biomes.habitability",
        "resources.biomes.agmRuleWeight",
        "resources.biomes.agmResourceTag",
      ],
    },
  };
}
