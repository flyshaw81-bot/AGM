// Debug: inject monitor into drawStateLabels to see if isInsideState works
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

  // Replicate the exact getOffsetWidth function
  function getOffsetWidth(cells) {
    return Math.max(1, Math.min(20, Math.sqrt(cells) / 2)) | 0;
  }

  // Find states that should get labels
  const states = pack.states.filter(s => s.i && !s.removed && !s.lock);

  const testState = states[0];
  const [x0, y0] = testState.pole;
  const stateId = testState.i;
  const offset = getOffsetWidth(testState.cells);

  // Try to find findClosestCell function
  // It might be available through the module's internal scope
  // Let's test by looking at what's available
  const globals = Object.keys(window).filter(k =>
    k.includes('find') || k.includes('cell') || k.includes('Closest') || k.includes('quad') || k.includes('agm')
  );

  // Get the actual renderer-render-context to see what's happening
  // Try to use the createBrowserRendererContext
  let rendererContext = null;
  try {
    // This is an internal function from the module
  } catch(e) {}

  // Test: call drawStateLabels and check textPaths after
  const beforePaths = document.querySelectorAll("#textPaths path");
  const beforeCount = beforePaths.length;
  const beforeDegenerate = [];
  beforePaths.forEach(p => {
    const d = p.getAttribute("d");
    // Check if it's degenerate (all points the same)
    const parts = d.split(/[MC,]/).filter(s => s.length > 0 && !isNaN(parseFloat(s)));
    const unique = [...new Set(parts)];
    if (unique.length <= 2) {
      beforeDegenerate.push({ id: p.getAttribute("id"), d: d.substring(0, 120) });
    }
  });

  return {
    stateInfo: {
      stateId,
      pole: [x0, y0],
      cells: testState.cells,
      offset,
    },
    globals: globals,
    textPathsBefore: {
      count: beforeCount,
      degenerateCount: beforeDegenerate.length,
      firstDegenerate: beforeDegenerate.slice(0, 3),
    }
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
