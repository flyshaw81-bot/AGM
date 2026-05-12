// Check if calculateClimate is being called and generating temp
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Intercept console before navigation
page.on("console", (msg) => {
  const text = msg.text();
  if (text.includes("calculateTemperatures") || text.includes("sea temperature") || text.includes("temp")) {
    console.log("[BROWSER]", text.substring(0, 200));
  }
});

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

// Check if grid.cells.temp was populated
const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const grid = ctx.grid;
  const pack = ctx.pack;

  // Check: are grid.cells.temp and pack.cells.temp different objects?
  const gridTemp = grid.cells.temp;
  const packTemp = pack.cells?.temp;

  // Is temp typed array or just array?
  const gridTempConstructor = gridTemp?.constructor?.name;

  // Check if calculateTemperatures is available
  const hasClimateModule = typeof window.Climate !== "undefined";
  const hasCalcTemps = typeof window.calculateTemperatures === "function";

  // Try to manually call it to see if it would produce temperatures
  let manualTempResult = null;
  if (hasCalcTemps) {
    try {
      window.calculateTemperatures();
      // Check temps again after manual call
      const uniqueAfter = new Set();
      for (let i = 0; i < Math.min(gridTemp.length, 1000); i++) {
        uniqueAfter.add(gridTemp[i]);
      }
      manualTempResult = { uniqueAfterCall: [...uniqueAfter].sort((a,b) => a-b).slice(0, 20) };
    } catch(e) {
      manualTempResult = { error: e.message };
    }
  }

  return {
    gridTempLength: gridTemp?.length,
    gridTempConstructor,
    gridTempFirst20: Array.from(gridTemp?.slice(0, 20) || []),
    packTempExists: !!packTemp,
    packTempLength: packTemp?.length,
    hasClimateModule,
    hasCalcTemps,
    manualTempResult,
    worldSettings: ctx.worldSettings,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
