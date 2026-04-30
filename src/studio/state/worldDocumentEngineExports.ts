import {
  createEngineArtifactContract,
  createEngineImportLayout,
  createEngineLayerBindings,
  createEngineLayoutFiles,
  createEngineManifestFiles,
  createEngineManifestLayers,
  createEnginePackageStructure,
  createEngineProfiles,
  createEngineTerrainImport,
  createEngineTerrainSource,
  packagePathForEngineFile,
} from "./worldDocumentEngineManifestParts";
import { createEngineProductionPlans } from "./worldDocumentEngineProductionPlans";
import { createEngineValidationPlans } from "./worldDocumentEngineValidationPlans";
import type { WorldMapExportPackage } from "./worldDocumentMapExports";

export function createEngineManifestExport(
  packageDraft: WorldMapExportPackage,
) {
  const baseName = packageDraft.manifest.id;
  const artifactContract = createEngineArtifactContract();
  const files = createEngineManifestFiles(packageDraft);
  const layers = createEngineManifestLayers(packageDraft);
  const layerBindings = createEngineLayerBindings();
  const terrainSource = createEngineTerrainSource();
  const terrainImport = createEngineTerrainImport(terrainSource);
  const enginePackageStructure = createEnginePackageStructure(
    baseName,
    terrainImport,
  );
  const unityImporterArtifactPaths = [
    "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt",
    "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt",
    "handoff/importers/unity/Editor/AgmImportMenu.cs.txt",
    "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt",
    "handoff/importers/unity/package-layout.json",
  ];
  const sampleStubPaths = [
    {
      engine: "unity",
      paths: [
        "handoff/importers/unity/README.md",
        "handoff/importers/unity/AgmImporterStub.cs.txt",
        ...unityImporterArtifactPaths,
      ],
    },
    {
      engine: "godot",
      paths: [
        "handoff/importers/godot/README.md",
        "handoff/importers/godot/agm_importer_stub.gd.txt",
      ],
    },
    {
      engine: "unreal",
      paths: [
        "handoff/importers/unreal/README.md",
        "handoff/importers/unreal/AgmImporterStub.cpp.txt",
      ],
    },
  ];
  const engineArtifactFiles = sampleStubPaths.flatMap((stub) => stub.paths);
  const {
    productionPluginBoundary,
    godotProductionImporterPackagingPlan,
    unrealProductionImporterPackagingPlan,
    unityProductionImporterPackagingPlan,
  } = createEngineProductionPlans(unityImporterArtifactPaths);
  const { requiredLayoutFiles, optionalLayoutFiles } =
    createEngineLayoutFiles(baseName);
  const {
    unityValidationHarness,
    unityVerticalSlicePrototype,
    realEngineSmokeRecords,
    unityAssetAuthoringSpike,
  } = createEngineValidationPlans();
  const importerEntryKinds = [
    "agm-world",
    "heightmap-raw16",
    "heightfield",
    "heightmap-metadata",
  ];
  const importerHandoff = {
    readmePath: "handoff/README.md",
    sampleMetadataPath: "handoff/importer-sample-metadata.json",
    artifactContract,
    productionPluginBoundary,
    unityProductionImporterPackagingPlan,
    godotProductionImporterPackagingPlan,
    unrealProductionImporterPackagingPlan,
    noPluginIncluded: true,
    packageFormat: artifactContract.packageFormat,
    layout: {
      rootDirectories: ["manifest", "maps", "terrain", "handoff"],
      requiredFiles: requiredLayoutFiles,
      optionalFiles: optionalLayoutFiles,
      engineArtifactFiles,
    },
    sampleStubPaths,
    bridgeValidation: {
      engine: "unity",
      status: "zip-content-e2e-validated",
      runtimeValidated: false,
      scope: [
        "manifest-json",
        "importer-sample-metadata",
        "unity-stub-text",
        "raw16-byte-length",
        "heightfield-sample-count",
      ],
    },
    unityRuntimeImporterSpike: {
      status: "source-sample-included",
      runtimeValidated: false,
      editorValidated: false,
      createsUnityProject: false,
      dependencyPolicy: "unity-builtins-only",
    },
    unityVerticalSlicePrototype,
    unityAssetAuthoringSpike,
    realEngineSmokeRecords,
    unityValidationHarness,
    unityImporterArtifactPaths,
    entryFiles: [
      {
        kind: "engine-manifest",
        path: `manifest/${baseName}.agm-engine-manifest.json`,
        schema: "agm.engine-manifest.v0",
      },
      ...files
        .filter((file) => importerEntryKinds.includes(file.kind))
        .map((file) => ({ ...file, path: packagePathForEngineFile(file) })),
    ],
    engines: enginePackageStructure.map((packageStructure) => ({
      engine: packageStructure.engine,
      root: packageStructure.root,
      directories: packageStructure.directories,
      terrainFiles: packageStructure.terrainFiles,
      importHints: packageStructure.importHints,
    })),
  };

  return {
    schema: "agm.engine-manifest.v0",
    artifactContract,
    manifest: packageDraft.manifest,
    map: packageDraft.map,
    targets: [
      "unity",
      "godot",
      "unreal",
      "tiled",
      "geojson",
      "heightmap",
      "heightfield",
      "raster",
      "terrain-raw16",
    ],
    files,
    layers,
    terrainSource,
    enginePackageStructure,
    importerHandoff,
    productionPluginBoundary,
    unityProductionImporterPackagingPlan,
    godotProductionImporterPackagingPlan,
    unrealProductionImporterPackagingPlan,
    realEngineSmokeRecords,
    importLayout: createEngineImportLayout(baseName, files),
    engineProfiles: createEngineProfiles(
      baseName,
      layerBindings,
      terrainImport,
    ),
    validation: {
      requiredSchemas: files.map((file) => file.schema),
      warnings: [
        "RAW16 height export is available; engine-specific terrain importer plugins are still pending.",
        "Importer stubs are documentation samples only; no engine plugin is included.",
      ],
    },
  };
}

export type EngineManifestExport = ReturnType<
  typeof createEngineManifestExport
>;
