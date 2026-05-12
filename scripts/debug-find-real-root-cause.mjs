// Instead of testing individual pieces, let's directly test the line() generator
// that converts pathPoints to SVG d string.
// Maybe the self-developed line()/curveNatural produces degenerate output?
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  // Check: what modules are available on window?
  // Maybe the line() function is accessible somehow
  // Or maybe we can test by reading the SVG directly

  // Let's check all global functions related to state labels
  const relevantGlobals = Object.getOwnPropertyNames(window).filter(k =>
    k.includes('line') || k.includes('curve') || k.includes('label') || k.includes('state')
  );

  // Try to get the ShapeUtils exports from the module system
  // TypeScript/Vite bundles modules, but maybe we can find them on window
  const allGlobals = Object.getOwnPropertyNames(window).filter(k =>
    k.includes('draw') || k.includes('render') || k.includes('agm')
  );

  return {
    relevantGlobals,
    allAgmGlobals: allGlobals,
  };
});

console.log(JSON.stringify(result, null, 2));

// Now let's try: call the line generator directly by injecting into the page
const testResult = await page.evaluate(() => {
  // Since the function is bundled and not exported, let's test by
  // directly computing path data from points using the same algorithm

  // We need to verify that curveNatural + line for 3 points doesn't collapse

  // Test the self-developed curveNatural algorithm directly
  // The code was verified against d3-shape - all points should generate proper curves

  // The pathPoints for a state label are [[ray1.x, ray1.y], pole, [ray2.x, ray2.y]]
  // These should be THREE DISTINCT points if raycast works correctly

  // But all textPaths show degenerate curves. This means ray1 == pole == ray2
  // which means the raycast returned length:0 for all directions

  // Let's test: for state 1, call the actual findClosestCell through context.pack
  const ctx = window.__agmActiveEngineRuntimeContext;

  // Create a new context EXACTLY as createBrowserRendererContext would
  // getActiveEngineRuntimeContext() just returns __agmActiveEngineRuntimeContext
  const context = window.__agmActiveEngineRuntimeContext;
  const { cells, states, features } = context.pack;
  const stateIds = cells.state;

  const s1 = states[1];
  const [x0, y0] = s1.pole;
  const stateId = s1.i;

  // TEST: what is stateIds[cellId] for cells near the pole?
  // If stateIds is actually 0 for ALL cells, that explains everything
  const poleCellId = -1;
  // We can't call findClosestCell because it's in module scope
  // But we CAN brute-force it

  function bruteFindCell(x, y) {
    let minDist = Infinity;
    let minIdx = -1;
    const pts = cells.p;
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      const d2 = (x - px) * (x - px) + (y - py) * (y - py);
      if (d2 < minDist) { minDist = d2; minIdx = i; }
    }
    return minIdx;
  }

  // Test: for ALL cell points within 100 units of the pole,
  // what stateIds do they have?
  let s1NearbyCount = 0;
  let otherNearbyCount = 0;
  const pts = cells.p;
  for (let i = 0; i < pts.length; i++) {
    const [px, py] = pts[i];
    const dist = Math.sqrt((px - x0) * (px - x0) + (py - y0) * (py - y0));
    if (dist < 30) {
      if (stateIds[i] === stateId) s1NearbyCount++;
      else otherNearbyCount++;
    }
  }

  // Also: for the actual pole cell, what's the stateId?
  const poleCell = bruteFindCell(x0, y0);
  const poleStateId = stateIds[poleCell];

  // And for the cell 5 units to the right
  const rightCell = bruteFindCell(x0 + 5, y0);
  const rightStateId = stateIds[rightCell];

  return {
    pole: [x0, y0],
    stateId,
    s1Cells: s1.cells,
    poleCell,
    poleStateId,
    rightCell,
    rightStateId,
    s1NearbyCount,
    otherNearbyCount,
    totalNearby: s1NearbyCount + otherNearbyCount,
    sampleStateIds: Array.from(stateIds.slice(Math.max(0, poleCell - 3), poleCell + 5)),
  };
});

console.log(JSON.stringify(testResult, null, 2));
await browser.close();
