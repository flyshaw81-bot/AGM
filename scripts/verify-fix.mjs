// Verify DPAGM fix: check if textPaths are no longer degenerate
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const textPaths = document.querySelectorAll("#textPaths path");
  const paths = [];
  textPaths.forEach(p => {
    const d = p.getAttribute("d");
    const parts = d.split(/[MC,]/).filter(s => s.length > 0 && !isNaN(parseFloat(s)));
    const unique = [...new Set(parts)];
    paths.push({
      id: p.getAttribute("id"),
      d: d?.substring(0, 200),
      degenerate: unique.length <= 2,
      uniqueCoords: unique.length,
    });
  });

  return {
    totalPaths: textPaths.length,
    degenerateCount: paths.filter(p => p.degenerate).length,
    goodCount: paths.filter(p => !p.degenerate).length,
    allPaths: paths,
  };
});

console.log(JSON.stringify(result, null, 2));

// If no degenerate paths, take a screenshot
if (result.degenerateCount === 0) {
  console.log("\n=== ALL TEXT PATHS ARE NON-DEGENERATE! ===");
}

await browser.close();
