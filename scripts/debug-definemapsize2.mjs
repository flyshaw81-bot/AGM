// Call defineMapSize through the lifecycle path exactly as the pipeline does
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Collect console.error
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(err.message));

// Navigate and interrupt before generate to inject our own test
await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(3000);

// Check what happens BEFORE the full generation runs
const result = await page.evaluate(() => {
  // Check if we can access the context before generation
  const ctx = window.__agmActiveEngineRuntimeContext;
  if (!ctx) return { stage: "pre-generation", ctxExists: false };

  const ws = ctx.worldSettings;
  const gs = ctx.generationSettings;

  // Call lifecycle.defineMapSize just like the pipeline does
  try {
    ctx.lifecycle.defineMapSize(ctx);
  } catch(e) {
    return { stage: "defineMapSize-error", error: e.message };
  }

  // Call lifecycle.calculateMapCoordinates just like the pipeline does
  try {
    ctx.lifecycle.calculateMapCoordinates(ctx);
  } catch(e) {
    return { stage: "calculateMapCoordinates-error", error: e.message };
  }

  return {
    stage: "after-both",
    mapSizePercent: ws.mapSizePercent,
    latitudePercent: ws.latitudePercent,
    longitudePercent: ws.longitudePercent,
    mapCoordinates: ws.mapCoordinates,
    template: gs?.heightmapTemplateId,
  };
});

console.log(JSON.stringify(result, null, 2));
if (errors.length) console.log("Errors:", errors);
await browser.close();
