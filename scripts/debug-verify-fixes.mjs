// Verify native draw functions work after the fix
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

// Check which draw functions exist now on globalThis
const funcs = await page.evaluate(() => {
  const names = [
    "drawTexture","drawGrid","drawCells","drawCoordinates",
    "drawPopulation","drawPrecipitation",
  ];
  const result = {};
  for (const n of names) {
    result[n] = typeof window[n] === "function" ? "EXISTS" : "MISSING";
  }
  return result;
});
console.log("=== Draw function status on globalThis ===");
for (const [k, v] of Object.entries(funcs)) {
  console.log(`  ${k}: ${v}`);
}

// Test each by toggling ON
const tests = [
  { key: "toggleTexture", svg: "#texture" },
  { key: "toggleGrid", svg: "#gridOverlay" },
  { key: "toggleCells", svg: "#cells" },
  { key: "togglePopulation", svg: "#population" },
];

console.log("\n=== Toggle test results ===");
for (const { key, svg } of tests) {
  // Ensure it's OFF first by checking, then clicking - but we need the chip
  // Since there are 2 buttons (panel chip + native v8 card), use first()
  const beforeState = await page.evaluate((k) => {
    const btn = document.querySelector(`[data-studio-action="layer"][data-value="${k}"]`);
    const svgEl = document.querySelector(k === "toggleTexture" ? "#texture" : k === "toggleGrid" ? "#gridOverlay" : k === "toggleCells" ? "#cells" : "#population");
    return {
      chipActive: btn?.classList.contains("is-active") || false,
      svgDisplay: svgEl ? getComputedStyle(svgEl).display : "MISSING",
      svgChildren: svgEl?.children.length || 0,
    };
  }, key);

  // Click to toggle
  const chip = page.locator(`[data-studio-action="layer"][data-value="${key}"]`).first();
  if (await chip.count() > 0) {
    await chip.click();
    await page.waitForTimeout(1500);
  }

  const afterState = await page.evaluate((k) => {
    const btn = document.querySelector(`[data-studio-action="layer"][data-value="${k}"]`);
    const svgEl = document.querySelector(k === "toggleTexture" ? "#texture" : k === "toggleGrid" ? "#gridOverlay" : k === "toggleCells" ? "#cells" : "#population");
    return {
      chipActive: btn?.classList.contains("is-active") || false,
      svgDisplay: svgEl ? getComputedStyle(svgEl).display : "MISSING",
      svgChildren: svgEl?.children.length || 0,
      firstChildTag: svgEl?.firstElementChild?.tagName || "none",
    };
  }, key);

  const status = afterState.svgChildren > 0 ? "RENDERED" : "EMPTY";
  console.log(`  ${key}: display=${beforeState.svgDisplay}->${afterState.svgDisplay}, children=${beforeState.svgChildren}->${afterState.svgChildren} [${status}], firstChild=${afterState.firstChildTag}`);
}

// Also check for console errors
const consoleErrors = await page.evaluate(() => {
  return window.__lastError || "none";
});
console.log("\nConsole errors:", consoleErrors);

await browser.close();
