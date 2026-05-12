// Deep test: toggle many layers and check if SVG content renders
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

// Check what draw functions exist on runtime vs globalThis
const funcCheck = await page.evaluate(() => {
  const runtime = window.__agmActiveEngineRuntimeContext;
  const names = [
    "drawTexture","drawHeightmap","drawBiomes","drawFeatures","drawCells",
    "drawGrid","drawCoordinates","drawRivers","drawReliefIcons",
    "drawReligions","drawCultures","drawStates","drawProvinces",
    "drawZones","drawBorders","drawRoutes","drawTemperature",
    "drawPopulation","drawIce","drawPrecipitation","drawEmblems",
    "drawLabels","drawBurgIcons","drawMilitary","drawMarkers",
  ];
  const result = [];
  for (const name of names) {
    const onGlobal = typeof window[name] === "function";
    const onRuntime = typeof runtime?.[name] === "function";
    result.push({ name, onGlobal, onRuntime });
  }
  return result;
});

console.log("=== Draw function availability ===");
console.log("%-22s %8s %8s", "FUNCTION", "global", "runtime");
for (const f of funcCheck) {
  console.log("%-22s %8s %8s", f.name, f.onGlobal ? "YES" : "NO", f.onRuntime ? "YES" : "NO");
}

// Now toggle some layers OFF->ON and check SVG children
const toTest = [
  { key: "toggleTexture", svg: "#texture" },
  { key: "toggleBiomes", svg: "#biomes" },
  { key: "toggleHeight", svg: "#terrs" },
  { key: "toggleCells", svg: "#cells" },
  { key: "toggleGrid", svg: "#gridOverlay" },
  { key: "toggleCoordinates", svg: "#coordinates" },
  { key: "toggleRelief", svg: "#terrain" },
  { key: "toggleTemperature", svg: "#temperature" },
  { key: "togglePopulation", svg: "#population" },
  { key: "toggleCultures", svg: "#cults" },
  { key: "toggleReligions", svg: "#relig" },
  { key: "toggleZones", svg: "#zones" },
  { key: "toggleEmblems", svg: "#emblems" },
  { key: "toggleMilitary", svg: "#armies" },
  { key: "togglePrecipitation", svg: "#prec" },
  { key: "toggleProvinces", svg: "#provs" },
  { key: "toggleMarkers", svg: "#markers" },
];

console.log("\n=== Toggle test: clicking OFF->ON and checking SVG children ===");
for (const { key, svg } of toTest) {
  // Check if currently OFF
  const before = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return { display: el ? getComputedStyle(el).display : "MISSING", children: el?.children.length || 0 };
  }, svg);

  if (before.display === "none" || before.display === "MISSING") {
    // Click to turn ON
    const chip = page.locator(`[data-studio-action="layer"][data-value="${key}"]`);
    if (await chip.count() > 0) {
      await chip.click();
      await page.waitForTimeout(1500);
    }
  }

  const after = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return { display: el ? getComputedStyle(el).display : "MISSING", children: el?.children.length || 0 };
  }, svg);

  const chipState = await page.evaluate((k) => {
    const btn = document.querySelector(`[data-studio-action="layer"][data-value="${k}"]`);
    return btn?.classList.contains("is-active") || false;
  }, key);

  console.log("%-22s display=%-8s children=%-4d chip=%s",
    key, after.display, after.children, chipState ? "ON" : "OFF");
}

await browser.close();
