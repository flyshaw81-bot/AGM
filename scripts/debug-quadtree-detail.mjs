// Detailed quadtree diagnosis
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const pts = pack.cells.p;

  // Set window.pack so the global findCell works
  window.pack = ctx.pack;

  const s1 = pack.states[1];
  const [x0, y0] = s1.pole;

  // Check what cell 309 actually is
  const cell309 = pts[309];
  const dist309 = Math.sqrt((x0 - cell309[0]) ** 2 + (y0 - cell309[1]) ** 2);

  // Brute force check: what IS the closest cell?
  let minDist = Infinity;
  let minIdx = -1;
  for (let i = 0; i < pts.length; i++) {
    const [px, py] = pts[i];
    const d2 = (x0 - px) ** 2 + (y0 - py) ** 2;
    if (d2 < minDist) { minDist = d2; minIdx = i; }
  }
  const bruteClosestDist = Math.sqrt(minDist);

  // Find a bunch of cells near x0,y0
  const nearby = [];
  for (let i = 0; i < pts.length; i++) {
    const [px, py] = pts[i];
    const dist = Math.sqrt((x0 - px) ** 2 + (y0 - py) ** 2);
    if (dist < 30) {
      nearby.push({ i, x: px, y: py, dist, stateId: pack.cells.state[i] });
      if (nearby.length >= 10) break;
    }
  }
  nearby.sort((a, b) => a.dist - b.dist);

  // Test: does quadtree find the right cell at the pole?
  const quad = window.findCell(x0, y0, 9999);
  const quadCoord = quad >= 0 ? pts[quad] : null;
  const quadDist = quadCoord ? Math.sqrt((x0 - quadCoord[0])**2 + (y0 - quadCoord[1])**2) : null;

  // Test points further away to see if there's a systematic offset
  const testPoints = [];
  for (let dist = 0; dist <= 50; dist += 10) {
    for (const [dx, dy] of [[1,0], [0,1], [-1,0], [0,-1]]) {
      const x = x0 + dist * dx;
      const y = y0 + dist * dy;
      const brute = (() => {
        let md = Infinity, mi = -1;
        for (let i = 0; i < pts.length; i++) {
          const d2 = (x - pts[i][0])**2 + (y - pts[i][1])**2;
          if (d2 < md) { md = d2; mi = i; }
        }
        return mi;
      })();
      const q = window.findCell(x, y, 9999);
      if (brute !== q) {
        testPoints.push({
          point: [Math.round(x), Math.round(y)],
          brute: { cellId: brute, coord: pts[brute], stateId: pack.cells.state[brute] },
          quad: { cellId: q, coord: q >= 0 ? pts[q] : null, stateId: q >= 0 ? pack.cells.state[q] : -1 },
        });
      }
    }
  }

  return {
    pole: [x0, y0],
    cell309: { coord: cell309, dist: Math.round(dist309 * 100) / 100 },
    bruteClosest: { cellId: minIdx, coord: pts[minIdx], dist: Math.round(bruteClosestDist * 100) / 100 },
    quadAtPole: { cellId: quad, coord: quadCoord, dist: Math.round(quadDist * 100) / 100 },
    nearbyCells: nearby,
    mismatches: testPoints.slice(0, 10),
    totalCells: pts.length,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
