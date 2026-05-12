// Trace the full pipeline with specific worldSettings logging
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Collect all console messages
const logLines = [];
page.on("console", (msg) => logLines.push(msg.text()));

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;

  return {
    ws: ctx.worldSettings,
    wsStore: ctx.worldSettingsStore?.get?.(),
    gs: ctx.generationSettings,
    options: ctx.options,
    grid_cells_count: ctx.grid?.cells?.i?.length,
    pack_cells_count: ctx.pack?.cells?.i?.length,
    mapCoordinates: ctx.worldSettings.mapCoordinates,
    climate_coordinates: ctx.climate?.coordinates,
    temp_first10: Array.from(ctx.grid.cells.temp.slice(0, 10)),
    temp_unique: (() => {
      const s = new Set();
      for (let i = 0; i < Math.min(ctx.grid.cells.temp.length, 500); i++) s.add(ctx.grid.cells.temp[i]);
      return [...s].sort((a,b) => a-b);
    })(),
    seed: ctx.seed,
  };
});

console.log(JSON.stringify(result, null, 2));

// Look for map size related messages
const relevantLogs = logLines.filter(l =>
  l.includes("Map size") || l.includes("mapSize") || l.includes("mapSizePercent") ||
  l.includes("defineMapSize") || l.includes("mapCoordinates")
);
console.log("\n=== Relevant console messages ===");
relevantLogs.slice(0, 20).forEach(l => console.log(l));

await browser.close();
