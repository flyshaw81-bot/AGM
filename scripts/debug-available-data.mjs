// Check what data is available for implementing the missing draw functions
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const workbenchBtn = page.locator('[data-studio-action="direct-workbench-jump"]').first();
if (await workbenchBtn.isVisible()) {
  await workbenchBtn.click();
  await page.waitForTimeout(3000);
}

const data = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx?.pack;
  const cells = pack?.cells;

  return {
    hasPack: !!pack,
    hasCells: !!cells,
    cellCount: cells?.i?.length || 0,
    hasP: !!cells?.p,
    hasH: !!cells?.h,
    hasTemp: !!cells?.temp,
    hasPrec: !!cells?.prec,
    hasPop: !!cells?.pop,
    hasState: !!cells?.state,
    hasBurg: !!cells?.burg,
    p_sample: cells?.p ? cells.p.slice(0, 6) : null,
    h_sample: cells?.h ? Array.from(cells.h).slice(0, 10) : null,
    temp_sample: cells?.temp ? Array.from(cells.temp).slice(0, 10) : null,
    prec_sample: cells?.prec ? Array.from(cells.prec).slice(0, 10) : null,
    pop_sample: cells?.pop ? Array.from(cells.pop).slice(0, 10) : null,

    // What about graph size?
    graphWidth: window.graphWidth,
    graphHeight: window.graphHeight,

    // Does #texture have data-href?
    textureHref: document.querySelector("#texture")?.getAttribute("data-href"),
    textureX: document.querySelector("#texture")?.getAttribute("data-x"),
    textureY: document.querySelector("#texture")?.getAttribute("data-y"),

    // Grid pattern?
    gridPattern: document.querySelector("#gridOverlay")?.getAttribute("type"),
    gridStroke: document.querySelector("#gridOverlay")?.getAttribute("stroke"),

    // Any cell patterns available?
    patternTypes: [...document.querySelectorAll("pattern[id]")].map(p => p.id),

    // What about D3?
    hasD3: typeof window.d3 !== "undefined",

    // Engine context rendering
    hasRendering: !!ctx?.rendering,
    renderingKeys: ctx?.rendering ? Object.keys(ctx.rendering).filter(k => typeof ctx.rendering[k] === "function") : [],
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
