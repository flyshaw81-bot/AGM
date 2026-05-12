// Verify drawStateLabels() works correctly after fix
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  // Call drawStateLabels to ensure it works
  window.drawStateLabels();

  const textPaths = document.querySelectorAll("#textPaths path");
  const paths = [];
  textPaths.forEach(p => {
    const d = p.getAttribute("d");
    // Check if degenerate
    const coords = d.match(/[\d.]+/g) || [];
    const unique = new Set(coords);
    paths.push({
      id: p.getAttribute("id"),
      degenerate: unique.size <= 2,
      coordCount: unique.size,
    });
  });

  return {
    totalPaths: textPaths.length,
    degenerateCount: paths.filter(p => p.degenerate).length,
    goodCount: paths.filter(p => !p.degenerate).length,
  };
});

console.log(JSON.stringify(result, null, 2));

if (result.degenerateCount === 0) {
  console.log("\n=== drawStateLabels() works correctly! ===");
} else {
  console.log(`\n${result.degenerateCount} degenerate paths still present`);
}

await browser.close();
