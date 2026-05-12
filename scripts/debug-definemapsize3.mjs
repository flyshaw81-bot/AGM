// Detailed trace of defineMapSize through lifecycle
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  if (!ctx) return { ctxExists: false };

  // Trace exactly what happens inside lifecycle.defineMapSize

  // 1. Check context state before
  const before = {
    lifecycleExists: !!ctx.lifecycle,
    mapPlacementExists: !!ctx.mapPlacement,
    worldSettingsStoreExists: !!ctx.worldSettingsStore,
    mapSizePercent: ctx.worldSettings.mapSizePercent,
    template: ctx.generationSettings?.heightmapTemplateId,
  };

  // 2. Trace mapPlacement path
  ctx.mapPlacement.defineMapSize("continents");

  // 3. Check after
  const after = {
    mapSizePercent: ctx.worldSettings.mapSizePercent,
    latitudePercent: ctx.worldSettings.latitudePercent,
    longitudePercent: ctx.worldSettings.longitudePercent,
  };

  // 4. Check isLocked behavior
  const lockedResult = typeof globalThis.locked === "function"
    ? { mapSize: globalThis.locked("mapSize"), latitude: globalThis.locked("latitude"), longitude: globalThis.locked("longitude") }
    : "no locked function";

  // 5. Check isDefaultOptionsRequested
  const isDefault = (() => {
    try { return new URL(window.location.href).searchParams.get("options") === "default"; }
    catch { return false; }
  })();

  // 6. Manually call defineEngineMapSize through the runtime targets to see if it works
  const targets = ctx.mapPlacement;
  // Try calling through the raw lifecycle target instead
  ctx.mapPlacement.defineMapSize("europe");

  const after2 = {
    mapSizePercent: ctx.worldSettings.mapSizePercent,
    latitudePercent: ctx.worldSettings.latitudePercent,
  };

  return { before, after, after2, lockedResult, isDefault };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
