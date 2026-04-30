#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readRaw16Values(filePath) {
  const raw = fs.readFileSync(filePath);
  const values = [];
  for (let index = 0; index < raw.length; index += 2) values.push(raw[index] | (raw[index + 1] << 8));
  return values;
}

function findManifestPath(packageRoot) {
  const manifestDir = path.join(packageRoot, "manifest");
  const manifestFile = fs.readdirSync(manifestDir).find(name => name.endsWith(".agm-engine-manifest.json"));
  if (!manifestFile) throw new Error("Missing AGM engine manifest in copied sample package");
  return path.join(manifestDir, manifestFile);
}

function findPackageRoot(projectPath) {
  const samplesRoot = path.join(projectPath, "Assets", "AGM", "Samples");
  const packageId = fs.readdirSync(samplesRoot).find(name => fs.statSync(path.join(samplesRoot, name)).isDirectory());
  if (!packageId) throw new Error("Missing AGM copied sample package");
  return {packageId, packageRoot: path.join(samplesRoot, packageId)};
}

const authoringAssetRoot = "Assets/AGM/Validation/EditorPrototypeAssets";
const authoringArtifacts = [
  {kind: "terrain-data", unityType: "TerrainData", path: `${authoringAssetRoot}/AgmTerrainPrototype.asset`},
  {kind: "world-scriptable-object", unityType: "AgmWorldPrototypeAsset", path: `${authoringAssetRoot}/AgmWorldPrototype.asset`},
  {kind: "prefab", unityType: "Prefab", path: `${authoringAssetRoot}/AgmWorldPrototype.prefab`},
];

function readPackageCompileGate(projectPath) {
  const packageRoot = path.join(projectPath, "Packages", "com.agm.importers.unity");
  const packageJson = readJson(path.join(packageRoot, "package.json"));
  return {
    schema: "agm.unity-package-compile-gate.v0",
    status: "compiled-in-validator-temp-project",
    packageName: packageJson.name,
    packageRoot: "Packages/com.agm.importers.unity",
    packageVersion: packageJson.version,
    compiledFiles: [
      "package.json",
      "Runtime/AGM.Importers.Unity.Runtime.asmdef",
      "Runtime/AgmRuntimePackageImporter.cs",
      "Runtime/AgmPackageTypes.cs",
      "Editor/AGM.Importers.Unity.Editor.asmdef",
      "Editor/AgmImportMenu.cs",
      "Editor/AgmImporterWindow.cs",
      "Editor/AgmAssetAuthoringPrototype.cs",
      "Samples~/ImporterFixture/README.md",
      "README.md",
    ],
    assemblies: ["AGM.Importers.Unity.Runtime", "AGM.Importers.Unity.Editor"],
    includedInEnginePackageZip: false,
  };
}

function createReport(packageId, packageRoot, projectPath) {
  const sampleMetadata = readJson(path.join(packageRoot, "handoff", "importer-sample-metadata.json"));
  const packageLayout = readJson(path.join(packageRoot, "handoff", "importers", "unity", "package-layout.json"));
  const manifest = readJson(findManifestPath(packageRoot));
  const heightfield = readJson(path.join(packageRoot, sampleMetadata.terrainInput.heightfieldPath));
  const resourceMap = readJson(path.join(packageRoot, sampleMetadata.mapLayers.resource));
  const provinceMap = readJson(path.join(packageRoot, sampleMetadata.mapLayers.province));
  const biomeMap = readJson(path.join(packageRoot, sampleMetadata.mapLayers.biome));
  const raw16Values = readRaw16Values(path.join(packageRoot, sampleMetadata.terrainInput.raw16Path));
  const failAssetAuthoring = process.env.AGM_MOCK_UNITY_MODE === "asset-authoring-fail";
  const failAssetAuthoringScope = process.env.AGM_MOCK_UNITY_MODE === "asset-authoring-scope-fail";
  const failPackageImportSmoke = process.env.AGM_MOCK_UNITY_MODE === "package-import-smoke-fail";
  const failRuntimeIssueTaxonomy = process.env.AGM_MOCK_UNITY_MODE === "runtime-issue-fail";
  const reportedAuthoringArtifacts = failAssetAuthoring
    ? authoringArtifacts.slice(0, 2)
    : failAssetAuthoringScope
      ? authoringArtifacts.map(artifact => artifact.kind === "prefab" ? {...artifact, path: "Assets/AGM/Unsafe/AgmWorldPrototype.prefab"} : artifact)
      : authoringArtifacts;

  return {
    schema: "agm.unity-imported-package-report.v0",
    packageId,
    packageName: manifest.manifest?.name || sampleMetadata.package?.name || packageId,
    heightSampleCount: heightfield.values.length,
    firstRaw16Samples: raw16Values.slice(0, 8),
    resourceLayerPath: sampleMetadata.mapLayers.resource,
    provinceLayerPath: sampleMetadata.mapLayers.province,
    biomeLayerPath: sampleMetadata.mapLayers.biome,
    artifactContractPrototype: {
      schema: packageLayout.contractSchema,
      packageFormat: packageLayout.packageFormat,
      layoutVersion: packageLayout.layoutVersion,
      zipParsingSupported: packageLayout.zipParsingSupported,
      productionPluginIncluded: packageLayout.productionPluginIncluded,
      validationMode: packageLayout.validationMode,
      consumedByUnitySourceSample: true,
    },
    mapLayerPrototype: {
      resource: {path: sampleMetadata.mapLayers.resource, recordCount: resourceMap.tiles.length, summary: "coverageSummary-present"},
      province: {path: sampleMetadata.mapLayers.province, recordCount: provinceMap.tiles.length, summary: "structureSummary-present"},
      biome: {path: sampleMetadata.mapLayers.biome, recordCount: biomeMap.biomes.length, summary: "habitabilitySummary-present"},
      validatedAsPrototypeMetadataOnly: true,
    },
    prototypeOutput: {
      kind: "metadata-json-only",
      createsUnityTerrainAsset: false,
      createsScriptableObjectAsset: false,
      productionPluginIncluded: false,
    },
    unityPackageCompileGate: readPackageCompileGate(projectPath),
    runtimeImportIssue: failRuntimeIssueTaxonomy ? {
      schema: "agm.unity-runtime-import-issue.v0",
      code: "raw16-byte-length-mismatch",
      message: `RAW16 byte length ${raw16Values.length * 2 - 2} does not match heightfield sample count ${heightfield.values.length}.`,
      path: sampleMetadata.terrainInput.raw16Path,
      expected: String(heightfield.values.length * 2),
      actual: String(raw16Values.length * 2 - 2),
    } : null,
    unityPackageImportSmokeTest: {
      schema: "agm.unity-package-import-smoke-test.v0",
      status: "package-importer-consumed-engine-package",
      packageName: "com.agm.importers.unity",
      packageRoot: "Packages/com.agm.importers.unity",
      importer: "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage",
      runtimeApi: "AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage",
      runtimeReportSchema: "agm.unity-runtime-import-report.v0",
      sourceSampleSummary: {
        packageId,
        heightSampleCount: heightfield.values.length,
        grid: `${heightfield.grid.width}x${heightfield.grid.height}`,
        raw16SampleCount: raw16Values.length,
        resourceRecords: resourceMap.tiles.length,
        provinceRecords: provinceMap.tiles.length,
        biomeRecords: biomeMap.biomes.length,
      },
      packageImporterSummary: {
        packageId,
        heightSampleCount: failPackageImportSmoke ? heightfield.values.length - 1 : heightfield.values.length,
        grid: `${heightfield.grid.width}x${heightfield.grid.height}`,
        raw16SampleCount: raw16Values.length,
        resourceRecords: resourceMap.tiles.length,
        provinceRecords: provinceMap.tiles.length,
        biomeRecords: biomeMap.biomes.length,
      },
      packageIdMatches: true,
      heightSampleCountMatches: !failPackageImportSmoke,
      gridMatches: true,
      raw16Matches: true,
      mapLayerRecordsMatch: true,
      mismatchDetail: failPackageImportSmoke ? `heightSampleCount mismatch: source=${heightfield.values.length}, package=${heightfield.values.length - 1}` : "none",
      productionAssetOutput: false,
      includedInEnginePackageZip: false,
    },
    assetAuthoringPrototype: {
      schema: "agm.unity-asset-authoring-report.v0",
      status: "editor-prototype-authored",
      outputKind: "temporary-unity-project-editor-artifacts",
      outputScope: "validator-temp-unity-project-only",
      assetRoot: authoringAssetRoot,
      createdArtifacts: reportedAuthoringArtifacts,
      createsUnityTerrainAsset: true,
      createsScriptableObjectAsset: true,
      createsPrefabAsset: !failAssetAuthoring,
      createsUnityPackage: failAssetAuthoring,
      productionPluginIncluded: false,
      runtimeValidated: false,
      editorPrototypeValidated: !failAssetAuthoring && !failAssetAuthoringScope,
    },
    terrainPrototype: {
      grid: {
        width: heightfield.grid.width,
        height: heightfield.grid.height,
        sampleSpacing: heightfield.grid.sampleSpacing,
      },
      height: {
        source: manifest.terrainSource.rawEncoding,
        heightScale: "designer-defined",
        normalizedRange: manifest.terrainSource.normalizedRange,
        rawRange: manifest.terrainSource.rawRange,
      },
      raw16: {
        sampleCount: raw16Values.length,
        firstSamples: raw16Values.slice(0, 8),
        minSample: Math.min(...raw16Values),
        maxSample: Math.max(...raw16Values),
        rangeValid: true,
      },
      mapLayers: {
        resource: sampleMetadata.mapLayers.resource,
        province: sampleMetadata.mapLayers.province,
        biome: sampleMetadata.mapLayers.biome,
      },
      validatedAsPrototypeMetadataOnly: true,
    },
    runtimeImporterExecuted: true,
    dataAssetPrototypeEmitted: true,
  };
}

const args = process.argv.slice(2);
const projectPath = valueAfter(args, "-projectPath");
const logPath = valueAfter(args, "-logFile");
if (!projectPath) throw new Error("Missing -projectPath");

if (process.env.AGM_MOCK_UNITY_MODE === "compile-fail") {
  const logText = [
    "Assets/AGM/Editor/AgmAssetAuthoringPrototype.cs(12,34): error CS0103: The name 'BrokenAuthoringApi' does not exist in the current context",
    "Compiler errors have to be fixed before you can enter playmode!",
    "Script compilation failed",
    "",
  ].join("\n");
  if (logPath) fs.writeFileSync(logPath, logText);
  process.stderr.write(logText);
  process.exit(1);
}

const {packageId, packageRoot} = findPackageRoot(projectPath);
const report = createReport(packageId, packageRoot, projectPath);
const validationDir = path.join(projectPath, "Assets", "AGM", "Validation");
const editorPrototypeDir = path.join(projectPath, authoringAssetRoot);
fs.mkdirSync(validationDir, {recursive: true});
fs.mkdirSync(editorPrototypeDir, {recursive: true});
const artifactsToCreate = process.env.AGM_MOCK_UNITY_MODE === "asset-authoring-fail" ? authoringArtifacts.slice(0, 2) : authoringArtifacts;
for (const artifact of artifactsToCreate) {
  fs.writeFileSync(path.join(projectPath, artifact.path), `${artifact.kind}\n${artifact.unityType}\n`);
}
if (process.env.AGM_MOCK_UNITY_MODE === "asset-authoring-extra-output-fail") {
  const unsafePath = path.join(projectPath, "Assets", "AGM", "Unsafe", "UnreportedPrototype.asset");
  fs.mkdirSync(path.dirname(unsafePath), {recursive: true});
  fs.writeFileSync(unsafePath, "unreported unsafe authoring output\n");
}
fs.writeFileSync(path.join(validationDir, "agm-imported-package-report.json"), JSON.stringify(report, null, 2));

const logLines = [
  "AGM_UNITY_IMPORTER_CALLED",
  "AGM_UNITY_TERRAIN_PROTOTYPE_VALIDATED",
  "AGM_UNITY_DATA_ASSET_PROTOTYPE_WRITTEN",
  "AGM_UNITY_PACKAGE_COMPILE_GATE_PASSED",
];
if (process.env.AGM_MOCK_UNITY_MODE !== "package-import-smoke-fail") logLines.push("AGM_UNITY_PACKAGE_IMPORT_SMOKE_TEST_PASSED");
logLines.push("AGM_UNITY_VALIDATION_PASSED", "");
const logText = logLines.join("\n");
if (logPath) fs.writeFileSync(logPath, logText);
process.stdout.write(logText);
