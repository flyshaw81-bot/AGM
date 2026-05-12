// Compare lifecycle.defineMapSize vs mapPlacement.defineMapSize
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  if (!ctx) return { ctxExists: false };

  // Reset worldSettings to zero to test clean
  ctx.worldSettings.mapSizePercent = 0;
  ctx.worldSettings.latitudePercent = 0;
  ctx.worldSettings.longitudePercent = 0;
  ctx.worldSettings.mapCoordinates = {};

  // Test 1: Call lifecycle.defineMapSize
  ctx.lifecycle.defineMapSize(ctx);

  const afterLifecycle = {
    mapSizePercent: ctx.worldSettings.mapSizePercent,
    latitudePercent: ctx.worldSettings.latitudePercent,
    longitudePercent: ctx.worldSettings.longitudePercent,
  };

  // Reset again
  ctx.worldSettings.mapSizePercent = 0;
  ctx.worldSettings.latitudePercent = 0;
  ctx.worldSettings.longitudePercent = 0;

  // Test 2: Call mapPlacement.defineMapSize directly
  ctx.mapPlacement.defineMapSize(ctx.generationSettings?.heightmapTemplateId);

  const afterDirect = {
    mapSizePercent: ctx.worldSettings.mapSizePercent,
    latitudePercent: ctx.worldSettings.latitudePercent,
    longitudePercent: ctx.worldSettings.longitudePercent,
  };

  // Also check: what settings does lifecycle.defineMapSize pass?
  // It reads from createLifecycleSettingsSnapshot
  const gs = ctx.generationSettings;
  const ws = ctx.worldSettings;

  return {
    afterLifecycle,
    afterDirect,
    genSettings: {
      template: gs?.heightmapTemplateId,
      mapSizePercent_snapshot: ws.mapSizePercent,
      latitudePercent_snapshot: ws.latitudePercent,
      longitudePercent_snapshot: ws.longitudePercent,
    },
    lifecycleCheck: {
      // Does lifecycle.defineMapSize use context.mapPlacement?
      mapPlacementType: typeof ctx.mapPlacement,
      mapPlacementHasDefine: typeof ctx.mapPlacement?.defineMapSize,
    },
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
