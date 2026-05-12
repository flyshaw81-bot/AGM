// Final comprehensive verification of all layer toggles
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

// Test all 28 toggles
const allToggles = [
  { key: "toggleTexture", svg: "#texture" },
  { key: "toggleHeight", svg: "#terrs" },
  { key: "toggleBiomes", svg: "#biomes" },
  { key: "toggleRelief", svg: "#terrain" },
  { key: "toggleStates", svg: "#regions" },
  { key: "toggleProvinces", svg: "#provs" },
  { key: "toggleBorders", svg: "#borders" },
  { key: "toggleLabels", svg: "#labels" },
  { key: "toggleRivers", svg: "#rivers" },
  { key: "toggleRoutes", svg: "#routes" },
  { key: "togglePopulation", svg: "#population" },
  { key: "toggleCells", svg: "#cells" },
  { key: "toggleGrid", svg: "#gridOverlay" },
  { key: "toggleCoordinates", svg: "#coordinates" },
  { key: "toggleCompass", svg: "#compass" },
  { key: "toggleRulers", svg: "#ruler" },
  { key: "toggleScaleBar", svg: "#scaleBar" },
  { key: "toggleVignette", svg: "#vignette" },
  { key: "toggleIce", svg: "#ice" },
  { key: "toggleCultures", svg: "#cults" },
  { key: "toggleReligions", svg: "#relig" },
  { key: "toggleZones", svg: "#zones" },
  { key: "toggleTemperature", svg: "#temperature" },
  { key: "togglePrecipitation", svg: "#prec" },
  { key: "toggleEmblems", svg: "#emblems" },
  { key: "toggleBurgIcons", svg: "#icons" },
  { key: "toggleMilitary", svg: "#armies" },
  { key: "toggleMarkers", svg: "#markers" },
];

console.log("=== Comprehensive Layer Toggle Verification ===\n");
console.log("%-22s %10s %10s %8s %6s", "KEY", "DISPLAY", "CHILDREN", "DRAW_FN", "STATUS");
console.log("".padEnd(70, "-"));

for (const { key, svg } of allToggles) {
  // Check current state
  const before = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return {
      display: el ? getComputedStyle(el).display : "MISSING",
      children: el?.children.length || 0,
    };
  }, svg);

  // Check if draw function exists
  const hasDrawFn = await page.evaluate((k) => {
    const name = "draw" + k.charAt(7).toUpperCase() + k.slice(8);
    // Handle special names
    const nameMap = {
      toggleHeight: "drawHeightmap",
      toggleRelief: "drawReliefIcons",
      toggleBurgIcons: "drawBurgIcons",
      toggleLabels: "drawLabels",
    };
    const fnName = nameMap[k] || name;
    return typeof window[fnName] === "function";
  }, key);

  // Toggle the chip ON if it's OFF (expect first click)
  const beforeChip = await page.evaluate((k) => {
    const btn = document.querySelector(`[data-studio-action="layer"][data-value="${k}"]`);
    return btn?.classList.contains("is-active") || false;
  }, key);

  const chip = page.locator(`[data-studio-action="layer"][data-value="${key}"]`).first();
  await chip.click();
  await page.waitForTimeout(800);

  // After toggle
  const after = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return {
      display: el ? getComputedStyle(el).display : "MISSING",
      children: el?.children.length || 0,
    };
  }, svg);

  const afterChip = await page.evaluate((k) => {
    const btn = document.querySelector(`[data-studio-action="layer"][data-value="${k}"]`);
    return btn?.classList.contains("is-active") || false;
  }, key);

  // Status determination
  let status = "OK";
  if (after.display === "MISSING") status = "NO_SVG";
  else if (!hasDrawFn && after.children === 0 && afterChip !== beforeChip) status = "DISPLAY_ONLY";
  else if (hasDrawFn && after.children === 0) status = "NO_CONTENT";
  else if (!hasDrawFn) status = "NO_DRAW_FN";
  else if (after.children > 0) status = "RENDERS";

  console.log("%-22s %10s %10d %8s %6s",
    key, after.display, after.children, hasDrawFn ? "YES" : "NO", status);
}

await browser.close();
