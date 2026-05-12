// Test window.findCell behavior vs brute-force
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const stateIds = pack.cells.state;

  function bruteFindCell(x, y) {
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
  }

  // Check what window.findCell is
  const findCellStr = typeof window.findCell === 'function' ? window.findCell.toString().substring(0, 500) : 'not a function';
  const findCellSource = typeof window.findCell === 'function' ? 'function' : typeof window.findCell;

  // Test window.findCell with various points
  const s1 = pack.states[1];
  const [x0, y0] = s1.pole;

  const testPoints = [
    [x0, y0],
    [x0 + 5, y0],
    [x0, y0 + 5],
    [x0 - 5, y0],
    [x0, y0 - 5],
  ];

  const results = testPoints.map(([x, y]) => {
    const brute = bruteFindCell(x, y);
    const bruteSid = stateIds[brute];

    let globalResult = null;
    let globalError = null;
    try {
      globalResult = window.findCell(x, y);
    } catch(e) {
      globalError = e.message;
    }

    return {
      point: [x, y],
      brute: { cellId: brute, stateId: bruteSid },
      global: { result: globalResult, error: globalError },
    };
  });

  // Also check window.pack
  const packKeys = Object.keys(window.pack || {});
  const packCellsP = window.pack?.cells?.p;
  const packCellsPLength = packCellsP ? packCellsP.length : 0;

  return {
    findCellSource,
    findCellStr,
    packKeys,
    packCellsPLength,
    activePackCellsPLength: pack.cells.p.length,
    results,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
