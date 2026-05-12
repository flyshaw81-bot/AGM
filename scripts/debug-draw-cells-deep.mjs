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

// Debug the actual function call
const debug = await page.evaluate(() => {
  const logs = [];

  // Check what window.pack looks like
  const pack = window.pack;
  logs.push(`window.pack exists: ${!!pack}`);
  logs.push(`window.pack.cells exists: ${!!pack?.cells}`);
  logs.push(`window.pack.cells.p exists: ${!!pack?.cells?.p}`);
  logs.push(`window.pack.cells.p length: ${pack?.cells?.p?.length || 0}`);

  const points = pack?.cells?.p;
  if (points) {
    logs.push(`points[0]: ${JSON.stringify(points[0])}`);
    logs.push(`points[100]: ${JSON.stringify(points[100])}`);
  }

  // Check the cells SVG element
  const cellsEl = document.querySelector("#cells");
  logs.push(`#cells exists: ${!!cellsEl}`);
  logs.push(`#cells children count: ${cellsEl?.children.length || 0}`);

  // Check what drawCells function looks like
  const fn = window.drawCells;
  logs.push(`drawCells type: ${typeof fn}`);
  if (typeof fn === "function") {
    logs.push(`drawCells.toString().substring(0, 300): ${fn.toString().substring(0, 300)}`);
  }

  // Check __agmActiveEngineRuntimeContext.pack.cells.p
  const ctx = window.__agmActiveEngineRuntimeContext;
  const ctxPoints = ctx?.pack?.cells?.p;
  logs.push(`ctx pack cells.p length: ${ctxPoints?.length || 0}`);

  return logs.join("\n");
});

console.log(debug);

// Now manually invoke the function with error capture
const result = await page.evaluate(() => {
  try {
    window.drawCells();
    return { success: true, children: document.querySelector("#cells")?.children.length };
  } catch (e) {
    return { success: false, error: e.message, stack: e.stack };
  }
});
console.log("drawCells result:", JSON.stringify(result));

await browser.close();
