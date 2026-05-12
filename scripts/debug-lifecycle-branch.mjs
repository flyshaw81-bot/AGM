// Monkey-patch to trace lifecycle defineMapSize branch
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  if (!ctx) return { ctxExists: false };

  const traces = [];

  // Monkey-patch to trace
  const origDefine = ctx.lifecycle.defineMapSize.bind(ctx.lifecycle);
  ctx.lifecycle.defineMapSize = function(context) {
    const ws = context.worldSettings;
    traces.push({
      event: "defineMapSize-called",
      mapPlacementExists: !!context.mapPlacement,
      mapPlacementDefineType: typeof context.mapPlacement?.defineMapSize,
      mapSizePercent_before: ws.mapSizePercent,
    });

    // Call the original
    origDefine(context);

    traces.push({
      event: "defineMapSize-done",
      mapSizePercent_after: ws.mapSizePercent,
      latitudePercent_after: ws.latitudePercent,
    });
  };

  // Call lifecycle.defineMapSize
  ctx.lifecycle.defineMapSize(ctx);

  return traces;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
