// Debug why drawCells and drawPopulation don't produce content
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
  const pack = window.__agmActiveEngineRuntimeContext?.pack;
  const cells = pack?.cells;

  return {
    packExists: !!pack,
    cellsExists: !!cells,
    pExists: !!cells?.p,
    pLength: cells?.p?.length || 0,
    pFirst: cells?.p?.[0],
    pLast: cells?.p?.[cells?.p?.length - 1],

    popExists: !!cells?.pop,
    popType: cells?.pop ? Object.prototype.toString.call(cells.pop) : "none",
    popSample: cells?.pop ? (() => { const a = []; for (let i = 0; i < Math.min(10, cells.pop.length); i++) a.push(cells.pop[i]); return a; })() : null,

    iExists: !!cells?.i,
    iLength: cells?.i?.length || 0,

    // Check the DOM elements
    cellsEl: document.querySelector("#cells")?.tagName || "none",
    populationEl: document.querySelector("#population")?.tagName || "none",
    ruralElExists: !!document.querySelector("#population #rural"),
    urbanElExists: !!document.querySelector("#population #urban"),

    // Check if there are existing children
    cellsChildren: document.querySelector("#cells")?.children.length || 0,
    populationChildren: document.querySelector("#population")?.children.length || 0,
  };
});

console.log(JSON.stringify(data, null, 2));

// Now manually call drawCells and see what happens
await page.evaluate(() => {
  if (typeof window.drawCells === "function") {
    try {
      window.drawCells();
    } catch (e) {
      window.__cellsError = e.message;
    }
  }
  if (typeof window.drawPopulation === "function") {
    try {
      window.drawPopulation();
    } catch (e) {
      window.__popError = e.message;
    }
  }
});

const after = await page.evaluate(() => ({
  cellsChildren: document.querySelector("#cells")?.children.length || 0,
  populationChildren: document.querySelector("#population")?.children.length || 0,
  cellsError: window.__cellsError,
  popError: window.__popError,
}));

console.log("\nAfter manual draw:");
console.log(JSON.stringify(after, null, 2));

await browser.close();
