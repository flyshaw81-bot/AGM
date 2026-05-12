// Monkey-patch defineEngineMapSize to trace internal behavior
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  if (!ctx) return { ctxExists: false };

  // Patch resolveEngineMapPlacementValues to trace
  const origResolve = window.resolveEngineMapPlacementValues;
  const traceData = [];

  window.resolveEngineMapPlacementValues = function(template, targets) {
    const result = origResolve(template, targets);
    traceData.push({
      template,
      result_size: result.size,
      result_latitude: result.latitude,
      result_longitude: result.longitude,
      isLocked_mapSize: targets.isLocked("mapSize"),
      isLocked_latitude: targets.isLocked("latitude"),
      isLocked_longitude: targets.isLocked("longitude"),
      isDefault: targets.isDefaultOptionsRequested(),
    });
    return result;
  };

  // Also patch the runtime setMapPlacementValue to trace
  const origSMPV = ctx.mapPlacement.defineMapSize;
  ctx.mapPlacement.defineMapSize = function(templateId) {
    const before = ctx.worldSettings.mapSizePercent;
    origSMPV.call(ctx.mapPlacement, templateId);
    const after = ctx.worldSettings.mapSizePercent;
    traceData.push({ event: "mapPlacement.defineMapSize", templateId, before, after });
  };

  // Call lifecycle.defineMapSize
  ctx.lifecycle.defineMapSize(ctx);

  return {
    traceData,
    final_mapSizePercent: ctx.worldSettings.mapSizePercent,
    final_latitudePercent: ctx.worldSettings.latitudePercent,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
