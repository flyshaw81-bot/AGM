import type { EngineManifestExport } from "./worldDocumentEngineExports";
import type { WorldMapExportPackage } from "./worldDocumentMapExports";

export type ImporterStubFile = {
  path: string;
  content: string;
};

export type ImporterStubContext = {
  packageDraft: WorldMapExportPackage;
  engineManifest: EngineManifestExport;
  baseName: string;
  manifestPath: string;
  sampleMetadataPath: string;
  heightfieldPath: string;
  raw16Path: string;
};
