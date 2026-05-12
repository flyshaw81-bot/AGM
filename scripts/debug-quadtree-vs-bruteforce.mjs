// Compare quadtree findClosestCell vs brute-force nearest neighbor
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

const result = await page.evaluate(() => {
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
      if (d2 < minDist) {
        minDist = d2;
        minIdx = i;
      }
    }
    return minIdx;
  }

  // Check if findClosestCell (quadtree) is available globally
  const hasFindClosestCell = typeof window.findClosestCell === 'function';

  // Test several random points, plus the poles of first 5 states
  const states = pack.states.filter(s => s.i && !s.removed);
  const testPoints = states.slice(0, 5).map(s => {
    const [x0, y0] = s.pole;
    // Test pole + a few steps out
    return [
      [x0, y0],
      [x0 + 5, y0],
      [x0 - 5, y0],
      [x0, y0 + 5],
      [x0, y0 - 5],
      [x0 + 10, y0],
    ];
  }).flat();

  const mismatches = [];
  testPoints.slice(0, 20).forEach(([x, y]) => {
    const brute = bruteFindCell(x, y);
    const bruteSid = brute >= 0 ? stateIds[brute] : -1;

    let quad = -1;
    let quadSid = -1;
    let quadError = null;
    if (hasFindClosestCell) {
      try {
        quad = window.findClosestCell(x, y, 9999, pack);
        quadSid = quad !== undefined ? stateIds[quad] : -1;
      } catch(e) {
        quadError = e.message;
      }
    }

    if (brute !== quad) {
      mismatches.push({
        point: [Math.round(x), Math.round(y)],
        brute: { cellId: brute, stateId: bruteSid, coord: brute >= 0 ? pts[brute] : null },
        quad: { cellId: quad, stateId: quadSid, coord: quad !== undefined && quad >= 0 ? pts[quad] : null },
        quadError,
      });
    }
  });

  return {
    hasFindClosestCell,
    testPointsCount: testPoints.length,
    mismatches,
    sampleBrute: testPoints.slice(0, 3).map(([x,y]) => ({ x, y, cellId: bruteFindCell(x,y), stateId: stateIds[bruteFindCell(x,y)] })),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
