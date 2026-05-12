// Intercept SVG path setAttribute to see what d values are being set during drawStateLabels
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Intercept at the page level before the app loads
await page.addInitScript(() => {
  // Monkey-patch SVGElement.prototype.setAttribute for "d"
  const originalSetAttr = SVGElement.prototype.setAttribute;
  SVGElement.prototype.setAttribute = function(name, value) {
    if (name === "d" && this.parentElement?.id === "textPaths" && value) {
      // Log the path data being set
      window.__lastTextPathD = value;
      window.__textPathLog = window.__textPathLog || [];
      window.__textPathLog.push({
        tag: this.tagName,
        d: value.substring(0, 300),
      });
    }
    return originalSetAttr.call(this, name, value);
  };
});

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);

const result = await page.evaluate(() => {
  return {
    textPathLog: window.__textPathLog || [],
  };
});

console.log("\n=== TextPath d-values set during initialization ===");
result.textPathLog.forEach((entry, i) => {
  console.log(`[${i}] ${entry.tag}: ${entry.d}`);
});

// Now let's check if drawStateLabels is being called
const afterCount = await page.evaluate(() => {
  document.querySelectorAll("#textPaths path").length;
});

console.log(`\nCurrent textPath count: ${afterCount}`);

await browser.close();
