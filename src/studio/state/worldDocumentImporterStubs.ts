import type { EngineManifestExport } from "./worldDocumentEngineExports";
import { createGodotImporterStubFiles } from "./worldDocumentGodotImporterStubs";
import type { WorldMapExportPackage } from "./worldDocumentMapExports";
import { createUnityImporterStubFiles } from "./worldDocumentUnityImporterStubs";
import { createUnrealImporterStubFiles } from "./worldDocumentUnrealImporterStubs";

export function createImporterStubFiles(
  packageDraft: WorldMapExportPackage,
  engineManifest: EngineManifestExport,
) {
  const baseName = packageDraft.manifest.id;
  const manifestPath = `manifest/${baseName}.agm-engine-manifest.json`;
  const sampleMetadataPath = engineManifest.importerHandoff.sampleMetadataPath;
  const heightfieldPath = `terrain/${baseName}.agm-heightfield.json`;
  const raw16Path = `terrain/${baseName}.agm-heightmap-r16.raw`;

  return [
    ...createUnityImporterStubFiles({
      packageDraft,
      engineManifest,
      baseName,
      manifestPath,
      sampleMetadataPath,
      heightfieldPath,
      raw16Path,
    }),
    ...createGodotImporterStubFiles({
      packageDraft,
      engineManifest,
      baseName,
      manifestPath,
      sampleMetadataPath,
      heightfieldPath,
      raw16Path,
    }),
    ...createUnrealImporterStubFiles({
      packageDraft,
      engineManifest,
      baseName,
      manifestPath,
      sampleMetadataPath,
      heightfieldPath,
      raw16Path,
    }),
  ];
}
