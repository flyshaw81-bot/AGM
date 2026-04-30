import type { WorldMapExportPackage } from "./worldDocumentMapExports";

function createPointFeature(
  id: string,
  x: number,
  y: number,
  properties: Record<string, string | number | boolean | null>,
) {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "Point",
      coordinates: [x, y],
    },
    properties: {
      coordinateSystem: "agm-layer-grid",
      ...properties,
    },
  };
}

function getGridPoint(index: number, width: number) {
  return { x: index % width, y: Math.floor(index / width) };
}

export function createGeoJsonMapLayerExport(
  packageDraft: WorldMapExportPackage,
) {
  const { resourceMap, provinceMap, biomeMap } = packageDraft.maps;
  const width = Math.max(
    1,
    Math.ceil(
      Math.sqrt(
        Math.max(
          resourceMap.tiles.length,
          provinceMap.tiles.length,
          biomeMap.biomes.length,
          1,
        ),
      ),
    ),
  );
  const resourceFeatures = resourceMap.tiles.map((tile, index) => {
    const point = getGridPoint(index, width);
    return createPointFeature(tile.id, point.x, point.y, {
      layer: "resource",
      provinceId: tile.provinceId,
      stateId: tile.stateId,
      resourceTag: tile.resourceTag,
      role: tile.role,
      coverageScore: tile.coverageScore,
      structureScore: tile.structureScore,
      connectorPriority: tile.connectorPriority,
      exportLayer: tile.exportLayer,
    });
  });
  const provinceFeatures = provinceMap.tiles.map((tile, index) => {
    const point = getGridPoint(index, width);
    return createPointFeature(tile.id, point.x, point.y, {
      layer: "province",
      provinceId: tile.provinceId,
      provinceName: tile.provinceName,
      stateId: tile.stateId,
      hasSettlementAnchor: tile.hasSettlementAnchor,
      structureScore: tile.structureScore,
      connectorPriority: tile.connectorPriority,
      exportLayer: tile.exportLayer,
    });
  });
  const biomeFeatures = biomeMap.biomes.map((biome, index) => {
    const point = getGridPoint(index, width);
    return createPointFeature(biome.id, point.x, point.y, {
      layer: "biome",
      biomeId: biome.biomeId,
      biomeName: biome.biomeName,
      habitability: biome.habitability,
      movementCost: biome.movementCost,
      resourceTag: biome.resourceTag,
      profileFrictionBand: biome.profileFrictionBand,
      profileAdjustedHabitability: biome.profileAdjustedHabitability,
      exportLayer: biome.exportLayer,
    });
  });

  return {
    type: "FeatureCollection",
    schema: "agm.geojson-map-layers.v0",
    name: packageDraft.manifest.name,
    profile: packageDraft.manifest.profile,
    profileLabel: packageDraft.manifest.profileLabel,
    sourceSchemas: {
      package: packageDraft.schema,
      resourceMap: resourceMap.schema,
      provinceMap: provinceMap.schema,
      biomeMap: biomeMap.schema,
    },
    features: [...resourceFeatures, ...provinceFeatures, ...biomeFeatures],
  };
}
