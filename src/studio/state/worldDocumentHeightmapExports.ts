import type { WorldMapExportPackage } from "./worldDocumentMapExports";

export function createHeightmapMetadataExport(
  packageDraft: WorldMapExportPackage,
) {
  return {
    schema: "agm.heightmap-metadata.v0",
    manifest: packageDraft.manifest,
    map: {
      width: packageDraft.map.width,
      height: packageDraft.map.height,
      style: packageDraft.map.style,
      heightmapTemplate: packageDraft.map.heightmap,
    },
    sourceMaps: {
      resourceMap: packageDraft.maps.resourceMap.schema,
      provinceMap: packageDraft.maps.provinceMap.schema,
      biomeMap: packageDraft.maps.biomeMap.schema,
    },
    interpretation: {
      source: "agm-template",
      coordinateSystem: "agm-layer-grid",
      heightScale: "designer-defined",
      rasterStatus: "metadata-only",
    },
  };
}

function clampHeight(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

type HeightfieldExport = ReturnType<typeof createHeightfieldExport>;

export type HeightmapPngCanvas = {
  width: number;
  height: number;
  getContext: (contextId: "2d") => CanvasRenderingContext2D | null;
  toBlob: (callback: BlobCallback, type?: string) => void;
};

export type HeightmapPngExportTargets = {
  createCanvas: () => HeightmapPngCanvas;
};

export function createGlobalHeightmapPngExportTargets(): HeightmapPngExportTargets {
  return {
    createCanvas: () => document.createElement("canvas"),
  };
}

export function createHeightfieldExport(packageDraft: WorldMapExportPackage) {
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
  const height = Math.max(
    1,
    Math.ceil(
      Math.max(
        resourceMap.tiles.length,
        provinceMap.tiles.length,
        biomeMap.biomes.length,
        1,
      ) / width,
    ),
  );
  const values = Array.from({ length: width * height }, (_, index) => {
    const resourceTile =
      resourceMap.tiles[index % Math.max(resourceMap.tiles.length, 1)];
    const provinceTile =
      provinceMap.tiles[index % Math.max(provinceMap.tiles.length, 1)];
    const biome = biomeMap.biomes[index % Math.max(biomeMap.biomes.length, 1)];
    const biomeBase = biome
      ? biome.profileFrictionBand === "high-friction"
        ? 58
        : biome.profileFrictionBand === "low-friction"
          ? 34
          : 46
      : 42;
    const habitabilityOffset =
      typeof biome?.profileAdjustedHabitability === "number"
        ? (50 - biome.profileAdjustedHabitability) * 0.18
        : 0;
    const provinceOffset = provinceTile
      ? provinceTile.structureScore * 0.12 +
        (provinceTile.connectorPriority === "primary-connector"
          ? -5
          : provinceTile.connectorPriority === "secondary-connector"
            ? -2
            : 4)
      : 0;
    const resourceOffset = resourceTile
      ? resourceTile.coverageScore * 0.08 +
        (resourceTile.role === "challenge"
          ? 5
          : resourceTile.role === "starter"
            ? -3
            : 0)
      : 0;
    const deterministicNoise =
      ((index * 37 + width * 11 + height * 7) % 17) - 8;
    return clampHeight(
      biomeBase +
        habitabilityOffset +
        provinceOffset +
        resourceOffset +
        deterministicNoise,
    );
  });

  return {
    schema: "agm.heightfield.v0",
    manifest: packageDraft.manifest,
    map: {
      width: packageDraft.map.width,
      height: packageDraft.map.height,
      style: packageDraft.map.style,
      seed: packageDraft.map.seed,
      heightmapTemplate: packageDraft.map.heightmap,
    },
    grid: {
      width,
      height,
      coordinateSystem: "agm-layer-grid",
      sampleSpacing: 1,
    },
    normalization: {
      min: 0,
      max: 100,
      valueType: "normalized-height",
      units: "designer-scale",
    },
    source: {
      type: "reconstructable-layer-derived",
      baseTemplate: packageDraft.map.heightmap,
      sourceMaps: {
        resourceMap: resourceMap.schema,
        provinceMap: provinceMap.schema,
        biomeMap: biomeMap.schema,
      },
    },
    values,
  };
}

export function createHeightmapPngBlob(
  heightfield: HeightfieldExport,
  targets: HeightmapPngExportTargets = createGlobalHeightmapPngExportTargets(),
) {
  const canvas = targets.createCanvas();
  canvas.width = heightfield.grid.width;
  canvas.height = heightfield.grid.height;
  const context = canvas.getContext("2d");
  if (!context)
    return Promise.reject(
      new Error("Heightmap PNG canvas context is unavailable"),
    );

  const imageData = context.createImageData(
    heightfield.grid.width,
    heightfield.grid.height,
  );
  heightfield.values.forEach((value, index) => {
    const shade = Math.max(0, Math.min(255, Math.round((value / 100) * 255)));
    const offset = index * 4;
    imageData.data[offset] = shade;
    imageData.data[offset + 1] = shade;
    imageData.data[offset + 2] = shade;
    imageData.data[offset + 3] = 255;
  });
  context.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Heightmap PNG blob generation failed"));
    }, "image/png");
  });
}

export function createHeightmapRaw16Blob(heightfield: HeightfieldExport) {
  const buffer = new ArrayBuffer(heightfield.values.length * 2);
  const view = new DataView(buffer);
  heightfield.values.forEach((value, index) => {
    const heightValue = Math.max(
      0,
      Math.min(65535, Math.round((value / 100) * 65535)),
    );
    view.setUint16(index * 2, heightValue, true);
  });
  return new Blob([buffer], { type: "application/octet-stream" });
}
