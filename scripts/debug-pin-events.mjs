// Debug the layer-pin click event wiring
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

// Check if layer-pin buttons have click listeners
const result = await page.evaluate(() => {
  const pins = [...document.querySelectorAll('[data-studio-action="layer-pin"]')];
  const first = pins[0];

  // Check event listeners by looking for onclick attribute
  const hasOnClick = first?.onclick !== null;

  // Try dispatching a click manually
  let manualResult = "not_tested";
  if (first) {
    const origClass = first.className;
    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // The click should have triggered a re-render, so check if the DOM changed
    const newPins = [...document.querySelectorAll('[data-studio-action="layer-pin"]')];
    const newFirst = newPins[0];
    manualResult = {
      origClass,
      newClass: newFirst?.className,
      countBefore: 1,
      countAfter: newPins.length,
    };
  }

  return {
    pinCount: pins.length,
    firstPinDataValue: first?.getAttribute("data-value"),
    firstPinClass: first?.className,
    hasClickAttr: first?.getAttribute("onclick"),
    manualResult,
  };
});

console.log(JSON.stringify(result, null, 2));

// Now try a programmatic approach: call the pin handler directly
await page.evaluate(() => {
  // Try to find and call the handler via the event system
  // Store the current state before
  window.__agmActiveEngineRuntimeContext.__testShell = window.__agmActiveEngineRuntimeContext?.shell;
});

// Listen for clicks on pin buttons
await page.evaluate(() => {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement) {
      const action = target.getAttribute("data-studio-action") || target.closest("[data-studio-action]")?.getAttribute("data-studio-action");
      if (action === "layer-pin") {
        console.log("[TEST] layer-pin clicked!", target.getAttribute("data-value"));
        window.__pinClicked = target.getAttribute("data-value");
      }
    }
  }, true); // capturing phase
});

// Click a pin button
const pinBtn = page.locator('[data-studio-action="layer-pin"][data-value="toggleTexture"]').first();
await pinBtn.click({ force: true });
await page.waitForTimeout(500);

const pinClicked = await page.evaluate(() => window.__pinClicked);
console.log("Pin clicked flag:", pinClicked);

await browser.close();
