// Verify each layer toggle actually works
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

// Enter workbench
const workbenchBtn = page.locator('[data-studio-action="direct-workbench-jump"]').first();
if (await workbenchBtn.isVisible()) {
  await workbenchBtn.click();
  await page.waitForTimeout(3000);
}

// Navigate to layers section
const layersBtn = page.locator('[data-studio-action="section"][data-value="layers"]');
if (await layersBtn.count() > 0) {
  await layersBtn.click();
  await page.waitForTimeout(1000);
}

const allKeys = [
  "toggleTexture","toggleHeight","toggleBiomes","toggleRelief",
  "toggleStates","toggleProvinces","toggleBorders","toggleLabels",
  "toggleRivers","toggleRoutes","togglePopulation",
  "toggleCells","toggleGrid","toggleCoordinates","toggleCompass","toggleRulers","toggleScaleBar","toggleVignette",
  "toggleIce","toggleCultures","toggleReligions","toggleZones","toggleTemperature","togglePrecipitation",
  "toggleEmblems","toggleBurgIcons","toggleMilitary","toggleMarkers",
];

// For each toggle key, check:
// 1. Does the DOM button exist?
// 2. Does window[toggleKey] exist (legacy function)?
// 3. What's the current active state?
const results = await page.evaluate((keys) => {
  const results = [];
  for (const key of keys) {
    const chipBtn = document.querySelector(`[data-studio-action="layer"][data-value="${key}"]`);
    const legacyFn = typeof window[key] === "function";
    const isActive = chipBtn?.classList.contains("is-active") || false;

    // Check SVG target
    const svgTargets = {
      toggleTexture: "#texture",
      toggleHeight: "#terrs",
      toggleBiomes: "#biomes",
      toggleRelief: "#terrain",
      toggleStates: "#regions",
      toggleProvinces: "#provs",
      toggleBorders: "#borders",
      toggleLabels: "#labels",
      toggleRivers: "#rivers",
      toggleRoutes: "#routes",
      togglePopulation: "#population",
      toggleCells: "#cells",
      toggleGrid: "#gridOverlay",
      toggleCoordinates: "#coordinates",
      toggleCompass: "#compass",
      toggleRulers: "#ruler",
      toggleScaleBar: "#scaleBar",
      toggleVignette: "#vignette",
      toggleIce: "#ice",
      toggleCultures: "#cults",
      toggleReligions: "#relig",
      toggleZones: "#zones",
      toggleTemperature: "#temperature",
      togglePrecipitation: "#prec",
      toggleEmblems: "#emblems",
      toggleBurgIcons: "#icons",
      toggleMilitary: "#armies",
      toggleMarkers: "#markers",
    };

    const svgSelector = svgTargets[key];
    const svgEl = svgSelector ? document.querySelector(svgSelector) : null;
    const svgDisplay = svgEl ? getComputedStyle(svgEl).display : null;
    const svgExists = !!svgEl;

    results.push({
      key,
      chipExists: !!chipBtn,
      isActive,
      legacyFn,
      svgExists,
      svgDisplay,
      svgChildren: svgEl?.children.length || 0,
    });
  }
  return results;
}, allKeys);

console.log("=== Layer Toggle Status ===");
console.log("%-25s %8s %8s %8s %10s %6s", "KEY", "CHIP", "ACTIVE", "LEGACY", "SVG", "CHILD");
console.log("".padEnd(75, "-"));
for (const r of results) {
  console.log(
    "%-25s %8s %8s %8s %10s %6d",
    r.key,
    r.chipExists ? "YES" : "NO",
    r.isActive ? "ON" : "OFF",
    r.legacyFn ? "YES" : "NO",
    r.svgDisplay || (r.svgExists ? "HIDDEN" : "MISSING"),
    r.svgChildren,
  );
}

// Now try toggling "toggleTexture" and see what happens
console.log("\n=== Test: Toggle toggleTexture ===");
const textureBefore = await page.evaluate(() => {
  const svg = document.querySelector("#texture");
  return { display: getComputedStyle(svg).display, children: svg?.children.length || 0 };
});
console.log("BEFORE:", JSON.stringify(textureBefore));

const textureChip = page.locator('[data-studio-action="layer"][data-value="toggleTexture"]');
if (await textureChip.count() > 0) {
  await textureChip.click();
  await page.waitForTimeout(2000);
}

const textureAfter = await page.evaluate(() => {
  const svg = document.querySelector("#texture");
  return { display: getComputedStyle(svg).display, children: svg?.children.length || 0 };
});
console.log("AFTER:", JSON.stringify(textureAfter));

// Check console for errors
const errors = await page.evaluate(() => {
  // Capture any window errors
  const msgs = [];
  if (window.__lastError) msgs.push(window.__lastError);
  return msgs;
});
console.log("Errors:", JSON.stringify(errors));

await browser.close();
