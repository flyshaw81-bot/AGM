// Debug: zoom in to see white blocks detail
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

// Zoom in on a specific area to see what the white blocks look like
await page.evaluate(() => {
  // Check what elements have white fill in the main map area
  const info = {};

  // Check coastline group
  const coastlineGroup = document.querySelector("#coastline");
  if (coastlineGroup) {
    const seaIsland = coastlineGroup.querySelector("#sea_island");
    const lakeIsland = coastlineGroup.querySelector("#lake_island");
    info.coastline = {
      seaIslandUses: seaIsland?.querySelectorAll("use")?.length,
      lakeIslandUses: lakeIsland?.querySelectorAll("use")?.length,
      seaIslandFilter: seaIsland?.getAttribute("filter"),
    };
  }

  // Check states body
  const statesBody = document.getElementById("statesBody");
  const statePaths = statesBody?.querySelectorAll("path");
  const state0Paths = [];
  statePaths?.forEach(p => {
    const fill = p.getAttribute("fill");
    if (fill === "#ffffff" || fill === "white" || fill === "#fff") {
      state0Paths.push({
        id: p.getAttribute("id"),
        dpreview: p.getAttribute("d")?.substring(0, 100),
      });
    }
  });
  info.state0Paths = state0Paths;

  // Check water mask
  const water = document.querySelector("#water");
  const waterRects = water?.querySelectorAll("rect");
  const waterUses = water?.querySelectorAll("use");
  info.water = {
    rectCount: waterRects?.length || 0,
    useCount: waterUses?.length || 0,
  };

  // Check land mask
  const land = document.querySelector("#land");
  info.land = {
    useCount: land?.querySelectorAll("use")?.length || 0,
  };

  return info;
}).then(info => console.log(JSON.stringify(info, null, 2)));

// Check features paths for white-ish fills
const featureInfo = await page.evaluate(() => {
  const featurePaths = document.querySelector("#featurePaths");
  const paths = featurePaths?.querySelectorAll("path");
  const result = [];
  paths?.forEach(p => {
    const fill = p.getAttribute("fill");
    const id = p.getAttribute("id");
    result.push({ id, fill });
  });
  return result.slice(0, 20);
});
console.log("Feature paths:", JSON.stringify(featureInfo, null, 2));

// Take screenshot of the area where white blocks appear
await page.evaluate(() => {
  // Try to zoom by setting transform on viewbox
  const viewbox = document.querySelector("#viewbox");
  if (viewbox) {
    viewbox.setAttribute("transform", "scale(1.5)");
  }
});
await page.waitForTimeout(500);
await page.screenshot({ path: "D:/DPAGM/scripts/dpagm-zoomed.png" });
console.log("Zoomed screenshot saved");

await browser.close();
