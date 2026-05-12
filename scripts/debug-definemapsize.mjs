// Directly call defineMapSize and check results
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;

  // Check the pre-generation values
  const before = {
    ws_mapSizePercent: ctx.worldSettings.mapSizePercent,
    ws_latitudePercent: ctx.worldSettings.latitudePercent,
    ws_longitudePercent: ctx.worldSettings.longitudePercent,
    global_mapSizePercent: globalThis.mapSizePercent,
    global_latitudePercent: globalThis.latitudePercent,
    global_longitudePercent: globalThis.longitudePercent,
    global_locked: typeof globalThis.locked,
  };

  // Now try calling defineMapSize with the current template
  const heightmapTemplateId = ctx.generationSettings?.heightmapTemplateId || "lowIsland";

  // Call the global function directly
  if (typeof window.defineMapSize === "function") {
    window.defineMapSize(heightmapTemplateId);
  }

  // Check values after calling defineMapSize
  const after = {
    ws_mapSizePercent: ctx.worldSettings.mapSizePercent,
    ws_latitudePercent: ctx.worldSettings.latitudePercent,
    ws_longitudePercent: ctx.worldSettings.longitudePercent,
    global_mapSizePercent: globalThis.mapSizePercent,
    global_latitudePercent: globalThis.latitudePercent,
    global_longitudePercent: globalThis.longitudePercent,
  };

  // Now try calling calculateMapCoordinates
  if (typeof window.calculateMapCoordinates === "function") {
    window.calculateMapCoordinates({
      mapSizePercent: after.global_mapSizePercent,
      latitudePercent: after.global_latitudePercent,
      longitudePercent: after.global_longitudePercent,
    });
  }

  const afterCoords = {
    ws_mapCoordinates: ctx.worldSettings.mapCoordinates,
    global_mapCoordinates: globalThis.mapCoordinates,
  };

  // Check grid.cells.temp after manual coordinates
  const temps = [];
  for (let i = 0; i < 10; i++) {
    temps.push(ctx.grid.cells.temp[i]);
  }

  return {
    before,
    heightmapTemplateId,
    after,
    afterCoords,
    tempSample: temps,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
