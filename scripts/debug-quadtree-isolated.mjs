// Isolate: build a small quadtree using the actual quadtree module and test find()
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(8000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;

  // Rebuild the EXACT quadtree that findClosestCell uses
  const quadData = pack.cells.p.map(([px, py], i) => [px, py, i]);

  // We can't import the quadtree module, but we can set window.pack to test
  // the findCell function which uses graphUtils.findClosestCell internally

  // Let's try a different approach: manually test the quadtree find logic
  // by dumping the quadtree structure

  // Since we can't easily access the internal quadtree, let's check:
  // is there a quadtree somewhere accessible?

  // Try to get it from the global scope or any cached variable
  const allProps = Object.getOwnPropertyNames(window).filter(p => {
    try {
      const val = window[p];
      return val && typeof val === 'object' && (p.includes('quad') || p.includes('tree') || p.includes('qTree'));
    } catch { return false; }
  });

  // Let's look at the actual data being passed to findClosestCell
  // We know window.findCell calls findClosestCell(x, y, radius, window.pack)
  // Let's patch pack and trace calls

  // Actually, let's just rebuild a mini quadtree manually to see if there's a structural issue
  // We'll implement the EXACT same quadtree in JS

  // First, let's check: what does window.findCell actually DO internally?
  // We can proxy it
  const origFindCell = window.findCell;
  const traceFind = [];
  window.findCell = function(x, y, radius) {
    const start = performance.now();
    const result = origFindCell(x, y, radius);
    const elapsed = performance.now() - start;
    traceFind.push({ x: Math.round(x), y: Math.round(y), result, elapsed });
    return result;
  };

  // Now call findCell on a known point
  const s1 = pack.states[1];
  window.pack = pack;
  const r1 = window.findCell(s1.pole[0], s1.pole[1], Infinity);
  const r2 = window.findCell(s1.pole[0] + 5, s1.pole[1], Infinity);

  return {
    traceFind,
    r1, r2,
    allQuadProps: allProps,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
