// Verify that state 0 now renders correctly
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const statesBody = document.getElementById("statesBody");
  const allPaths = statesBody?.querySelectorAll("path");

  const state0Paths = [];
  allPaths?.forEach(p => {
    const id = p.getAttribute("id");
    if (id === "state0") {
      state0Paths.push({
        id,
        fill: p.getAttribute("fill"),
        dpreview: p.getAttribute("d")?.substring(0, 100),
      });
    }
  });

  // Count all states rendered
  const allStateIds = [];
  allPaths?.forEach(p => {
    const id = p.getAttribute("id");
    if (id && id.match(/^state\d+$/)) {
      allStateIds.push({ id, fill: p.getAttribute("fill") });
    }
  });

  return {
    state0Paths,
    totalStatePaths: allPaths?.length,
    allStates: allStateIds,
  };
});

console.log(JSON.stringify(result, null, 2));

if (result.state0Paths.length > 0) {
  console.log("\n=== State 0 IS NOW RENDERED! ===");
} else {
  console.log("\n=== State 0 STILL MISSING ===");
}

await browser.close();
