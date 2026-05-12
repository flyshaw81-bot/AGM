// Check DOM structure
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  // Look for all navigation-like elements
  const allButtons = document.querySelectorAll("button");
  const relevant = [];
  allButtons.forEach(btn => {
    const action = btn.getAttribute("data-studio-action");
    const value = btn.getAttribute("data-value");
    if (action || value) {
      relevant.push({
        action,
        value,
        classes: btn.className?.substring(0, 80),
        text: btn.textContent?.trim()?.substring(0, 50),
      });
    }
  });

  // Check if layers section exists in the state
  const stateEl = document.getElementById("studioRoot");
  const sectionAttr = stateEl?.getAttribute("data-studio-section");

  return {
    studioRootExists: !!stateEl,
    sectionAttr,
    totalButtons: allButtons.length,
    relevantButtons: relevant.slice(0, 30),
    hasIconbarClass: document.querySelector(".studio-native-iconbar") !== null,
    hasNativeV8: document.querySelector(".studio-native-v8-main") !== null,
    hasAnyNav: document.querySelector("nav") !== null,
    bodyChildren: document.body.children.length,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
