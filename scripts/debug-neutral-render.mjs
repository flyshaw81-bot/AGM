// Check how neutral (state 0) cells are rendered
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

  // Find all neutral cells (state 0) and their features
  const neutralByFeature = {};
  let totalNeutralCells = 0;
  for (let i = 0; i < stateIds.length; i++) {
    if (stateIds[i] === 0) {
      totalNeutralCells++;
      const fid = cellsF[i];
      neutralByFeature[fid] = (neutralByFeature[fid] || 0) + 1;
    }
  }

  // Check: are neutral cells on land features or ocean?
  const featureBreakdown = Object.entries(neutralByFeature).map(([fid, count]) => {
    const f = features[Number(fid)];
    return {
      featureId: fid,
      count,
      type: f?.type,
      group: f?.group,
      cells: f?.cells,
    };
  });

  // Check the states body for state0 path
  const statesBody = document.getElementById("statesBody");
  const allStatePaths = statesBody?.innerHTML || "";
  const hasState0 = allStatePaths.includes("state0");

  // Check if state0 is in the isolines output
  // The fill color for state 0 would be states[0]?.color
  const state0Color = pack.states[0]?.color || "none";

  // Check the actual rendered state paths for each state
  const stateColors = {};
  pack.states.filter(s => s.i !== undefined).forEach(s => {
    stateColors[s.i] = s.color;
  });

  return {
    neutralByFeature: featureBreakdown.sort((a,b) => b.count - a.count),
    totalNeutralCells,
    hasState0,
    state0Color,
    stateColors: Object.entries(stateColors).slice(0, 15),
    statesWithCells: pack.states.filter(s => s.i && !s.removed).map(s => ({
      i: s.i, cells: s.cells, color: s.color
    })),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
