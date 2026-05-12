// Debug: trace raycast WITH offset checks as in draw-state-labels
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

  // Test ALL states, not just state 1
  const states = pack.states.filter(s => s.i && !s.removed && !s.lock);

  const LENGTH_START = 5;
  const LENGTH_STEP = 5;
  const LENGTH_MAX = 300;

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

  // Replicate getOffsetWidth
  function getOffsetWidth(cells) {
    // from draw-state-labels.ts line ~400
    return Math.max(1, Math.min(20, Math.sqrt(cells) / 2)) | 0;
  }

  const results = states.slice(0, 3).map(state => {
    const [x0, y0] = state.pole;
    const stateId = state.i;
    const offset = getOffsetWidth(state.cells);
    const dirs = [[1,0], [0,1], [-1,0], [0,-1]];

    const traces = dirs.map(([dx, dy]) => {
      let lastInside = { length: 0, x: x0, y: y0 };
      const steps = [];

      for (let length = LENGTH_START; length < LENGTH_MAX; length += LENGTH_STEP) {
        const x = x0 + length * dx;
        const y = y0 + length * dy;
        // offset points
        const ox1 = x + -dy * offset;
        const oy1 = y + dx * offset;
        const ox2 = x + dy * offset;
        const oy2 = y + -dx * offset;

        // isInsideState for main point
        if (x < 0 || x > (ctx.worldSettings.graphWidth ?? 0) || y < 0 || y > (ctx.worldSettings.graphHeight ?? 0)) {
          steps.push({ length, type: "oob", x: Math.round(x), y: Math.round(y) });
          break;
        }

        const cellId = findCell(x, y);
        const sid = stateIds[cellId];
        const mainInside = sid === stateId;

        // offset checks
        const oc1 = findCell(ox1, oy1);
        const oc2 = findCell(ox2, oy2);
        const off1Inside = stateIds[oc1] === stateId;
        const off2Inside = stateIds[oc2] === stateId;

        const allInside = mainInside && off1Inside && off2Inside;
        steps.push({
          length,
          x: Math.round(x), y: Math.round(y),
          mainInside, off1Inside, off2Inside, allInside,
          cellId, sid, oc1: stateIds[oc1], oc2: stateIds[oc2],
          ox1: Math.round(ox1), oy1: Math.round(oy1),
          ox2: Math.round(ox2), oy2: Math.round(oy2),
        });

        if (!allInside) break;
        lastInside = { length, x: Math.round(x), y: Math.round(y) };
      }

      return { dir: [dx, dy], lastInside, steps };
    });

    return { stateId, pole: [x0, y0], cells: state.cells, offset, traces };
  });

  return results;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
