import {
  createGlobalDraftFileIoTargets,
  createSafeFilename,
  type DraftFileIoTargets,
  downloadBlobDraft,
  loadZipConstructor,
  stringifyPackageFile,
} from "./draftFileIo";
import type { WorldDocumentDraft } from "./worldDocumentDraft";
import { createEngineManifestExport } from "./worldDocumentEngineExports";
import {
  createEngineHandoffReadme,
  createImporterSampleMetadata,
} from "./worldDocumentEngineHandoff";
import { createImporterStubFiles } from "./worldDocumentImporterStubs";
import {
  createGeoJsonMapLayerExport,
  createGlobalHeightmapPngExportTargets,
  createHeightfieldExport,
  createHeightmapMetadataExport,
  createHeightmapPngBlob,
  createHeightmapRaw16Blob,
  createTiledMapExport,
  type HeightmapPngExportTargets,
} from "./worldDocumentMapExports";

type WorldPackageDraft = WorldDocumentDraft["package"];

export type EnginePackageZipInstance = {
  file: (path: string, content: string | Blob) => void;
  generateAsync: (options: { type: "blob" }) => Promise<Blob>;
};

export type EnginePackageZipConstructor = new () => EnginePackageZipInstance;

export type EnginePackageBundleTargets = {
  loadZip: () => Promise<EnginePackageZipConstructor>;
  downloadBlob: (filename: string, blob: Blob) => void;
  createPngBlob: typeof createHeightmapPngBlob;
  createRaw16Blob: typeof createHeightmapRaw16Blob;
};

export type GlobalEnginePackageBundleTargetOptions = {
  fileIoTargets?: DraftFileIoTargets;
  heightmapPngTargets?: HeightmapPngExportTargets;
};

export function createGlobalEnginePackageBundleTargets(
  options: GlobalEnginePackageBundleTargetOptions = {},
): EnginePackageBundleTargets {
  const fileIoTargets =
    options.fileIoTargets ?? createGlobalDraftFileIoTargets();
  const heightmapPngTargets =
    options.heightmapPngTargets ?? createGlobalHeightmapPngExportTargets();

  return {
    loadZip: () => Promise.resolve(loadZipConstructor()),
    downloadBlob: (filename, blob) =>
      downloadBlobDraft(filename, blob, fileIoTargets),
    createPngBlob: (heightfield) =>
      createHeightmapPngBlob(heightfield, heightmapPngTargets),
    createRaw16Blob: createHeightmapRaw16Blob,
  };
}

export async function exportEnginePackageBundle(
  documentName: string,
  packageDraft: WorldPackageDraft,
  targets: EnginePackageBundleTargets = createGlobalEnginePackageBundleTargets(),
) {
  const baseName = packageDraft.manifest.id;
  const heightmapMetadata = createHeightmapMetadataExport(packageDraft);
  const heightfield = createHeightfieldExport(packageDraft);
  const heightmapPngBlob = await targets.createPngBlob(heightfield);
  const heightmapRaw16Blob = targets.createRaw16Blob(heightfield);
  const engineManifest = createEngineManifestExport(packageDraft);
  const importerStubFiles = createImporterStubFiles(
    packageDraft,
    engineManifest,
  );
  const JsZip = await targets.loadZip();
  const zip = new JsZip();

  zip.file(
    `manifest/${baseName}.agm-engine-manifest.json`,
    stringifyPackageFile(engineManifest),
  );
  zip.file(
    `maps/${baseName}.agm-world.json`,
    stringifyPackageFile(packageDraft),
  );
  zip.file(
    `maps/${baseName}.agm-resource-map.json`,
    stringifyPackageFile(packageDraft.maps.resourceMap),
  );
  zip.file(
    `maps/${baseName}.agm-province-map.json`,
    stringifyPackageFile(packageDraft.maps.provinceMap),
  );
  zip.file(
    `maps/${baseName}.agm-biome-map.json`,
    stringifyPackageFile(packageDraft.maps.biomeMap),
  );
  zip.file(
    `maps/${baseName}.agm-tiled-map.json`,
    stringifyPackageFile(createTiledMapExport(packageDraft)),
  );
  zip.file(
    `maps/${baseName}.agm-map-layers.geojson`,
    stringifyPackageFile(createGeoJsonMapLayerExport(packageDraft)),
  );
  zip.file(
    `terrain/${baseName}.agm-heightmap.json`,
    stringifyPackageFile(heightmapMetadata),
  );
  zip.file(
    `terrain/${baseName}.agm-heightfield.json`,
    stringifyPackageFile(heightfield),
  );
  zip.file(`terrain/${baseName}.agm-heightmap.png`, heightmapPngBlob);
  zip.file(`terrain/${baseName}.agm-heightmap-r16.raw`, heightmapRaw16Blob);
  zip.file(
    "handoff/README.md",
    createEngineHandoffReadme(packageDraft, engineManifest),
  );
  zip.file(
    "handoff/importer-sample-metadata.json",
    stringifyPackageFile(
      createImporterSampleMetadata(packageDraft, engineManifest),
    ),
  );
  importerStubFiles.forEach((file) => {
    zip.file(file.path, file.content);
  });

  const filename = createSafeFilename(documentName, "agm-engine-package.zip");
  const blob = await zip.generateAsync({ type: "blob" });
  targets.downloadBlob(filename, blob);
  return { filename, manifest: engineManifest, heightfield };
}
