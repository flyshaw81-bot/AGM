// Check why mapCoordinates still empty
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;

  return {
    mapCoordinates: ctx.worldSettings.mapCoordinates,
    climate_coordinates: ctx.climate?.coordinates,
    ws_mapSizePercent: ctx.worldSettings.mapSizePercent,
    global_mapCoordinates: globalThis.mapCoordinates,
    global_mapSizePercent: globalThis.mapSizePercent,
    global_latitudePercent: globalThis.latitudePercent,
    calculateMapCoordinates_global: typeof window.calculateMapCoordinates,
    temp_sample: Array.from(ctx.grid.cells.temp.slice(0, 20)),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
