// Check if map coordinates are properly calculated
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Listen for console messages
const logs = [];
page.on("console", (msg) => {
  logs.push(msg.text().substring(0, 200));
});

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const ws = ctx.worldSettings;
  const wsStore = ctx.worldSettingsStore?.get?.();

  // Try to see what defineMapSize would produce
  // Check if mapSize was defined
  return {
    worldSettings: {
      graphWidth: ws.graphWidth,
      graphHeight: ws.graphHeight,
      mapSizePercent: ws.mapSizePercent,
      latitudePercent: ws.latitudePercent,
      longitudePercent: ws.longitudePercent,
      mapCoordinates: ws.mapCoordinates,
    },
    worldSettingsStore: wsStore,
    generationSettings: ctx.generationSettings,
    options: {
      temperatureEquator: ctx.options?.temperatureEquator,
      temperatureNorthPole: ctx.options?.temperatureNorthPole,
      temperatureSouthPole: ctx.options?.temperatureSouthPole,
    },
  };
});

console.log(JSON.stringify(result, null, 2));

// Show relevant console logs
const relevantLogs = logs.filter(l =>
  l.includes("mapSize") || l.includes("lat") || l.includes("temp") || l.includes("coord")
);
console.log("\nRelevant console logs:", relevantLogs.slice(0, 20));

await browser.close();
