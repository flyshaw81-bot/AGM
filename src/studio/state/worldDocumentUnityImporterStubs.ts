import type {
  ImporterStubContext,
  ImporterStubFile,
} from "./worldDocumentImporterStubTypes";
import {
  createUnityAssetAuthoringPrototypeFile,
  createUnityImportMenuFile,
} from "./worldDocumentUnityEditorStubFiles";
import {
  createUnityMinimalImporterStubFile,
  createUnityReadmeFile,
} from "./worldDocumentUnityIntroStubFiles";
import { createUnityPackageLayoutFile } from "./worldDocumentUnityPackageLayout";
import { createUnityRuntimePackageImporterFile } from "./worldDocumentUnityRuntimeImporterStubFile";
import { createUnityRuntimePackageTypesFile } from "./worldDocumentUnityRuntimeTypesStubFile";

export function createUnityImporterStubFiles(
  context: ImporterStubContext,
): ImporterStubFile[] {
  return [
    createUnityReadmeFile(context),
    createUnityMinimalImporterStubFile(context),
    createUnityRuntimePackageTypesFile(),
    createUnityRuntimePackageImporterFile(context),
    createUnityImportMenuFile(),
    createUnityAssetAuthoringPrototypeFile(),
    createUnityPackageLayoutFile(context),
  ];
}
