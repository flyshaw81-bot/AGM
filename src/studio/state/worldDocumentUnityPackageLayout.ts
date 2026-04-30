import { stringifyPackageFile } from "./draftFileIo";
import type {
  ImporterStubContext,
  ImporterStubFile,
} from "./worldDocumentImporterStubTypes";

export function createUnityPackageLayoutFile({
  baseName,
  engineManifest,
  manifestPath,
  sampleMetadataPath,
}: ImporterStubContext): ImporterStubFile {
  return {
    path: "handoff/importers/unity/package-layout.json",
    content: stringifyPackageFile({
      schema: "agm.unity-package-layout.v0",
      contractSchema: engineManifest.artifactContract.schema,
      packageFormat: engineManifest.artifactContract.packageFormat,
      layoutVersion: engineManifest.artifactContract.layoutVersion,
      manifestPath,
      sampleMetadataPath,
      engine: "unity",
      root: `Assets/AGM/${baseName}`,
      sourceStatus: "source-sample-included",
      productionPluginIncluded: false,
      productionPluginBoundary: engineManifest.productionPluginBoundary,
      unityProductionImporterPackagingPlan:
        engineManifest.unityProductionImporterPackagingPlan,
      zipParsingSupported: false,
      validationMode: "extracted-directory-only",
      requiredPackageFiles: engineManifest.importerHandoff.layout.requiredFiles,
      runtimeValidated: false,
      editorValidated: false,
      createsUnityProject: false,
      createsUnityTerrainAsset: false,
      createsScriptableObjectAsset: false,
      createsPrefabAsset: false,
      exportedAssetsIncluded: false,
      createsUnityTerrainAssetInExport: false,
      createsScriptableObjectAssetInExport: false,
      createsPrefabAssetInExport: false,
      createsUnityPackage: false,
      prototypeOutputKind: "metadata-json-only",
      assetAuthoringSpikeStatus: "editor-source-sample-prototype",
      assetAuthoringOutputKind: "temporary-unity-project-editor-artifacts",
      assetAuthoringOutputScope: "validator-temp-unity-project-only",
      assetAuthoringAssetRoot: "Assets/AGM/Validation/EditorPrototypeAssets",
      assetAuthoringReportBlock: "assetAuthoringPrototype",
      directories: [
        "Data",
        "Maps",
        "Terrain",
        "Metadata",
        "Importers",
        "Runtime",
        "Editor",
      ],
      artifacts: engineManifest.importerHandoff.unityImporterArtifactPaths,
      terrain: {
        raw16: `Terrain/${baseName}.agm-heightmap-r16.raw`,
        heightfield: `Terrain/${baseName}.agm-heightfield.json`,
        metadata: `Metadata/${baseName}.agm-heightmap.json`,
      },
      maps: {
        resource: `Maps/${baseName}.agm-resource-map.json`,
        province: `Maps/${baseName}.agm-province-map.json`,
        biome: `Maps/${baseName}.agm-biome-map.json`,
      },
    }),
  };
}
