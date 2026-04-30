import type { EngineManifestExport } from "./worldDocumentEngineExports";
import type { WorldMapExportPackage } from "./worldDocumentMapExports";

export function createImporterSampleMetadata(
  packageDraft: WorldMapExportPackage,
  engineManifest: EngineManifestExport,
) {
  const baseName = packageDraft.manifest.id;
  const filePathByKind = new Map(
    engineManifest.importerHandoff.entryFiles.map((file) => [
      file.kind,
      file.path,
    ]),
  );

  return {
    schema: "agm.importer-sample-metadata.v0",
    artifactContract: engineManifest.artifactContract,
    package: {
      id: packageDraft.manifest.id,
      name: packageDraft.manifest.name,
      profile: packageDraft.manifest.profile,
      profileLabel: packageDraft.manifest.profileLabel,
      seed: packageDraft.map.seed,
    },
    paths: {
      manifest: `manifest/${baseName}.agm-engine-manifest.json`,
      readme: engineManifest.importerHandoff.readmePath,
      sampleMetadata: engineManifest.importerHandoff.sampleMetadataPath,
    },
    importerStatus: {
      noPluginIncluded: engineManifest.importerHandoff.noPluginIncluded,
      packageFormat: engineManifest.importerHandoff.packageFormat,
      stubStatus: "sample-text-only",
      bridgeValidation: "unity-zip-content-e2e-validated",
      productionPluginBoundaryStatus:
        engineManifest.productionPluginBoundary.status,
      intendedUse:
        "Use this metadata and the sample importer stubs as starting points for Unity, Godot, or Unreal importer scripts.",
    },
    productionPluginBoundary: engineManifest.productionPluginBoundary,
    unityProductionImporterPackagingPlan:
      engineManifest.unityProductionImporterPackagingPlan,
    godotProductionImporterPackagingPlan:
      engineManifest.godotProductionImporterPackagingPlan,
    unrealProductionImporterPackagingPlan:
      engineManifest.unrealProductionImporterPackagingPlan,
    realEngineSmokeRecords: engineManifest.realEngineSmokeRecords,
    handoffDocs: {
      language: ["en", "zh-CN"],
      readme: engineManifest.importerHandoff.readmePath,
      quickStart: {
        en: [
          "Export Engine Package ZIP from AGM Studio.",
          "Extract the ZIP to a local folder.",
          "Run npm run validate:unity-export -- --dir <extracted-package-root>.",
          "Optionally provide --unity or UNITY_EXECUTABLE for Unity CLI validation.",
          "Adapt source samples under handoff/importers/.",
        ],
        zhCN: [
          "从 AGM Studio 导出 Engine Package ZIP。",
          "将 ZIP 解压到本地目录。",
          "运行 npm run validate:unity-export -- --dir <解压后的包目录> 进行校验。",
          "可选提供 --unity 或 UNITY_EXECUTABLE 执行 Unity CLI 校验。",
          "基于 handoff/importers/ 下的源码示例改造导入器。",
        ],
      },
      limitations: {
        en: [
          "Source samples only; no production plugin is included.",
          "Editor authoring prototype assets are created only inside the validator temporary Unity project.",
          "Direct --zip validation is not implemented in this milestone.",
          "Default validation targets an extracted package directory.",
        ],
        zhCN: [
          "仅包含源码示例，不包含生产级插件。",
          "Editor authoring prototype assets 只会在 validator 临时 Unity project 内创建。",
          "本里程碑尚未实现直接 --zip 校验。",
          "默认校验目标是已解压的包目录。",
        ],
      },
    },
    validationCommands: {
      extractedDirectory:
        "npm run validate:unity-export -- --dir <extracted-package-root>",
      optionalUnityCli:
        "npm run validate:unity-export -- --dir <extracted-package-root> --unity <Unity executable>",
      unityExecutableEnv:
        "UNITY_EXECUTABLE=<Unity executable> npm run validate:unity-export -- --dir <extracted-package-root>",
      zipDirectValidation: "not-implemented",
    },
    terrainInput: {
      raw16Path: filePathByKind.get("heightmap-raw16"),
      heightfieldPath: filePathByKind.get("heightfield"),
      metadataPath: filePathByKind.get("heightmap-metadata"),
      previewPngPath: `terrain/${baseName}.agm-heightmap.png`,
      encoding: engineManifest.terrainSource.rawEncoding,
      bitDepth: 16,
      endianness: "little-endian",
      normalizedRange: engineManifest.terrainSource.normalizedRange,
      rawRange: engineManifest.terrainSource.rawRange,
      coordinateSystem: engineManifest.terrainSource.coordinateSystem,
      sampleSpacing: engineManifest.terrainSource.sampleSpacing,
    },
    mapLayers: {
      world: filePathByKind.get("agm-world"),
      resource: `maps/${baseName}.agm-resource-map.json`,
      province: `maps/${baseName}.agm-province-map.json`,
      biome: `maps/${baseName}.agm-biome-map.json`,
      tiled: `maps/${baseName}.agm-tiled-map.json`,
      geojson: `maps/${baseName}.agm-map-layers.geojson`,
    },
    unityRuntimeImporter: {
      entryScript:
        "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt",
      typeDefinitions: "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt",
      editorMenuSample: "handoff/importers/unity/Editor/AgmImportMenu.cs.txt",
      packageLayout: "handoff/importers/unity/package-layout.json",
      notValidatedInUnity: true,
      validationScope: [
        "zip-content",
        "raw16-byte-length",
        "heightfield-sample-count",
        "map-layer-paths",
      ],
    },
    unityVerticalSlicePrototype: {
      sourceStatus: "source-sample-prototype",
      consumes: {
        artifactContract: `manifest/${baseName}.agm-engine-manifest.json`,
        packageLayout: "handoff/importers/unity/package-layout.json",
        sampleMetadata: engineManifest.importerHandoff.sampleMetadataPath,
        terrain: {
          raw16: `terrain/${baseName}.agm-heightmap-r16.raw`,
          heightfield: `terrain/${baseName}.agm-heightfield.json`,
          metadata: `terrain/${baseName}.agm-heightmap.json`,
        },
        mapLayers: {
          resource: `maps/${baseName}.agm-resource-map.json`,
          province: `maps/${baseName}.agm-province-map.json`,
          biome: `maps/${baseName}.agm-biome-map.json`,
        },
      },
      emits: {
        report: "Assets/AGM/Validation/agm-imported-package-report.json",
        terrainPrototype: "terrainPrototype",
        mapLayerPrototype: "mapLayerPrototype",
        artifactContractPrototype: "artifactContractPrototype",
        prototypeOutput: "prototypeOutput",
      },
      limitations: [
        "metadata-json-only",
        "no Unity Terrain asset",
        "no ScriptableObject asset",
        "no production plugin",
        "extracted-directory-only",
      ],
      runtimeValidated: false,
      editorValidated: false,
    },
    unityAssetAuthoringSpike: {
      ...engineManifest.importerHandoff.unityAssetAuthoringSpike,
      report: "Assets/AGM/Validation/agm-imported-package-report.json",
      outputReportBlock:
        engineManifest.importerHandoff.unityAssetAuthoringSpike.reportBlock,
      assetRoot: "Assets/AGM/Validation/EditorPrototypeAssets",
      exportedAssetsIncluded: false,
      validatorTempProjectCreatesAssets: true,
    },
    unityValidationHarness: {
      scriptPath:
        engineManifest.importerHandoff.unityValidationHarness.scriptPath,
      mode: engineManifest.importerHandoff.unityValidationHarness.mode,
      defaultValidation:
        engineManifest.importerHandoff.unityValidationHarness.defaultValidation,
      unityCliValidation:
        engineManifest.importerHandoff.unityValidationHarness
          .unityCliValidation,
      batchmodeMethod:
        engineManifest.importerHandoff.unityValidationHarness.batchmodeMethod,
      importerSmokeTest:
        engineManifest.importerHandoff.unityValidationHarness.importerSmokeTest,
      prototypeReport:
        engineManifest.importerHandoff.unityValidationHarness.prototypeReport,
      terrainPrototypeReport:
        engineManifest.importerHandoff.unityValidationHarness
          .terrainPrototypeReport,
      prototypeValidation:
        engineManifest.importerHandoff.unityValidationHarness
          .prototypeValidation,
      runtimeValidated: false,
      editorValidated: false,
      validationScope:
        engineManifest.importerHandoff.unityValidationHarness.checks,
      unityExecutableInputs: ["--unity", "UNITY_EXECUTABLE"],
      reportSchema:
        engineManifest.importerHandoff.unityValidationHarness.reportSchema,
    },
    expectedOutputs: {
      terrainHeightSamples:
        "Decoded UInt16 little-endian height samples from RAW16.",
      heightfieldGrid:
        "Grid dimensions and normalized height values from Heightfield JSON.",
      resourceLayerRecords:
        "Resource map records for gameplay resource placement.",
      provinceLayerRecords:
        "Province map records for political and connector layers.",
      biomeLayerRecords:
        "Biome map records for habitability and friction layers.",
      resourceLayerSummary: "Resource map coverageSummary presence marker.",
      provinceLayerSummary: "Province map structureSummary presence marker.",
      biomeLayerSummary: "Biome map habitabilitySummary presence marker.",
      artifactContractPrototype:
        "Metadata-only report block proving Unity source sample consumed the hardened artifact contract.",
      unityPrototypeReport:
        "Metadata-only Unity importer report; no Unity Terrain asset, ScriptableObject asset, or production plugin is emitted.",
      assetAuthoringPrototype:
        "Editor prototype authoring report created only inside the validator temporary Unity project; no TerrainData, ScriptableObject, prefab, Unity package, or production plugin is included in the export ZIP.",
      manifestSummary: "Engine manifest metadata and terrain import settings.",
    },
    engineSamples: engineManifest.importerHandoff.engines.map((engine) => ({
      engine: engine.engine,
      root: engine.root,
      directories: engine.directories,
      terrainTargetPath: engine.terrainFiles.find(
        (file) => file.kind === "heightmap-raw16",
      )?.recommendedPath,
      suggestedImporter: engine.importHints.importer,
      sampleStubPaths:
        engineManifest.importerHandoff.sampleStubPaths.find(
          (stub) => stub.engine === engine.engine,
        )?.paths || [],
      requiredFiles:
        engineManifest.engineProfiles.find(
          (profile) => profile.engine === engine.engine,
        )?.requiredFiles || [],
      terrainImport: engine.importHints,
    })),
  };
}

export { createEngineHandoffReadme } from "./worldDocumentEngineHandoffReadme";
