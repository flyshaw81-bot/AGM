// Check heightmap and terrain for white/light colored irregular patches
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;

  // Check heightmap rendering
  const heightmap = document.getElementById("heightmap");
  const hmChildren = [];
  if (heightmap) {
    heightmap.querySelectorAll("path, rect, polygon, use").forEach(el => {
      const fill = el.getAttribute("fill");
      const opacity = el.getAttribute("opacity");
      const id = el.getAttribute("id") || "";
      hmChildren.push({ tag: el.tagName, id, fill, opacity });
    });
  }

  // Check terrs (terrain layer)
  const terrs = document.getElementById("terrs");
  const terrChildren = [];
  if (terrs) {
    terrs.querySelectorAll("path, rect, use, g").forEach(el => {
      const fill = el.getAttribute("fill");
      const id = el.getAttribute("id") || "";
      terrChildren.push({ tag: el.tagName, id, fill });
    });
  }

  // Check biomes for white
  const biomes = document.getElementById("biomes");
  const biomeChildren = [];
  if (biomes) {
    biomes.querySelectorAll("path").forEach(el => {
      const fill = el.getAttribute("fill");
      const id = el.getAttribute("id") || "";
      if (fill === "#ffffff" || fill === "white" || fill === "#fff" || !fill) {
        biomeChildren.push({ id, fill });
      }
    });
  }

  // Check if the dropShadow filter is creating white ghosting
  const defs = document.querySelector("defs");
  const filters = [];
  if (defs) {
    defs.querySelectorAll("filter").forEach(f => {
      const id = f.getAttribute("id");
      filters.push({ id, innerHTML: f.innerHTML?.substring(0, 200) });
    });
  }

  return {
    heightmapChildren: hmChildren.slice(0, 10),
    terrChildren: terrChildren.slice(0, 10),
    whiteBiomePaths: biomeChildren.slice(0, 10),
    totalHmChildren: hmChildren.length,
    filters,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
