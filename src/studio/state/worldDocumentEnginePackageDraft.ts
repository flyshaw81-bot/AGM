import {
  createSafeFilename,
  downloadBlobDraft,
  loadJsZip,
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
  createHeightfieldExport,
  createHeightmapMetadataExport,
  createHeightmapPngBlob,
  createHeightmapRaw16Blob,
  createTiledMapExport,
} from "./worldDocumentMapExports";

type WorldPackageDraft = WorldDocumentDraft["package"];

export async function exportEnginePackageBundle(
  documentName: string,
  packageDraft: WorldPackageDraft,
) {
  const baseName = packageDraft.manifest.id;
  const heightmapMetadata = createHeightmapMetadataExport(packageDraft);
  const heightfield = createHeightfieldExport(packageDraft);
  const heightmapPngBlob = await createHeightmapPngBlob(heightfield);
  const heightmapRaw16Blob = createHeightmapRaw16Blob(heightfield);
  const engineManifest = createEngineManifestExport(packageDraft);
  const importerStubFiles = createImporterStubFiles(
    packageDraft,
    engineManifest,
  );
  const JsZip = await loadJsZip();
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
  downloadBlobDraft(filename, blob);
  return { filename, manifest: engineManifest, heightfield };
}
