// Test how features lookup works in the drawStateLabels context
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const stateIds = pack.cells.state;
  const cellsF = pack.cells.f;
  const features = pack.features;

  function bruteFindCell(x, y) {
    let minDist = Infinity;
    let minIdx = -1;
    const pts = pack.cells.p;
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      const d2 = (x - px) * (x - px) + (y - py) * (y - py);
      if (d2 < minDist) { minDist = d2; minIdx = i; }
    }
    return minIdx;
  }

  // Test: for state 1's pole, check if 5 steps in each direction are inside
  const s1 = pack.states[1];
  const [x0, y0] = s1.pole;
  const stateId = s1.i;

  const dirs = [[1,0], [0,1], [-1,0], [0,-1]];
  const checks = [];

  for (const [dx, dy] of dirs) {
    // Simulate the ACTUAL isInsideState call from draw-state-labels
    for (let length = 5; length <= 25; length += 5) {
      const x = x0 + length * dx;
      const y = y0 + length * dy;

      // OOB check (same as draw-state-labels)
      const oob = x < 0 || x > (ctx.worldSettings.graphWidth ?? 0) || y < 0 || y > (ctx.worldSettings.graphHeight ?? 0);

      const cellId = bruteFindCell(x, y);

      // Feature lookup (same as draw-state-labels line 315)
      const featureIdx = cellsF[cellId];
      const feature = features[featureIdx];
      const featureType = feature?.type;

      const cellStateId = stateIds[cellId];
      const inside = cellStateId === stateId;

      checks.push({
        dir: `${dx},${dy}`,
        length,
        point: [Math.round(x), Math.round(y)],
        oob,
        cellId,
        featureIdx,
        featureType,
        cellStateId,
        inside,
      });
    }
  }

  return {
    state1: { pole: [x0, y0], stateId, cells: s1.cells },
    features: features?.map(f => ({ type: f?.type, cells: f?.cells })) || [],
    checks,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
