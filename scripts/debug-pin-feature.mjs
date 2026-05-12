// Verify the layer card pin feature works end-to-end
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

// Check initial state
const initial = await page.evaluate(() => {
  // Check bottom cards
  const bottomCards = [...document.querySelectorAll('[data-native-v8-layer-card="true"]')];
  const bottomValues = bottomCards.map(c => c.getAttribute("data-value"));

  // Check pins in layers panel
  const pinBtns = [...document.querySelectorAll('[data-studio-action="layer-pin"]')];
  const pinnedValues = pinBtns.filter(b => b.classList.contains("is-pinned")).map(b => b.getAttribute("data-value"));

  // Check localStorage
  const stored = localStorage.getItem("agm-studio-layer-cards");

  return {
    bottomCardCount: bottomCards.length,
    bottomCardValues: bottomValues,
    pinnedChips: pinnedValues,
    stored,
  };
});

console.log("=== Initial State ===");
console.log(JSON.stringify(initial, null, 2));

// Now test: pin a new layer (toggleTexture) to the bottom bar
console.log("\n=== Test: Pin toggleTexture ===");
// First, find the toggleTexture pin button
const texturePin = page.locator('[data-studio-action="layer-pin"][data-value="toggleTexture"]').first();
if (await texturePin.count() > 0) {
  const beforeClass = await texturePin.evaluate(el => el.className);
  console.log("Before pin:", beforeClass);
  await texturePin.click();
  await page.waitForTimeout(500);

  const afterClass = await texturePin.evaluate(el => el.className);
  console.log("After pin:", afterClass);
}

// Check bottom cards after pinning
const afterPin = await page.evaluate(() => {
  const bottomCards = [...document.querySelectorAll('[data-native-v8-layer-card="true"]')];
  const bottomValues = bottomCards.map(c => c.getAttribute("data-value"));
  const stored = localStorage.getItem("agm-studio-layer-cards");
  return { bottomValues, stored };
});
console.log("After pinning toggleTexture:", JSON.stringify(afterPin, null, 2));

// Now test: unpin a layer (toggleCells - should be first in default list)
console.log("\n=== Test: Unpin toggleCells ===");
const cellsPin = page.locator('[data-studio-action="layer-pin"][data-value="toggleCells"]').first();
if (await cellsPin.count() > 0) {
  const beforeClass = await cellsPin.evaluate(el => el.className);
  console.log("Before unpin:", beforeClass);
  await cellsPin.click();
  await page.waitForTimeout(500);

  const afterClass = await cellsPin.evaluate(el => el.className);
  console.log("After unpin:", afterClass);
}

const afterUnpin = await page.evaluate(() => {
  const bottomCards = [...document.querySelectorAll('[data-native-v8-layer-card="true"]')];
  const bottomValues = bottomCards.map(c => c.getAttribute("data-value"));
  const stored = localStorage.getItem("agm-studio-layer-cards");
  return { bottomValues, stored };
});
console.log("After unpinning toggleCells:", JSON.stringify(afterUnpin, null, 2));

// Final check: does bottom bar still have 8 cards?
const final = await page.evaluate(() => ({
  bottomCardCount: document.querySelectorAll('[data-native-v8-layer-card="true"]').length,
  hasTexture: !!document.querySelector('[data-native-v8-layer-card="true"][data-value="toggleTexture"]'),
  hasCells: !!document.querySelector('[data-native-v8-layer-card="true"][data-value="toggleCells"]'),
}));
console.log("\n=== Final State ===");
console.log(JSON.stringify(final, null, 2));

await browser.close();
