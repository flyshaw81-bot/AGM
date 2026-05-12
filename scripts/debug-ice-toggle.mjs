// Verify: toggle off ice layer, check if white blocks disappear
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const beforeResult = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const grid = ctx.grid;

  // Use grid.cells (the actual cell data)
  const { h, temp } = grid.cells;

  // Check how many water cells have temp <= 0
  let waterCells = 0, coldWaterCells = 0;
  const allTemps = [];
  for (let i = 0; i < h.length; i++) {
    allTemps.push(temp[i]);
    if (h[i] < 20) { // water
      waterCells++;
      if (temp[i] <= 0) coldWaterCells++;
    }
  }

  return {
    iceCount: pack.ice?.length || 0,
    icebergCount: pack.ice?.filter(e => e.type === "iceberg").length,
    glacierCount: pack.ice?.filter(e => e.type === "glacier").length,
    totalCells: h.length,
    waterCells,
    coldWaterCells,
    coldWaterPct: waterCells ? ((coldWaterCells / waterCells) * 100).toFixed(1) : "0",
    tempRange: {
      min: Math.min(...allTemps),
      max: Math.max(...allTemps),
    },
    iceLayerVisible: document.getElementById("ice")?.style.display !== "none",
  };
});

console.log("=== BEFORE toggling ice off ===");
console.log(JSON.stringify(beforeResult, null, 2));

// Now hide the ice layer and take screenshot
await page.evaluate(() => {
  const ice = document.getElementById("ice");
  if (ice) ice.style.display = "none";
});

await page.waitForTimeout(500);

// Take screenshot after hiding ice
await page.screenshot({ path: "D:/DPAGM/scripts/screenshots/no-ice.png", fullPage: false });

const afterResult = await page.evaluate(() => {
  return {
    iceHidden: document.getElementById("ice")?.style.display === "none",
  };
});

console.log("\n=== AFTER toggling ice off ===");
console.log(JSON.stringify(afterResult, null, 2));

await browser.close();
