/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceRoots = [resolve(repoRoot, "src")];

function collectSourceFiles(path: string): string[] {
  const stat = statSync(path);
  if (stat.isFile()) return /\.(ts|js)$/.test(path) ? [path] : [];

  return readdirSync(path).flatMap((entry) => {
    if (entry === "node_modules" || entry === "dist") return [];
    return collectSourceFiles(join(path, entry));
  });
}

function isTestFile(file: string): boolean {
  return /\.test\.ts$/.test(file) || file.includes("\\tests\\");
}

describe("engine global boundary", () => {
  it("keeps draw-function calls behind the typed V2 boundary", () => {
    const offenders = sourceRoots
      .flatMap(collectSourceFiles)
      .filter((file) => !file.endsWith("engineGlobalBoundary.test.ts"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        return source.includes("callGlobalDraw(")
          ? [file.replace(`${repoRoot}\\`, "").replace(/\\/g, "/")]
          : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps new module and Studio code from adding ad-hoc callGlobal helpers", () => {
    const offenders = sourceRoots
      .flatMap(collectSourceFiles)
      .filter((file) => !file.endsWith("engineGlobalBoundary.test.ts"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        return /\bfunction\s+callGlobal\b|\bcallGlobal\(/.test(source)
          ? [file.replace(`${repoRoot}\\`, "").replace(/\\/g, "/")]
          : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps shared render globals behind engine-render-adapter", () => {
    const allowedBoundary = "src/modules/engine-render-adapter.ts";
    const sharedRenderGlobalPattern =
      /globalThis\.(layerIsOn|drawHeightmap|drawBiomes|drawCells|invokeActiveZooming)|\(globalThis as any\)\.(drawHeightmap|drawBiomes|drawCells|invokeActiveZooming)|get[A-Za-z]+Window\(\)\.(layerIsOn|drawHeightmap|drawBiomes|drawCells|invokeActiveZooming)/;
    const offenders = sourceRoots
      .flatMap(collectSourceFiles)
      .filter((file) => !isTestFile(file))
      .flatMap((file) => {
        const relativeFile = file
          .replace(`${repoRoot}\\`, "")
          .replace(/\\/g, "/");
        if (relativeFile === allowedBoundary) return [];

        const source = readFileSync(file, "utf8");
        return sharedRenderGlobalPattern.test(source) ? [relativeFile] : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps algorithm data globals behind browser adapter boundaries", () => {
    const allowedBoundaries = new Set([
      "src/modules/emblem/generator.ts",
      "src/modules/engine-generation-statistics-service.ts",
      "src/modules/engine-map-graph-lifecycle-service.ts",
      "src/modules/engine-map-placement-service.ts",
      "src/modules/engine-route-service.ts",
      "src/modules/engine-runtime-settings.ts",
      "src/modules/engine-seed-session.ts",
      "src/studio/bridge/engineBrowserPackAdapter.ts",
    ]);
    const dataGlobalPattern =
      /globalThis\.(pack|grid|options|seed|biomesData|graphWidth|graphHeight|mapCoordinates)\b/;
    const offenders = sourceRoots
      .flatMap(collectSourceFiles)
      .filter((file) => !isTestFile(file))
      .flatMap((file) => {
        const relativeFile = file
          .replace(`${repoRoot}\\`, "")
          .replace(/\\/g, "/");
        if (allowedBoundaries.has(relativeFile)) return [];

        const source = readFileSync(file, "utf8");
        return dataGlobalPattern.test(source) ? [relativeFile] : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps direct engine data container globals out of product code", () => {
    const allowedBoundaries = new Set([
      "src/modules/engine-browser-runtime-globals.ts",
      "src/modules/engine-map-store.ts",
      "src/modules/engine-runtime-context.ts",
      "src/modules/engine-lifecycle-adapter.ts",
      "src/modules/engine-render-adapter.ts",
      "src/modules/engine-burg-service.ts",
    ]);
    const directDataGlobalPattern =
      /globalThis\.(pack|grid|options|seed)\b|typeof\s+(pack|grid|options|seed|mapCoordinates)\b(?!\.)/;
    const offenders = sourceRoots
      .flatMap(collectSourceFiles)
      .filter((file) => !isTestFile(file))
      .flatMap((file) => {
        const relativeFile = file
          .replace(`${repoRoot}\\`, "")
          .replace(/\\/g, "/");
        if (allowedBoundaries.has(relativeFile)) return [];
        if (relativeFile === "src/types/global.ts") return [];

        const source = readFileSync(file, "utf8");
        return directDataGlobalPattern.test(source) ? [relativeFile] : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps the old public main entry deleted", () => {
    const mainPath = resolve(repoRoot, "public/main.js");

    expect(existsSync(mainPath)).toBe(false);
  });

  it("keeps the AGM-owned browser runtime boot free of legacy dialogs", () => {
    const bootPath = resolve(
      repoRoot,
      "src/modules/engine-browser-runtime-main.ts",
    );
    const source = readFileSync(bootPath, "utf8");

    expect(source).not.toContain(".dialog(");
    expect(source).not.toContain("modules/ui/");
    expect(source).not.toContain("modules/dynamic/");
    expect(source).not.toContain("modules/io/");
    expect(source).not.toContain("versioning.js");
  });

  it("keeps Studio root html writes behind the render-slot boundary", () => {
    const allowedBoundary = "src/studio/app/studioRenderSlots.ts";
    const rootHtmlWritePattern =
      /\b(?:root|studioRoot|container)\.innerHTML\s*=|Reflect\.set\(\s*(?:root|studioRoot|container)\s*,\s*["']innerHTML["']/;
    const offenders = [resolve(repoRoot, "src/studio")]
      .flatMap(collectSourceFiles)
      .filter((file) => !isTestFile(file))
      .flatMap((file) => {
        const relativeFile = file
          .replace(`${repoRoot}\\`, "")
          .replace(/\\/g, "/");
        if (relativeFile === allowedBoundary) return [];

        const source = readFileSync(file, "utf8");
        return rootHtmlWritePattern.test(source) ? [relativeFile] : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps extracted generation entrypoints out of the browser runtime boot", () => {
    const bootPath = resolve(
      repoRoot,
      "src/modules/engine-browser-runtime-main.ts",
    );
    const source = readFileSync(bootPath, "utf8");

    expect(source).not.toContain("async function generate(");
    expect(source).not.toContain("function defineMapSize(");
    expect(source).not.toContain("function setSeed(");
    expect(source).not.toContain("function rankCells(");
    expect(source).not.toContain("function reGraph(");
    expect(source).not.toContain("function calculateMapCoordinates(");
    expect(source).not.toContain("function calculateTemperatures(");
    expect(source).not.toContain("function generatePrecipitation(");
    expect(source).not.toContain("function showStatistics(");
    expect(source).not.toContain("const regenerateMap");
    expect(source).not.toContain("function hideLoading(");
    expect(source).not.toContain("function showLoading(");
    expect(source).not.toContain("function focusOn(");
    expect(source).not.toContain("function findBurgForMFCG(");
    expect(source).not.toContain("async function checkLoadParameters(");
    expect(source).not.toContain("async function generateMapOnLoad(");
    expect(source).not.toContain("function isLocalRuntime(");
    expect(source).not.toContain("function toggleAssistant(");
    expect(source).not.toContain("function zoomTo(");
    expect(source).not.toContain("function resetZoom(");
    expect(source).not.toContain("function invokeActiveZooming(");
    expect(source).not.toContain("function undraw(");
    expect(source).not.toContain("addDragToUpload");
    expect(source).not.toContain("function addLakesInDeepDepressions(");
    expect(source).not.toContain("function openNearSeaLakes(");
    expect(source).not.toContain("function isWetLand(");
    expect(source).not.toContain("Object.assign(window, {populationRate");
    expect(source).not.toContain("var populationRate");
    expect(source).not.toContain("var mapSizePercent");
    expect(source).not.toContain("window.setStudioViewportSize =");
  });

  it("keeps zero-legacy UI and IO scripts disconnected from the HTML boot path", () => {
    const indexPath = resolve(repoRoot, "src/index.html");
    const source = readFileSync(indexPath, "utf8").toLowerCase();
    const forbiddenEntrypoints = [
      "modules/ui/",
      "modules/dynamic/",
      "modules/io/",
      "jquery",
      "versioning.js",
      "public/main.js",
      "%base_url%main.js",
    ];

    const offenders = forbiddenEntrypoints.filter((entrypoint) =>
      source.includes(entrypoint),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps legacy IO dialog markup out of the HTML shell", () => {
    const indexPath = resolve(repoRoot, "src/index.html");
    const source = readFileSync(indexPath, "utf8");
    const forbiddenMarkup = [
      "exportMapData",
      "saveMapData",
      "loadMapData",
      "exportToPngTilesScreen",
      "pngResolutionInput",
      "tileColsOutput",
      "tileRowsOutput",
      "tileScaleOutput",
      "saveGeoJson",
      "exportToJson(",
    ];

    const offenders = forbiddenMarkup.filter((entrypoint) =>
      source.includes(entrypoint),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps replaced legacy editor and tooling dialogs out of the HTML shell", () => {
    const indexPath = resolve(repoRoot, "src/index.html");
    const source = readFileSync(indexPath, "utf8");
    const forbiddenDialogIds = [
      "labelEditor",
      "riverEditor",
      "riverCreator",
      "lakeEditor",
      "elevationProfile",
      "routeEditor",
      "routeCreator",
      "routeGroupsEditor",
      "iceEditor",
      "coastlineEditor",
      "reliefEditor",
      "burgEditor",
      "markerEditor",
      "regimentEditor",
      "battleScreen",
      "regimentSelectorScreen",
      "brushesPanel",
      "templateEditor",
      "imageConverter",
      "biomesEditor",
      "stateNameEditor",
      "provincesEditor",
      "diplomacyEditor",
      "diplomacyMatrix",
      "provinceNameEditor",
      "namesbaseEditor",
      "zonesEditor",
      "notesEditor",
      "aiGenerator",
      "emblemEditor",
      "unitsEditor",
      "burgsOverview",
      "burgGroupsEditor",
      "routesOverview",
      "riversOverview",
      "militaryOverview",
      "regimentsOverview",
      "militaryOptions",
      "markersOverview",
      "styleSaver",
      "addFontDialog",
      "cellInfo",
      "iconSelector",
      "submapTool",
      "transformTool",
      "preview3d",
      "worldConfigurator",
      "options3d",
    ];

    const offenders = forbiddenDialogIds.filter((id) =>
      source.includes(`id="${id}"`),
    );

    expect(offenders).toEqual([]);
    expect(source).not.toContain('class="dialog');
  });

  it("keeps legacy inline browser event handlers out of the HTML shell", () => {
    const indexPath = resolve(repoRoot, "src/index.html");
    const source = readFileSync(indexPath, "utf8");

    expect(source).not.toMatch(/\son(?:click|change)=/);
  });

  it("keeps deleted legacy public module directories from returning", () => {
    const forbiddenPaths = [
      "public/modules/ui",
      "public/modules/dynamic",
      "public/modules/io",
      "public/versioning.js",
      "public/dropbox.html",
      "public/libs/dropbox-sdk.min.js",
      "public/libs/jquery-3.1.1.min.js",
      "public/libs/jquery-ui.css",
      "public/libs/jquery-ui.min.js",
      "public/libs/jquery.ui.touch-punch.min.js",
      "public/libs/tinymce",
    ];

    const offenders = forbiddenPaths.filter((entrypoint) =>
      existsSync(resolve(repoRoot, entrypoint)),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps the AGM-owned browser runtime boot from importing deleted legacy public modules", () => {
    const bootPath = resolve(
      repoRoot,
      "src/modules/engine-browser-runtime-main.ts",
    );
    const source = readFileSync(bootPath, "utf8");
    const forbiddenReferences = [
      "modules/ui/",
      "modules/dynamic/",
      "modules/io/",
      "versioning.js",
    ];

    const offenders = forbiddenReferences.filter((reference) =>
      source.includes(reference),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps product source free of legacy dialog, jQuery, and Dropbox references", () => {
    const forbiddenPatterns = [
      /\bui-dialog\b/,
      /\bjQuery\b/,
      /\bjquery\b/,
      /\bdropbox\b/i,
      /\bglobalThis\.\$/,
      /\.dialog\(/,
    ];
    const offenders = [resolve(repoRoot, "src"), resolve(repoRoot, "tests")]
      .flatMap(collectSourceFiles)
      .filter((file) => !file.endsWith("engineGlobalBoundary.test.ts"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        return forbiddenPatterns.some((pattern) => pattern.test(source))
          ? [file.replace(`${repoRoot}\\`, "").replace(/\\/g, "/")]
          : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps deleted legacy public APIs out of global type declarations", () => {
    const checkedPaths = [
      resolve(repoRoot, "src/types/global.ts"),
      resolve(repoRoot, "src/modules/engine-startup-service.ts"),
    ];
    const forbiddenDeclarations = [
      "var $",
      "var saveMap",
      "var quickLoad",
      "var generateMapOnLoad",
      "var loadURL",
      "var loadMapFromURL",
      "var uploadMap",
      "var toggleStates",
      "var toggleBorders",
      "var toggleRoutes",
      "var toggleRivers",
      "var toggleBurgIcons",
      "var toggleLabels",
      "var toggleScaleBar",
      "var editStates",
      "var editCultures",
      "var editReligions",
      "var editBiomes",
      "var editProvinces",
      "var editZones",
      "var editDiplomacy",
    ];

    const offenders = checkedPaths.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return forbiddenDeclarations
        .filter((declaration) => source.includes(declaration))
        .map(
          (declaration) =>
            `${path.replace(`${repoRoot}\\`, "").replace(/\\/g, "/")}:${declaration}`,
        );
    });

    expect(offenders).toEqual([]);
  });

  it("keeps engine context and state types off legacy global data-container aliases", () => {
    const checkedFiles = [
      "src/modules/engine-world-state.ts",
      "src/modules/engine-runtime-context.ts",
      "src/modules/engine-climate-context.ts",
      "src/modules/climate.ts",
      "src/modules/engine-map-store.ts",
      "src/modules/engine-generation-session-services.ts",
      "src/modules/engine-options-session.ts",
    ];
    const forbiddenTypeAnchors = [
      "typeof pack",
      "typeof grid",
      "typeof options",
      "typeof seed",
    ];
    const offenders = checkedFiles.flatMap((relativeFile) => {
      const source = readFileSync(resolve(repoRoot, relativeFile), "utf8");
      return forbiddenTypeAnchors
        .filter((anchor) => source.includes(anchor))
        .map((anchor) => `${relativeFile}:${anchor}`);
    });

    expect(offenders).toEqual([]);
  });

  it("keeps Studio data action targets on AGM-owned method names", () => {
    const targetsPath = resolve(
      repoRoot,
      "src/studio/bridge/engineDataActionTargets.ts",
    );
    const source = readFileSync(targetsPath, "utf8");
    const targetsType = source.match(
      /export type EngineDataActionTargets = \{[\s\S]*?\n\};/,
    )?.[0];
    const forbiddenTargetMethods = [
      "canQuickLoad",
      "quickLoad:",
      "quickLoad(",
      "canSaveMap",
      "saveMap:",
      "saveMap(",
      "canGenerateMapOnLoad",
      "generateMapOnLoad:",
      "generateMapOnLoad(",
      "canLoadUrl",
      "loadUrl:",
      "loadUrl(",
    ];

    expect(targetsType).toBeTruthy();
    const offenders = forbiddenTargetMethods.filter((method) =>
      targetsType?.includes(method),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps Studio data action internals on the AGM runtime data facade", () => {
    const targetsPath = resolve(
      repoRoot,
      "src/studio/bridge/engineDataActionTargets.ts",
    );
    const source = readFileSync(targetsPath, "utf8");

    expect(source).not.toContain("function getRuntimeFunction");
    expect(source).not.toContain("getRuntimeFunction(");
    expect(source).toContain("function createAgmDataRuntimeOperations");
    expect(source).toContain("getAgmRuntimeDataFacade");
  });

  it("keeps deleted runtime, editor, and data action names out of product source", () => {
    const checkedRoots = [
      resolve(repoRoot, "src/modules"),
      resolve(repoRoot, "src/studio"),
      resolve(repoRoot, "src/index.html"),
      resolve(repoRoot, "tests"),
    ];
    const forbiddenNames = [
      "quickLoad",
      "saveMap",
      "loadMapFromURL",
      "uploadMap",
      "loadURL",
      "editStates",
      "editCultures",
      "editReligions",
      "editBiomes",
      "editProvinces",
      "editZones",
      "editDiplomacy",
      "quick-load",
      "save-storage",
      "save-machine",
      "new-map",
      "load-url",
    ];
    const checkedFiles = checkedRoots.flatMap((path) =>
      statSync(path).isFile() ? [path] : collectSourceFiles(path),
    );
    const offenders = checkedFiles
      .filter((file) => !file.endsWith("engineGlobalBoundary.test.ts"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        return forbiddenNames
          .filter((name) => source.includes(name))
          .map(
            (name) =>
              `${file.replace(`${repoRoot}\\`, "").replace(/\\/g, "/")}:${name}`,
          );
      });

    expect(offenders).toEqual([]);
  });

  it("keeps document-source tracking on AGM-owned target methods", () => {
    const sourcePath = resolve(
      repoRoot,
      "src/studio/bridge/engineDocumentSource.ts",
    );
    const source = readFileSync(sourcePath, "utf8");
    const targetsType = source.match(
      /export type EngineDocumentSourceTargets = \{[\s\S]*?\n\};/,
    )?.[0];
    const forbiddenTargetMethods = ["getRuntimeFunction", "setRuntimeFunction"];

    expect(targetsType).toBeTruthy();
    const offenders = forbiddenTargetMethods.filter((method) =>
      targetsType?.includes(method),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps startup and drag upload targets on AGM-owned import names", () => {
    const targetChecks = [
      {
        path: resolve(repoRoot, "src/modules/engine-startup-service.ts"),
        pattern: /export type EngineStartupTargets = \{[\s\S]*?\n\};/,
        forbidden: ["loadMapFromURL:", "uploadMap:"],
      },
      {
        path: resolve(repoRoot, "src/modules/engine-drag-upload-service.ts"),
        pattern: /export type EngineDragUploadTargets = \{[\s\S]*?\n\};/,
        forbidden: ["uploadMap:"],
      },
    ];

    const offenders = targetChecks.flatMap((check) => {
      const source = readFileSync(check.path, "utf8");
      const targetsType = source.match(check.pattern)?.[0];

      expect(targetsType).toBeTruthy();

      return check.forbidden
        .filter((method) => targetsType?.includes(method))
        .map(
          (method) =>
            `${check.path.replace(`${repoRoot}\\`, "").replace(/\\/g, "/")}:${method}`,
        );
    });

    expect(offenders).toEqual([]);
  });

  it("keeps legacy e2e scripts out of package health checks", () => {
    const packageJsonPath = resolve(repoRoot, "package.json");
    const source = readFileSync(packageJsonPath, "utf8");

    expect(source).not.toContain("test:e2e:legacy");
    expect(source).not.toContain("test:e2e:studio:legacy-shell");
  });

  it("keeps V2 generation boundary modules mounted before the browser runtime boot", () => {
    const modulesIndexPath = resolve(repoRoot, "src/modules/index.ts");
    const source = readFileSync(modulesIndexPath, "utf8");
    const requiredImports = [
      'import "./climate";',
      'import "./engine-seed-session";',
      'import "./engine-runtime-defaults";',
      'import "./engine-generation-session-services";',
      'import "./engine-map-placement-service";',
      'import "./engine-generation-statistics-service";',
      'import "./engine-map-graph-lifecycle-service";',
      'import "./engine-loading-service";',
      'import "./engine-focus-service";',
      'import "./engine-assistant-service";',
      'import "./engine-native-runtime-entrypoints";',
      'import "./engine-startup-service";',
      'import "./engine-viewport-service";',
      'import "./engine-canvas-clear-service";',
      'import "./engine-drag-upload-service";',
      'import "./engine-water-feature-service";',
      'import "./engine-regeneration-service";',
      'import "./cell-ranking";',
      'import "./engine-generation-pipeline";',
    ];

    const missingImports = requiredImports.filter(
      (importStatement) => !source.includes(importStatement),
    );

    expect(missingImports).toEqual([]);
  });
});
