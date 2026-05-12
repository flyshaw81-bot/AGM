// Root cause analysis: why are drawTexture/drawGrid/drawCells/drawCoordinates/drawPopulation/drawPrecipitation missing?
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const workbenchBtn = page.locator('[data-studio-action="direct-workbench-jump"]').first();
if (await workbenchBtn.isVisible()) {
  await workbenchBtn.click();
  await page.waitForTimeout(3000);
}

const layersBtn = page.locator('[data-studio-action="section"][data-value="layers"]');
if (await layersBtn.count() > 0) {
  await layersBtn.click();
  await page.waitForTimeout(1000);
}

// Check which toggle functions exist on globalThis
const globalFuncs = await page.evaluate(() => {
  const all = [
    "toggleTexture","toggleHeight","toggleBiomes","toggleRelief",
    "toggleStates","toggleProvinces","toggleBorders","toggleLabels",
    "toggleRivers","toggleRoutes","togglePopulation",
    "toggleCells","toggleGrid","toggleCoordinates","toggleCompass",
    "toggleRulers","toggleScaleBar","toggleVignette",
    "toggleIce","toggleCultures","toggleReligions","toggleZones",
    "toggleTemperature","togglePrecipitation",
    "toggleEmblems","toggleBurgIcons","toggleMilitary","toggleMarkers",
  ];
  const results = [];
  for (const key of all) {
    const fn = window[key];
    results.push({
      key,
      type: typeof fn,
      isFunction: typeof fn === "function",
      source: typeof fn === "function" ? fn.toString().substring(0, 200) : "N/A",
    });
  }
  return results;
});

console.log("=== Toggle function types on window ===");
for (const f of globalFuncs) {
  console.log("%-22s type=%-10s",
    f.key, f.isFunction ? "FUNCTION" : f.type);
}

// Check if drawTexture etc exist as global functions elsewhere
const globalDraws = await page.evaluate(() => {
  const names = [
    "drawTexture","drawHeightmap","drawBiomes","drawFeatures","drawCells",
    "drawGrid","drawCoordinates","drawRivers","drawReliefIcons",
    "drawReligions","drawCultures","drawStates","drawProvinces",
    "drawZones","drawBorders","drawRoutes","drawTemperature",
    "drawPopulation","drawIce","drawPrecipitation","drawEmblems",
    "drawLabels","drawBurgIcons","drawMilitary","drawMarkers",
    "drawScaleBar","drawVignette","drawCompass",
  ];
  const results = [];
  for (const name of names) {
    const fn = window[name];
    results.push({
      name,
      exists: fn !== undefined,
      type: typeof fn,
    });
  }
  return results;
});

console.log("\n=== Draw functions on window ===");
for (const f of globalDraws) {
  if (f.type !== "function") {
    console.log("  MISSING: %s (type=%s)", f.name, f.type);
  }
}

// Check if there's a legacy JS engine being loaded
const legacyCheck = await page.evaluate(() => {
  // Check if FMG layers.js loaded
  const hasFMGLayers = document.querySelector("script[src*='layers']") !== null;
  const fmgReady = typeof window.FMG !== "undefined";
  return { hasFMGLayers, fmgReady };
});
console.log("\n=== Legacy engine check ===", JSON.stringify(legacyCheck));

// Now test: can we manually call drawTexture?
const manualDraw = await page.evaluate(() => {
  // Try finding it on any reachable object
  const runtime = window.__agmActiveEngineRuntimeContext;

  // Check if there's a renderFunctions object
  const results = [];
  if (runtime) {
    for (const key of Object.keys(runtime)) {
      if (key.includes("render") || key.includes("draw") || key.includes("texture") || key.includes("grid")) {
        results.push(key + ": " + typeof runtime[key]);
      }
    }
  }

  // Also try the native V8 bottom card functions
  const textureCard = document.querySelector('[data-native-v8-layer-card="true"][data-value="toggleTexture"]');

  return {
    runtimeKeys: results.slice(0, 20),
    textureCardExists: !!textureCard,
    textureCardText: textureCard?.getAttribute("aria-label"),
  };
});

console.log("\n=== Runtime keys containing render/draw/texture ===");
console.log(JSON.stringify(manualDraw, null, 2));

await browser.close();
