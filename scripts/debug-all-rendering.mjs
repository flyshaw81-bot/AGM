// Comprehensive check of all rendered elements for white artifacts
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const cells = pack.cells;
  const features = pack.features;

  // 1. Check all paths in the main SVG layers for white/light fills
  const layers = ["statesBody", "biomes", "cults", "relig", "provinces", "terrs", "heightmap"];
  const whitePaths = [];

  layers.forEach(layerId => {
    const layer = document.getElementById(layerId);
    if (!layer) return;
    layer.querySelectorAll("path, rect, polygon").forEach(el => {
      const fill = el.getAttribute("fill");
      const stroke = el.getAttribute("stroke");
      const id = el.getAttribute("id") || "";
      if (fill === "#ffffff" || fill === "white" || fill === "#fff" ||
          stroke === "#ffffff" || stroke === "white" || stroke === "#fff") {
        whitePaths.push({ layer: layerId, id, fill, stroke, tag: el.tagName });
      }
    });
  });

  // 2. Check coastline for white elements
  const coastline = document.getElementById("coastline");
  const coastlineInfo = {};
  if (coastline) {
    coastline.querySelectorAll("use").forEach(u => {
      const href = u.getAttribute("href") || u.getAttribute("xlink:href") || "";
      const filter = u.getAttribute("filter");
      if (!coastlineInfo[href]) coastlineInfo[href] = 0;
      coastlineInfo[href]++;
    });
    coastline.querySelectorAll("path").forEach(p => {
      const fill = p.getAttribute("fill");
      const stroke = p.getAttribute("stroke");
      if (fill === "#ffffff" || fill === "white" || stroke === "#ffffff" || stroke === "white") {
        whitePaths.push({ layer: "coastline", fill, stroke, tag: "path" });
      }
    });
  }

  // 3. Check land mask
  const land = document.getElementById("land");
  const water = document.getElementById("water");

  // 4. Check if there are gap paths that are white
  const gapPaths = [];
  document.querySelectorAll("path[id*='-gap']").forEach(p => {
    gapPaths.push({
      id: p.getAttribute("id"),
      stroke: p.getAttribute("stroke"),
      fill: p.getAttribute("fill"),
    });
  });

  return {
    whitePaths,
    coastlineUses: coastlineInfo,
    landChildren: land?.children.length,
    waterChildren: water?.children.length,
    gapPaths: gapPaths.slice(0, 5),
    // Check what cells are NOT covered by any state
    stateIdsSample: Array.from(pack.cells.state.slice(0, 30)),
    featuresPreview: features.map(f => f ? `${f.type}:${f.group}:${f.cells}cells` : "null").slice(0, 15),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
