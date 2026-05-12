// Intercept drawStateLabels to check if isInsideState returns correct values
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

// Inject a wrapper that intercepts the quadtree find
const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;

  // Access the quadtree that's stored in the WeakMap cache
  // Since we can't access Module internals, let's create our own quadtree
  // that mirrors what findClosestCell does

  // But first, let's trace what happens when drawStateLabels runs
  // by wrapping it

  const originalDrawStateLabels = window.drawStateLabels;
  let traceLog = [];

  window.drawStateLabels = function(list) {
    const ctx2 = window.__agmActiveEngineRuntimeContext;
    traceLog.push({
      activeContextExists: !!ctx2,
      packCellsP: ctx2?.pack?.cells?.p?.length,
      packStates: ctx2?.pack?.states?.filter(s => s.i && !s.removed && !s.lock)?.length,
    });

    // Call original
    originalDrawStateLabels(list);

    // Check textPaths after
    const textPaths = document.querySelectorAll("#textPaths path");
    const pathData = [];
    textPaths.forEach(p => {
      const d = p.getAttribute("d");
      pathData.push({
        id: p.getAttribute("id"),
        d: d?.substring(0, 150),
        degenerate: d?.includes("C") && new Set(d.split(/[MC,]/).filter(s => !isNaN(parseFloat(s)))).size <= 2,
      });
    });
    traceLog.push({
      afterTextPaths: pathData.length,
      degenerateCount: pathData.filter(p => p.degenerate).length,
      firstThree: pathData.slice(0, 3),
    });
  };

  // Now call drawStateLabels
  window.drawStateLabels();

  return { traceLog };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
