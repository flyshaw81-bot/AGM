import type { WorldMapExportPackage } from "./worldDocumentMapExports";

function createTiledProperties(
  properties: Record<string, string | number | boolean>,
) {
  return Object.entries(properties).map(([name, value]) => ({
    name,
    type:
      typeof value === "number"
        ? "float"
        : typeof value === "boolean"
          ? "bool"
          : "string",
    value,
  }));
}

function createTiledLayerData<T>(
  items: T[],
  width: number,
  height: number,
  resolver: (item: T) => number,
) {
  const data = Array.from({ length: width * height }, () => 0);
  items.slice(0, data.length).forEach((item, index) => {
    data[index] = resolver(item);
  });
  return data;
}

export function createTiledMapExport(packageDraft: WorldMapExportPackage) {
  const { resourceMap, provinceMap, biomeMap } = packageDraft.maps;
  const tileCount = Math.max(
    resourceMap.tiles.length,
    provinceMap.tiles.length,
    biomeMap.biomes.length,
    1,
  );
  const width = Math.max(1, Math.ceil(Math.sqrt(tileCount)));
  const height = Math.max(1, Math.ceil(tileCount / width));

  return {
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    width,
    height,
    tilewidth: 1,
    tileheight: 1,
    infinite: false,
    properties: createTiledProperties({
      agmSchema: packageDraft.schema,
      manifestId: packageDraft.manifest.id,
      name: packageDraft.manifest.name,
      profile: packageDraft.manifest.profile,
      profileLabel: packageDraft.manifest.profileLabel,
      resourceMapSchema: resourceMap.schema,
      provinceMapSchema: provinceMap.schema,
      biomeMapSchema: biomeMap.schema,
    }),
    layers: [
      {
        id: 1,
        name: "Resources",
        type: "tilelayer",
        x: 0,
        y: 0,
        width,
        height,
        opacity: 1,
        visible: true,
        data: createTiledLayerData(resourceMap.tiles, width, height, (tile) =>
          tile.role === "starter" ? 1 : tile.role === "challenge" ? 2 : 3,
        ),
        properties: createTiledProperties({
          schema: resourceMap.schema,
          profile: resourceMap.profile,
          coverageSummary: JSON.stringify(resourceMap.coverageSummary),
        }),
      },
      {
        id: 2,
        name: "Provinces",
        type: "tilelayer",
        x: 0,
        y: 0,
        width,
        height,
        opacity: 0.8,
        visible: true,
        data: createTiledLayerData(provinceMap.tiles, width, height, (tile) =>
          tile.connectorPriority === "primary-connector"
            ? 4
            : tile.connectorPriority === "secondary-connector"
              ? 5
              : 6,
        ),
        properties: createTiledProperties({
          schema: provinceMap.schema,
          profile: provinceMap.profile,
          structureSummary: JSON.stringify(provinceMap.structureSummary),
        }),
      },
      {
        id: 3,
        name: "Biomes",
        type: "tilelayer",
        x: 0,
        y: 0,
        width,
        height,
        opacity: 0.65,
        visible: true,
        data: createTiledLayerData(biomeMap.biomes, width, height, (biome) =>
          biome.profileFrictionBand === "low-friction"
            ? 7
            : biome.profileFrictionBand === "high-friction"
              ? 9
              : 8,
        ),
        properties: createTiledProperties({
          schema: biomeMap.schema,
          profile: biomeMap.profile,
          habitabilitySummary: JSON.stringify(biomeMap.habitabilitySummary),
        }),
      },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: "AGM semantic map layers",
        tilewidth: 1,
        tileheight: 1,
        tilecount: 9,
        columns: 9,
        tiles: [
          {
            id: 0,
            type: "starter-resource",
            properties: createTiledProperties({
              agmLayer: "resource",
              role: "starter",
            }),
          },
          {
            id: 1,
            type: "challenge-resource",
            properties: createTiledProperties({
              agmLayer: "resource",
              role: "challenge",
            }),
          },
          {
            id: 2,
            type: "neutral-resource",
            properties: createTiledProperties({
              agmLayer: "resource",
              role: "neutral",
            }),
          },
          {
            id: 3,
            type: "primary-connector",
            properties: createTiledProperties({
              agmLayer: "province",
              priority: "primary-connector",
            }),
          },
          {
            id: 4,
            type: "secondary-connector",
            properties: createTiledProperties({
              agmLayer: "province",
              priority: "secondary-connector",
            }),
          },
          {
            id: 5,
            type: "resource-frontier",
            properties: createTiledProperties({
              agmLayer: "province",
              priority: "resource-frontier",
            }),
          },
          {
            id: 6,
            type: "low-friction-biome",
            properties: createTiledProperties({
              agmLayer: "biome",
              frictionBand: "low-friction",
            }),
          },
          {
            id: 7,
            type: "balanced-friction-biome",
            properties: createTiledProperties({
              agmLayer: "biome",
              frictionBand: "balanced-friction",
            }),
          },
          {
            id: 8,
            type: "high-friction-biome",
            properties: createTiledProperties({
              agmLayer: "biome",
              frictionBand: "high-friction",
            }),
          },
        ],
      },
    ],
  };
}
