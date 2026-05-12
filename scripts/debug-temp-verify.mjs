// Verify temperature distribution
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const temp = ctx.grid.cells.temp;
  const h = ctx.grid.cells.h;

  // Full temperature distribution
  const tempDist = {};
  for (let i = 0; i < temp.length; i++) {
    const t = temp[i];
    tempDist[t] = (tempDist[t] || 0) + 1;
  }

  // Water vs land temperatures
  const waterTemps = [];
  const landTemps = [];
  for (let i = 0; i < temp.length; i++) {
    if (h[i] < 20) waterTemps.push(temp[i]);
    else landTemps.push(temp[i]);
  }

  return {
    mapSizePercent: ctx.worldSettings.mapSizePercent,
    latitudePercent: ctx.worldSettings.latitudePercent,
    mapCoordinates: ctx.worldSettings.mapCoordinates,
    tempDistribution: Object.entries(tempDist).sort(([a], [b]) => Number(a) - Number(b)),
    waterTempRange: {
      min: Math.min(...waterTemps),
      max: Math.max(...waterTemps),
    },
    landTempRange: {
      min: Math.min(...landTemps),
      max: Math.max(...landTemps),
    },
    iceCount: ctx.pack.ice?.length,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
