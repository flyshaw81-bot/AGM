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
  if (!manifestFile) throw new Error("Missing AGM engine manifest in Godot smoke package");
  return path.join(manifestDir, manifestFile);
}

const args = process.argv.slice(2);
const projectPath = valueAfter(args, "--path");
if (!projectPath) throw new Error("Missing --path");

const packageRoot = path.join(projectPath, "agm_engine_package");
const sampleMetadata = readJson(path.join(packageRoot, "handoff", "importer-sample-metadata.json"));
const manifest = readJson(findManifestPath(packageRoot));
const heightfield = readJson(path.join(packageRoot, sampleMetadata.terrainInput.heightfieldPath));
const raw16Values = readRaw16Values(path.join(packageRoot, sampleMetadata.terrainInput.raw16Path));
const resourceMap = readJson(path.join(packageRoot, sampleMetadata.mapLayers.resource));
const provinceMap = readJson(path.join(packageRoot, sampleMetadata.mapLayers.province));
const biomeMap = readJson(path.join(packageRoot, sampleMetadata.mapLayers.biome));

const failMode = process.env.AGM_MOCK_GODOT_MODE === "addon-smoke-fail";
const report = {
  schema: "agm.godot-addon-smoke-report.v0",
  status: failMode ? "addon-import-contract-smoke-failed" : "addon-import-contract-smoke-passed",
  packageId: manifest.manifest?.id || sampleMetadata.package?.id || path.basename(packageRoot),
  heightSampleCount: heightfield.values.length,
  raw16SampleCount: failMode ? raw16Values.length - 1 : raw16Values.length,
  resourceRecords: resourceMap.tiles.length,
  provinceRecords: provinceMap.tiles.length,
  biomeRecords: biomeMap.biomes.length,
  addonRoot: "addons/agm_importers_godot",
  expectedDeliverableRoot: "addons/agm_importers_godot",
  productionAddonIncluded: false,
  createsGodotResources: false,
  createsPackedScenes: false,
  pluginCfgIncludedInEnginePackage: false,
  sourceSampleOnly: true,
  mockOrFixtureResult: false,
};

fs.writeFileSync(path.join(projectPath, "agm-godot-smoke-report.json"), JSON.stringify(report, null, 2));
if (!failMode) process.stdout.write("AGM_GODOT_ADDON_SMOKE_PASSED\n");
process.exit(0);
