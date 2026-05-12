// Override the module's findClosestCell to add logging
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// IMPORTANT: addInitScript runs BEFORE any page scripts
await page.addInitScript(() => {
  // We'll intercept calls to the line() generator
  // The line generator calls path.setAttribute("d", ...)
  // But the Path class generates points from controlPoints

  // Actually, let's try to intercept the module's findClosestCell
  // Since it's bundled, we need to intercept at the quadtree level
  // or at the SVG level

  // Instead, let's override the Quadtree.prototype.find
  // But the Quadtree class is also bundled...

  // Let's intercept SVGPathElement.setAttribute to capture ALL d attribute changes
  // AND log the call stack to see who's calling it
  const origSetAttr = SVGElement.prototype.setAttribute;
  SVGElement.prototype.setAttribute = function(name, value) {
    if (name === 'd' && this.parentElement && this.parentElement.id === 'textPaths') {
      // Capture stack trace
      const stack = new Error().stack;
      const lines = stack.split('\n');
      // Only show lines that might be from the bundle
      const relevantLines = lines.filter(l => l.includes('DPAGM') || l.includes('AGM') || l.includes('main') || l.includes('chunk'));
      if (!window.__textPathStackLog) window.__textPathStackLog = [];
      window.__textPathStackLog.push({ value: value, stack: relevantLines.slice(0, 5) });
    }
    return origSetAttr.call(this, name, value);
  };
});

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);

const result = await page.evaluate(() => {
  const log = window.__textPathStackLog || [];
  return {
    count: log.length,
    firstEntry: log[0],
    allValues: log.map(e => e.value?.substring(0, 120)),
  };
});

console.log("\n=== TextPath with call stacks ===");
console.log("Count:", result.count);
console.log("\nFirst entry:");
if (result.firstEntry) {
  console.log("Value:", result.firstEntry.value);
  console.log("Stack:", result.firstEntry.stack.join('\n       '));
}
console.log("\nAll values:");
result.allValues.forEach((v, i) => console.log(`[${i}] ${v}`));
await browser.close();
