// Deep check temperature data and generation
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const grid = ctx.grid;
  const pack = ctx.pack;

  const temps = grid.cells.temp;
  const heights = grid.cells.h;
  const features = pack.features;

  // Get unique temperature values
  const uniqueTemps = new Set();
  for (let i = 0; i < temps.length; i++) {
    uniqueTemps.add(temps[i]);
  }

  // Get unique height values
  const uniqueHeights = new Set();
  for (let i = 0; i < heights.length; i++) {
    uniqueHeights.add(heights[i]);
  }

  // Sample some cells with their full data
  const samples = [];
  for (let i = 0; i < 15; i++) {
    const cellId = Math.floor(Math.random() * temps.length);
    const feature = features[grid.cells.f[cellId]];
    samples.push({
      cellId,
      temp: temps[cellId],
      height: heights[cellId],
      featureType: feature?.type,
      pos: grid.points[cellId],
    });
  }

  // Check if pack.cells has temp
  const packTemp = pack.cells?.temp;
  const packTempSample = packTemp ? Array.from(packTemp.slice(0, 20)) : "no pack temp";

  return {
    gridTempLength: temps.length,
    uniqueTempCount: uniqueTemps.size,
    uniqueTemps: [...uniqueTemps].slice(0, 30).sort((a,b) => a-b),
    uniqueHeightCount: uniqueHeights.size,
    uniqueHeights: [...uniqueHeights].slice(0, 20).sort((a,b) => a-b),
    sampleCells: samples,
    packTempSample,
    worldSettings: ctx.worldSettings,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
