// Test quadtree find() against brute force with the SAME data
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  // Get the ACTUAL quadtree that the module uses
  // The quadtree is cached in a WeakMap keyed by pack.cells.p
  // We can't access the WeakMap, but we can construct our own quadtree
  // using the SAME algorithm as graphUtils.ts

  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const stateIds = pack.cells.state;
  const pts = pack.cells.p;

  // Brute force
  function bruteFindCell(x, y) {
    let minDist = Infinity;
    let minIdx = -1;
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      const d2 = (x - px) * (x - px) + (y - py) * (y - py);
      if (d2 < minDist) { minDist = d2; minIdx = i; }
    }
    return minIdx;
  }

  // Build quadtree using the self-developed algorithm
  // The data format is [px, py, index]
  const quadData = pts.map(([px, py], i) => [px, py, i]);

  // We need the Quadtree class - it's bundled but exported
  // Let's try to access it through the module's exports
  // Actually, graphUtils.ts imports from "../utils/quadtree"
  // The quadtree() function creates a new Quadtree and adds data

  // Since we can't access the quadtree module, let's test if the quadtree
  // algorithm is correct by checking if there's a known issue

  // Let's check: for the specific poles of the states, what does
  // findClosestCell return? We can call window.findCell which uses
  // findClosestCell with window.pack (which is empty).

  // But the module's findClosestCell uses context.pack which should be the active context

  // Let's test: what if we monkey-patch window.pack?
  window.pack = ctx.pack;

  // Now call window.findCell (which uses findClosestCell(x, y, radius, window.pack))
  const s1 = pack.states[1];
  const [x0, y0] = s1.pole;

  const results = [];
  const dirs = [[0,0], [1,0], [0,1], [-1,0], [0,-1]];
  for (const [dx, dy] of dirs) {
    const x = x0 + 5 * dx;
    const y = y0 + 5 * dy;
    const brute = bruteFindCell(x, y);
    const bruteSid = stateIds[brute];

    let quad = -1;
    let quadSid = -1;
    let quadError = null;
    try {
      // window.findCell = (x, y, radius) => findClosestCell(x, y, radius, window.pack)
      quad = window.findCell(x, y, 9999);
      quadSid = quad !== undefined && quad >= 0 ? stateIds[quad] : -1;
    } catch(e) {
      quadError = e.message;
    }

    results.push({
      point: [Math.round(x), Math.round(y)],
      brute: { cellId: brute, stateId: bruteSid },
      quad: { cellId: quad, stateId: quadSid, error: quadError },
    });
  }

  return {
    pole: [x0, y0],
    stateId: s1.i,
    s1Cells: s1.cells,
    results,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
