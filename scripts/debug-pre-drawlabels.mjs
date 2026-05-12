// Add debug logging to check context before drawStateLabels runs
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Wait for the app to fully initialize
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[BROWSER ERROR]", msg.text());
});

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);

// Wait for the runtime context to be available
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const stateIds = pack.cells.state;
  const features = pack.features;

  const ws = ctx.worldSettings;

  const cellsF = pack.cells.f;
  let cellsFInfo = null;
  if (cellsF && typeof cellsF === 'object' && cellsF.constructor) {
    cellsFInfo = {
      constructorName: cellsF.constructor?.name,
      length: cellsF.length,
      sample5: Array.from(cellsF.slice(0, 5))
    };
  }

  const s1 = pack.states[1];
  let s1CellCount = 0;
  let firstS1CellIdx = -1;
  for (let i = 0; i < stateIds.length; i++) {
    if (stateIds[i] === 1) {
      s1CellCount++;
      if (firstS1CellIdx === -1) firstS1CellIdx = i;
    }
  }

  // Check if findClosestCell function is callable somehow
  // The module function should work internally, so let's find it by traversing
  // Actually, let's test: if we were to call drawStateLabels, what would happen?
  // We'll intercept the SVG path creation to see the intermediate values

  // Check the existing paths first
  const existingPaths = document.querySelectorAll("#textPaths path");
  const existingData = [];
  existingPaths.forEach(p => {
    existingData.push({ id: p.getAttribute("id"), d: p.getAttribute("d")?.substring(0, 100) });
  });

  return {
    worldSettings: { graphWidth: ws.graphWidth, graphHeight: ws.graphHeight },
    cellsF: cellsFInfo,
    s1: { cells: s1?.cells, pole: s1?.pole, cellCount: s1CellCount, firstCellIdx: firstS1CellIdx },
    stateIdsLength: stateIds.length,
    stateIdsSample: Array.from(stateIds.slice(0, 20)),
    featuresLength: features?.length,
    existingTextPaths: existingData,
    stateCount: pack.states.filter(s => s.i && !s.removed).length,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
