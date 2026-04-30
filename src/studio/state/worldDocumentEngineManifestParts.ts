import type { WorldMapExportPackage } from "./worldDocumentMapExports";

const MAP_FILE_KINDS = [
  "agm-world",
  "resource-map",
  "province-map",
  "biome-map",
  "tiled-map",
  "geojson-map-layers",
];

export function createEngineArtifactContract() {
  return {
    schema: "agm.engine-package-contract.v0",
    packageFormat: "agm.engine-package.v0",
    layoutVersion: 0,
    manifestSchema: "agm.engine-manifest.v0",
    sampleMetadataSchema: "agm.importer-sample-metadata.v0",
    unityPackageLayoutSchema: "agm.unity-package-layout.v0",
    zipParsingSupported: false,
    productionPluginsIncluded: false,
    validationMode: "extracted-directory-only",
  };
}

export function createEngineManifestFiles(packageDraft: WorldMapExportPackage) {
  const baseName = packageDraft.manifest.id;
  return [
    {
      kind: "agm-world",
      path: `${baseName}.agm-world.json`,
      schema: packageDraft.schema,
    },
    {
      kind: "resource-map",
      path: `${baseName}.agm-resource-map.json`,
      schema: packageDraft.maps.resourceMap.schema,
    },
    {
      kind: "province-map",
      path: `${baseName}.agm-province-map.json`,
      schema: packageDraft.maps.provinceMap.schema,
    },
    {
      kind: "biome-map",
      path: `${baseName}.agm-biome-map.json`,
      schema: packageDraft.maps.biomeMap.schema,
    },
    {
      kind: "tiled-map",
      path: `${baseName}.agm-tiled-map.json`,
      schema: "tiled.map.v1",
    },
    {
      kind: "geojson-map-layers",
      path: `${baseName}.agm-map-layers.geojson`,
      schema: "agm.geojson-map-layers.v0",
    },
    {
      kind: "heightmap-metadata",
      path: `${baseName}.agm-heightmap.json`,
      schema: "agm.heightmap-metadata.v0",
    },
    {
      kind: "heightfield",
      path: `${baseName}.agm-heightfield.json`,
      schema: "agm.heightfield.v0",
    },
    {
      kind: "heightmap-png",
      path: `${baseName}.agm-heightmap.png`,
      schema: "png.grayscale-heightmap.v1",
    },
    {
      kind: "heightmap-raw16",
      path: `${baseName}.agm-heightmap-r16.raw`,
      schema: "raw.uint16-heightmap.le.v1",
    },
  ];
}

export function packagePathForEngineFile(file: { kind: string; path: string }) {
  return `${MAP_FILE_KINDS.includes(file.kind) ? "maps" : "terrain"}/${file.path}`;
}

export function createEngineManifestLayers(
  packageDraft: WorldMapExportPackage,
) {
  return [
    {
      id: "resource",
      source: packageDraft.maps.resourceMap.schema,
      semantics: ["resourceTag", "role", "coverageScore", "exportLayer"],
    },
    {
      id: "province",
      source: packageDraft.maps.provinceMap.schema,
      semantics: [
        "provinceId",
        "stateId",
        "structureScore",
        "connectorPriority",
      ],
    },
    {
      id: "biome",
      source: packageDraft.maps.biomeMap.schema,
      semantics: [
        "biomeId",
        "resourceTag",
        "profileFrictionBand",
        "profileAdjustedHabitability",
      ],
    },
  ];
}

export const REQUIRED_ENGINE_FILE_KINDS = [
  "agm-world",
  "resource-map",
  "province-map",
  "biome-map",
];

export const OPTIONAL_ENGINE_FILE_KINDS = [
  "tiled-map",
  "geojson-map-layers",
  "heightmap-metadata",
  "heightfield",
  "heightmap-png",
  "heightmap-raw16",
];

export function createEngineLayerBindings() {
  return [
    {
      layer: "resource",
      fileKind: "resource-map",
      role: "semantic resource coverage",
    },
    {
      layer: "province",
      fileKind: "province-map",
      role: "province structure and connector planning",
    },
    {
      layer: "biome",
      fileKind: "biome-map",
      role: "biome habitability and friction bands",
    },
    { layer: "tiled", fileKind: "tiled-map", role: "tilemap import reference" },
    {
      layer: "geojson",
      fileKind: "geojson-map-layers",
      role: "GIS-style layer interchange",
    },
    {
      layer: "heightmap",
      fileKind: "heightmap-metadata",
      role: "height interpretation metadata",
    },
    {
      layer: "heightfield",
      fileKind: "heightfield",
      role: "reconstructable normalized elevation grid",
    },
    {
      layer: "heightmap-raster",
      fileKind: "heightmap-png",
      role: "8-bit grayscale terrain raster",
    },
    {
      layer: "heightmap-raw16",
      fileKind: "heightmap-raw16",
      role: "16-bit little-endian terrain height raster",
    },
  ];
}

export function createEngineTerrainSource() {
  return {
    heightfieldSchema: "agm.heightfield.v0",
    rawSchema: "raw.uint16-heightmap.le.v1",
    rawEncoding: "uint16-little-endian",
    normalizedRange: { min: 0, max: 100 },
    rawRange: { min: 0, max: 65535 },
    coordinateSystem: "agm-layer-grid",
    sampleSpacing: 1,
  };
}

export function createEngineTerrainImport(
  terrainSource: ReturnType<typeof createEngineTerrainSource>,
) {
  return {
    rawFileKind: "heightmap-raw16",
    heightfieldFileKind: "heightfield",
    previewFileKind: "heightmap-png",
    metadataFileKind: "heightmap-metadata",
    rawEncoding: terrainSource.rawEncoding,
    bitDepth: 16,
    endianness: "little-endian",
    heightRange: terrainSource.rawRange,
    sampleSpacing: terrainSource.sampleSpacing,
  };
}

export function createEnginePackageStructure(
  baseName: string,
  terrainImport: ReturnType<typeof createEngineTerrainImport>,
) {
  return [
    {
      engine: "unity",
      root: `Assets/AGM/${baseName}`,
      directories: ["Data", "Maps", "Terrain", "Metadata", "Importers"],
      terrainFiles: [
        {
          kind: "heightmap-raw16",
          recommendedPath: `Terrain/${baseName}.agm-heightmap-r16.raw`,
        },
        {
          kind: "heightfield",
          recommendedPath: `Terrain/${baseName}.agm-heightfield.json`,
        },
        {
          kind: "heightmap-png",
          recommendedPath: `Terrain/${baseName}.agm-heightmap.png`,
        },
        {
          kind: "heightmap-metadata",
          recommendedPath: `Metadata/${baseName}.agm-heightmap.json`,
        },
      ],
      importHints: {
        ...terrainImport,
        importer:
          "Unity Terrain RAW heightmap import or custom Editor importer",
      },
    },
    {
      engine: "godot",
      root: `res://agm/${baseName}`,
      directories: ["data", "maps", "terrain", "metadata", "importers"],
      terrainFiles: [
        {
          kind: "heightmap-raw16",
          recommendedPath: `terrain/${baseName}.agm-heightmap-r16.raw`,
        },
        {
          kind: "heightfield",
          recommendedPath: `terrain/${baseName}.agm-heightfield.json`,
        },
        {
          kind: "heightmap-png",
          recommendedPath: `terrain/${baseName}.agm-heightmap.png`,
        },
        {
          kind: "heightmap-metadata",
          recommendedPath: `metadata/${baseName}.agm-heightmap.json`,
        },
      ],
      importHints: {
        ...terrainImport,
        importer: "Godot EditorImportPlugin or runtime terrain loader",
      },
    },
    {
      engine: "unreal",
      root: `/Game/AGM/${baseName}`,
      directories: ["Data", "Maps", "Terrain", "Metadata", "EditorUtilities"],
      terrainFiles: [
        {
          kind: "heightmap-raw16",
          recommendedPath: `Terrain/${baseName}.agm-heightmap-r16.raw`,
        },
        {
          kind: "heightfield",
          recommendedPath: `Terrain/${baseName}.agm-heightfield.json`,
        },
        {
          kind: "heightmap-png",
          recommendedPath: `Terrain/${baseName}.agm-heightmap.png`,
        },
        {
          kind: "heightmap-metadata",
          recommendedPath: `Metadata/${baseName}.agm-heightmap.json`,
        },
      ],
      importHints: {
        ...terrainImport,
        importer: "Unreal Landscape RAW16 import with DataAsset metadata",
      },
    },
  ];
}

export function createEngineLayoutFiles(baseName: string) {
  return {
    requiredLayoutFiles: [
      `manifest/${baseName}.agm-engine-manifest.json`,
      `maps/${baseName}.agm-world.json`,
      `maps/${baseName}.agm-resource-map.json`,
      `maps/${baseName}.agm-province-map.json`,
      `maps/${baseName}.agm-biome-map.json`,
      `terrain/${baseName}.agm-heightmap.json`,
      `terrain/${baseName}.agm-heightfield.json`,
      `terrain/${baseName}.agm-heightmap-r16.raw`,
      "handoff/README.md",
      "handoff/importer-sample-metadata.json",
    ],
    optionalLayoutFiles: [
      `maps/${baseName}.agm-tiled-map.json`,
      `maps/${baseName}.agm-map-layers.geojson`,
      `terrain/${baseName}.agm-heightmap.png`,
    ],
  };
}

export function createEngineProfiles(
  baseName: string,
  layerBindings: ReturnType<typeof createEngineLayerBindings>,
  terrainImport: ReturnType<typeof createEngineTerrainImport>,
) {
  const shared = {
    requiredFiles: REQUIRED_ENGINE_FILE_KINDS,
    optionalFiles: OPTIONAL_ENGINE_FILE_KINDS,
    layerBindings,
    terrainImport,
    coordinateSystem: "agm-layer-grid",
    heightmapStatus: "heightfield-json",
    heightDataStatus: "reconstructable-json",
    heightRasterStatus: "png-8bit-and-raw-uint16",
    heightRawStatus: "raw-uint16-little-endian",
  };

  return [
    {
      engine: "unity",
      assetRoot: `Assets/AGM/${baseName}`,
      loaderHint: "ScriptableObject importer or Editor JSON importer",
      packageStructureRef: "unity",
      terrainDirectories: ["Data", "Maps", "Terrain", "Metadata", "Importers"],
      ...shared,
    },
    {
      engine: "godot",
      assetRoot: `res://agm/${baseName}`,
      loaderHint: "EditorImportPlugin or runtime JSON loader",
      packageStructureRef: "godot",
      terrainDirectories: ["data", "maps", "terrain", "metadata", "importers"],
      ...shared,
    },
    {
      engine: "unreal",
      assetRoot: `/Game/AGM/${baseName}`,
      loaderHint: "Editor Utility Widget or DataAsset importer",
      packageStructureRef: "unreal",
      terrainDirectories: [
        "Data",
        "Maps",
        "Terrain",
        "Metadata",
        "EditorUtilities",
      ],
      ...shared,
    },
  ];
}

export function createEngineImportLayout(
  baseName: string,
  files: ReturnType<typeof createEngineManifestFiles>,
) {
  return {
    root: `Assets/AGM/${baseName}`,
    dataDirectory: "Data",
    mapsDirectory: "Maps",
    metadataDirectory: "Metadata",
    recommendedFiles: files.map((file) => ({
      ...file,
      recommendedPath: `${MAP_FILE_KINDS.includes(file.kind) ? "Maps" : "Metadata"}/${file.path}`,
    })),
  };
}
