// Deep dive into iceberg rendering - why white?
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const iceLayer = document.getElementById("ice");
  const polygons = iceLayer?.querySelectorAll("polygon");

  const results = [];
  polygons?.forEach((p, idx) => {
    if (idx >= 5) return;
    const computed = getComputedStyle(p);
    results.push({
      idx,
      fill: p.getAttribute("fill"),
      stroke: p.getAttribute("stroke"),
      computedFill: computed.fill,
      computedStroke: computed.stroke,
      computedOpacity: computed.opacity,
      points: p.getAttribute("points")?.substring(0, 60),
    });
  });

  // Check parent group styles
  const iceStyle = getComputedStyle(iceLayer);
  const viewbox = document.querySelector("g[transform]"); // closest transform ancestor

  // Check inline styles and CSS rules
  const stylesheets = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        const cssText = rule.cssText;
        if (cssText.includes("ice") || cssText.includes("polygon")) {
          stylesheets.push(cssText.substring(0, 200));
        }
      }
    } catch(e) { /* cross-origin */ }
  }

  // Check the actual HTML of first iceberg
  const firstHTML = polygons?.[0]?.outerHTML;

  // Check if there's any fill="white" in ancestors
  let ancestor = iceLayer?.parentElement;
  const ancestorFills = [];
  while (ancestor) {
    const fill = ancestor.getAttribute("fill");
    const style = ancestor.getAttribute("style");
    const id = ancestor.id;
    if (fill || (style && style.includes("fill"))) {
      ancestorFills.push({ id, fill, style: style?.substring(0, 100) });
    }
    ancestor = ancestor.parentElement;
  }

  return {
    sampleIcebergs: results,
    iceGComputedFill: iceStyle.fill,
    iceGComputedStroke: iceStyle.stroke,
    firstPolygonHTML: firstHTML?.substring(0, 300),
    stylesheetsWithIceOrPolygon: stylesheets.slice(0, 10),
    ancestorFills,
    iceLayerAttributes: {
      fill: iceLayer.getAttribute("fill"),
      stroke: iceLayer.getAttribute("stroke"),
      style: iceLayer.getAttribute("style"),
    },
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
