import type { EngineWorldResourceSummary } from "../bridge/engineActionTypes";
import type { WorldRulesDraft } from "./worldDocumentDraftTypes";

export function createResourceMapExport(rules: WorldRulesDraft) {
  const legend = rules.resourceRules.map((rule) => ({
    tag: rule.tag,
    role: rule.role,
    priority: rule.priority,
    coverageScore: rule.coverageScore,
    profileCoverageBand: rule.profileCoverageBand,
  }));
  const tiles = rules.provinceStructure.map((structure) => {
    const linkedRules = rules.resourceRules.filter((rule) =>
      structure.resourceRuleIds.includes(rule.id),
    );
    const primaryRule = linkedRules.sort(
      (a, b) => b.coverageScore - a.coverageScore,
    )[0];
    return {
      id: `resource-tile-${structure.provinceId}`,
      provinceId: structure.provinceId,
      stateId: structure.stateId,
      resourceTag: primaryRule?.tag ?? "neutral-biome",
      role: primaryRule?.role ?? "neutral",
      coverageScore: primaryRule?.coverageScore ?? 0,
      structureScore: structure.structureScore,
      connectorPriority: structure.connectorPriority,
      routeAnchorIds: structure.routeAnchorIds,
      exportLayer:
        primaryRule?.role === "starter"
          ? "starter-resource"
          : primaryRule?.role === "challenge"
            ? "challenge-resource"
            : "neutral-resource",
    };
  });

  return {
    schema: "agm.resource-map.v0",
    profile: rules.profileRules.profile,
    profileLabel: rules.profileRules.profileLabel,
    sourceRules: rules.resourceRules.map((rule) => rule.id),
    legend,
    tiles,
    coverageSummary: {
      tileCount: tiles.length,
      starterTiles: tiles.filter((tile) => tile.role === "starter").length,
      challengeTiles: tiles.filter((tile) => tile.role === "challenge").length,
      neutralTiles: tiles.filter((tile) => tile.role === "neutral").length,
      averageCoverageScore: tiles.length
        ? Math.round(
            tiles.reduce((total, tile) => total + tile.coverageScore, 0) /
              tiles.length,
          )
        : 0,
    },
  };
}

export function createProvinceMapExport(
  resources: EngineWorldResourceSummary,
  rules: WorldRulesDraft,
) {
  const tiles = rules.provinceStructure.map((structure) => {
    const province = resources.provinces.find(
      (item) => item.id === structure.provinceId,
    );
    return {
      id: `province-tile-${structure.provinceId}`,
      provinceId: structure.provinceId,
      provinceName: province?.name ?? `Province ${structure.provinceId}`,
      stateId: structure.stateId,
      hasSettlementAnchor: structure.hasSettlementAnchor,
      structureScore: structure.structureScore,
      connectorPriority: structure.connectorPriority,
      routeAnchorIds: structure.routeAnchorIds,
      resourceRuleIds: structure.resourceRuleIds,
      exportLayer: structure.connectorPriority,
    };
  });

  return {
    schema: "agm.province-map.v0",
    profile: rules.profileRules.profile,
    profileLabel: rules.profileRules.profileLabel,
    sourceRules: rules.provinceStructure.map((structure) => structure.id),
    tiles,
    structureSummary: {
      tileCount: tiles.length,
      settlementAnchoredTiles: tiles.filter((tile) => tile.hasSettlementAnchor)
        .length,
      primaryConnectorTiles: tiles.filter(
        (tile) => tile.connectorPriority === "primary-connector",
      ).length,
      secondaryConnectorTiles: tiles.filter(
        (tile) => tile.connectorPriority === "secondary-connector",
      ).length,
      resourceFrontierTiles: tiles.filter(
        (tile) => tile.connectorPriority === "resource-frontier",
      ).length,
      averageStructureScore: tiles.length
        ? Math.round(
            tiles.reduce((total, tile) => total + tile.structureScore, 0) /
              tiles.length,
          )
        : 0,
    },
  };
}

export function createBiomeMapExport(
  resources: EngineWorldResourceSummary,
  rules: WorldRulesDraft,
) {
  const biomes = resources.biomes.map((biome) => {
    const rule = rules.biomeRules.find((item) => item.biomeId === biome.id);
    return {
      id: `biome-tile-${biome.id}`,
      biomeId: biome.id,
      biomeName: biome.name,
      color: biome.color,
      habitability:
        typeof biome.habitability === "number" ? biome.habitability : null,
      movementCost:
        typeof biome.movementCost === "number" ? biome.movementCost : null,
      resourceTag: rule?.resourceTag ?? biome.agmResourceTag ?? "neutral-biome",
      ruleWeight: rule?.ruleWeight ?? biome.agmRuleWeight ?? 1,
      profileBiomeFrictionWeight: rule?.profileBiomeFrictionWeight ?? 1,
      profileAdjustedHabitability: rule?.profileAdjustedHabitability ?? null,
      profileFrictionBand: rule?.profileFrictionBand ?? "balanced-friction",
      exportLayer: rule?.profileFrictionBand ?? "balanced-friction",
    };
  });
  const adjustedHabitability = biomes.flatMap((biome) =>
    biome.profileAdjustedHabitability === null
      ? []
      : [biome.profileAdjustedHabitability],
  );

  return {
    schema: "agm.biome-map.v0",
    profile: rules.profileRules.profile,
    profileLabel: rules.profileRules.profileLabel,
    sourceRules: rules.biomeRules.map((rule) => rule.id),
    legend: rules.resourceTags.map((tag) => ({
      tag: tag.tag,
      role: tag.role,
      biomeIds: tag.biomeIds,
    })),
    biomes,
    habitabilitySummary: {
      biomeCount: biomes.length,
      lowFrictionBiomes: biomes.filter(
        (biome) => biome.profileFrictionBand === "low-friction",
      ).length,
      balancedFrictionBiomes: biomes.filter(
        (biome) => biome.profileFrictionBand === "balanced-friction",
      ).length,
      highFrictionBiomes: biomes.filter(
        (biome) => biome.profileFrictionBand === "high-friction",
      ).length,
      averageAdjustedHabitability: adjustedHabitability.length
        ? Math.round(
            adjustedHabitability.reduce((total, value) => total + value, 0) /
              adjustedHabitability.length,
          )
        : 0,
    },
  };
}

export type ResourceMapExport = ReturnType<typeof createResourceMapExport>;
export type ProvinceMapExport = ReturnType<typeof createProvinceMapExport>;
export type BiomeMapExport = ReturnType<typeof createBiomeMapExport>;

export type WorldMapExportPackage = {
  schema: string;
  manifest: {
    id: string;
    name: string;
    profile: string;
    profileLabel: string;
    sourceSchema?: string;
  };
  map: {
    seed: string;
    width: number;
    height: number;
    style: string;
    heightmap: string;
  };
  maps: {
    resourceMap: ResourceMapExport;
    provinceMap: ProvinceMapExport;
    biomeMap: BiomeMapExport;
  };
};

export { createGeoJsonMapLayerExport } from "./worldDocumentGeoJsonMapExport";
export {
  createGlobalHeightmapPngExportTargets,
  createHeightfieldExport,
  createHeightmapMetadataExport,
  createHeightmapPngBlob,
  createHeightmapRaw16Blob,
  type HeightmapPngExportTargets,
} from "./worldDocumentHeightmapExports";
export { createTiledMapExport } from "./worldDocumentTiledMapExport";
