#!/usr/bin/env node
import {spawnSync} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const REQUIRED_UNITY_ARTIFACTS = [
  "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt",
  "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt",
  "handoff/importers/unity/Editor/AgmImportMenu.cs.txt",
  "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt",
  "handoff/importers/unity/package-layout.json",
];

const REQUIRED_GODOT_ARTIFACTS = [
  "handoff/importers/godot/README.md",
  "handoff/importers/godot/agm_importer_stub.gd.txt",
];
const GODOT_ADDON_ROOT = "addons/agm_importers_godot";

const REQUIRED_UNREAL_ARTIFACTS = [
  "handoff/importers/unreal/README.md",
  "handoff/importers/unreal/AgmImporterStub.cpp.txt",
];
const UNREAL_PLUGIN_ROOT = "Plugins/AGMImportersUnreal";

const UNITY_SOURCE_FILES = [
  ["handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "Assets/AGM/Runtime/AgmRuntimePackageImporter.cs"],
  ["handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", "Assets/AGM/Runtime/AgmPackageTypes.cs"],
  ["handoff/importers/unity/Editor/AgmImportMenu.cs.txt", "Assets/AGM/Editor/AgmImportMenu.cs"],
  ["handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", "Assets/AGM/Editor/AgmAssetAuthoringPrototype.cs"],
];

const AUTHORING_PROTOTYPE_SOURCE = "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt";
const AUTHORING_EDITOR_API_CALLS = [
  "AssetDatabase.CreateAsset(",
  "ScriptableObject.CreateInstance(",
  "PrefabUtility.SaveAsPrefabAsset(",
];
const FORBIDDEN_UNITY_PRODUCTION_API_CALLS = [
  "UnityEditor.PackageManager",
  "AssetDatabase.ExportPackage(",
];
const AUTHORING_ASSET_ROOT = "Assets/AGM/Validation/EditorPrototypeAssets";
const UNITY_PACKAGE_ROOT = "Packages/com.agm.importers.unity";
const UNITY_PACKAGE_SCAFFOLD_FILES = [
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
];
const AUTHORING_ARTIFACTS = [
  {kind: "terrain-data", unityType: "TerrainData", path: "Assets/AGM/Validation/EditorPrototypeAssets/AgmTerrainPrototype.asset"},
  {kind: "world-scriptable-object", unityType: "AgmWorldPrototypeAsset", path: "Assets/AGM/Validation/EditorPrototypeAssets/AgmWorldPrototype.asset"},
  {kind: "prefab", unityType: "Prefab", path: "Assets/AGM/Validation/EditorPrototypeAssets/AgmWorldPrototype.prefab"},
];
const RUNTIME_IMPORT_ISSUE_SCHEMA = "agm.unity-runtime-import-issue.v0";
const RUNTIME_IMPORT_ISSUE_CODES = ["package-root-missing", "required-directory-missing", "required-file-count-mismatch", "heightfield-grid-missing", "heightfield-sample-count-mismatch", "raw16-byte-length-mismatch"];

const CHECK_DEFINITIONS = [
  "manifest-json",
  "importer-sample-metadata",
  "artifact-contract",
  "layout-version",
  "layout-required-files",
  "sample-metadata-contract",
  "unity-artifact-paths",
  "package-layout",
  "unity-layout-contract",
  "engine-stub-contracts",
  "production-plugin-boundary",
  "unity-production-importer-packaging-plan",
  "unity-production-importer-package-scaffold",
  "unity-production-importer-runtime-contract",
  "unity-package-release-candidate-review",
  "godot-production-importer-packaging-plan",
  "godot-production-addon-boundary",
  "godot-source-sample-contract",
  "godot-addon-boundary-review",
  "unreal-production-importer-packaging-plan",
  "unreal-production-plugin-boundary",
  "unreal-source-sample-contract",
  "unreal-plugin-boundary-review",
  "real-engine-smoke-records",
  "godot-cli-executable",
  "godot-smoke-readiness",
  "godot-project-created",
  "godot-source-copied",
  "godot-addon-smoke-report",
  "unity-package-compile-gate",
  "unity-package-import-smoke-test",
  "unity-runtime-issue-taxonomy",
  "no-production-plugin-claims",
  "zip-validation-disabled",
  "raw16-byte-length",
  "raw16-little-endian-decode-sample",
  "map-layer-json",
  "terrain-prototype-grid",
  "terrain-prototype-height-source",
  "terrain-prototype-raw16-range",
  "terrain-prototype-map-layer-refs",
  "unity-contract-consumed",
  "unity-package-layout-consumed",
  "unity-map-layer-records",
  "unity-map-layer-summaries",
  "unity-prototype-report-contract",
  "unity-prototype-non-asset-output",
  "unity-asset-authoring-spike-metadata",
  "unity-asset-authoring-report",
  "unity-asset-authoring-non-asset-output",
  "unity-forbidden-editor-apis-absent",
  "validation-fields-non-claiming",
  "unity-cli-executable",
  "unity-project-created",
  "unity-source-copied",
  "unity-editor-compile",
  "unity-runtime-importer-called",
  "unity-imported-package-report",
  "unity-data-asset-prototype",
];

function parseArgs(argv) {
  const args = {json: false, help: false};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--dir") args.dir = argv[++index];
    else if (arg === "--zip") args.zip = argv[++index];
    else if (arg === "--unity") args.unity = argv[++index];
    else if (arg === "--godot") args.godot = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return [
    "Usage: node scripts/validate-unity-export.mjs --dir <extracted-package-root> [--unity <Unity executable>] [--godot <Godot executable>] [--json]",
    "",
    "Validates an extracted AGM Engine Package handoff directory for manifest JSON, artifact contract, importer sample metadata, Unity source-sample layout, RAW16 terrain data, and map layer references.",
    "",
    "Workflow:",
    "  1. Export Engine Package ZIP from AGM Studio.",
    "  2. Extract the ZIP.",
    "  3. Run this script with --dir <extracted-package-root>.",
    "  4. Optionally pass --unity or set UNITY_EXECUTABLE to run Unity batchmode compile/importer checks.",
    "  5. Optionally pass --godot or set GODOT_EXECUTABLE to run Godot addon import contract smoke validation when Godot is installed.",
    "  6. If Unity or Godot is not supplied, the validator tries common install paths before falling back to structure-only validation.",
    "",
    "Notes:",
    "  - Importer files are source samples only, not production plugins.",
    "  - --zip is reserved for a future dependency-free ZIP reader; direct ZIP validation is not implemented in this milestone.",
  ].join("\n");
}

function isExecutableFile(filePath) {
  return Boolean(filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile());
}

function listUnityHubExecutables(editorRoot, executableRelativePath) {
  if (!editorRoot || !fs.existsSync(editorRoot) || !fs.statSync(editorRoot).isDirectory()) return [];
  return fs.readdirSync(editorRoot, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(editorRoot, entry.name, executableRelativePath))
    .filter(isExecutableFile)
    .sort()
    .reverse();
}

function commandPath(command) {
  const lookup = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(lookup, [command], {encoding: "utf8", timeout: 5000});
  if (result.status !== 0) return null;
  return result.stdout.split(/\r?\n/u).map(line => line.trim()).find(isExecutableFile) || null;
}

function unityExecutableSearchPlan() {
  if (process.platform === "win32") {
    const programFiles = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], "C:/Program Files", "C:/Program Files (x86)"].filter(Boolean);
    return {
      commands: ["Unity.exe", "Unity"],
      hubEditors: [...new Set(programFiles.map(root => path.join(root, "Unity", "Hub", "Editor")))],
      standaloneEditors: [...new Set(programFiles.flatMap(root => [root, path.join(root, "Unity")]))],
      executableRelativePath: path.join("Editor", "Unity.exe"),
    };
  }
  if (process.platform === "darwin") {
    return {
      commands: ["Unity"],
      hubEditors: ["/Applications/Unity/Hub/Editor"],
      standaloneEditors: ["/Applications"],
      executableRelativePath: path.join("Unity.app", "Contents", "MacOS", "Unity"),
    };
  }
  return {
    commands: ["unity-editor", "Unity", "unity"],
    hubEditors: [path.join(os.homedir(), "Unity", "Hub", "Editor")],
    standaloneEditors: ["/opt", "/usr/local", os.homedir()],
    executableRelativePath: path.join("Editor", "Unity"),
  };
}

function listStandaloneUnityExecutables(root, executableRelativePath) {
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];
  return fs.readdirSync(root, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && entry.name.toLowerCase().includes("unity"))
    .map(entry => path.join(root, entry.name, executableRelativePath))
    .filter(isExecutableFile)
    .sort()
    .reverse();
}

function findUnityExecutableCandidates(searchPlan = unityExecutableSearchPlan()) {
  const candidates = [];
  for (const editorRoot of searchPlan.hubEditors) candidates.push(...listUnityHubExecutables(editorRoot, searchPlan.executableRelativePath));
  for (const editorRoot of searchPlan.standaloneEditors || []) candidates.push(...listStandaloneUnityExecutables(editorRoot, searchPlan.executableRelativePath));
  for (const command of searchPlan.commands) {
    const pathCandidate = commandPath(command);
    if (pathCandidate) candidates.push(pathCandidate);
  }
  return [...new Set(candidates.map(candidate => path.resolve(candidate)))];
}

function resolveUnityExecutable(requestedUnityExecutable) {
  const searchPlan = unityExecutableSearchPlan();
  if (requestedUnityExecutable) return {path: requestedUnityExecutable, source: "explicit", candidates: [], searchPlan};
  if (process.env.AGM_UNITY_DISABLE_AUTO_DISCOVERY === "1" || process.env.AGM_UNITY_DISABLE_AUTO_DISCOVERY === "true") return {path: "", source: "auto-discovery-disabled", candidates: [], searchPlan};
  const candidates = findUnityExecutableCandidates(searchPlan);
  return {path: candidates[0] || "", source: candidates.length > 0 ? "auto-discovered" : "not-found", candidates, searchPlan};
}

function godotExecutableSearchPlan() {
  if (process.platform === "win32") {
    const programFiles = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], "C:/Program Files", "C:/Program Files (x86)"].filter(Boolean);
    return {
      commands: ["godot", "godot4", "Godot"],
      standaloneRoots: [...new Set([...programFiles, path.join(os.homedir(), "AppData", "Local", "Programs"), path.join(os.homedir(), "Downloads")])],
      executableNamePatterns: ["godot*.exe"],
    };
  }
  if (process.platform === "darwin") {
    return {
      commands: ["godot", "godot4", "Godot"],
      standaloneRoots: ["/Applications", path.join(os.homedir(), "Applications")],
      executableNamePatterns: ["Godot.app/Contents/MacOS/Godot", "godot*"],
    };
  }
  return {
    commands: ["godot", "godot4", "godot3"],
    standaloneRoots: ["/usr/bin", "/usr/local/bin", "/opt", os.homedir()],
    executableNamePatterns: ["godot*"],
  };
}

function godotExecutablePattern(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/gu, "\\$&").replace(/\*/gu, ".*");
  return new RegExp(`^${escaped}$`, "iu");
}

function listGodotExecutables(root, patterns) {
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];
  const matchers = patterns.map(godotExecutablePattern);
  const candidates = [];
  const stack = [root];
  while (stack.length > 0 && candidates.length < 24) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isFile() && matchers.some(pattern => pattern.test(entry.name)) && isExecutableFile(fullPath)) candidates.push(fullPath);
      else if (entry.isDirectory() && /godot/iu.test(entry.name)) stack.push(fullPath);
    }
  }
  return candidates.sort().reverse();
}

function findGodotExecutableCandidates(searchPlan = godotExecutableSearchPlan()) {
  const candidates = [];
  for (const command of searchPlan.commands) {
    const pathCandidate = commandPath(command);
    if (pathCandidate) candidates.push(pathCandidate);
  }
  for (const root of searchPlan.standaloneRoots || []) candidates.push(...listGodotExecutables(root, searchPlan.executableNamePatterns || [/godot/iu]));
  return [...new Set(candidates.map(candidate => path.resolve(candidate)))];
}

function resolveGodotExecutable(requestedGodotExecutable) {
  const searchPlan = godotExecutableSearchPlan();
  if (requestedGodotExecutable) return {path: requestedGodotExecutable, source: "explicit", candidates: [], searchPlan};
  if (process.env.AGM_GODOT_DISABLE_AUTO_DISCOVERY === "1" || process.env.AGM_GODOT_DISABLE_AUTO_DISCOVERY === "true") return {path: "", source: "auto-discovery-disabled", candidates: [], searchPlan};
  const candidates = findGodotExecutableCandidates(searchPlan);
  return {path: candidates[0] || "", source: candidates.length > 0 ? "auto-discovered" : "not-found", candidates, searchPlan};
}

function createGodotSmokeReadiness(rootDir, godotExecutableResolution, godotCliDetected, captured = false) {
  const packageRoot = rootDir ? path.resolve(rootDir) : "<extracted-package-root>";
  return {
    schema: "agm.godot-smoke-readiness.v0",
    status: captured ? "godot-smoke-captured" : (godotCliDetected ? "godot-executable-detected" : "godot-executable-unavailable"),
    smokeType: "addon-import-contract-smoke",
    executableValidated: godotCliDetected,
    executable: godotExecutableResolution.path || null,
    executableSource: godotExecutableResolution.source,
    executableCandidates: godotExecutableResolution.candidates,
    searchedCommands: godotExecutableResolution.searchPlan?.commands || [],
    searchedStandaloneRoots: godotExecutableResolution.searchPlan?.standaloneRoots || [],
    requiredForReleaseCandidate: true,
    mockOrFixtureResult: false,
    captured,
    pendingReason: captured ? "real Godot addon smoke record captured" : (godotCliDetected ? "run real Godot addon smoke validation to capture smoke record" : "Godot executable was not supplied or auto-discovered on this machine"),
    expectedCommand: `npm run validate:unity-export -- --dir ${packageRoot} --godot <Godot executable> --json`,
    expectedEnvCommand: `GODOT_EXECUTABLE=<Godot executable> npm run validate:unity-export -- --dir ${packageRoot} --json`,
    reportSchema: "agm.godot-addon-smoke-report.v0",
    expectedDeliverableRoot: GODOT_ADDON_ROOT,
  };
}

function createUnitySmokeReadiness(rootDir, unityExecutableResolution, unityCliDetected) {
  const packageRoot = rootDir ? path.resolve(rootDir) : "<extracted-package-root>";
  return {
    schema: "agm.unity-smoke-readiness.v0",
    status: unityCliDetected ? "unity-executable-detected" : "unity-executable-unavailable",
    smokeType: "batchmode-package-import-and-editor-prototype",
    executableValidated: unityCliDetected,
    executable: unityExecutableResolution.path || null,
    executableSource: unityExecutableResolution.source,
    executableCandidates: unityExecutableResolution.candidates,
    searchedCommands: unityExecutableResolution.searchPlan?.commands || [],
    searchedUnityHubEditorRoots: unityExecutableResolution.searchPlan?.hubEditors || [],
    searchedStandaloneEditorRoots: unityExecutableResolution.searchPlan?.standaloneEditors || [],
    requiredForReleaseCandidate: true,
    mockOrFixtureResult: false,
    captured: false,
    pendingReason: unityCliDetected ? "run real Unity batchmode validation to capture smoke record" : "Unity executable was not supplied or auto-discovered on this machine",
    expectedCommand: `npm run validate:unity-export -- --dir ${packageRoot} --unity <Unity executable> --json`,
    expectedEnvCommand: `UNITY_EXECUTABLE=<Unity executable> npm run validate:unity-export -- --dir ${packageRoot} --json`,
    reportSchema: "agm.unity-validation-report.v0",
  };
}

function createReport(rootDir, unityExecutableResolution, godotExecutableResolution) {
  const unityCliDetected = isExecutableFile(unityExecutableResolution.path);
  const godotCliDetected = isExecutableFile(godotExecutableResolution.path);
  return {
    schema: "agm.unity-validation-report.v0",
    packageRoot: rootDir ? path.resolve(rootDir) : undefined,
    status: "not-run",
    structureValidated: false,
    unityCliDetected,
    unityExecutable: unityExecutableResolution.path || null,
    unityExecutableSource: unityExecutableResolution.source,
    unityExecutableCandidates: unityExecutableResolution.candidates,
    unityExecutableSearch: unityExecutableResolution.searchPlan,
    unitySmokeReadiness: createUnitySmokeReadiness(rootDir, unityExecutableResolution, unityCliDetected),
    godotCliDetected,
    godotExecutable: godotExecutableResolution.path || null,
    godotExecutableSource: godotExecutableResolution.source,
    godotExecutableCandidates: godotExecutableResolution.candidates,
    godotExecutableSearch: godotExecutableResolution.searchPlan,
    godotSmokeReadiness: createGodotSmokeReadiness(rootDir, godotExecutableResolution, godotCliDetected),
    unityCompileValidated: false,
    godotSmokeCaptured: false,
    runtimeImporterExecuted: false,
    dataAssetPrototypeEmitted: false,
    terrainPrototypeValidated: false,
    runtimeValidated: false,
    editorValidated: false,
    checks: CHECK_DEFINITIONS.map(name => ({name, passed: false})),
    warnings: [],
  };
}

function setCheck(report, name, passed, detail) {
  const check = report.checks.find(item => item.name === name);
  if (!check) throw new Error(`Unknown check: ${name}`);
  check.passed = passed;
  if (detail) check.detail = detail;
}

function readJson(rootDir, relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  const text = fs.readFileSync(fullPath, "utf8");
  return {fullPath, text, value: JSON.parse(text)};
}

function assertFile(rootDir, relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) throw new Error(`Missing file: ${relativePath}`);
  return fullPath;
}

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.copyFileSync(source, target);
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, {recursive: true});
  for (const entry of fs.readdirSync(source, {withFileTypes: true})) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, targetPath);
    else if (entry.isFile()) copyFile(sourcePath, targetPath);
  }
}

function listFilesRecursive(rootDir, currentDir = rootDir) {
  const files = [];
  for (const entry of fs.readdirSync(currentDir, {withFileTypes: true})) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) files.push(...listFilesRecursive(rootDir, fullPath));
    else if (entry.isFile()) files.push(path.relative(rootDir, fullPath).split(path.sep).join("/"));
  }
  return files;
}

function assertNoUnityAssetOutputs(rootDir) {
  const forbidden = listFilesRecursive(rootDir).filter(filePath =>
    filePath.endsWith(".asset") ||
    filePath.endsWith(".prefab") ||
    filePath.endsWith(".unitypackage") ||
    filePath.endsWith(".cs") ||
    filePath === "handoff/importers/unity/package.json" ||
    filePath.endsWith("/package.json")
  );
  if (forbidden.length > 0) throw new Error(`Unity handoff must not include real Unity asset/plugin/package outputs: ${forbidden.join(", ")}`);
}

function assertForbiddenUnityEditorApisAbsent(rootDir) {
  for (const sourcePath of REQUIRED_UNITY_ARTIFACTS.filter(filePath => filePath.endsWith(".cs.txt"))) {
    const text = fs.readFileSync(assertFile(rootDir, sourcePath), "utf8");
    for (const forbiddenCall of FORBIDDEN_UNITY_PRODUCTION_API_CALLS) {
      if (text.includes(forbiddenCall)) throw new Error(`Unity source sample must not contain production editor API: ${forbiddenCall}`);
    }
    if (sourcePath !== AUTHORING_PROTOTYPE_SOURCE) {
      for (const authoringCall of AUTHORING_EDITOR_API_CALLS) {
        if (text.includes(authoringCall)) throw new Error(`Unity editor authoring API must stay isolated to ${AUTHORING_PROTOTYPE_SOURCE}: ${authoringCall}`);
      }
    }
  }
  const authoringText = fs.readFileSync(assertFile(rootDir, AUTHORING_PROTOTYPE_SOURCE), "utf8");
  for (const authoringCall of AUTHORING_EDITOR_API_CALLS) {
    if (!authoringText.includes(authoringCall)) throw new Error(`Unity editor authoring prototype source must include ${authoringCall}`);
  }
}

function assertArtifactContract(contract) {
  if (contract?.schema !== "agm.engine-package-contract.v0") throw new Error(`Unexpected artifact contract schema: ${contract?.schema}`);
  if (contract.packageFormat !== "agm.engine-package.v0") throw new Error(`Unexpected package format: ${contract.packageFormat}`);
  if (contract.layoutVersion !== 0) throw new Error(`Unexpected layout version: ${contract.layoutVersion}`);
  if (contract.manifestSchema !== "agm.engine-manifest.v0") throw new Error(`Unexpected manifest schema contract: ${contract.manifestSchema}`);
  if (contract.sampleMetadataSchema !== "agm.importer-sample-metadata.v0") throw new Error(`Unexpected sample metadata schema contract: ${contract.sampleMetadataSchema}`);
  if (contract.unityPackageLayoutSchema !== "agm.unity-package-layout.v0") throw new Error(`Unexpected Unity package layout schema contract: ${contract.unityPackageLayoutSchema}`);
  if (contract.zipParsingSupported !== false) throw new Error("Artifact contract must keep zipParsingSupported false");
  if (contract.productionPluginsIncluded !== false) throw new Error("Artifact contract must keep productionPluginsIncluded false");
  if (contract.validationMode !== "extracted-directory-only") throw new Error(`Unexpected validation mode: ${contract.validationMode}`);
}

function assertMatchingContract(actual, expected, label) {
  for (const key of ["schema", "packageFormat", "layoutVersion", "zipParsingSupported", "productionPluginsIncluded", "validationMode"]) {
    if (actual?.[key] !== expected?.[key]) throw new Error(`${label} contract mismatch for ${key}`);
  }
}

function assertProductionPluginBoundary(boundary, label) {
  if (boundary?.status !== "source-sample-and-validation-prototype-only") throw new Error(`${label} production plugin boundary status is invalid`);
  if (boundary.productionPluginsIncluded !== false) throw new Error(`${label} must not include production plugins`);
  if (boundary.compiledPluginsIncluded !== false) throw new Error(`${label} must not include compiled plugins`);
  if (boundary.enginePackagesIncluded !== false) throw new Error(`${label} must not include engine packages`);
  if (boundary.exportedUnityAssetsIncluded !== false) throw new Error(`${label} must not include exported Unity assets`);
  if (boundary.validatorTempArtifactsAreProductionAssets !== false) throw new Error(`${label} validator temp artifacts must not be production assets`);
  if (boundary.sourceSamplesMayBeAdaptedIntoPlugins !== true) throw new Error(`${label} source samples should remain adaptable into plugins`);
  if (boundary.productionizationRequiredBeforeRuntimeUse !== true) throw new Error(`${label} must require productionization before runtime use`);
  for (const extension of [".cs", ".dll", ".asmdef", ".asset", ".prefab", ".unitypackage"]) {
    if (!boundary.forbiddenExportExtensions?.includes(extension)) throw new Error(`${label} missing forbidden extension ${extension}`);
  }
  if (!boundary.forbiddenUnityPackageFiles?.includes("handoff/importers/unity/package.json")) throw new Error(`${label} must forbid Unity package.json`);
  if (boundary.validatorTempArtifactRoot !== AUTHORING_ASSET_ROOT) throw new Error(`${label} validator temp artifact root mismatch`);
  if (boundary.productionPluginStatus !== "not-included-review-required") throw new Error(`${label} production plugin status is invalid`);
}

function assertUnityProductionImporterPackageScaffold(plan, label) {
  if (plan?.scaffoldStatus !== "runtime-importer-contract-hardened") throw new Error(`${label} Unity production importer scaffold status is invalid`);
  if (plan.packageVersion !== "0.1.0-preview.1") throw new Error(`${label} Unity package scaffold version mismatch`);
  if (plan.scaffoldValidation !== "local-repository-package-files-and-runtime-importer-contract") throw new Error(`${label} Unity package scaffold validation mode mismatch`);
  for (const scaffoldFile of UNITY_PACKAGE_SCAFFOLD_FILES) {
    if (!plan.scaffoldFiles?.includes(scaffoldFile)) throw new Error(`${label} missing scaffold Unity package file ${scaffoldFile}`);
  }
  const contract = plan.runtimeImporterContract || {};
  if (contract.status !== "reads-engine-package-contract") throw new Error(`${label} Unity runtime importer contract status mismatch`);
  for (const flag of ["readsManifest", "readsPackageLayout", "readsSampleMetadata", "readsHeightfieldJson", "readsRaw16Terrain", "validatesRaw16ByteLength", "validatesHeightfieldGrid", "countsMapLayerRecords"]) {
    if (contract[flag] !== true) throw new Error(`${label} Unity runtime importer contract missing ${flag}`);
  }
  for (const layer of ["resource", "province", "biome"]) {
    if (!contract.readsMapLayers?.includes(layer)) throw new Error(`${label} Unity runtime importer contract missing map layer ${layer}`);
  }
  if (contract.productionAssetOutput !== false) throw new Error(`${label} Unity runtime importer contract must not produce assets`);
  const usageContract = contract.usageContract || {};
  if (usageContract.packageInstallMode !== "separate-unity-package") throw new Error(`${label} Unity package usage contract install mode mismatch`);
  if (usageContract.importApi !== "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage") throw new Error(`${label} Unity package usage contract import API mismatch`);
  if (usageContract.inspectApi !== "AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage") throw new Error(`${label} Unity package usage contract inspect API mismatch`);
  if (usageContract.errorContract !== "AgmImportException.Issue") throw new Error(`${label} Unity package usage contract error contract mismatch`);
  if (usageContract.runtimeCreatesAssets !== false) throw new Error(`${label} Unity package usage contract must keep runtime asset-free`);
  const releaseCandidateReview = plan.releaseCandidateReview || {};
  if (releaseCandidateReview.status !== "pre-release-candidate-checklist") throw new Error(`${label} Unity package release-candidate checklist status mismatch`);
  for (const flag of ["packageMetadataReviewed", "usageContractDocumented", "runtimeIssueTaxonomyCovered", "mockUnityFixtureRequired", "realUnityValidationRequired", "enginePackageZipBoundaryRequired"]) {
    if (releaseCandidateReview[flag] !== true) throw new Error(`${label} Unity package release-candidate checklist missing ${flag}`);
  }
  if (releaseCandidateReview.releaseCandidateReady !== false) throw new Error(`${label} Unity package must not claim release-candidate readiness yet`);
  const compileGate = plan.packageCompileGate || {};
  if (compileGate.status !== "validator-temp-unity-project-compile-gate") throw new Error(`${label} Unity package compile gate status mismatch`);
  if (compileGate.packageRoot !== UNITY_PACKAGE_ROOT) throw new Error(`${label} Unity package compile gate root mismatch`);
  for (const flag of ["packageCopiedToTempProject", "validatesPackageJson", "validatesRuntimeAsmdef", "validatesEditorAsmdef", "validatesRuntimeImporterSource", "validatesEditorSource"]) {
    if (compileGate[flag] !== true) throw new Error(`${label} Unity package compile gate missing ${flag}`);
  }
  if (compileGate.includedInEnginePackageZip !== false) throw new Error(`${label} Unity package compile gate must stay outside Engine Package ZIP`);
}

function assertUnityProductionImporterPackagingPlan(plan, label) {
  if (plan?.status !== "scaffolded-separate-deliverable") throw new Error(`${label} Unity production importer packaging plan status is invalid`);
  if (plan.packageName !== "com.agm.importers.unity") throw new Error(`${label} Unity package name mismatch`);
  if (plan.packageRoot !== "Packages/com.agm.importers.unity") throw new Error(`${label} Unity package root mismatch`);
  if (plan.distribution !== "separate-versioned-unity-package") throw new Error(`${label} Unity package distribution mismatch`);
  if (plan.includedInEnginePackageZip !== false) throw new Error(`${label} Unity production importer must not be bundled in Engine Package ZIP`);
  if (plan.requiresProductionizationReview !== true) throw new Error(`${label} Unity production importer must require productionization review`);
  if (plan.packageJsonIncludedInEnginePackage !== false) throw new Error(`${label} Unity package.json must not be included in Engine Package ZIP`);
  if (plan.asmdefIncludedInEnginePackage !== false) throw new Error(`${label} Unity asmdef files must not be included in Engine Package ZIP`);
  if (plan.compiledAssembliesIncludedInEnginePackage !== false) throw new Error(`${label} Unity compiled assemblies must not be included in Engine Package ZIP`);
  if (plan.runtimeAssembly !== "AGM.Importers.Unity.Runtime") throw new Error(`${label} Unity runtime assembly mismatch`);
  if (plan.editorAssembly !== "AGM.Importers.Unity.Editor") throw new Error(`${label} Unity editor assembly mismatch`);
  for (const plannedFile of UNITY_PACKAGE_SCAFFOLD_FILES) {
    if (!plan.plannedFiles?.includes(plannedFile)) throw new Error(`${label} missing planned Unity package file ${plannedFile}`);
  }
  for (const gate of ["artifact-contract", "package-layout", "raw16-terrain-import", "map-layer-import", "editor-asset-authoring", "unity-package-import-smoke-test", "unity-package-release-candidate-review", "no-export-zip-plugin-contamination"]) {
    if (!plan.validationGates?.includes(gate)) throw new Error(`${label} missing validation gate ${gate}`);
  }
  const smokeTest = plan.packageImportSmokeTest;
  if (smokeTest?.schema !== "agm.unity-package-import-smoke-test.v0") throw new Error(`${label} package import smoke test schema mismatch`);
  if (smokeTest?.packageImporter !== "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage") throw new Error(`${label} package import smoke test importer mismatch`);
  if (smokeTest?.includedInEnginePackageZip !== false || smokeTest?.productionAssetOutput !== false) throw new Error(`${label} package import smoke test must stay outside Engine Package ZIP asset output`);
  if (!plan.sourceSampleInputs?.includes(AUTHORING_PROTOTYPE_SOURCE)) throw new Error(`${label} must reference Unity authoring source sample input`);
  if (plan.enginePackageBoundaryRef !== "productionPluginBoundary") throw new Error(`${label} boundary reference mismatch`);
  assertUnityProductionImporterPackageScaffold(plan, label);
}

function assertGodotProductionImporterPackagingPlan(plan, label) {
  if (plan?.status !== "source-sample-scaffolded-separate-addon-review-required") throw new Error(`${label} Godot production importer plan status is invalid`);
  if (plan.scaffoldStatus !== "runtime-importer-source-sample-contract") throw new Error(`${label} Godot scaffold status mismatch`);
  if (plan.addonName !== "agm_importers_godot") throw new Error(`${label} Godot addon name mismatch`);
  if (plan.addonRoot !== GODOT_ADDON_ROOT) throw new Error(`${label} Godot addon root mismatch`);
  if (plan.distribution !== "separate-versioned-godot-addon") throw new Error(`${label} Godot distribution mismatch`);
  if (plan.targetGodotVersion !== "4.x") throw new Error(`${label} Godot target version mismatch`);
  for (const flag of ["includedInEnginePackageZip", "pluginCfgIncludedInEnginePackage", "gdScriptIncludedAsProductionAddon", "productionAddonIncluded"]) {
    if (plan[flag] !== false) throw new Error(`${label} Godot plan must keep ${flag} false`);
  }
  if (plan.requiresProductionizationReview !== true) throw new Error(`${label} Godot plan must require productionization review`);
  for (const plannedFile of ["plugin.cfg", "agm_importer.gd", "README.md"]) {
    if (!plan.plannedFiles?.includes(plannedFile)) throw new Error(`${label} Godot plan missing planned file ${plannedFile}`);
  }
  for (const sourceSample of REQUIRED_GODOT_ARTIFACTS) {
    if (!plan.sourceSampleInputs?.includes(sourceSample)) throw new Error(`${label} Godot plan missing source sample ${sourceSample}`);
  }
  const contract = plan.runtimeImporterContract || {};
  if (contract.status !== "reads-engine-package-contract-source-sample") throw new Error(`${label} Godot runtime importer contract status mismatch`);
  for (const flag of ["readsManifest", "readsSampleMetadata", "readsHeightfieldJson", "readsRaw16Terrain", "decodesRaw16LittleEndian", "countsMapLayerRecords"]) {
    if (contract[flag] !== true) throw new Error(`${label} Godot runtime importer contract missing ${flag}`);
  }
  for (const flag of ["productionAssetOutput", "createsGodotResources", "createsPackedScenes", "createsImportPlugin"]) {
    if (contract[flag] !== false) throw new Error(`${label} Godot runtime importer contract must keep ${flag} false`);
  }
  for (const gate of ["godot-source-sample-present", "godot-production-addon-boundary", "no-export-zip-plugin-contamination"]) {
    if (!plan.validationGates?.includes(gate)) throw new Error(`${label} Godot plan missing validation gate ${gate}`);
  }
  const review = plan.releaseCandidateReview || {};
  if (review.status !== "pre-addon-release-candidate-checklist") throw new Error(`${label} Godot release-candidate checklist status mismatch`);
  for (const flag of ["sourceSampleDocumented", "addonBoundaryDocumented", "realGodotValidationRequired"]) {
    if (review[flag] !== true) throw new Error(`${label} Godot release-candidate checklist missing ${flag}`);
  }
  if (review.releaseCandidateReady !== false) throw new Error(`${label} Godot addon must not claim release-candidate readiness yet`);
  if (plan.enginePackageBoundaryRef !== "productionPluginBoundary") throw new Error(`${label} Godot boundary reference mismatch`);
}

function assertNoGodotProductionAddonOutputs(rootDir) {
  const forbidden = listFilesRecursive(rootDir).filter(filePath =>
    filePath === `${GODOT_ADDON_ROOT}/plugin.cfg` ||
    filePath === `${GODOT_ADDON_ROOT}/agm_importer.gd` ||
    (filePath.startsWith(`${GODOT_ADDON_ROOT}/`) && (filePath.endsWith(".gd") || filePath.endsWith(".tscn") || filePath.endsWith(".tres") || filePath.endsWith(".res")))
  );
  if (forbidden.length > 0) throw new Error(`Godot handoff must not include production addon/plugin outputs: ${forbidden.join(", ")}`);
}

function assertGodotAddonBoundaryReview(plan, label) {
  const review = plan?.addonBoundaryReview;
  if (!review) throw new Error(`${label} Godot addon boundary review missing`);
  if (review.schema !== "agm.godot-addon-boundary-review.v0") throw new Error(`${label} Godot addon boundary review schema mismatch`);
  if (review.status !== "source-sample-boundary-verified") throw new Error(`${label} Godot addon boundary review status mismatch`);
  if (review.deliverableRoot !== GODOT_ADDON_ROOT) throw new Error(`${label} Godot addon boundary review deliverable root mismatch`);
  for (const flag of ["enginePackageZipIncludesDeliverable", "productionAddonIncluded", "pluginCfgIncludedInEnginePackage", "productionGdScriptsIncludedInEnginePackage", "resourceOutputsIncludedInEnginePackage", "sceneOutputsIncludedInEnginePackage", "releaseCandidateReady"]) {
    if (review[flag] !== false) throw new Error(`${label} Godot addon boundary review must keep ${flag} false`);
  }
  for (const flag of ["sourceSampleOnly", "realGodotSmokeRequired"]) {
    if (review[flag] !== true) throw new Error(`${label} Godot addon boundary review missing ${flag}`);
  }
}

function assertGodotSourceSampleContract(rootDir) {
  for (const artifactPath of REQUIRED_GODOT_ARTIFACTS) assertFile(rootDir, artifactPath);
  const readmeText = fs.readFileSync(assertFile(rootDir, "handoff/importers/godot/README.md"), "utf8");
  for (const requiredText of ["Production addon review target: addons/agm_importers_godot", "plugin.cfg and production .gd files are intentionally not bundled", "source sample reads manifest JSON, importer sample metadata, heightfield JSON, RAW16 little-endian height samples", "resource/province/biome map layer record counts", "Godot Resource output, PackedScene output, plugin.cfg, production .gd files, and EditorImportPlugin registration remain release-candidate work"]) {
    if (!readmeText.includes(requiredText)) throw new Error(`Godot README missing contract text: ${requiredText}`);
  }
  const stubText = fs.readFileSync(assertFile(rootDir, "handoff/importers/godot/agm_importer_stub.gd.txt"), "utf8");
  for (const requiredText of ["AGM_IMPORTER_CONTRACT", "agm.godot-importer-source-sample.v0", "PRODUCTION_ADDON_INCLUDED := false", "CREATES_GODOT_RESOURCES := false", "CREATES_PACKED_SCENES := false", "JSON.parse_string", "_decode_raw16_little_endian", "raw16_samples.size() != height_values.size()", "resource_map.get(\"tiles\", []).size()", "province_map.get(\"tiles\", []).size()", "biome_map.get(\"biomes\", []).size()", "FileAccess.open", "PackedByteArray"]) {
    if (!stubText.includes(requiredText)) throw new Error(`Godot source sample missing contract text: ${requiredText}`);
  }
  for (const forbiddenText of ["EditorImportPlugin", "ResourceSaver.save", "PackedScene", "plugin.cfg"]) {
    if (stubText.includes(forbiddenText)) throw new Error(`Godot source sample must not contain production addon/output API: ${forbiddenText}`);
  }
}

function assertUnrealProductionImporterPackagingPlan(plan, label) {
  if (plan?.status !== "source-sample-scaffolded-separate-plugin-review-required") throw new Error(`${label} Unreal production importer plan status is invalid`);
  if (plan.scaffoldStatus !== "runtime-importer-source-sample-contract") throw new Error(`${label} Unreal scaffold status mismatch`);
  if (plan.pluginName !== "AGMImportersUnreal") throw new Error(`${label} Unreal plugin name mismatch`);
  if (plan.pluginRoot !== UNREAL_PLUGIN_ROOT) throw new Error(`${label} Unreal plugin root mismatch`);
  if (plan.distribution !== "separate-versioned-unreal-plugin") throw new Error(`${label} Unreal distribution mismatch`);
  if (plan.targetUnrealVersion !== "5.x") throw new Error(`${label} Unreal target version mismatch`);
  for (const flag of ["includedInEnginePackageZip", "upluginIncludedInEnginePackage", "cppSourceIncludedAsProductionPlugin", "productionPluginIncluded"]) {
    if (plan[flag] !== false) throw new Error(`${label} Unreal plan must keep ${flag} false`);
  }
  if (plan.requiresProductionizationReview !== true) throw new Error(`${label} Unreal plan must require productionization review`);
  for (const plannedFile of ["AGMImportersUnreal.uplugin", "Source/AGMImportersUnreal/AGMImportersUnreal.Build.cs", "Source/AGMImportersUnreal/Private/AgmImporter.cpp", "README.md"]) {
    if (!plan.plannedFiles?.includes(plannedFile)) throw new Error(`${label} Unreal plan missing planned file ${plannedFile}`);
  }
  for (const sourceSample of REQUIRED_UNREAL_ARTIFACTS) {
    if (!plan.sourceSampleInputs?.includes(sourceSample)) throw new Error(`${label} Unreal plan missing source sample ${sourceSample}`);
  }
  const contract = plan.runtimeImporterContract || {};
  if (contract.status !== "reads-engine-package-contract-source-sample") throw new Error(`${label} Unreal runtime importer contract status mismatch`);
  for (const flag of ["readsManifest", "readsSampleMetadata", "readsHeightfieldJson", "readsRaw16Terrain", "decodesRaw16LittleEndian", "countsMapLayerRecords"]) {
    if (contract[flag] !== true) throw new Error(`${label} Unreal runtime importer contract missing ${flag}`);
  }
  for (const flag of ["productionAssetOutput", "createsUnrealAssets", "createsUObjects", "createsImportFactory"]) {
    if (contract[flag] !== false) throw new Error(`${label} Unreal runtime importer contract must keep ${flag} false`);
  }
  for (const gate of ["unreal-source-sample-present", "unreal-production-plugin-boundary", "no-export-zip-plugin-contamination"]) {
    if (!plan.validationGates?.includes(gate)) throw new Error(`${label} Unreal plan missing validation gate ${gate}`);
  }
  const review = plan.releaseCandidateReview || {};
  if (review.status !== "pre-plugin-release-candidate-checklist") throw new Error(`${label} Unreal release-candidate checklist status mismatch`);
  for (const flag of ["sourceSampleDocumented", "pluginBoundaryDocumented", "realUnrealValidationRequired"]) {
    if (review[flag] !== true) throw new Error(`${label} Unreal release-candidate checklist missing ${flag}`);
  }
  if (review.releaseCandidateReady !== false) throw new Error(`${label} Unreal plugin must not claim release-candidate readiness yet`);
  if (plan.enginePackageBoundaryRef !== "productionPluginBoundary") throw new Error(`${label} Unreal boundary reference mismatch`);
}

function assertNoUnrealProductionPluginOutputs(rootDir) {
  const forbidden = listFilesRecursive(rootDir).filter(filePath =>
    filePath === `${UNREAL_PLUGIN_ROOT}/AGMImportersUnreal.uplugin` ||
    filePath.startsWith(`${UNREAL_PLUGIN_ROOT}/`) ||
    filePath.endsWith(".uasset") ||
    filePath.endsWith(".umap") ||
    filePath.endsWith(".Build.cs")
  );
  if (forbidden.length > 0) throw new Error(`Unreal handoff must not include production plugin/asset outputs: ${forbidden.join(", ")}`);
}

function assertUnrealPluginBoundaryReview(plan, label) {
  const review = plan?.pluginBoundaryReview;
  if (!review) throw new Error(`${label} Unreal plugin boundary review missing`);
  if (review.schema !== "agm.unreal-plugin-boundary-review.v0") throw new Error(`${label} Unreal plugin boundary review schema mismatch`);
  if (review.status !== "source-sample-boundary-verified") throw new Error(`${label} Unreal plugin boundary review status mismatch`);
  if (review.deliverableRoot !== UNREAL_PLUGIN_ROOT) throw new Error(`${label} Unreal plugin boundary review deliverable root mismatch`);
  for (const flag of ["enginePackageZipIncludesDeliverable", "productionPluginIncluded", "upluginIncludedInEnginePackage", "buildCsIncludedInEnginePackage", "productionCppIncludedInEnginePackage", "cookedAssetsIncludedInEnginePackage", "releaseCandidateReady"]) {
    if (review[flag] !== false) throw new Error(`${label} Unreal plugin boundary review must keep ${flag} false`);
  }
  for (const flag of ["sourceSampleOnly", "realUnrealSmokeRequired"]) {
    if (review[flag] !== true) throw new Error(`${label} Unreal plugin boundary review missing ${flag}`);
  }
}

function assertRealEngineSmokeRecords(records, label) {
  if (!records) throw new Error(`${label} real engine smoke records missing`);
  if (records.schema !== "agm.real-engine-smoke-records.v0") throw new Error(`${label} real engine smoke records schema mismatch`);
  if (records.status !== "not-captured") throw new Error(`${label} real engine smoke records must stay not-captured until a real executable run is recorded`);
  if (records.releaseCandidateReady !== false) throw new Error(`${label} real engine smoke records must not mark release-candidate ready`);
  if (!Array.isArray(records.capturedEngines) || records.capturedEngines.length !== 0) throw new Error(`${label} real engine smoke records must not claim captured engines`);
  for (const engine of ["unity", "godot", "unreal"]) {
    if (!records.missingEngines?.includes(engine)) throw new Error(`${label} real engine smoke records missing engine ${engine}`);
    const record = records.records?.[engine];
    if (!record) throw new Error(`${label} real engine smoke record missing ${engine}`);
    if (record.engine !== engine) throw new Error(`${label} real engine smoke record engine mismatch for ${engine}`);
    if (record.status !== "not-captured") throw new Error(`${label} real engine smoke record must keep ${engine} not-captured`);
    if (record.requiredForReleaseCandidate !== true) throw new Error(`${label} real engine smoke record must require ${engine} for release candidate`);
    if (record.executableValidated !== false) throw new Error(`${label} real engine smoke record must not mark ${engine} executable validated`);
    if (record.mockOrFixtureResult !== false) throw new Error(`${label} real engine smoke record must not use mock/fixture result for ${engine}`);
  }
  if (records.records.unity.smokeType !== "batchmode-package-import-and-editor-prototype") throw new Error(`${label} Unity smoke record type mismatch`);
  if (!records.records.unity.expectedCommand?.includes("--unity <Unity executable>")) throw new Error(`${label} Unity smoke record command must require real executable`);
  if (records.records.unity.reportSchema !== "agm.unity-validation-report.v0") throw new Error(`${label} Unity smoke record report schema mismatch`);
  if (records.records.godot.smokeType !== "addon-import-contract-smoke" || records.records.godot.expectedDeliverableRoot !== GODOT_ADDON_ROOT || records.records.godot.reportSchema !== "agm.godot-addon-smoke-report.v0") throw new Error(`${label} Godot smoke record contract mismatch`);
  if (records.records.unreal.smokeType !== "plugin-commandlet-import-contract-smoke" || records.records.unreal.expectedDeliverableRoot !== UNREAL_PLUGIN_ROOT || records.records.unreal.reportSchema !== "agm.unreal-plugin-smoke-report.v0") throw new Error(`${label} Unreal smoke record contract mismatch`);
  if (records.nextAction !== "capture-real-engine-smoke-records") throw new Error(`${label} real engine smoke records next action mismatch`);
}

function assertUnrealSourceSampleContract(rootDir) {
  for (const artifactPath of REQUIRED_UNREAL_ARTIFACTS) assertFile(rootDir, artifactPath);
  const readmeText = fs.readFileSync(assertFile(rootDir, "handoff/importers/unreal/README.md"), "utf8");
  for (const requiredText of ["Production plugin review target: Plugins/AGMImportersUnreal", ".uplugin, Build.cs, production .cpp/.h files, and cooked Unreal assets are intentionally not bundled", "source sample reads manifest JSON, importer sample metadata, heightfield JSON, RAW16 little-endian height samples", "resource/province/biome map layer record counts", "Unreal asset output, UObject authoring, ImportFactory registration, .uasset output, and production plugin packaging remain release-candidate work"]) {
    if (!readmeText.includes(requiredText)) throw new Error(`Unreal README missing contract text: ${requiredText}`);
  }
  const stubText = fs.readFileSync(assertFile(rootDir, "handoff/importers/unreal/AgmImporterStub.cpp.txt"), "utf8");
  for (const requiredText of ["FAgmImporterSummary", "SampleMetadataPath", "HeightfieldPath", "DecodeRaw16LittleEndian", "Raw16Samples.Num() != HeightSampleCount", "ResourceRecords", "ProvinceRecords", "BiomeRecords", "CountJsonArrayItems", "FFileHelper::LoadFileToString", "FFileHelper::LoadFileToArray"]) {
    if (!stubText.includes(requiredText)) throw new Error(`Unreal source sample missing contract text: ${requiredText}`);
  }
  for (const forbiddenText of ["UFactory", "UObject", "CreatePackage", "UPackage::SavePackage", ".uplugin"]) {
    if (stubText.includes(forbiddenText)) throw new Error(`Unreal source sample must not contain production plugin/asset API: ${forbiddenText}`);
  }
}

function assertUnityProductionImporterPackageScaffoldFiles(repoRoot) {
  const packageRoot = path.join(repoRoot, UNITY_PACKAGE_ROOT);
  for (const scaffoldFile of UNITY_PACKAGE_SCAFFOLD_FILES) {
    const fullPath = path.join(packageRoot, scaffoldFile);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) throw new Error(`Missing Unity package scaffold file: ${path.join(UNITY_PACKAGE_ROOT, scaffoldFile).split(path.sep).join("/")}`);
  }
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  if (packageJson.name !== "com.agm.importers.unity") throw new Error("Unity package scaffold package name mismatch");
  if (packageJson.version !== "0.1.0-preview.1") throw new Error("Unity package scaffold package version mismatch");
  for (const keyword of ["agm", "engine-package", "unity-importer", "runtime-importer", "terrain", "world-generation"]) {
    if (!packageJson.keywords?.includes(keyword)) throw new Error(`Unity package scaffold package keyword missing: ${keyword}`);
  }
  if (packageJson.documentationUrl !== "https://docs.unity3d.com/2022.3/Documentation/Manual/upm-ui-local.html") throw new Error("Unity package scaffold documentation URL mismatch");
  const packageReadme = fs.readFileSync(path.join(packageRoot, "README.md"), "utf8");
  for (const requiredText of ["AGM Unity Importers", "Engine Package Importer", "Inspect Unpacked Engine Package", "Import Unpacked Engine Package", "status and diagnostics", "changing the folder clears the inspection", "Sample walkthrough", "AGM Engine Package ZIP", "Add package from disk", "Packages/com.agm.importers.unity/package.json", "Production asset output: False", "Packaging checklist", "mock Unity fixture automation", "Engine Package ZIP exports must remain source-sample-only"]) {
    if (!packageReadme.includes(requiredText)) throw new Error(`Unity package README missing: ${requiredText}`);
  }
  const fixtureReadme = fs.readFileSync(path.join(packageRoot, "Samples~/ImporterFixture/README.md"), "utf8");
  for (const requiredText of ["Usage contract", "Unity menu workflow", "Engine Package Importer", "Import is disabled until the selected folder has inspected successfully", "Fixture walkthrough", "Unity Package Manager's local package flow", "run `Inspect`, then run `Import`", "no production asset output", "Inspect Unpacked Engine Package", "Release-candidate checklist", "AgmImportException.Issue", "real Unity executable validation pass"]) {
    if (!fixtureReadme.includes(requiredText)) throw new Error(`Unity package fixture README missing: ${requiredText}`);
  }
  const runtimeAsmdef = JSON.parse(fs.readFileSync(path.join(packageRoot, "Runtime/AGM.Importers.Unity.Runtime.asmdef"), "utf8"));
  const editorAsmdef = JSON.parse(fs.readFileSync(path.join(packageRoot, "Editor/AGM.Importers.Unity.Editor.asmdef"), "utf8"));
  const editorMenu = fs.readFileSync(path.join(packageRoot, "Editor/AgmImportMenu.cs"), "utf8");
  const importerWindow = fs.readFileSync(path.join(packageRoot, "Editor/AgmImporterWindow.cs"), "utf8");
  if (runtimeAsmdef.name !== "AGM.Importers.Unity.Runtime") throw new Error("Unity runtime asmdef name mismatch");
  if (editorAsmdef.name !== "AGM.Importers.Unity.Editor") throw new Error("Unity editor asmdef name mismatch");
  if (!editorAsmdef.references?.includes("AGM.Importers.Unity.Runtime")) throw new Error("Unity editor asmdef must reference runtime asmdef");
  for (const requiredSnippet of [
    "AGM/Inspect Unpacked Engine Package...",
    "AGM/Import Unpacked Engine Package...",
    "AgmRuntimePackageImporter.InspectUnpackedPackage(packageRoot)",
    "AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot)",
    "AgmImporterWindow.FormatImportSummary(imported)",
  ]) {
    if (!editorMenu.includes(requiredSnippet)) throw new Error(`Unity editor menu missing production package UX snippet: ${requiredSnippet}`);
  }
  for (const requiredSnippet of [
    "AgmImporterWindow",
    "EditorWindow",
    "AGM/Engine Package Importer",
    "Select an extracted AGM Engine Package folder",
    "Package Folder",
    "Browse",
    "StatusText()",
    "inspect required before import",
    "CanImportInspectedPackage()",
    "ClearInspection()",
    "FormatImportSummary(AgmImportedPackage imported)",
    "EditorGUI.DisabledScope(!CanImportInspectedPackage())",
    "InspectPackage()",
    "ImportPackage()",
    "Diagnostics",
    "Production asset output",
    "FormatIssue(AgmImportIssue issue)",
  ]) {
    if (!importerWindow.includes(requiredSnippet)) throw new Error(`Unity importer window missing UX snippet: ${requiredSnippet}`);
  }
  for (const forbiddenSnippet of ["AssetDatabase.CreateAsset(", "PrefabUtility.SaveAsPrefabAsset(", "AssetDatabase.ExportPackage("]) {
    if (editorMenu.includes(forbiddenSnippet) || importerWindow.includes(forbiddenSnippet)) throw new Error(`Unity editor import UI must not author production assets: ${forbiddenSnippet}`);
  }
}

function validateUnityPackageCompileGateSummary(summary) {
  if (!summary) return {passed: false, detail: "Unity package compile gate report missing"};
  if (summary.schema !== "agm.unity-package-compile-gate.v0") return {passed: false, detail: "Unity package compile gate schema mismatch"};
  if (summary.packageName !== "com.agm.importers.unity") return {passed: false, detail: "Unity package compile gate package name mismatch"};
  if (summary.packageRoot !== UNITY_PACKAGE_ROOT) return {passed: false, detail: "Unity package compile gate package root mismatch"};
  if (summary.packageVersion !== "0.1.0-preview.1") return {passed: false, detail: "Unity package compile gate package version mismatch"};
  if (summary.includedInEnginePackageZip !== false) return {passed: false, detail: "Unity package compile gate must not mark package as exported"};
  for (const filePath of UNITY_PACKAGE_SCAFFOLD_FILES) {
    if (!summary.compiledFiles?.includes(filePath)) return {passed: false, detail: `Unity package compile gate missing ${filePath}`};
  }
  for (const assemblyName of ["AGM.Importers.Unity.Runtime", "AGM.Importers.Unity.Editor"]) {
    if (!summary.assemblies?.includes(assemblyName)) return {passed: false, detail: `Unity package compile gate missing assembly ${assemblyName}`};
  }
  return {passed: true, detail: "Unity package scaffold copied into temp project and compile gate report validated"};
}

function validateRuntimeImportIssueSummary(summary) {
  if (!summary) return {passed: true, detail: "runtime issue taxonomy available; no import issue reported"};
  if (summary.schema !== RUNTIME_IMPORT_ISSUE_SCHEMA) return {passed: false, detail: "Runtime import issue schema mismatch"};
  if (!RUNTIME_IMPORT_ISSUE_CODES.includes(summary.code)) return {passed: false, detail: `Runtime import issue code unsupported: ${summary.code}`};
  if (typeof summary.message !== "string" || summary.message.length === 0) return {passed: false, detail: "Runtime import issue message missing"};
  if (typeof summary.expected !== "string" || summary.expected.length === 0) return {passed: false, detail: "Runtime import issue expected value missing"};
  if (typeof summary.actual !== "string" || summary.actual.length === 0) return {passed: false, detail: "Runtime import issue actual value missing"};
  return {passed: false, detail: `${summary.code}: ${summary.message}`};
}

function validateUnityPackageImportSmokeTestSummary(summary) {
  if (!summary) return {passed: false, detail: "Unity package import smoke test report missing"};
  if (summary.schema !== "agm.unity-package-import-smoke-test.v0") return {passed: false, detail: "Unity package import smoke test schema mismatch"};
  if (summary.status !== "package-importer-consumed-engine-package") return {passed: false, detail: "Unity package import smoke test status mismatch"};
  if (summary.packageName !== "com.agm.importers.unity") return {passed: false, detail: "Unity package import smoke test package name mismatch"};
  if (summary.packageRoot !== UNITY_PACKAGE_ROOT) return {passed: false, detail: "Unity package import smoke test package root mismatch"};
  if (summary.importer !== "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage") return {passed: false, detail: "Unity package import smoke test importer mismatch"};
  if (summary.runtimeApi !== "AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage") return {passed: false, detail: "Unity package import smoke test runtime API mismatch"};
  if (summary.runtimeReportSchema !== "agm.unity-runtime-import-report.v0") return {passed: false, detail: "Unity package import smoke test runtime report schema mismatch"};
  if (!summary.sourceSampleSummary || !summary.packageImporterSummary) return {passed: false, detail: "Unity package import smoke test diagnostics missing"};
  for (const flag of ["packageIdMatches", "heightSampleCountMatches", "gridMatches", "raw16Matches", "mapLayerRecordsMatch"]) {
    if (summary[flag] !== true) return {passed: false, detail: summary.mismatchDetail || `Unity package import smoke test failed ${flag}`};
  }
  if (summary.mismatchDetail !== "none") return {passed: false, detail: summary.mismatchDetail || "Unity package import smoke test mismatch detail invalid"};
  if (summary.productionAssetOutput !== false || summary.includedInEnginePackageZip !== false) return {passed: false, detail: "Unity package import smoke test must not emit production assets or enter Engine Package ZIP"};
  return {passed: true, detail: "Unity package importer consumed Engine Package data and matched source sample importer"};
}

function assertUnityProductionImporterRuntimeContract(repoRoot) {
  const runtimeImporter = fs.readFileSync(path.join(repoRoot, UNITY_PACKAGE_ROOT, "Runtime/AgmRuntimePackageImporter.cs"), "utf8");
  const runtimeTypes = fs.readFileSync(path.join(repoRoot, UNITY_PACKAGE_ROOT, "Runtime/AgmPackageTypes.cs"), "utf8");
  for (const requiredSnippet of [
    "FindRequiredFile(packageRoot, \"manifest\", \".agm-engine-manifest.json\")",
    "handoff",
    "package-layout.json",
    "importer-sample-metadata.json",
    ".agm-heightfield.json",
    ".agm-heightmap-r16.raw",
    ".agm-resource-map.json",
    ".agm-province-map.json",
    ".agm-biome-map.json",
    "DecodeUInt16LittleEndian(rawBytes)",
    "rawBytes.Length != expectedRawBytes",
    "gridWidth * gridHeight != heightfieldSampleCount",
    "ThrowImportIssue(AgmImportIssueCode.PackageRootMissing",
    "ThrowImportIssue(AgmImportIssueCode.RequiredDirectoryMissing",
    "ThrowImportIssue(AgmImportIssueCode.RequiredFileCountMismatch",
    "ThrowImportIssue(AgmImportIssueCode.HeightfieldGridMissing",
    "ThrowImportIssue(AgmImportIssueCode.HeightfieldSampleCountMismatch",
    "ThrowImportIssue(AgmImportIssueCode.Raw16ByteLengthMismatch",
    "CountArrayItems(resourceMapJson",
    "CountArrayItems(provinceMapJson",
    "CountArrayItems(biomeMapJson",
    "InspectUnpackedPackage(string packageRoot)",
    "CreateImportSummary(AgmImportedPackage imported)",
  ]) {
    if (!runtimeImporter.includes(requiredSnippet)) throw new Error(`Unity runtime importer missing contract snippet: ${requiredSnippet}`);
  }
  for (const requiredType of ["Raw16Heights", "ResourceLayerRecordCount", "ProvinceLayerRecordCount", "BiomeLayerRecordCount", "ArtifactContractSchema", "PackageFormat", "ValidationMode", "AgmImportIssueCode", "AgmImportIssue", "AgmImportException", "agm.unity-runtime-import-issue.v0", "PackageRootMissing", "RequiredDirectoryMissing", "RequiredFileCountMismatch", "HeightfieldGridMissing", "HeightfieldSampleCountMismatch", "Raw16ByteLengthMismatch", "AgmPackageImportSummary", "AgmImportReport", "ProductionAssetOutput"]) {
    if (!runtimeTypes.includes(requiredType)) throw new Error(`Unity runtime package types missing field: ${requiredType}`);
  }
  for (const forbiddenSnippet of ["using UnityEditor", "AssetDatabase.CreateAsset(", "PrefabUtility.SaveAsPrefabAsset(", "UnityEditor.PackageManager", "AssetDatabase.ExportPackage("]) {
    if (runtimeImporter.includes(forbiddenSnippet)) throw new Error(`Unity runtime importer must not use editor/package API: ${forbiddenSnippet}`);
  }
}

function validateNonClaimingFields(manifest, sampleMetadata) {
  const handoff = manifest.importerHandoff || {};
  const spike = handoff.unityRuntimeImporterSpike || {};
  const harness = handoff.unityValidationHarness || {};
  const metadataHarness = sampleMetadata.unityValidationHarness || {};
  if (spike.runtimeValidated !== false) throw new Error("unityRuntimeImporterSpike.runtimeValidated must remain false");
  if (spike.editorValidated !== false) throw new Error("unityRuntimeImporterSpike.editorValidated must remain false");
  if (spike.createsUnityProject !== false) throw new Error("unityRuntimeImporterSpike.createsUnityProject must remain false");
  if (harness.runtimeValidated !== false) throw new Error("unityValidationHarness.runtimeValidated must remain false");
  if (harness.editorValidated !== false) throw new Error("unityValidationHarness.editorValidated must remain false");
  if (harness.createsUnityProject !== false) throw new Error("unityValidationHarness.createsUnityProject must remain false");
  if (metadataHarness.runtimeValidated !== false) throw new Error("sample metadata runtimeValidated must remain false");
  if (metadataHarness.editorValidated !== false) throw new Error("sample metadata editorValidated must remain false");
}

function findFilePath(manifest, kind, fallback) {
  const file = manifest.importerHandoff?.entryFiles?.find(entry => entry.kind === kind);
  return file?.path || fallback;
}

function decodeRaw16Sample(rawBytes) {
  const count = Math.min(8, Math.floor(rawBytes.length / 2));
  const values = [];
  for (let index = 0; index < count; index += 1) {
    values.push(rawBytes[index * 2] | (rawBytes[index * 2 + 1] << 8));
  }
  return values;
}

function decodeRaw16Stats(rawBytes) {
  let min = 65535;
  let max = 0;
  const count = Math.floor(rawBytes.length / 2);
  for (let index = 0; index < count; index += 1) {
    const value = rawBytes[index * 2] | (rawBytes[index * 2 + 1] << 8);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return {count, min: count > 0 ? min : 0, max: count > 0 ? max : 0};
}

function validateArtifactContractPrototype(summary) {
  return summary?.schema === "agm.engine-package-contract.v0" &&
    summary.packageFormat === "agm.engine-package.v0" &&
    summary.layoutVersion === 0 &&
    summary.zipParsingSupported === false &&
    summary.productionPluginIncluded === false &&
    summary.validationMode === "extracted-directory-only" &&
    summary.consumedByUnitySourceSample === true;
}

function validateMapLayerPrototype(summary, expected) {
  if (summary?.validatedAsPrototypeMetadataOnly !== true) return false;
  for (const key of ["resource", "province", "biome"]) {
    if (summary[key]?.path !== expected?.[key]?.path) return false;
    if (summary[key]?.recordCount !== expected[key].recordCount) return false;
    if (summary[key]?.summary !== expected[key].summary) return false;
  }
  return true;
}

function validatePrototypeOutput(summary) {
  return summary?.kind === "metadata-json-only" &&
    summary.createsUnityTerrainAsset === false &&
    summary.createsScriptableObjectAsset === false &&
    summary.productionPluginIncluded === false;
}

function validateAssetAuthoringSpike(spike) {
  return spike?.status === "editor-source-sample-prototype" &&
    spike.schema === "agm.unity-asset-authoring-plan.v0" &&
    spike.sourceScript === AUTHORING_PROTOTYPE_SOURCE &&
    spike.outputKind === "temporary-unity-project-editor-artifacts" &&
    spike.outputScope === "validator-temp-unity-project-only" &&
    spike.reportBlock === "assetAuthoringPrototype" &&
    Array.isArray(spike.intendedArtifacts) &&
    spike.intendedArtifacts.length === 3 &&
    spike.intendedArtifacts.every(artifact => artifact?.exportedAssetIncluded === false && artifact?.validatorTempProjectCreatesAsset === true) &&
    spike.exportedAssetsIncluded === false &&
    spike.createsUnityTerrainAssetInExport === false &&
    spike.createsScriptableObjectAssetInExport === false &&
    spike.createsPrefabAssetInExport === false &&
    spike.createsUnityTerrainAsset === false &&
    spike.createsScriptableObjectAsset === false &&
    spike.createsPrefabAsset === false &&
    spike.createsUnityPackage === false &&
    spike.productionPluginIncluded === false &&
    spike.runtimeValidated === false &&
    spike.editorValidated === false;
}

function validateAuthoringFilesystemScope(projectRoot) {
  if (!projectRoot) return {passed: true, detail: "filesystem scope not checked without project root"};

  const expectedPaths = new Set(AUTHORING_ARTIFACTS.map(artifact => artifact.path));
  const assetRoot = path.join(projectRoot, "Assets", "AGM");
  if (!fs.existsSync(assetRoot)) return {passed: false, detail: "Assets/AGM root missing for authoring artifact scope check"};

  const authoredOutputs = listFilesRecursive(assetRoot)
    .map(filePath => `Assets/AGM/${filePath}`)
    .filter(filePath => filePath.endsWith(".asset") || filePath.endsWith(".prefab") || filePath.endsWith(".unitypackage"));
  const unexpected = authoredOutputs.filter(filePath => !expectedPaths.has(filePath));
  if (unexpected.length > 0) return {passed: false, detail: `unexpected Unity authoring artifact output: ${unexpected.join(", ")}`};

  return {passed: true, detail: `filesystem scope contains only ${expectedPaths.size} expected editor prototype artifacts`};
}

function validateAssetAuthoringPrototype(summary, projectRoot) {
  if (summary?.schema !== "agm.unity-asset-authoring-report.v0") return {passed: false, detail: `invalid schema: ${summary?.schema || "missing"}`};
  if (summary.status !== "editor-prototype-authored") return {passed: false, detail: `invalid status: ${summary.status}`};
  if (summary.outputKind !== "temporary-unity-project-editor-artifacts") return {passed: false, detail: `invalid outputKind: ${summary.outputKind}`};
  if (summary.outputScope !== "validator-temp-unity-project-only") return {passed: false, detail: `invalid outputScope: ${summary.outputScope}`};
  if (summary.assetRoot !== AUTHORING_ASSET_ROOT) return {passed: false, detail: `invalid assetRoot: ${summary.assetRoot}`};
  if (!Array.isArray(summary.createdArtifacts)) return {passed: false, detail: "createdArtifacts missing"};
  if (summary.createdArtifacts.length !== AUTHORING_ARTIFACTS.length) return {passed: false, detail: `expected ${AUTHORING_ARTIFACTS.length} artifacts, got ${summary.createdArtifacts.length}`};
  const seenPaths = new Set();
  for (const expected of AUTHORING_ARTIFACTS) {
    const actual = summary.createdArtifacts.find(artifact => artifact?.kind === expected.kind);
    if (!actual) return {passed: false, detail: `missing ${expected.kind} artifact`};
    if (actual.unityType !== expected.unityType) return {passed: false, detail: `${expected.kind} unityType mismatch: ${actual.unityType}`};
    if (actual.path !== expected.path) return {passed: false, detail: `${expected.kind} path mismatch: ${actual.path}`};
    if (!actual.path.startsWith(`${AUTHORING_ASSET_ROOT}/`)) return {passed: false, detail: `${expected.kind} path outside authoring root: ${actual.path}`};
    if (seenPaths.has(actual.path)) return {passed: false, detail: `duplicate artifact path: ${actual.path}`};
    seenPaths.add(actual.path);
    if (projectRoot && !fs.existsSync(path.join(projectRoot, actual.path))) return {passed: false, detail: `${expected.kind} artifact file missing: ${actual.path}`};
  }
  if (summary.createsUnityTerrainAsset !== true) return {passed: false, detail: "createsUnityTerrainAsset must be true"};
  if (summary.createsScriptableObjectAsset !== true) return {passed: false, detail: "createsScriptableObjectAsset must be true"};
  if (summary.createsPrefabAsset !== true) return {passed: false, detail: "createsPrefabAsset must be true"};
  if (summary.createsUnityPackage !== false) return {passed: false, detail: "createsUnityPackage must remain false"};
  if (summary.productionPluginIncluded !== false) return {passed: false, detail: "productionPluginIncluded must remain false"};
  if (summary.runtimeValidated !== false) return {passed: false, detail: "runtimeValidated must remain false"};
  if (summary.editorPrototypeValidated !== true) return {passed: false, detail: "editorPrototypeValidated must be true"};
  return {passed: true, detail: `validated ${AUTHORING_ARTIFACTS.length} scoped editor prototype artifacts`};
}

function validateTerrainPrototypeSummary(terrainPrototype, layerPaths) {
  const grid = terrainPrototype?.grid || {};
  const height = terrainPrototype?.height || {};
  const raw16 = terrainPrototype?.raw16 || {};
  const mapLayers = terrainPrototype?.mapLayers || {};
  const gridValid = Number.isInteger(grid.width) && grid.width > 0 && Number.isInteger(grid.height) && grid.height > 0 && grid.width * grid.height === raw16.sampleCount && grid.sampleSpacing === 1;
  const heightValid = height.source === "uint16-little-endian" && height.heightScale === "designer-defined" && height.normalizedRange?.min === 0 && height.normalizedRange?.max === 100 && height.rawRange?.min === 0 && height.rawRange?.max === 65535;
  const rawValid = Number.isInteger(raw16.minSample) && Number.isInteger(raw16.maxSample) && raw16.minSample >= 0 && raw16.maxSample <= 65535 && raw16.rangeValid === true;
  const layerValid = mapLayers.resource === layerPaths[0] && mapLayers.province === layerPaths[1] && mapLayers.biome === layerPaths[2];
  return {gridValid, heightValid, rawValid, layerValid};
}

function summarizeUnityDiagnostics(text) {
  return text
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => /error CS|Compiler errors|Script compilation failed|Exception|AGM_UNITY_VALIDATION_FAILED|Asset authoring|failed/i.test(line))
    .filter((line, index, lines) => line && lines.indexOf(line) === index)
    .slice(0, 12);
}

function createUnityBatchmodeScript(packageId) {
  const escapedPackageId = JSON.stringify(packageId || "Package");
  return [
    "using System;",
    "using System.IO;",
    "using System.Text;",
    "using UnityEditor;",
    "using UnityEngine;",
    "",
    "public static class AgmValidationBatchmode",
    "{",
    "    public static void Run()",
    "    {",
    "        if (EditorUtility.scriptCompilationFailed)",
    "        {",
    "            throw new Exception(\"AGM Unity script compilation failed.\");",
    "        }",
    `        var packageRoot = Path.Combine(Application.dataPath, "AGM", "Samples", ${escapedPackageId});`,
    "        var imported = AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot);",
    "        var packageImportReport = AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage(packageRoot);",
    "        var packageImported = AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage(packageRoot);",
    "        var packageImporterSummary = packageImportReport.Summary;",
    "        if (packageImportReport.Schema != \"agm.unity-runtime-import-report.v0\") throw new Exception(\"AGM package import report schema mismatch.\");",
    "        if (packageImportReport.Raw16LengthMatchesHeightfield != true) throw new Exception(\"AGM package import report RAW16 length mismatch.\");",
    "        if (packageImportReport.ProductionAssetOutput != false) throw new Exception(\"AGM package import report must not emit production assets.\");",
    "        if (string.IsNullOrEmpty(imported.PackageId)) throw new Exception(\"AGM package id is missing.\");",
    "        if (string.IsNullOrEmpty(imported.PackageName)) throw new Exception(\"AGM package name is missing.\");",
    "        if (imported.HeightSampleCount <= 0) throw new Exception(\"AGM height sample count is empty.\");",
    "        if (imported.Raw16Heights == null) throw new Exception(\"AGM RAW16 heights are missing.\");",
    "        if (imported.Raw16Heights.Length != imported.HeightSampleCount) throw new Exception(\"AGM RAW16 height count does not match heightfield sample count.\");",
    "        if (imported.GridWidth <= 0) throw new Exception(\"AGM terrain grid width is missing.\");",
    "        if (imported.GridHeight <= 0) throw new Exception(\"AGM terrain grid height is missing.\");",
    "        if (imported.GridWidth * imported.GridHeight != imported.HeightSampleCount) throw new Exception(\"AGM terrain grid does not match height sample count.\");",
    "        if (imported.SampleSpacing <= 0) throw new Exception(\"AGM terrain sample spacing is missing.\");",
    "        if (imported.Raw16MinSample < 0) throw new Exception(\"AGM RAW16 minimum sample is invalid.\");",
    "        if (imported.Raw16MaxSample > 65535) throw new Exception(\"AGM RAW16 maximum sample is invalid.\");",
    "        if (imported.NormalizedMin != 0) throw new Exception(\"AGM normalized terrain minimum must be 0.\");",
    "        if (imported.NormalizedMax != 100) throw new Exception(\"AGM normalized terrain maximum must be 100.\");",
    "        if (string.IsNullOrEmpty(imported.HeightScale)) throw new Exception(\"AGM terrain height scale is missing.\");",
    "        if (string.IsNullOrEmpty(imported.HeightSource)) throw new Exception(\"AGM terrain height source is missing.\");",
    "        if (imported.ArtifactContractSchema != \"agm.engine-package-contract.v0\") throw new Exception(\"AGM artifact contract schema was not consumed.\");",
    "        if (imported.PackageFormat != \"agm.engine-package.v0\") throw new Exception(\"AGM package format was not consumed.\");",
    "        if (imported.LayoutVersion != 0) throw new Exception(\"AGM layout version was not consumed.\");",
    "        if (imported.ZipParsingSupported != false) throw new Exception(\"AGM ZIP parsing must remain disabled.\");",
    "        if (imported.ProductionPluginIncluded != false) throw new Exception(\"AGM package must not claim a production plugin.\");",
    "        if (imported.ValidationMode != \"extracted-directory-only\") throw new Exception(\"AGM validation mode must be extracted-directory-only.\");",
    "        if (imported.ResourceLayerRecordCount <= 0) throw new Exception(\"AGM resource layer records are missing.\");",
    "        if (imported.ProvinceLayerRecordCount <= 0) throw new Exception(\"AGM province layer records are missing.\");",
    "        if (imported.BiomeLayerRecordCount <= 0) throw new Exception(\"AGM biome layer records are missing.\");",
    "        if (imported.ResourceLayerSummary.EndsWith(\"missing\")) throw new Exception(\"AGM resource layer summary is missing.\");",
    "        if (imported.ProvinceLayerSummary.EndsWith(\"missing\")) throw new Exception(\"AGM province layer summary is missing.\");",
    "        if (imported.BiomeLayerSummary.EndsWith(\"missing\")) throw new Exception(\"AGM biome layer summary is missing.\");",
    "        if (string.IsNullOrEmpty(imported.ResourceLayerPath)) throw new Exception(\"AGM resource layer path is missing.\");",
    "        if (string.IsNullOrEmpty(imported.ProvinceLayerPath)) throw new Exception(\"AGM province layer path is missing.\");",
    "        if (string.IsNullOrEmpty(imported.BiomeLayerPath)) throw new Exception(\"AGM biome layer path is missing.\");",
    "        if (imported.AssetAuthoringPlanSchema != \"agm.unity-asset-authoring-plan.v0\") throw new Exception(\"AGM asset authoring plan schema was not consumed.\");",
    "        if (imported.AssetAuthoringOutputKind != \"temporary-unity-project-editor-artifacts\") throw new Exception(\"AGM asset authoring output kind must target temporary editor artifacts.\");",
    "        if (imported.AssetAuthoringReportBlock != \"assetAuthoringPrototype\") throw new Exception(\"AGM asset authoring report block is invalid.\");",
    "        if (imported.PlannedUnityArtifactCount != 3) throw new Exception(\"AGM planned Unity artifact count is invalid.\");",
    "        if (imported.ExportedAssetsIncluded || imported.CreatesUnityTerrainAssetInExport || imported.CreatesScriptableObjectAssetInExport || imported.CreatesPrefabAssetInExport || imported.CreatesUnityPackage) throw new Exception(\"AGM export package must not include Unity authored assets.\");",
    "        if (imported.UsesAssetDatabaseCreateAsset || imported.UsesScriptableObjectCreateInstance || imported.UsesUnityPackageManager) throw new Exception(\"AGM runtime importer must not use Unity editor asset APIs.\");",
    "        if (packageImported.PackageId != imported.PackageId) throw new Exception(\"AGM package importer package id mismatch.\");",
    "        if (packageImported.HeightSampleCount != imported.HeightSampleCount) throw new Exception(\"AGM package importer height sample count mismatch.\");",
    "        if (packageImported.GridWidth != imported.GridWidth || packageImported.GridHeight != imported.GridHeight) throw new Exception(\"AGM package importer grid mismatch.\");",
    "        if (packageImported.Raw16Heights == null || packageImported.Raw16Heights.Length != imported.Raw16Heights.Length) throw new Exception(\"AGM package importer RAW16 mismatch.\");",
    "        if (packageImported.ResourceLayerRecordCount != imported.ResourceLayerRecordCount || packageImported.ProvinceLayerRecordCount != imported.ProvinceLayerRecordCount || packageImported.BiomeLayerRecordCount != imported.BiomeLayerRecordCount) throw new Exception(\"AGM package importer map layer record mismatch.\");",
    "        Debug.Log(\"AGM_UNITY_IMPORTER_CALLED\");",
    "        Debug.Log(\"AGM_UNITY_PACKAGE_IMPORT_SMOKE_TEST_PASSED\");",
    "",
    "        var validationDirectory = Path.Combine(Application.dataPath, \"AGM\", \"Validation\");",
    "        Directory.CreateDirectory(validationDirectory);",
    "        var authoringRoot = \"Assets/AGM/Validation/EditorPrototypeAssets\";",
    "        AgmAssetAuthoringPrototype.AuthorTemporaryEditorPrototypeAssets(imported, authoringRoot);",
    "        var sampleCount = Math.Min(8, imported.Raw16Heights.Length);",
    "        var samples = new StringBuilder();",
    "        for (var i = 0; i < sampleCount; i++)",
    "        {",
    "            if (i > 0) samples.Append(\",\");",
    "            samples.Append(imported.Raw16Heights[i]);",
    "        }",
    "        var sourceSampleSummaryJson = \"{\" +",
    "            \"\\\"packageId\\\":\" + JsonString(imported.PackageId) + \",\" +",
    "            \"\\\"heightSampleCount\\\":\" + imported.HeightSampleCount + \",\" +",
    "            \"\\\"grid\\\":\" + JsonString(imported.GridWidth + \"x\" + imported.GridHeight) + \",\" +",
    "            \"\\\"raw16SampleCount\\\":\" + imported.Raw16Heights.Length + \",\" +",
    "            \"\\\"resourceRecords\\\":\" + imported.ResourceLayerRecordCount + \",\" +",
    "            \"\\\"provinceRecords\\\":\" + imported.ProvinceLayerRecordCount + \",\" +",
    "            \"\\\"biomeRecords\\\":\" + imported.BiomeLayerRecordCount +",
    "            \"}\";",
    "        var packageImporterSummaryJson = \"{\" +",
    "            \"\\\"packageId\\\":\" + JsonString(packageImporterSummary.PackageId) + \",\" +",
    "            \"\\\"heightSampleCount\\\":\" + packageImporterSummary.HeightSampleCount + \",\" +",
    "            \"\\\"grid\\\":\" + JsonString(packageImporterSummary.Grid) + \",\" +",
    "            \"\\\"raw16SampleCount\\\":\" + packageImporterSummary.Raw16SampleCount + \",\" +",
    "            \"\\\"resourceRecords\\\":\" + packageImporterSummary.ResourceRecords + \",\" +",
    "            \"\\\"provinceRecords\\\":\" + packageImporterSummary.ProvinceRecords + \",\" +",
    "            \"\\\"biomeRecords\\\":\" + packageImporterSummary.BiomeRecords +",
    "            \"}\";",
    "        var reportJson = \"{\" +",
    "            \"\\\"schema\\\":\\\"agm.unity-imported-package-report.v0\\\",\" +",
    "            \"\\\"packageId\\\":\" + JsonString(imported.PackageId) + \",\" +",
    "            \"\\\"packageName\\\":\" + JsonString(imported.PackageName) + \",\" +",
    "            \"\\\"heightSampleCount\\\":\" + imported.HeightSampleCount + \",\" +",
    "            \"\\\"firstRaw16Samples\\\":[\" + samples + \"],\" +",
    "            \"\\\"resourceLayerPath\\\":\" + JsonString(imported.ResourceLayerPath) + \",\" +",
    "            \"\\\"provinceLayerPath\\\":\" + JsonString(imported.ProvinceLayerPath) + \",\" +",
    "            \"\\\"biomeLayerPath\\\":\" + JsonString(imported.BiomeLayerPath) + \",\" +",
    "            \"\\\"artifactContractPrototype\\\":{\" +",
    "                \"\\\"schema\\\":\" + JsonString(imported.ArtifactContractSchema) + \",\" +",
    "                \"\\\"packageFormat\\\":\" + JsonString(imported.PackageFormat) + \",\" +",
    "                \"\\\"layoutVersion\\\":\" + imported.LayoutVersion + \",\" +",
    "                \"\\\"zipParsingSupported\\\":\" + imported.ZipParsingSupported.ToString().ToLowerInvariant() + \",\" +",
    "                \"\\\"productionPluginIncluded\\\":\" + imported.ProductionPluginIncluded.ToString().ToLowerInvariant() + \",\" +",
    "                \"\\\"validationMode\\\":\" + JsonString(imported.ValidationMode) + \",\" +",
    "                \"\\\"consumedByUnitySourceSample\\\":true\" +",
    "            \"},\" +",
    "            \"\\\"mapLayerPrototype\\\":{\" +",
    "                \"\\\"resource\\\":{\\\"path\\\":\" + JsonString(imported.ResourceLayerPath) + \",\\\"recordCount\\\":\" + imported.ResourceLayerRecordCount + \",\\\"summary\\\":\" + JsonString(imported.ResourceLayerSummary) + \"},\" +",
    "                \"\\\"province\\\":{\\\"path\\\":\" + JsonString(imported.ProvinceLayerPath) + \",\\\"recordCount\\\":\" + imported.ProvinceLayerRecordCount + \",\\\"summary\\\":\" + JsonString(imported.ProvinceLayerSummary) + \"},\" +",
    "                \"\\\"biome\\\":{\\\"path\\\":\" + JsonString(imported.BiomeLayerPath) + \",\\\"recordCount\\\":\" + imported.BiomeLayerRecordCount + \",\\\"summary\\\":\" + JsonString(imported.BiomeLayerSummary) + \"},\" +",
    "                \"\\\"validatedAsPrototypeMetadataOnly\\\":true\" +",
    "            \"},\" +",
    "            \"\\\"prototypeOutput\\\":{\\\"kind\\\":\\\"metadata-json-only\\\",\\\"createsUnityTerrainAsset\\\":false,\\\"createsScriptableObjectAsset\\\":false,\\\"productionPluginIncluded\\\":false},\" +",
    "            \"\\\"unityPackageCompileGate\\\":{\\\"schema\\\":\\\"agm.unity-package-compile-gate.v0\\\",\\\"status\\\":\\\"compiled-in-validator-temp-project\\\",\\\"packageName\\\":\\\"com.agm.importers.unity\\\",\\\"packageRoot\\\":\\\"Packages/com.agm.importers.unity\\\",\\\"packageVersion\\\":\\\"0.1.0-preview.1\\\",\\\"compiledFiles\\\":[\\\"package.json\\\",\\\"Runtime/AGM.Importers.Unity.Runtime.asmdef\\\",\\\"Runtime/AgmRuntimePackageImporter.cs\\\",\\\"Runtime/AgmPackageTypes.cs\\\",\\\"Editor/AGM.Importers.Unity.Editor.asmdef\\\",\\\"Editor/AgmImportMenu.cs\\\",\\\"Editor/AgmImporterWindow.cs\\\",\\\"Editor/AgmAssetAuthoringPrototype.cs\\\",\\\"Samples~/ImporterFixture/README.md\\\",\\\"README.md\\\"],\\\"assemblies\\\":[\\\"AGM.Importers.Unity.Runtime\\\",\\\"AGM.Importers.Unity.Editor\\\"],\\\"includedInEnginePackageZip\\\":false},\" +",
    "            \"\\\"unityPackageImportSmokeTest\\\":{\\\"schema\\\":\\\"agm.unity-package-import-smoke-test.v0\\\",\\\"status\\\":\\\"package-importer-consumed-engine-package\\\",\\\"packageName\\\":\\\"com.agm.importers.unity\\\",\\\"packageRoot\\\":\\\"Packages/com.agm.importers.unity\\\",\\\"importer\\\":\\\"AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage\\\",\\\"runtimeApi\\\":\\\"AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage\\\",\\\"runtimeReportSchema\\\":\" + JsonString(packageImportReport.Schema) + \",\\\"sourceSampleSummary\\\":\" + sourceSampleSummaryJson + \",\\\"packageImporterSummary\\\":\" + packageImporterSummaryJson + \",\\\"packageIdMatches\\\":true,\\\"heightSampleCountMatches\\\":true,\\\"gridMatches\\\":true,\\\"raw16Matches\\\":true,\\\"mapLayerRecordsMatch\\\":true,\\\"mismatchDetail\\\":\\\"none\\\",\\\"productionAssetOutput\\\":false,\\\"includedInEnginePackageZip\\\":false},\" +",
    "            \"\\\"assetAuthoringPrototype\\\":{\" +",
    "                \"\\\"schema\\\":\\\"agm.unity-asset-authoring-report.v0\\\",\" +",
    "                \"\\\"status\\\":\\\"editor-prototype-authored\\\",\" +",
    "                \"\\\"outputKind\\\":\" + JsonString(imported.AssetAuthoringOutputKind) + \",\" +",
    "                \"\\\"outputScope\\\":\\\"validator-temp-unity-project-only\\\",\" +",
    "                \"\\\"assetRoot\\\":\\\"Assets/AGM/Validation/EditorPrototypeAssets\\\",\" +",
    "                \"\\\"createdArtifacts\\\":[{\\\"kind\\\":\\\"terrain-data\\\",\\\"unityType\\\":\\\"TerrainData\\\",\\\"path\\\":\\\"Assets/AGM/Validation/EditorPrototypeAssets/AgmTerrainPrototype.asset\\\"},{\\\"kind\\\":\\\"world-scriptable-object\\\",\\\"unityType\\\":\\\"AgmWorldPrototypeAsset\\\",\\\"path\\\":\\\"Assets/AGM/Validation/EditorPrototypeAssets/AgmWorldPrototype.asset\\\"},{\\\"kind\\\":\\\"prefab\\\",\\\"unityType\\\":\\\"Prefab\\\",\\\"path\\\":\\\"Assets/AGM/Validation/EditorPrototypeAssets/AgmWorldPrototype.prefab\\\"}],\" +",
    "                \"\\\"createsUnityTerrainAsset\\\":true,\" +",
    "                \"\\\"createsScriptableObjectAsset\\\":true,\" +",
    "                \"\\\"createsPrefabAsset\\\":true,\" +",
    "                \"\\\"createsUnityPackage\\\":false,\" +",
    "                \"\\\"productionPluginIncluded\\\":false,\" +",
    "                \"\\\"runtimeValidated\\\":false,\" +",
    "                \"\\\"editorPrototypeValidated\\\":true\" +",
    "            \"},\" +",
    "            \"\\\"terrainPrototype\\\":{\" +",
    "                \"\\\"grid\\\":{\\\"width\\\":\" + imported.GridWidth + \",\\\"height\\\":\" + imported.GridHeight + \",\\\"sampleSpacing\\\":\" + imported.SampleSpacing + \"},\" +",
    "                \"\\\"height\\\":{\\\"source\\\":\" + JsonString(imported.HeightSource) + \",\\\"heightScale\\\":\" + JsonString(imported.HeightScale) + \",\\\"normalizedRange\\\":{\\\"min\\\":\" + imported.NormalizedMin + \",\\\"max\\\":\" + imported.NormalizedMax + \"},\\\"rawRange\\\":{\\\"min\\\":\" + imported.RawMin + \",\\\"max\\\":\" + imported.RawMax + \"}},\" +",
    "                \"\\\"raw16\\\":{\\\"sampleCount\\\":\" + imported.HeightSampleCount + \",\\\"firstSamples\\\":[\" + samples + \"],\\\"minSample\\\":\" + imported.Raw16MinSample + \",\\\"maxSample\\\":\" + imported.Raw16MaxSample + \",\\\"rangeValid\\\":true},\" +",
    "                \"\\\"mapLayers\\\":{\\\"resource\\\":\" + JsonString(imported.ResourceLayerPath) + \",\\\"province\\\":\" + JsonString(imported.ProvinceLayerPath) + \",\\\"biome\\\":\" + JsonString(imported.BiomeLayerPath) + \"},\" +",
    "                \"\\\"validatedAsPrototypeMetadataOnly\\\":true\" +",
    "            \"},\" +",
    "            \"\\\"runtimeImporterExecuted\\\":true,\" +",
    "            \"\\\"dataAssetPrototypeEmitted\\\":true\" +",
    "            \"}\";",
    "        File.WriteAllText(Path.Combine(validationDirectory, \"agm-imported-package-report.json\"), reportJson);",
    "        Debug.Log(\"AGM_UNITY_TERRAIN_PROTOTYPE_VALIDATED\");",
    "        Debug.Log(\"AGM_UNITY_DATA_ASSET_PROTOTYPE_WRITTEN\");",
    "        Debug.Log(\"AGM_UNITY_VALIDATION_PASSED\");",
    "    }",
    "",
    "    static string JsonString(string value)",
    "    {",
    "        return \"\\\"\" + value.Replace(\"\\\\\", \"\\\\\\\\\").Replace(\"\\\"\", \"\\\\\\\"\") + \"\\\"\";",
    "    }",
    "}",
    "",
  ].join("\n");
}

function validateDir(rootDir, report) {
  if (!rootDir) throw new Error("--dir is required for structure validation");
  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) throw new Error(`Package directory does not exist: ${rootDir}`);

  const manifestDir = path.join(rootDir, "manifest");
  const manifestFile = fs.readdirSync(manifestDir).find(name => name.endsWith(".agm-engine-manifest.json"));
  if (!manifestFile) throw new Error("Missing engine manifest in manifest/");
  const manifest = readJson(rootDir, path.join("manifest", manifestFile)).value;
  if (manifest.schema !== "agm.engine-manifest.v0") throw new Error(`Unexpected manifest schema: ${manifest.schema}`);
  setCheck(report, "manifest-json", true, path.join("manifest", manifestFile));

  const sampleMetadata = readJson(rootDir, "handoff/importer-sample-metadata.json").value;
  if (sampleMetadata.schema !== "agm.importer-sample-metadata.v0") throw new Error(`Unexpected importer sample metadata schema: ${sampleMetadata.schema}`);
  setCheck(report, "importer-sample-metadata", true, "handoff/importer-sample-metadata.json");

  assertArtifactContract(manifest.artifactContract);
  assertMatchingContract(manifest.importerHandoff?.artifactContract, manifest.artifactContract, "importerHandoff");
  setCheck(report, "artifact-contract", true, manifest.artifactContract.schema);
  setCheck(report, "layout-version", true, `layout v${manifest.artifactContract.layoutVersion}`);

  assertMatchingContract(sampleMetadata.artifactContract, manifest.artifactContract, "sample metadata");
  setCheck(report, "sample-metadata-contract", true, sampleMetadata.artifactContract.schema);

  const layout = manifest.importerHandoff?.layout || {};
  if (!Array.isArray(layout.requiredFiles) || layout.requiredFiles.length === 0) throw new Error("Importer handoff layout requiredFiles must be present");
  for (const requiredPath of layout.requiredFiles) assertFile(rootDir, requiredPath);
  for (const entry of manifest.importerHandoff?.entryFiles || []) assertFile(rootDir, entry.path);
  for (const stubPath of manifest.importerHandoff?.sampleStubPaths?.flatMap(stub => stub.paths) || []) assertFile(rootDir, stubPath);
  setCheck(report, "layout-required-files", true, `${layout.requiredFiles.length} required files`);

  for (const artifactPath of REQUIRED_UNITY_ARTIFACTS) assertFile(rootDir, artifactPath);
  const manifestArtifacts = manifest.importerHandoff?.unityImporterArtifactPaths || [];
  for (const artifactPath of REQUIRED_UNITY_ARTIFACTS) {
    if (!manifestArtifacts.includes(artifactPath)) throw new Error(`Manifest missing Unity artifact path: ${artifactPath}`);
  }
  setCheck(report, "unity-artifact-paths", true, `${REQUIRED_UNITY_ARTIFACTS.length} Unity source artifacts`);

  const packageLayout = readJson(rootDir, "handoff/importers/unity/package-layout.json").value;
  if (packageLayout.schema !== "agm.unity-package-layout.v0") throw new Error(`Unexpected Unity package layout schema: ${packageLayout.schema}`);
  if (packageLayout.contractSchema !== manifest.artifactContract.schema) throw new Error("Unity layout contractSchema must match artifact contract schema");
  if (packageLayout.packageFormat !== manifest.artifactContract.packageFormat) throw new Error("Unity layout packageFormat must match artifact contract packageFormat");
  if (packageLayout.layoutVersion !== manifest.artifactContract.layoutVersion) throw new Error("Unity layout layoutVersion must match artifact contract layoutVersion");
  if (packageLayout.validationMode !== manifest.artifactContract.validationMode) throw new Error("Unity layout validationMode must match artifact contract validationMode");
  if (packageLayout.zipParsingSupported !== manifest.artifactContract.zipParsingSupported) throw new Error("Unity layout zipParsingSupported must match artifact contract zipParsingSupported");
  if (packageLayout.productionPluginIncluded !== false) throw new Error("Unity layout must not claim a production plugin is included");
  if (packageLayout.manifestPath !== `manifest/${manifestFile}`) throw new Error("Unity layout manifestPath must point to the package manifest");
  if (packageLayout.sampleMetadataPath !== "handoff/importer-sample-metadata.json") throw new Error("Unity layout sampleMetadataPath must point to importer metadata");
  if (!Array.isArray(packageLayout.requiredPackageFiles) || packageLayout.requiredPackageFiles.length !== layout.requiredFiles.length) throw new Error("Unity layout requiredPackageFiles must mirror importer handoff required files");
  for (const requiredPath of layout.requiredFiles) {
    if (!packageLayout.requiredPackageFiles.includes(requiredPath)) throw new Error(`Unity layout missing required package file: ${requiredPath}`);
  }
  if (packageLayout.runtimeValidated !== false || packageLayout.editorValidated !== false || packageLayout.createsUnityProject !== false) throw new Error("Unity package layout must not claim runtime/editor validation or project creation");
  if (packageLayout.createsUnityTerrainAsset !== false || packageLayout.createsScriptableObjectAsset !== false || packageLayout.createsPrefabAsset !== false || packageLayout.exportedAssetsIncluded !== false || packageLayout.createsUnityTerrainAssetInExport !== false || packageLayout.createsScriptableObjectAssetInExport !== false || packageLayout.createsPrefabAssetInExport !== false || packageLayout.createsUnityPackage !== false || packageLayout.prototypeOutputKind !== "metadata-json-only") throw new Error("Unity package layout must keep exported package non-asset-producing");
  if (packageLayout.assetAuthoringSpikeStatus !== "editor-source-sample-prototype" || packageLayout.assetAuthoringOutputKind !== "temporary-unity-project-editor-artifacts" || packageLayout.assetAuthoringOutputScope !== "validator-temp-unity-project-only" || packageLayout.assetAuthoringAssetRoot !== AUTHORING_ASSET_ROOT || packageLayout.assetAuthoringReportBlock !== "assetAuthoringPrototype") throw new Error("Unity package layout asset authoring prototype metadata is invalid");
  setCheck(report, "package-layout", true, packageLayout.root);
  setCheck(report, "unity-layout-contract", true, `${packageLayout.contractSchema}, layout v${packageLayout.layoutVersion}`);

  const engineArtifactFiles = layout.engineArtifactFiles || [];
  for (const artifactPath of engineArtifactFiles) {
    if (!artifactPath.endsWith(".txt") && !artifactPath.endsWith("README.md") && !artifactPath.endsWith("package-layout.json")) throw new Error(`Engine artifact must remain a sample/stub/layout file: ${artifactPath}`);
  }
  setCheck(report, "engine-stub-contracts", true, `${engineArtifactFiles.length} sample artifacts`);

  assertProductionPluginBoundary(manifest.productionPluginBoundary, "manifest");
  assertProductionPluginBoundary(manifest.importerHandoff?.productionPluginBoundary, "importer handoff");
  assertProductionPluginBoundary(sampleMetadata.productionPluginBoundary, "sample metadata");
  assertProductionPluginBoundary(packageLayout.productionPluginBoundary, "Unity package layout");
  if (sampleMetadata.importerStatus?.productionPluginBoundaryStatus !== manifest.productionPluginBoundary.status) throw new Error("Sample metadata importerStatus production plugin boundary status mismatch");
  setCheck(report, "production-plugin-boundary", true, "source samples and validator temp artifacts remain separate from production plugin deliverables");

  assertUnityProductionImporterPackagingPlan(manifest.unityProductionImporterPackagingPlan, "manifest");
  assertUnityProductionImporterPackagingPlan(manifest.importerHandoff?.unityProductionImporterPackagingPlan, "importer handoff");
  assertUnityProductionImporterPackagingPlan(sampleMetadata.unityProductionImporterPackagingPlan, "sample metadata");
  assertUnityProductionImporterPackagingPlan(packageLayout.unityProductionImporterPackagingPlan, "Unity package layout");
  setCheck(report, "unity-production-importer-packaging-plan", true, "Unity production importer remains a separate versioned package scaffold outside Engine Package ZIP");

  assertGodotProductionImporterPackagingPlan(manifest.godotProductionImporterPackagingPlan, "manifest");
  assertGodotProductionImporterPackagingPlan(manifest.importerHandoff?.godotProductionImporterPackagingPlan, "importer handoff");
  assertGodotProductionImporterPackagingPlan(sampleMetadata.godotProductionImporterPackagingPlan, "sample metadata");
  assertGodotAddonBoundaryReview(manifest.godotProductionImporterPackagingPlan, "manifest");
  assertGodotAddonBoundaryReview(manifest.importerHandoff?.godotProductionImporterPackagingPlan, "importer handoff");
  assertGodotAddonBoundaryReview(sampleMetadata.godotProductionImporterPackagingPlan, "sample metadata");
  assertGodotSourceSampleContract(rootDir);
  assertNoGodotProductionAddonOutputs(rootDir);
  setCheck(report, "godot-production-importer-packaging-plan", true, "Godot importer remains a source-sample scaffold for a separate addon review");
  setCheck(report, "godot-source-sample-contract", true, `${REQUIRED_GODOT_ARTIFACTS.length} Godot source sample artifacts validated`);
  setCheck(report, "godot-production-addon-boundary", true, "Engine Package ZIP contains no Godot plugin.cfg, production .gd, resources, or scenes");
  setCheck(report, "godot-addon-boundary-review", true, "Godot addon deliverable boundary verified; Engine Package ZIP remains source-sample-only");

  assertUnrealProductionImporterPackagingPlan(manifest.unrealProductionImporterPackagingPlan, "manifest");
  assertUnrealProductionImporterPackagingPlan(manifest.importerHandoff?.unrealProductionImporterPackagingPlan, "importer handoff");
  assertUnrealProductionImporterPackagingPlan(sampleMetadata.unrealProductionImporterPackagingPlan, "sample metadata");
  assertUnrealPluginBoundaryReview(manifest.unrealProductionImporterPackagingPlan, "manifest");
  assertUnrealPluginBoundaryReview(manifest.importerHandoff?.unrealProductionImporterPackagingPlan, "importer handoff");
  assertUnrealPluginBoundaryReview(sampleMetadata.unrealProductionImporterPackagingPlan, "sample metadata");
  assertUnrealSourceSampleContract(rootDir);
  assertNoUnrealProductionPluginOutputs(rootDir);
  setCheck(report, "unreal-production-importer-packaging-plan", true, "Unreal importer remains a source-sample scaffold for a separate plugin review");
  setCheck(report, "unreal-source-sample-contract", true, `${REQUIRED_UNREAL_ARTIFACTS.length} Unreal source sample artifacts validated`);
  setCheck(report, "unreal-production-plugin-boundary", true, "Engine Package ZIP contains no Unreal .uplugin, Build.cs, production source, .uasset, or .umap outputs");
  setCheck(report, "unreal-plugin-boundary-review", true, "Unreal plugin deliverable boundary verified; Engine Package ZIP remains source-sample-only");

  assertRealEngineSmokeRecords(manifest.realEngineSmokeRecords, "manifest");
  assertRealEngineSmokeRecords(manifest.importerHandoff?.realEngineSmokeRecords, "importer handoff");
  assertRealEngineSmokeRecords(sampleMetadata.realEngineSmokeRecords, "sample metadata");
  setCheck(report, "real-engine-smoke-records", true, "real Unity/Godot/Unreal smoke records are tracked as required but not yet captured");

  assertUnityProductionImporterPackageScaffoldFiles(process.cwd());
  if (manifest.importerHandoff?.unityValidationHarness?.checks?.includes("unity-production-importer-package-scaffold") !== true) throw new Error("Unity validation harness must include package scaffold check");
  assertNoUnityAssetOutputs(rootDir);
  setCheck(report, "unity-production-importer-package-scaffold", true, "local Unity package scaffold exists and is not bundled in Engine Package ZIP");
  setCheck(report, "unity-package-release-candidate-review", true, "pre-release checklist documented; package remains not release-candidate-ready until real Unity validation");
  assertUnityProductionImporterRuntimeContract(process.cwd());
  if (manifest.importerHandoff?.unityValidationHarness?.checks?.includes("unity-production-importer-runtime-contract") !== true) throw new Error("Unity validation harness must include runtime contract check");
  setCheck(report, "unity-production-importer-runtime-contract", true, "Unity package runtime importer reads manifest, layout, heightfield, RAW16, and map layers without asset output");

  const manifestAssetAuthoringSpike = manifest.importerHandoff?.unityAssetAuthoringSpike;
  const sampleAssetAuthoringSpike = sampleMetadata.unityAssetAuthoringSpike;
  if (!validateAssetAuthoringSpike(manifestAssetAuthoringSpike)) throw new Error("Manifest Unity asset authoring spike metadata is invalid");
  if (!validateAssetAuthoringSpike(sampleAssetAuthoringSpike)) throw new Error("Sample metadata Unity asset authoring spike metadata is invalid");
  if (sampleAssetAuthoringSpike.exportedAssetsIncluded !== false || sampleAssetAuthoringSpike.validatorTempProjectCreatesAssets !== true || sampleAssetAuthoringSpike.assetRoot !== AUTHORING_ASSET_ROOT || sampleAssetAuthoringSpike.outputReportBlock !== manifestAssetAuthoringSpike.reportBlock) throw new Error("Sample metadata asset authoring prototype report metadata is invalid");
  if (manifest.importerHandoff?.unityValidationHarness?.checks?.includes("unity-asset-authoring-spike-metadata") !== true) throw new Error("Unity validation harness must include asset authoring spike metadata check");
  assertForbiddenUnityEditorApisAbsent(rootDir);
  setCheck(report, "unity-asset-authoring-spike-metadata", true, "editor source sample prototype plan and export safety flags validated");
  setCheck(report, "unity-asset-authoring-non-asset-output", true, "export includes no Unity .asset/.prefab/.unitypackage/.cs/package.json outputs");
  setCheck(report, "unity-forbidden-editor-apis-absent", true, "production editor APIs absent; authoring APIs isolated to editor prototype sample");

  const heightfieldPath = findFilePath(manifest, "heightfield", sampleMetadata.terrainInput?.heightfieldPath);
  const raw16Path = findFilePath(manifest, "heightmap-raw16", sampleMetadata.terrainInput?.raw16Path);
  const heightfield = readJson(rootDir, heightfieldPath).value;
  const rawBytes = fs.readFileSync(assertFile(rootDir, raw16Path));
  if (!Array.isArray(heightfield.values)) throw new Error("Heightfield values must be an array");
  const expectedRawLength = heightfield.values.length * 2;
  if (rawBytes.length !== expectedRawLength) throw new Error(`RAW16 byte length ${rawBytes.length} does not match heightfield values ${heightfield.values.length}`);
  setCheck(report, "raw16-byte-length", true, `${rawBytes.length} bytes for ${heightfield.values.length} samples`);

  const grid = heightfield.grid || {};
  if (grid.width * grid.height !== heightfield.values.length) throw new Error(`Heightfield grid ${grid.width}x${grid.height} does not match values ${heightfield.values.length}`);
  if (grid.sampleSpacing !== 1) throw new Error(`Unexpected heightfield sample spacing: ${grid.sampleSpacing}`);
  setCheck(report, "terrain-prototype-grid", true, `${grid.width}x${grid.height} @ ${grid.sampleSpacing}`);

  const metadataPath = findFilePath(manifest, "heightmap-metadata", sampleMetadata.terrainInput?.metadataPath);
  const heightmapMetadata = readJson(rootDir, metadataPath).value;
  if (heightmapMetadata.interpretation?.heightScale !== "designer-defined") throw new Error(`Unexpected height scale: ${heightmapMetadata.interpretation?.heightScale}`);
  if (manifest.terrainSource?.normalizedRange?.min !== 0 || manifest.terrainSource?.normalizedRange?.max !== 100) throw new Error("Manifest normalized range must be 0..100");
  if (manifest.terrainSource?.rawRange?.min !== 0 || manifest.terrainSource?.rawRange?.max !== 65535) throw new Error("Manifest RAW16 range must be 0..65535");
  setCheck(report, "terrain-prototype-height-source", true, `${manifest.terrainSource?.rawEncoding}, ${heightmapMetadata.interpretation.heightScale}`);

  const raw16Sample = decodeRaw16Sample(rawBytes);
  if (!raw16Sample.every(value => Number.isInteger(value) && value >= 0 && value <= 65535)) throw new Error("RAW16 decoded sample contains values outside UInt16 range");
  setCheck(report, "raw16-little-endian-decode-sample", true, raw16Sample.join(","));
  const raw16Stats = decodeRaw16Stats(rawBytes);
  if (raw16Stats.min < 0 || raw16Stats.max > 65535 || raw16Stats.count !== heightfield.values.length) throw new Error("RAW16 decoded samples do not match terrain prototype range expectations");
  setCheck(report, "terrain-prototype-raw16-range", true, `${raw16Stats.count} samples, ${raw16Stats.min}..${raw16Stats.max}`);

  const layerPaths = [sampleMetadata.mapLayers?.resource, sampleMetadata.mapLayers?.province, sampleMetadata.mapLayers?.biome];
  const resourceMap = readJson(rootDir, layerPaths[0]).value;
  const provinceMap = readJson(rootDir, layerPaths[1]).value;
  const biomeMap = readJson(rootDir, layerPaths[2]).value;
  if (resourceMap.schema !== "agm.resource-map.v0" || !Array.isArray(resourceMap.tiles) || resourceMap.tiles.length === 0 || !resourceMap.coverageSummary) throw new Error("Resource map layer must include records and coverageSummary");
  if (provinceMap.schema !== "agm.province-map.v0" || !Array.isArray(provinceMap.tiles) || provinceMap.tiles.length === 0 || !provinceMap.structureSummary) throw new Error("Province map layer must include records and structureSummary");
  if (biomeMap.schema !== "agm.biome-map.v0" || !Array.isArray(biomeMap.biomes) || biomeMap.biomes.length === 0 || !biomeMap.habitabilitySummary) throw new Error("Biome map layer must include records and habitabilitySummary");
  setCheck(report, "map-layer-json", true, layerPaths.join(", "));
  setCheck(report, "terrain-prototype-map-layer-refs", true, layerPaths.join(", "));
  report.mapLayerExpected = {
    resource: {path: layerPaths[0], recordCount: resourceMap.tiles.length, summary: "coverageSummary-present"},
    province: {path: layerPaths[1], recordCount: provinceMap.tiles.length, summary: "structureSummary-present"},
    biome: {path: layerPaths[2], recordCount: biomeMap.biomes.length, summary: "habitabilitySummary-present"},
  };
  setCheck(report, "unity-map-layer-records", true, `${resourceMap.tiles.length}/${provinceMap.tiles.length}/${biomeMap.biomes.length}`);
  setCheck(report, "unity-map-layer-summaries", true, "coverageSummary/structureSummary/habitabilitySummary present");
  report.terrainPrototypeExpectedLayerPaths = layerPaths;
  report.terrainPrototypeExpectedSampleCount = heightfield.values.length;

  validateNonClaimingFields(manifest, sampleMetadata);
  setCheck(report, "validation-fields-non-claiming", true, "runtime/editor validation remains false");
  setCheck(report, "no-production-plugin-claims", true, "production plugin flags remain false");
  setCheck(report, "zip-validation-disabled", true, "--zip remains reserved; validate extracted package directories with --dir");

  report.structureValidated = true;
  report.packageId = manifest.manifest?.id || sampleMetadata.package?.id || path.basename(rootDir);
  report.raw16Sample = raw16Sample;
  report.status = report.unityCliDetected ? "structure-passed-unity-detected" : "structure-passed-unity-unavailable";
  report.unitySmokeReadiness = createUnitySmokeReadiness(rootDir, {
    path: report.unityExecutable || "",
    source: report.unityExecutableSource,
    candidates: report.unityExecutableCandidates,
    searchPlan: report.unityExecutableSearch,
  }, report.unityCliDetected);
  report.godotSmokeReadiness = createGodotSmokeReadiness(rootDir, {
    path: report.godotExecutable || "",
    source: report.godotExecutableSource,
    candidates: report.godotExecutableCandidates,
    searchPlan: report.godotExecutableSearch,
  }, report.godotCliDetected);
  setCheck(report, "godot-cli-executable", report.godotCliDetected, report.godotCliDetected ? report.godotExecutable : "Godot executable not supplied or auto-discovered");
  setCheck(report, "godot-smoke-readiness", true, report.godotCliDetected ? "Godot executable detected; addon smoke capture pending implementation" : "Godot smoke readiness recorded; executable unavailable");
  if (!report.unityCliDetected) {
    report.warnings.push("Unity CLI was not supplied or auto-discovered; editor/runtime validation remains pending.");
    report.warnings.push(`Searched Unity commands: ${report.unitySmokeReadiness.searchedCommands.join(", ") || "none"}.`);
    report.warnings.push(`Searched Unity Hub editor roots: ${report.unitySmokeReadiness.searchedUnityHubEditorRoots.join(", ") || "none"}.`);
    report.warnings.push(`Searched standalone Unity editor roots: ${report.unitySmokeReadiness.searchedStandaloneEditorRoots.join(", ") || "none"}.`);
    report.warnings.push("Install Unity via Unity Hub or rerun with --unity <Unity executable> / UNITY_EXECUTABLE=<path>.");
    report.warnings.push(`Next Unity smoke command: ${report.unitySmokeReadiness.expectedCommand}`);
  }
  if (!report.godotCliDetected) {
    report.warnings.push("Godot executable was not supplied or auto-discovered; Godot addon smoke capture remains pending.");
    report.warnings.push(`Searched Godot commands: ${report.godotSmokeReadiness.searchedCommands.join(", ") || "none"}.`);
    report.warnings.push(`Searched Godot standalone roots: ${report.godotSmokeReadiness.searchedStandaloneRoots.join(", ") || "none"}.`);
    report.warnings.push("Install Godot 4.x or rerun with --godot <Godot executable> / GODOT_EXECUTABLE=<path>.");
    report.warnings.push(`Next Godot smoke command: ${report.godotSmokeReadiness.expectedCommand}`);
  }
  return report;
}

function validateGodotAddonSmokeReport(summary, expectedPackageId) {
  if (!summary) return {passed: false, detail: "Godot addon smoke report missing"};
  if (summary.schema !== "agm.godot-addon-smoke-report.v0") return {passed: false, detail: `schema mismatch: ${summary.schema}`};
  if (summary.status !== "addon-import-contract-smoke-passed") return {passed: false, detail: `status mismatch: ${summary.status}`};
  if (summary.packageId !== expectedPackageId) return {passed: false, detail: `package id mismatch: ${summary.packageId}`};
  if (summary.addonRoot !== GODOT_ADDON_ROOT) return {passed: false, detail: `addon root mismatch: ${summary.addonRoot}`};
  if (summary.expectedDeliverableRoot !== GODOT_ADDON_ROOT) return {passed: false, detail: `expected deliverable root mismatch: ${summary.expectedDeliverableRoot}`};
  if (summary.productionAddonIncluded !== false) return {passed: false, detail: "production addon must remain false"};
  if (summary.createsGodotResources !== false) return {passed: false, detail: "createsGodotResources must remain false"};
  if (summary.createsPackedScenes !== false) return {passed: false, detail: "createsPackedScenes must remain false"};
  if (summary.pluginCfgIncludedInEnginePackage !== false) return {passed: false, detail: "plugin.cfg must not be included in Engine Package ZIP"};
  if (summary.sourceSampleOnly !== true) return {passed: false, detail: "sourceSampleOnly must be true"};
  if (summary.mockOrFixtureResult !== false) return {passed: false, detail: "Godot smoke must not be marked as mock or fixture"};
  if (!Number.isInteger(summary.heightSampleCount) || summary.heightSampleCount <= 0) return {passed: false, detail: "heightSampleCount invalid"};
  if (summary.raw16SampleCount !== summary.heightSampleCount) return {passed: false, detail: `raw16 sample count mismatch: ${summary.raw16SampleCount} != ${summary.heightSampleCount}`};
  for (const key of ["resourceRecords", "provinceRecords", "biomeRecords"]) {
    if (!Number.isInteger(summary[key]) || summary[key] <= 0) return {passed: false, detail: `${key} invalid`};
  }
  return {passed: true, detail: "Godot addon import contract smoke report valid"};
}

function createGodotSmokeRunnerScript(packageRoot, reportPath) {
  return [
    "extends SceneTree",
    "",
    "const ADDON_ROOT := \"addons/agm_importers_godot\"",
    `const PACKAGE_ROOT := ${JSON.stringify(packageRoot.split(path.sep).join("/"))}`,
    `const REPORT_PATH := ${JSON.stringify(reportPath.split(path.sep).join("/"))}`,
    "",
    "func _init():",
    "\tvar importer_script := load(\"res://addons/agm_importers_godot/agm_importer.gd\")",
    "\tvar importer := importer_script.new()",
    "\tvar summary := importer.import_agm_package(PACKAGE_ROOT)",
    "\tvar report := {",
    "\t\t\"schema\": \"agm.godot-addon-smoke-report.v0\",",
    "\t\t\"status\": \"addon-import-contract-smoke-passed\",",
    "\t\t\"packageId\": summary.get(\"package_id\", \"\"),",
    "\t\t\"heightSampleCount\": summary.get(\"height_sample_count\", 0),",
    "\t\t\"raw16SampleCount\": summary.get(\"raw16_sample_count\", 0),",
    "\t\t\"resourceRecords\": summary.get(\"resource_records\", 0),",
    "\t\t\"provinceRecords\": summary.get(\"province_records\", 0),",
    "\t\t\"biomeRecords\": summary.get(\"biome_records\", 0),",
    "\t\t\"addonRoot\": ADDON_ROOT,",
    "\t\t\"expectedDeliverableRoot\": ADDON_ROOT,",
    "\t\t\"productionAddonIncluded\": summary.get(\"production_addon_included\", true),",
    "\t\t\"createsGodotResources\": summary.get(\"creates_godot_resources\", true),",
    "\t\t\"createsPackedScenes\": summary.get(\"creates_packed_scenes\", true),",
    "\t\t\"pluginCfgIncludedInEnginePackage\": false,",
    "\t\t\"sourceSampleOnly\": true,",
    "\t\t\"mockOrFixtureResult\": false,",
    "\t}",
    "\tvar output := FileAccess.open(REPORT_PATH, FileAccess.WRITE)",
    "\toutput.store_string(JSON.stringify(report, \"  \"))",
    "\tprint(\"AGM_GODOT_ADDON_SMOKE_PASSED\")",
    "\tquit(0)",
    "",
  ].join("\n");
}

function validateGodotCli(rootDir, report, godotExecutable) {
  if (!report.godotCliDetected) return report;

  setCheck(report, "godot-cli-executable", true, godotExecutable);
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agm-godot-smoke-"));
  report.godotProjectPath = projectRoot;
  const reportPath = path.join(projectRoot, "agm-godot-smoke-report.json");
  report.godotSmokeReportPath = reportPath;

  fs.mkdirSync(path.join(projectRoot, "addons", "agm_importers_godot"), {recursive: true});
  fs.mkdirSync(path.join(projectRoot, "agm_engine_package"), {recursive: true});
  fs.writeFileSync(path.join(projectRoot, "project.godot"), "config_version=5\n\n[application]\nconfig/name=\"AGM Godot Smoke\"\n");
  copyFile(path.join(rootDir, "handoff", "importers", "godot", "agm_importer_stub.gd.txt"), path.join(projectRoot, "addons", "agm_importers_godot", "agm_importer.gd"));
  copyDirectory(rootDir, path.join(projectRoot, "agm_engine_package"));
  const runnerPath = path.join(projectRoot, "agm_godot_smoke_runner.gd");
  fs.writeFileSync(runnerPath, createGodotSmokeRunnerScript(path.join(projectRoot, "agm_engine_package"), reportPath));
  setCheck(report, "godot-project-created", true, projectRoot);
  setCheck(report, "godot-source-copied", true, "Godot source sample copied into temp addon project");

  const executableExtension = path.extname(godotExecutable).toLowerCase();
  const godotArgs = ["--headless", "--path", projectRoot, "--script", runnerPath];
  const command = [".js", ".mjs"].includes(executableExtension) ? process.execPath : godotExecutable;
  const args = [".js", ".mjs"].includes(executableExtension) ? [godotExecutable, ...godotArgs] : godotArgs;
  const result = spawnSync(command, args, {encoding: "utf8", timeout: 600000});
  report.godotExitCode = result.status ?? 1;
  if (result.error) report.warnings.push(`Godot process error: ${result.error.message}`);
  if (result.stdout) report.godotStdout = result.stdout.slice(-4000);
  if (result.stderr) report.godotStderr = result.stderr.slice(-4000);

  const processText = `${result.stdout || ""}\n${result.stderr || ""}`;
  const hasPassMarker = processText.includes("AGM_GODOT_ADDON_SMOKE_PASSED");
  const hasReport = fs.existsSync(reportPath);
  const smokeReport = hasReport ? JSON.parse(fs.readFileSync(reportPath, "utf8")) : null;
  const smokeReportCheck = validateGodotAddonSmokeReport(smokeReport, report.packageId || path.basename(rootDir));
  const passed = report.godotExitCode === 0 && hasPassMarker && hasReport && smokeReportCheck.passed;

  setCheck(report, "godot-addon-smoke-report", passed, passed ? smokeReportCheck.detail : (smokeReportCheck.detail || "Godot smoke marker/report missing"));
  report.godotSmokeCaptured = passed;
  report.godotAddonSmokeReport = smokeReport;
  report.godotSmokeReadiness = {
    ...report.godotSmokeReadiness,
    status: passed ? "godot-smoke-captured" : "godot-smoke-failed",
    captured: passed,
    executableValidated: true,
    smokeCapturedAt: passed ? new Date().toISOString() : null,
    validationStatus: passed ? "passed" : "failed",
    godotExitCode: report.godotExitCode,
    pendingReason: passed ? "real Godot addon smoke record captured" : "real Godot addon smoke validation failed",
  };
  setCheck(report, "godot-smoke-readiness", passed, passed ? "Godot addon smoke captured" : "Godot addon smoke failed");
  setCheck(report, "real-engine-smoke-records", true, passed ? "real Godot addon smoke captured; Unity/Unreal smoke records remain pending" : "real Unity/Godot/Unreal smoke records are tracked as required but not yet captured");
  if (passed && report.status !== "failed") report.status = report.editorValidated ? "passed" : "structure-passed-godot-smoke-captured";
  if (!passed) {
    report.status = "failed";
    report.warnings.push(`Godot addon smoke validation failed: ${smokeReportCheck.detail}`);
  }

  const forceRetainProject = process.env.AGM_GODOT_RETAIN_PROJECT === "1" || process.env.AGM_GODOT_RETAIN_PROJECT === "true";
  report.godotProjectRetained = !passed || forceRetainProject;
  if (report.godotProjectRetained) {
    report.godotProjectCleanup = forceRetainProject && passed ? "retained-by-env" : "retained-for-failure-diagnostics";
  } else {
    try {
      fs.rmSync(projectRoot, {recursive: true, force: true, maxRetries: 3, retryDelay: 200});
      report.godotProjectCleanup = "removed-after-success";
      report.godotProjectPath = null;
      report.godotSmokeReportPath = null;
    } catch (error) {
      report.godotProjectRetained = true;
      report.godotProjectCleanup = "retained-for-cleanup-error";
      report.warnings.push(`Godot smoke passed, but temporary project cleanup failed: ${error.message}`);
    }
  }
  return report;
}

function validateUnityCli(rootDir, report, unityExecutable) {
  if (!report.unityCliDetected) return report;

  setCheck(report, "unity-cli-executable", true, unityExecutable);
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agm-unity-batchmode-"));
  report.unityProjectPath = projectRoot;
  const logPath = path.join(projectRoot, "agm-unity-validation.log");
  report.unityLogPath = logPath;

  fs.mkdirSync(path.join(projectRoot, "Assets", "AGM", "Runtime"), {recursive: true});
  fs.mkdirSync(path.join(projectRoot, "Assets", "AGM", "Editor"), {recursive: true});
  fs.mkdirSync(path.join(projectRoot, "Packages"), {recursive: true});
  fs.mkdirSync(path.join(projectRoot, "ProjectSettings"), {recursive: true});
  fs.writeFileSync(path.join(projectRoot, "Packages", "manifest.json"), JSON.stringify({dependencies: {"com.agm.importers.unity": "file:com.agm.importers.unity"}}, null, 2));
  fs.writeFileSync(path.join(projectRoot, "ProjectSettings", "ProjectVersion.txt"), "m_EditorVersion: 2022.3.0f1\n");
  setCheck(report, "unity-project-created", true, projectRoot);

  for (const [sourceRelative, targetRelative] of UNITY_SOURCE_FILES) {
    copyFile(path.join(rootDir, sourceRelative), path.join(projectRoot, targetRelative));
  }
  const sampleRoot = path.join(projectRoot, "Assets", "AGM", "Samples", report.packageId || path.basename(rootDir));
  copyDirectory(rootDir, sampleRoot);
  fs.writeFileSync(path.join(projectRoot, "Assets", "AGM", "Editor", "AgmValidationBatchmode.cs"), createUnityBatchmodeScript(report.packageId));
  copyDirectory(path.join(process.cwd(), UNITY_PACKAGE_ROOT), path.join(projectRoot, UNITY_PACKAGE_ROOT));
  report.unityPackageCompileGate = {packageRoot: UNITY_PACKAGE_ROOT, copiedToTempProject: true};
  setCheck(report, "unity-source-copied", true, "Unity source samples and package scaffold copied into temp project");

  const unityArgs = ["-batchmode", "-quit", "-projectPath", projectRoot, "-logFile", logPath, "-executeMethod", "AgmValidationBatchmode.Run"];
  const executableExtension = path.extname(unityExecutable).toLowerCase();
  const command = [".js", ".mjs"].includes(executableExtension) ? process.execPath : unityExecutable;
  const args = [".js", ".mjs"].includes(executableExtension) ? [unityExecutable, ...unityArgs] : unityArgs;
  const result = spawnSync(command, args, {encoding: "utf8", timeout: 600000});
  report.unityExitCode = result.status ?? 1;
  if (result.error) report.warnings.push(`Unity process error: ${result.error.message}`);
  if (result.stdout) report.unityStdout = result.stdout.slice(-4000);
  if (result.stderr) report.unityStderr = result.stderr.slice(-4000);

  const logText = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
  const processText = `${result.stdout || ""}\n${result.stderr || ""}`;
  const combinedText = `${logText}\n${processText}`;
  const unityDiagnostics = summarizeUnityDiagnostics(combinedText);
  report.unityDiagnostics = unityDiagnostics;
  const hasPassMarker = combinedText.includes("AGM_UNITY_VALIDATION_PASSED");
  const hasImporterMarker = combinedText.includes("AGM_UNITY_IMPORTER_CALLED");
  const hasPrototypeMarker = combinedText.includes("AGM_UNITY_DATA_ASSET_PROTOTYPE_WRITTEN");
  const hasTerrainPrototypeMarker = combinedText.includes("AGM_UNITY_TERRAIN_PROTOTYPE_VALIDATED");
  const hasPackageImportSmokeMarker = combinedText.includes("AGM_UNITY_PACKAGE_IMPORT_SMOKE_TEST_PASSED");
  const hasCompileFailure = /Compiler errors|Script compilation failed|error CS/u.test(combinedText);
  const importedPackageReportPath = path.join(projectRoot, "Assets", "AGM", "Validation", "agm-imported-package-report.json");
  const hasImportedPackageReport = fs.existsSync(importedPackageReportPath);
  let importedPackageSummary = null;
  if (hasImportedPackageReport) importedPackageSummary = JSON.parse(fs.readFileSync(importedPackageReportPath, "utf8"));
  const terrainPrototype = importedPackageSummary?.terrainPrototype;
  const terrainPrototypeChecks = validateTerrainPrototypeSummary(terrainPrototype, report.terrainPrototypeExpectedLayerPaths || []);
  const terrainPrototypeValidated = hasTerrainPrototypeMarker && terrainPrototype?.validatedAsPrototypeMetadataOnly === true && terrainPrototypeChecks.gridValid && terrainPrototypeChecks.heightValid && terrainPrototypeChecks.rawValid && terrainPrototypeChecks.layerValid;
  const artifactContractPrototypeValid = validateArtifactContractPrototype(importedPackageSummary?.artifactContractPrototype);
  const mapLayerPrototypeValid = validateMapLayerPrototype(importedPackageSummary?.mapLayerPrototype, report.mapLayerExpected || {});
  const prototypeOutputValid = validatePrototypeOutput(importedPackageSummary?.prototypeOutput);
  const assetAuthoringPrototypeCheck = validateAssetAuthoringPrototype(importedPackageSummary?.assetAuthoringPrototype, projectRoot);
  const authoringFilesystemScopeCheck = validateAuthoringFilesystemScope(projectRoot);
  const assetAuthoringPrototypeValid = assetAuthoringPrototypeCheck.passed && authoringFilesystemScopeCheck.passed;
  const packageCompileGateCheck = validateUnityPackageCompileGateSummary(importedPackageSummary?.unityPackageCompileGate);
  const packageCompileGateValid = packageCompileGateCheck.passed;
  const packageImportSmokeTestCheck = validateUnityPackageImportSmokeTestSummary(importedPackageSummary?.unityPackageImportSmokeTest);
  const packageImportSmokeTestValid = hasPackageImportSmokeMarker && packageImportSmokeTestCheck.passed;
  const runtimeImportIssueCheck = validateRuntimeImportIssueSummary(importedPackageSummary?.runtimeImportIssue);
  const runtimeImportIssueValid = runtimeImportIssueCheck.passed;
  const passed = report.unityExitCode === 0 && hasPassMarker && hasImporterMarker && hasPrototypeMarker && terrainPrototypeValidated && artifactContractPrototypeValid && mapLayerPrototypeValid && prototypeOutputValid && assetAuthoringPrototypeValid && packageCompileGateValid && packageImportSmokeTestValid && runtimeImportIssueValid && hasImportedPackageReport && !hasCompileFailure;

  setCheck(report, "unity-editor-compile", report.unityExitCode === 0 && !hasCompileFailure, report.unityExitCode === 0 && !hasCompileFailure ? "Unity batchmode compile completed" : (unityDiagnostics[0] || "Unity batchmode compile errors found"));
  setCheck(report, "unity-runtime-importer-called", hasImporterMarker, hasImporterMarker ? "AgmRuntimePackageImporter.ImportFromUnpackedPackage executed" : "Importer marker missing");
  setCheck(report, "unity-imported-package-report", hasImportedPackageReport, hasImportedPackageReport ? importedPackageReportPath : "Imported package report missing");
  setCheck(report, "unity-data-asset-prototype", hasPrototypeMarker && hasImportedPackageReport, hasPrototypeMarker && hasImportedPackageReport ? "JSON prototype report emitted" : "Prototype marker or report missing");
  setCheck(report, "terrain-prototype-grid", terrainPrototypeChecks.gridValid, terrainPrototypeChecks.gridValid ? `${terrainPrototype.grid.width}x${terrainPrototype.grid.height}` : "Terrain prototype grid invalid");
  setCheck(report, "terrain-prototype-height-source", terrainPrototypeChecks.heightValid, terrainPrototypeChecks.heightValid ? `${terrainPrototype.height.source}, ${terrainPrototype.height.heightScale}` : "Terrain prototype height source invalid");
  setCheck(report, "terrain-prototype-raw16-range", terrainPrototypeChecks.rawValid, terrainPrototypeChecks.rawValid ? `${terrainPrototype.raw16.minSample}..${terrainPrototype.raw16.maxSample}` : "Terrain prototype RAW16 range invalid");
  setCheck(report, "terrain-prototype-map-layer-refs", terrainPrototypeChecks.layerValid, terrainPrototypeChecks.layerValid ? Object.values(terrainPrototype.mapLayers).join(", ") : "Terrain prototype map layer refs invalid");
  setCheck(report, "unity-contract-consumed", artifactContractPrototypeValid, artifactContractPrototypeValid ? "artifact contract consumed by Unity source sample" : "Artifact contract prototype invalid");
  setCheck(report, "unity-package-layout-consumed", artifactContractPrototypeValid, artifactContractPrototypeValid ? "package-layout consumed by Unity source sample" : "Unity package-layout prototype invalid");
  setCheck(report, "unity-map-layer-records", mapLayerPrototypeValid, mapLayerPrototypeValid ? "map layer record counts match" : "Map layer record counts mismatch");
  setCheck(report, "unity-map-layer-summaries", mapLayerPrototypeValid, mapLayerPrototypeValid ? "map layer summaries match" : "Map layer summaries mismatch");
  setCheck(report, "unity-prototype-report-contract", artifactContractPrototypeValid && mapLayerPrototypeValid, artifactContractPrototypeValid && mapLayerPrototypeValid ? "prototype report contract valid" : "Prototype report contract invalid");
  setCheck(report, "unity-prototype-non-asset-output", prototypeOutputValid, prototypeOutputValid ? "metadata-json-only output" : "Prototype output must not create assets");
  const assetAuthoringDetail = assetAuthoringPrototypeCheck.passed ? authoringFilesystemScopeCheck.detail : assetAuthoringPrototypeCheck.detail;
  setCheck(report, "unity-asset-authoring-report", assetAuthoringPrototypeValid, assetAuthoringDetail);
  setCheck(report, "unity-asset-authoring-non-asset-output", prototypeOutputValid && assetAuthoringPrototypeValid, prototypeOutputValid && assetAuthoringPrototypeValid ? "export package is asset-free; editor prototype assets are scoped to temp Unity project" : assetAuthoringDetail);
  setCheck(report, "unity-package-compile-gate", packageCompileGateValid, packageCompileGateCheck.detail);
  setCheck(report, "unity-package-import-smoke-test", packageImportSmokeTestValid, packageImportSmokeTestCheck.detail);
  setCheck(report, "unity-runtime-issue-taxonomy", runtimeImportIssueValid, runtimeImportIssueCheck.detail);
  setCheck(report, "real-engine-smoke-records", passed, passed ? "real Unity batchmode smoke captured; Godot/Unreal smoke records remain pending" : "real Unity batchmode smoke not captured");
  report.unityCompileValidated = report.unityExitCode === 0 && !hasCompileFailure;
  report.runtimeImporterExecuted = hasImporterMarker;
  report.dataAssetPrototypeEmitted = hasPrototypeMarker && hasImportedPackageReport;
  report.terrainPrototypeValidated = terrainPrototypeValidated;
  report.artifactContractPrototypeValidated = artifactContractPrototypeValid;
  report.mapLayerPrototypeValidated = mapLayerPrototypeValid;
  report.prototypeOutputValidated = prototypeOutputValid;
  report.assetAuthoringPrototypeValidated = assetAuthoringPrototypeValid;
  report.unityPackageCompileGateValidated = packageCompileGateValid;
  report.unityPackageImportSmokeTestValidated = packageImportSmokeTestValid;
  report.runtimeImportIssueValidated = runtimeImportIssueValid;
  report.terrainPrototypeChecks = terrainPrototypeChecks;
  report.unityImportedPackageReportPath = hasImportedPackageReport ? importedPackageReportPath : null;
  report.importedPackageSummary = importedPackageSummary;
  report.editorValidated = passed;
  report.runtimeValidated = false;
  report.status = passed ? "passed" : "failed";
  report.unitySmokeReadiness = {
    ...report.unitySmokeReadiness,
    status: passed ? "unity-smoke-captured" : "unity-smoke-failed",
    captured: passed,
    executableValidated: true,
    smokeCapturedAt: passed ? new Date().toISOString() : null,
    validationStatus: report.status,
    unityExitCode: report.unityExitCode,
    pendingReason: passed ? "real Unity batchmode smoke record captured" : "real Unity batchmode smoke validation failed",
  };
  const forceRetainProject = process.env.AGM_UNITY_RETAIN_PROJECT === "1" || process.env.AGM_UNITY_RETAIN_PROJECT === "true";
  report.unityProjectRetained = !passed || forceRetainProject;
  if (report.unityProjectRetained) {
    report.unityProjectCleanup = forceRetainProject && passed ? "retained-by-env" : "retained-for-failure-diagnostics";
  } else {
    try {
      fs.rmSync(projectRoot, {recursive: true, force: true, maxRetries: 3, retryDelay: 200});
      report.unityProjectCleanup = "removed-after-success";
      report.unityProjectPath = null;
      report.unityLogPath = null;
      report.unityImportedPackageReportPath = null;
    } catch (error) {
      report.unityProjectRetained = true;
      report.unityProjectCleanup = "retained-for-cleanup-error";
      report.warnings.push(`Unity validation passed, but temporary project cleanup failed: ${error.message}`);
    }
  }
  if (!passed) report.warnings.push(unityDiagnostics.length > 0 ? `Unity importer data validation failed: ${unityDiagnostics[0]}` : "Unity importer data validation failed; retained unityProjectPath for diagnostics.");
  return report;
}

function printReport(report, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  process.stdout.write(`AGM Unity export validation: ${report.status}\n`);
  for (const check of report.checks) process.stdout.write(`${check.passed ? "PASS" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}\n`);
  for (const warning of report.warnings) process.stdout.write(`WARN ${warning}\n`);
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }
  if (args.zip) throw new Error("--zip validation is not implemented yet; extract the package and run with --dir.");
  const unityExecutableResolution = resolveUnityExecutable(args.unity || process.env.UNITY_EXECUTABLE || "");
  const godotExecutableResolution = resolveGodotExecutable(args.godot || process.env.GODOT_EXECUTABLE || "");
  const report = validateGodotCli(args.dir, validateUnityCli(args.dir, validateDir(args.dir, createReport(args.dir, unityExecutableResolution, godotExecutableResolution)), unityExecutableResolution.path), godotExecutableResolution.path);
  printReport(report, args.json);
  process.exit(report.status === "failed" ? 1 : 0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`AGM Unity export validation failed: ${message}\n`);
  process.exit(1);
}
