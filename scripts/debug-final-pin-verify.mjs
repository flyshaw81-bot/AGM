// Comprehensive verification of layer card pin feature
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

// Clear localStorage for clean test
await page.evaluate(() => localStorage.removeItem("agm-studio-layer-cards"));

// Navigate to layers
const layersBtn = page.locator('[data-studio-action="section"][data-value="layers"]');
if (await layersBtn.count() > 0) {
  await layersBtn.click();
  await page.waitForTimeout(1000);
}

console.log("=== 1. Initial default cards ===");
let state = await page.evaluate(() => ({
  bottomCards: [...document.querySelectorAll('[data-native-v8-layer-card="true"]')].map(c => c.getAttribute("data-value")),
  pinnedCount: document.querySelectorAll('[data-studio-action="layer-pin"].is-pinned').length,
}));
console.log(JSON.stringify(state));

console.log("\n=== 2. Pin toggleIce and toggleTexture ===");
for (const key of ["toggleIce", "toggleTexture"]) {
  await page.locator(`[data-studio-action="layer-pin"][data-value="${key}"]`).first().click();
  await page.waitForTimeout(300);
}
state = await page.evaluate(() => ({
  bottomCards: [...document.querySelectorAll('[data-native-v8-layer-card="true"]')].map(c => c.getAttribute("data-value")),
  pinnedCount: document.querySelectorAll('[data-studio-action="layer-pin"].is-pinned').length,
  stored: localStorage.getItem("agm-studio-layer-cards"),
}));
console.log(JSON.stringify(state));

console.log("\n=== 3. Unpin toggleRivers ===");
await page.locator('[data-studio-action="layer-pin"][data-value="toggleRivers"]').first().click();
await page.waitForTimeout(300);
state = await page.evaluate(() => ({
  bottomCards: [...document.querySelectorAll('[data-native-v8-layer-card="true"]')].map(c => c.getAttribute("data-value")),
  pinnedCount: document.querySelectorAll('[data-studio-action="layer-pin"].is-pinned').length,
  stored: localStorage.getItem("agm-studio-layer-cards"),
}));
console.log(JSON.stringify(state));

console.log("\n=== 4. All 8 bottom cards match pinned chips ===");
state = await page.evaluate(() => {
  const bottomCards = [...document.querySelectorAll('[data-native-v8-layer-card="true"]')].map(c => c.getAttribute("data-value")).sort();
  const pinnedChips = [...document.querySelectorAll('[data-studio-action="layer-pin"].is-pinned')].map(b => b.getAttribute("data-value")).sort();
  return { bottomCards, pinnedChips, match: JSON.stringify(bottomCards) === JSON.stringify(pinnedChips) };
});
console.log(JSON.stringify(state));

// Clean up
await page.evaluate(() => localStorage.removeItem("agm-studio-layer-cards"));
await browser.close();
