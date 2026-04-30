import {expect, test} from "@playwright/test";
import type {Page, TestInfo} from "@playwright/test";
import fs from "fs/promises";
import path from "path";
import {spawnSync} from "child_process";
import fsSync from "fs";

const repoRoot = path.resolve(__dirname, "../..");
const validatorScript = path.join(repoRoot, "scripts", "validate-unity-export.mjs");
const mockUnityScript = path.join(repoRoot, "scripts", "mock-unity-batchmode.mjs");
const mockGodotScript = path.join(repoRoot, "scripts", "mock-godot-headless.mjs");

test.describe.configure({timeout: 120000});

type ZipEntry = {name: string; bytes: number[]};
type ValidatorReport = {
  status: string;
  structureValidated?: boolean;
  unityCliDetected?: boolean;
  unityExecutableSource?: string;
  unityExecutableCandidates?: string[];
  unityExecutableSearch?: {commands?: string[]; hubEditors?: string[]; standaloneEditors?: string[]; executableRelativePath?: string};
  unitySmokeReadiness?: {
    schema: string;
    status: string;
    smokeType: string;
    executableValidated: boolean;
    executable: string | null;
    executableSource: string;
    executableCandidates: string[];
    searchedCommands: string[];
    searchedUnityHubEditorRoots: string[];
    searchedStandaloneEditorRoots: string[];
    requiredForReleaseCandidate: boolean;
    mockOrFixtureResult: boolean;
    captured: boolean;
    pendingReason: string;
    expectedCommand: string;
    expectedEnvCommand: string;
    reportSchema: string;
  };
  godotSmokeReadiness?: {
    schema: string;
    status: string;
    smokeType: string;
    executableValidated: boolean;
    executable: string | null;
    executableSource: string;
    executableCandidates: string[];
    searchedCommands: string[];
    searchedStandaloneRoots: string[];
    requiredForReleaseCandidate: boolean;
    mockOrFixtureResult: boolean;
    captured: boolean;
    pendingReason: string;
    expectedCommand: string;
    expectedEnvCommand: string;
    reportSchema: string;
    expectedDeliverableRoot: string;
  };
  editorValidated?: boolean;
  unityCompileValidated?: boolean;
  terrainPrototypeValidated?: boolean;
  assetAuthoringPrototypeValidated?: boolean;
  runtimeImportIssueValidated?: boolean;
  unityDiagnostics?: string[];
  warnings?: string[];
  unityProjectPath?: string | null;
  unityLogPath?: string | null;
  unityProjectRetained?: boolean;
  unityProjectCleanup?: string;
  godotSmokeCaptured?: boolean;
  godotProjectPath?: string | null;
  godotSmokeReportPath?: string | null;
  godotProjectRetained?: boolean;
  godotProjectCleanup?: string;
  godotAddonSmokeReport?: {
    schema: string;
    status: string;
    packageId: string;
    heightSampleCount: number;
    raw16SampleCount: number;
    resourceRecords: number;
    provinceRecords: number;
    biomeRecords: number;
    addonRoot: string;
    expectedDeliverableRoot: string;
    productionAddonIncluded: boolean;
    createsGodotResources: boolean;
    createsPackedScenes: boolean;
    pluginCfgIncludedInEnginePackage: boolean;
    sourceSampleOnly: boolean;
    mockOrFixtureResult: boolean;
  };
  checks: Array<{name: string; passed: boolean; detail?: string}>;
};

async function exportEnginePackageZip(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("agm-studio-language", "en"));
  await page.reload({waitUntil: "domcontentloaded"});
  const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
  await projectNav.click();
  const projectDocumentPanel = page
    .locator("[data-studio-project-document='true']")
    .first();
  const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
  await nameInput.fill("Importer Fixture Draft");
  await expect(nameInput).toHaveValue("Importer Fixture Draft");

  const exportNav = page.locator(
    ".studio-nav [data-studio-action='section'][data-value='export']",
  );
  await exportNav.click();
  const engineHandoff = page
    .locator(".studio-sidebar--right details")
    .filter({hasText: "Engine handoff"})
    .first();
  await engineHandoff.locator("summary").click();
  const downloadPromise = page.waitForEvent("download");
  await engineHandoff
    .getByRole("button", {name: "Export Engine Package ZIP"})
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Importer-Fixture-Draft.agm-engine-package.zip");
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  return fs.readFile(downloadPath!);
}

async function extractEnginePackage(page: Page, zipBytes: Buffer, outputDir: string) {
  const entries = await page.evaluate(async (bytes: number[]) => {
    const JsZip = (window as any).JSZip;
    if (!JsZip) throw new Error("JSZip is unavailable for Engine Package extraction");
    const zip = await JsZip.loadAsync(new Uint8Array(bytes));
    const files = Object.keys(zip.files).filter(name => !zip.files[name].dir).sort();
    return Promise.all(files.map(async name => ({name, bytes: Array.from(await zip.file(name).async("uint8array"))})));
  }, Array.from(zipBytes)) as ZipEntry[];

  expect(entries.length).toBeGreaterThan(0);
  expect(entries.some(entry => entry.name.endsWith(".asset") || entry.name.endsWith(".prefab") || entry.name.endsWith(".unitypackage") || entry.name.endsWith(".cs") || entry.name === "handoff/importers/unity/package.json" || entry.name.endsWith("/package.json") || entry.name.startsWith("Plugins/AGMImportersUnreal/") || entry.name.endsWith(".uasset") || entry.name.endsWith(".umap") || entry.name.endsWith(".Build.cs"))).toBe(false);

  await fs.rm(outputDir, {recursive: true, force: true});
  for (const entry of entries) {
    const target = path.join(outputDir, entry.name);
    await fs.mkdir(path.dirname(target), {recursive: true});
    await fs.writeFile(target, Buffer.from(entry.bytes));
  }
  return entries.map(entry => entry.name);
}

function runValidator(args: string[], env: NodeJS.ProcessEnv = {}) {
  const result = spawnSync(process.execPath, [validatorScript, ...args, "--json"], {
    cwd: repoRoot,
    env: {...process.env, ...env},
    encoding: "utf8",
    timeout: 600000,
  });
  const stdout = result.stdout.trim();
  let report: ValidatorReport | null = null;
  if (stdout) report = JSON.parse(stdout) as ValidatorReport;
  return {exitCode: result.status ?? 1, stdout, stderr: result.stderr, report};
}

function check(report: ValidatorReport, name: string) {
  const item = report.checks.find(candidate => candidate.name === name);
  if (!item) throw new Error(`Missing validator check: ${name}`);
  return item;
}

async function exportAndExtract(page: Page, testInfo: TestInfo) {
  const zipBytes = await exportEnginePackageZip(page);
  const extractedDir = testInfo.outputPath("engine-package");
  const entries = await extractEnginePackage(page, zipBytes, extractedDir);
  expect(entries).toEqual(expect.arrayContaining([
    "handoff/importer-sample-metadata.json",
    "handoff/importers/unity/package-layout.json",
    "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt",
    "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt",
    "handoff/importers/unity/Editor/AgmImportMenu.cs.txt",
    "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt",
    "handoff/importers/godot/README.md",
    "handoff/importers/godot/agm_importer_stub.gd.txt",
    "handoff/importers/unreal/README.md",
    "handoff/importers/unreal/AgmImporterStub.cpp.txt",
  ]));
  return extractedDir;
}

test("validates extracted Engine Package without Unity", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir], {AGM_UNITY_DISABLE_AUTO_DISCOVERY: "1", AGM_GODOT_DISABLE_AUTO_DISCOVERY: "1"});

  expect(result.stderr).toBe("");
  expect(result.exitCode).toBe(0);
  expect(result.report).toBeTruthy();
  expect(result.report).toEqual(expect.objectContaining({
    status: "structure-passed-unity-unavailable",
    structureValidated: true,
    unityCliDetected: false,
    unityExecutableSource: "auto-discovery-disabled",
    unityExecutableCandidates: [],
  }));
  expect(result.report!.warnings).toEqual(expect.arrayContaining([
    expect.stringContaining("rerun with --unity <Unity executable>"),
    expect.stringContaining("Searched Unity commands:"),
    expect.stringContaining("Searched Unity Hub editor roots:"),
    expect.stringContaining("Searched standalone Unity editor roots:"),
    expect.stringContaining("Next Unity smoke command:"),
    expect.stringContaining("Next Godot smoke command:"),
  ]));
  expect(result.report!.unityExecutableSearch?.commands?.length).toBeGreaterThan(0);
  expect(result.report!.unityExecutableSearch?.hubEditors?.length).toBeGreaterThan(0);
  expect(result.report!.unityExecutableSearch?.standaloneEditors?.length).toBeGreaterThan(0);
  expect(result.report!.unitySmokeReadiness).toEqual(expect.objectContaining({
    schema: "agm.unity-smoke-readiness.v0",
    status: "unity-executable-unavailable",
    smokeType: "batchmode-package-import-and-editor-prototype",
    executableValidated: false,
    executable: null,
    executableSource: "auto-discovery-disabled",
    executableCandidates: [],
    requiredForReleaseCandidate: true,
    mockOrFixtureResult: false,
    captured: false,
    pendingReason: "Unity executable was not supplied or auto-discovered on this machine",
    reportSchema: "agm.unity-validation-report.v0",
  }));
  expect(result.report!.unitySmokeReadiness?.searchedCommands.length).toBeGreaterThan(0);
  expect(result.report!.unitySmokeReadiness?.searchedUnityHubEditorRoots.length).toBeGreaterThan(0);
  expect(result.report!.unitySmokeReadiness?.searchedStandaloneEditorRoots.length).toBeGreaterThan(0);
  expect(result.report!.unitySmokeReadiness?.expectedCommand).toContain("--unity <Unity executable> --json");
  expect(result.report!.unitySmokeReadiness?.expectedEnvCommand).toContain("UNITY_EXECUTABLE=<Unity executable>");
  expect(result.report!.godotSmokeReadiness).toEqual(expect.objectContaining({
    schema: "agm.godot-smoke-readiness.v0",
    status: "godot-executable-unavailable",
    smokeType: "addon-import-contract-smoke",
    executableValidated: false,
    executable: null,
    requiredForReleaseCandidate: true,
    mockOrFixtureResult: false,
    captured: false,
    pendingReason: "Godot executable was not supplied or auto-discovered on this machine",
    reportSchema: "agm.godot-addon-smoke-report.v0",
    expectedDeliverableRoot: "addons/agm_importers_godot",
  }));
  expect(result.report!.godotSmokeReadiness?.searchedCommands.length).toBeGreaterThan(0);
  expect(result.report!.godotSmokeReadiness?.searchedStandaloneRoots.length).toBeGreaterThan(0);
  expect(result.report!.godotSmokeReadiness?.expectedCommand).toContain("--godot <Godot executable> --json");
  expect(result.report!.godotSmokeReadiness?.expectedEnvCommand).toContain("GODOT_EXECUTABLE=<Godot executable>");
  expect(check(result.report!, "godot-smoke-readiness")).toEqual(expect.objectContaining({passed: true, detail: "Godot smoke readiness recorded; executable unavailable"}));
  expect(check(result.report!, "production-plugin-boundary").passed).toBe(true);
  expect(check(result.report!, "unity-production-importer-packaging-plan").passed).toBe(true);
  expect(check(result.report!, "unity-production-importer-package-scaffold").passed).toBe(true);
  expect(check(result.report!, "unity-production-importer-runtime-contract").passed).toBe(true);
  expect(check(result.report!, "unity-package-compile-gate").passed).toBe(false);
  expect(check(result.report!, "unity-package-import-smoke-test").passed).toBe(false);
  expect(check(result.report!, "unity-asset-authoring-spike-metadata").passed).toBe(true);
  expect(check(result.report!, "unity-asset-authoring-non-asset-output").passed).toBe(true);
  expect(check(result.report!, "unity-forbidden-editor-apis-absent").passed).toBe(true);
  expect(check(result.report!, "godot-production-importer-packaging-plan").passed).toBe(true);
  expect(check(result.report!, "godot-source-sample-contract").passed).toBe(true);
  expect(check(result.report!, "godot-production-addon-boundary").passed).toBe(true);
  expect(check(result.report!, "godot-addon-boundary-review")).toEqual(expect.objectContaining({passed: true, detail: "Godot addon deliverable boundary verified; Engine Package ZIP remains source-sample-only"}));
  expect(check(result.report!, "godot-project-created").passed).toBe(false);
  expect(check(result.report!, "godot-source-copied").passed).toBe(false);
  expect(check(result.report!, "godot-addon-smoke-report").passed).toBe(false);
  expect(check(result.report!, "unreal-production-importer-packaging-plan")).toEqual(expect.objectContaining({passed: true, detail: "Unreal importer remains a source-sample scaffold for a separate plugin review"}));
  expect(check(result.report!, "unreal-source-sample-contract")).toEqual(expect.objectContaining({passed: true, detail: "2 Unreal source sample artifacts validated"}));
  expect(check(result.report!, "unreal-production-plugin-boundary")).toEqual(expect.objectContaining({passed: true, detail: "Engine Package ZIP contains no Unreal .uplugin, Build.cs, production source, .uasset, or .umap outputs"}));
  expect(check(result.report!, "unreal-plugin-boundary-review")).toEqual(expect.objectContaining({passed: true, detail: "Unreal plugin deliverable boundary verified; Engine Package ZIP remains source-sample-only"}));
  expect(check(result.report!, "real-engine-smoke-records")).toEqual(expect.objectContaining({passed: true, detail: "real Unity/Godot/Unreal smoke records are tracked as required but not yet captured"}));
});

test("validates extracted Engine Package with mock Godot addon smoke", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--godot", mockGodotScript], {AGM_UNITY_DISABLE_AUTO_DISCOVERY: "1"});

  expect(result.stderr).toBe("");
  expect(result.exitCode).toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "structure-passed-godot-smoke-captured",
    structureValidated: true,
    unityCliDetected: false,
    godotCliDetected: true,
    godotSmokeCaptured: true,
  }));
  expect(result.report!.godotSmokeReadiness).toEqual(expect.objectContaining({
    schema: "agm.godot-smoke-readiness.v0",
    status: "godot-smoke-captured",
    captured: true,
    executableValidated: true,
    pendingReason: "real Godot addon smoke record captured",
    reportSchema: "agm.godot-addon-smoke-report.v0",
    expectedDeliverableRoot: "addons/agm_importers_godot",
  }));
  expect(result.report!.godotAddonSmokeReport).toEqual(expect.objectContaining({
    schema: "agm.godot-addon-smoke-report.v0",
    status: "addon-import-contract-smoke-passed",
    addonRoot: "addons/agm_importers_godot",
    expectedDeliverableRoot: "addons/agm_importers_godot",
    productionAddonIncluded: false,
    createsGodotResources: false,
    createsPackedScenes: false,
    pluginCfgIncludedInEnginePackage: false,
    sourceSampleOnly: true,
    mockOrFixtureResult: false,
  }));
  expect(result.report!.godotAddonSmokeReport!.raw16SampleCount).toBe(result.report!.godotAddonSmokeReport!.heightSampleCount);
  expect(["removed-after-success", "retained-for-cleanup-error"]).toContain(result.report!.godotProjectCleanup);
  expect(check(result.report!, "godot-cli-executable")).toEqual(expect.objectContaining({passed: true, detail: mockGodotScript}));
  expect(check(result.report!, "godot-project-created").passed).toBe(true);
  expect(check(result.report!, "godot-source-copied")).toEqual(expect.objectContaining({passed: true, detail: "Godot source sample copied into temp addon project"}));
  expect(check(result.report!, "godot-addon-smoke-report")).toEqual(expect.objectContaining({passed: true, detail: "Godot addon import contract smoke report valid"}));
  expect(check(result.report!, "godot-smoke-readiness")).toEqual(expect.objectContaining({passed: true, detail: "Godot addon smoke captured"}));
  expect(check(result.report!, "real-engine-smoke-records")).toEqual(expect.objectContaining({passed: true, detail: "real Godot addon smoke captured; Unity/Unreal smoke records remain pending"}));
});

test("fails mock Godot addon smoke when report violates contract", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--godot", mockGodotScript], {AGM_UNITY_DISABLE_AUTO_DISCOVERY: "1", AGM_MOCK_GODOT_MODE: "addon-smoke-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    godotCliDetected: true,
    godotSmokeCaptured: false,
    godotProjectRetained: true,
    godotProjectCleanup: "retained-for-failure-diagnostics",
  }));
  expect(result.report!.godotProjectPath).toBeTruthy();
  expect(fsSync.existsSync(result.report!.godotProjectPath!)).toBe(true);
  expect(check(result.report!, "godot-addon-smoke-report")).toEqual(expect.objectContaining({passed: false, detail: "status mismatch: addon-import-contract-smoke-failed"}));
  expect(check(result.report!, "godot-smoke-readiness")).toEqual(expect.objectContaining({passed: false, detail: "Godot addon smoke failed"}));
});
test("validates extracted Engine Package with mock Unity", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript]);

  expect(result.stderr).toBe("");
  expect(result.exitCode).toBe(0);
  expect(result.report).toBeTruthy();
  expect(result.report).toEqual(expect.objectContaining({
    status: "passed",
    editorValidated: true,
    unityCompileValidated: true,
    terrainPrototypeValidated: true,
    assetAuthoringPrototypeValidated: true,
  }));
  expect(result.report!.assetAuthoringPrototypeValidated).toBe(true);
  expect(["removed-after-success", "retained-for-cleanup-error"]).toContain(result.report!.unityProjectCleanup);
  if (result.report!.unityProjectCleanup === "removed-after-success") {
    expect(result.report!).toEqual(expect.objectContaining({unityProjectRetained: false, unityProjectPath: null, unityLogPath: null}));
  } else {
    expect(result.report!).toEqual(expect.objectContaining({unityProjectRetained: true}));
    expect(result.report!.warnings).toEqual(expect.arrayContaining([expect.stringContaining("temporary project cleanup failed")]));
  }
  const packageCompileGate = result.report!.importedPackageSummary.unityPackageCompileGate;
  expect(packageCompileGate).toEqual(expect.objectContaining({schema: "agm.unity-package-compile-gate.v0", status: "compiled-in-validator-temp-project", packageName: "com.agm.importers.unity", packageRoot: "Packages/com.agm.importers.unity", packageVersion: "0.1.0-preview.1", includedInEnginePackageZip: false}));
  expect(packageCompileGate.compiledFiles).toEqual(expect.arrayContaining(["package.json", "Runtime/AGM.Importers.Unity.Runtime.asmdef", "Runtime/AgmRuntimePackageImporter.cs", "Runtime/AgmPackageTypes.cs", "Editor/AGM.Importers.Unity.Editor.asmdef", "Editor/AgmImportMenu.cs", "Editor/AgmImporterWindow.cs", "Editor/AgmAssetAuthoringPrototype.cs", "Samples~/ImporterFixture/README.md", "README.md"]));
  expect(packageCompileGate.assemblies).toEqual(expect.arrayContaining(["AGM.Importers.Unity.Runtime", "AGM.Importers.Unity.Editor"]));
  const packageImportSmokeTest = result.report!.importedPackageSummary.unityPackageImportSmokeTest;
  expect(packageImportSmokeTest).toEqual(expect.objectContaining({schema: "agm.unity-package-import-smoke-test.v0", status: "package-importer-consumed-engine-package", packageName: "com.agm.importers.unity", packageRoot: "Packages/com.agm.importers.unity", importer: "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage", runtimeApi: "AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage", runtimeReportSchema: "agm.unity-runtime-import-report.v0", mismatchDetail: "none", productionAssetOutput: false, includedInEnginePackageZip: false}));
  expect(packageImportSmokeTest).toEqual(expect.objectContaining({packageIdMatches: true, heightSampleCountMatches: true, gridMatches: true, raw16Matches: true, mapLayerRecordsMatch: true}));
  expect(packageImportSmokeTest.sourceSampleSummary).toEqual(expect.objectContaining({packageId: expect.any(String), heightSampleCount: expect.any(Number), grid: expect.any(String), raw16SampleCount: expect.any(Number), resourceRecords: expect.any(Number), provinceRecords: expect.any(Number), biomeRecords: expect.any(Number)}));
  expect(packageImportSmokeTest.packageImporterSummary).toEqual(packageImportSmokeTest.sourceSampleSummary);
  expect(result.report!.unityPackageImportSmokeTestValidated).toBe(true);
  expect(result.report!.runtimeImportIssueValidated).toBe(true);
  expect(check(result.report!, "unity-runtime-issue-taxonomy")).toEqual(expect.objectContaining({passed: true, detail: "runtime issue taxonomy available; no import issue reported"}));
  const assetAuthoringPrototype = result.report!.importedPackageSummary.assetAuthoringPrototype;
  expect(assetAuthoringPrototype).toEqual(expect.objectContaining({
    status: "editor-prototype-authored",
    outputScope: "validator-temp-unity-project-only",
    createsUnityPackage: false,
    productionPluginIncluded: false,
    runtimeValidated: false,
  }));
  expect(assetAuthoringPrototype.createdArtifacts.map((artifact: {kind: string}) => artifact.kind).sort()).toEqual(["prefab", "terrain-data", "world-scriptable-object"]);
  for (const checkName of ["production-plugin-boundary", "unity-production-importer-packaging-plan", "unity-production-importer-package-scaffold", "unity-production-importer-runtime-contract", "unity-package-release-candidate-review", "unity-package-compile-gate", "unity-package-import-smoke-test", "unity-runtime-importer-called", "unity-imported-package-report", "unity-data-asset-prototype", "unity-asset-authoring-report", "unity-asset-authoring-non-asset-output", "godot-production-importer-packaging-plan", "godot-source-sample-contract", "godot-production-addon-boundary", "godot-addon-boundary-review", "unreal-production-importer-packaging-plan", "unreal-source-sample-contract", "unreal-production-plugin-boundary", "unreal-plugin-boundary-review", "real-engine-smoke-records"]) {
    expect(check(result.report!, checkName).passed).toBe(true);
  }
});

test("retains mock Unity project on successful validation when requested", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_UNITY_RETAIN_PROJECT: "1"});

  expect(result.stderr).toBe("");
  expect(result.exitCode).toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "passed",
    unityProjectRetained: true,
    unityProjectCleanup: "retained-by-env",
  }));
  expect(result.report!.unityProjectPath).toBeTruthy();
  expect(fsSync.existsSync(result.report!.unityProjectPath!)).toBe(true);
});

test("fails mock Unity validation when asset authoring creates assets", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_MOCK_UNITY_MODE: "asset-authoring-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    assetAuthoringPrototypeValidated: false,
    unityProjectRetained: true,
    unityProjectCleanup: "retained-for-failure-diagnostics",
  }));
  expect(result.report!.unityProjectPath).toBeTruthy();
  expect(fsSync.existsSync(result.report!.unityProjectPath!)).toBe(true);
  expect(check(result.report!, "unity-asset-authoring-report")).toEqual(expect.objectContaining({passed: false, detail: "expected 3 artifacts, got 2"}));
  expect(check(result.report!, "unity-asset-authoring-non-asset-output")).toEqual(expect.objectContaining({passed: false, detail: "expected 3 artifacts, got 2"}));
});

test("fails mock Unity validation when asset authoring reports artifacts outside scope", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_MOCK_UNITY_MODE: "asset-authoring-scope-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    assetAuthoringPrototypeValidated: false,
  }));
  expect(check(result.report!, "unity-asset-authoring-report")).toEqual(expect.objectContaining({passed: false, detail: "prefab path mismatch: Assets/AGM/Unsafe/AgmWorldPrototype.prefab"}));
  expect(check(result.report!, "unity-asset-authoring-non-asset-output")).toEqual(expect.objectContaining({passed: false, detail: "prefab path mismatch: Assets/AGM/Unsafe/AgmWorldPrototype.prefab"}));
});

test("fails mock Unity validation when asset authoring writes unreported artifacts outside scope", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_MOCK_UNITY_MODE: "asset-authoring-extra-output-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    assetAuthoringPrototypeValidated: false,
    unityProjectRetained: true,
    unityProjectCleanup: "retained-for-failure-diagnostics",
  }));
  expect(check(result.report!, "unity-asset-authoring-report")).toEqual(expect.objectContaining({passed: false, detail: "unexpected Unity authoring artifact output: Assets/AGM/Unsafe/UnreportedPrototype.asset"}));
  expect(check(result.report!, "unity-asset-authoring-non-asset-output")).toEqual(expect.objectContaining({passed: false, detail: "unexpected Unity authoring artifact output: Assets/AGM/Unsafe/UnreportedPrototype.asset"}));
});

test("fails mock Unity validation when package importer smoke test mismatches", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_MOCK_UNITY_MODE: "package-import-smoke-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    unityPackageImportSmokeTestValidated: false,
    unityProjectRetained: true,
    unityProjectCleanup: "retained-for-failure-diagnostics",
  }));
  const packageImportSmokeTest = result.report!.importedPackageSummary.unityPackageImportSmokeTest;
  expect(packageImportSmokeTest).toEqual(expect.objectContaining({heightSampleCountMatches: false, mismatchDetail: "heightSampleCount mismatch: source=16, package=15"}));
  expect(packageImportSmokeTest.sourceSampleSummary).toEqual(expect.objectContaining({heightSampleCount: 16}));
  expect(packageImportSmokeTest.packageImporterSummary).toEqual(expect.objectContaining({heightSampleCount: 15}));
  expect(check(result.report!, "unity-package-import-smoke-test")).toEqual(expect.objectContaining({passed: false, detail: "heightSampleCount mismatch: source=16, package=15"}));
});

test("fails mock Unity validation when runtime issue taxonomy reports import issue", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_MOCK_UNITY_MODE: "runtime-issue-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    runtimeImportIssueValidated: false,
    unityProjectRetained: true,
    unityProjectCleanup: "retained-for-failure-diagnostics",
  }));
  expect(result.report!.importedPackageSummary.runtimeImportIssue).toEqual(expect.objectContaining({
    schema: "agm.unity-runtime-import-issue.v0",
    code: "raw16-byte-length-mismatch",
    expected: "32",
    actual: "30",
  }));
  expect(check(result.report!, "unity-runtime-issue-taxonomy")).toEqual(expect.objectContaining({passed: false, detail: expect.stringContaining("raw16-byte-length-mismatch")}));
});

test("reports Unity compile diagnostics when batchmode compilation fails", async ({page}, testInfo) => {
  const extractedDir = await exportAndExtract(page, testInfo);
  const result = runValidator(["--dir", extractedDir, "--unity", mockUnityScript], {AGM_MOCK_UNITY_MODE: "compile-fail"});

  expect(result.report).toBeTruthy();
  expect(result.exitCode).not.toBe(0);
  expect(result.report).toEqual(expect.objectContaining({
    status: "failed",
    unityCompileValidated: false,
    editorValidated: false,
  }));
  expect(check(result.report!, "unity-editor-compile")).toEqual(expect.objectContaining({passed: false, detail: expect.stringContaining("error CS0103")}));
  expect(result.report!.unityDiagnostics).toEqual(expect.arrayContaining([expect.stringContaining("error CS0103")]));
  expect(result.report!.warnings).toEqual(expect.arrayContaining([expect.stringContaining("error CS0103")]));
});
