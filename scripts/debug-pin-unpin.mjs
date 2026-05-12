// Test explicit unpin
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const workbenchBtn = page.locator('[data-studio-action="direct-workbench-jump"]').first();
if (await workbenchBtn.isVisible()) {
  await workbenchBtn.click();
  await page.waitForTimeout(3000);
}

const layersBtn = page.locator('[data-studio-action="section"][data-value="layers"]');
if (await layersBtn.count() > 0) {
  await layersBtn.click();
  await page.waitForTimeout(1000);
}

// Find a pinned chip and click its pin to unpin
const before = await page.evaluate(() => {
  const bottomCards = [...document.querySelectorAll('[data-native-v8-layer-card="true"]')].map(c => c.getAttribute("data-value"));
  return { bottomCards, count: bottomCards.length };
});
console.log("Before:", JSON.stringify(before));

// Unpin toggleCells (currently pinned)
const cellsPin = page.locator('[data-studio-action="layer-pin"][data-value="toggleCells"]').first();
const cellsPinClass = await cellsPin.evaluate(el => el.className);
console.log("toggleCells pin class:", cellsPinClass);

await cellsPin.click();
await page.waitForTimeout(500);

const after = await page.evaluate(() => {
  const bottomCards = [...document.querySelectorAll('[data-native-v8-layer-card="true"]')].map(c => c.getAttribute("data-value"));
  const toggleCellsPin = document.querySelector('[data-studio-action="layer-pin"][data-value="toggleCells"]');
  return {
    bottomCards,
    count: bottomCards.length,
    hasToggleCells: bottomCards.includes("toggleCells"),
    toggleCellsPinClass: toggleCellsPin?.className,
  };
});
console.log("After unpinning toggleCells:", JSON.stringify(after, null, 2));

await browser.close();
