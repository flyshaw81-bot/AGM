// Debug: trace the FULL raycast logic for state 1
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const stateIds = pack.cells.state;
  const features = pack.features;

  const s1 = pack.states[1];
  const [x0, y0] = s1.pole;
  const stateId = s1.i;

  const LENGTH_START = 5;
  const LENGTH_STEP = 5;
  const LENGTH_MAX = 300;

  // Brute force findClosestCell (same as draw-state-labels uses internally)
  const findCell = (x, y) => {
    let minDist = Infinity;
    let minIdx = -1;
    const pts = pack.cells.p;
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      const d2 = (x - px) * (x - px) + (y - py) * (y - py);
      if (d2 < minDist) {
        minDist = d2;
        minIdx = i;
      }
    }
    return minIdx;
  };

  // Test four basic directions
  const dirs = [[1,0], [0,1], [-1,0], [0,-1]];
  const rayTraces = dirs.map(([dx, dy]) => {
    let lastInside = { length: 0, x: x0, y: y0 };
    const steps = [];

    for (let length = LENGTH_START; length < LENGTH_MAX; length += LENGTH_STEP) {
      const x = x0 + length * dx;
      const y = y0 + length * dy;

      // isInsideState logic
      if (x < 0 || x > (ctx.worldSettings.graphWidth ?? 0) || y < 0 || y > (ctx.worldSettings.graphHeight ?? 0)) {
        steps.push({ length, x: Math.round(x), y: Math.round(y), inside: false, reason: "out of bounds" });
        break;
      }

      const cellId = findCell(x, y);
      const sid = stateIds[cellId];
      const inside = sid === stateId;

      steps.push({ length, x: Math.round(x), y: Math.round(y), inside, cellId, stateId: sid });

      if (!inside) break;
      lastInside = { length, x: Math.round(x), y: Math.round(y) };
    }

    return { dir: [dx, dy], start: [x0, y0], lastInside, steps };
  });

  return {
    pole: [x0, y0],
    stateId,
    graphWidth: ctx.worldSettings.graphWidth,
    graphHeight: ctx.worldSettings.graphHeight,
    rayTraces,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
