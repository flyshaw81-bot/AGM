// Check ice layer rendering - iceberg white blocks
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;

  // Check ice SVG layer
  const iceLayer = document.getElementById("ice");
  const iceChildren = [];
  if (iceLayer) {
    iceLayer.querySelectorAll("polygon, path").forEach(el => {
      iceChildren.push({
        tag: el.tagName,
        fill: el.getAttribute("fill"),
        stroke: el.getAttribute("stroke"),
        points: el.getAttribute("points")?.substring(0, 80),
        id: el.getAttribute("id")?.substring(0, 40),
      });
    });
  }

  // Check ice data in pack
  let iceSample = null;
  let glacierCount = 0;
  let icebergCount = 0;
  if (pack.ice) {
    iceSample = pack.ice.slice(0, 10);
    for (const i of pack.ice) {
      if (i?.type === "glacier") glacierCount++;
      if (i?.type === "iceberg") icebergCount++;
    }
  }

  return {
    iceLayerExists: !!iceLayer,
    iceLayerVisible: iceLayer ? (iceLayer.style.display !== "none") : false,
    iceChildCount: iceChildren.length,
    iceChildren: iceChildren.slice(0, 10),
    hasPackIce: !!pack.ice,
    iceTotal: pack.ice?.length || 0,
    glacierCount,
    icebergCount,
    iceSample,
  };
});

console.log(JSON.stringify(result, null, 2));

if (result.iceChildCount > 0) {
  console.log(`\n=== ICE LAYER FOUND: ${result.iceChildCount} polygons (${result.icebergCount} icebergs, ${result.glacierCount} glaciers) ===`);
}

await browser.close();
