// Force fresh page load and verify state 0 rendering
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Kill cache
await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const statesBody = document.getElementById("statesBody");
  const allElements = statesBody?.children;

  const info = {
    totalChildren: allElements?.length,
    state0Present: false,
    state0Fill: null,
    allStateInfo: [],
    // Also check other potentially white elements
    waterInfo: {},
  };

  if (allElements) {
    for (const el of allElements) {
      const id = el.getAttribute("id");
      const fill = el.getAttribute("fill");
      const tag = el.tagName;

      if (id === "state0") {
        info.state0Present = true;
        info.state0Fill = fill;
      }

      if (id && id.startsWith("state")) {
        info.allStateInfo.push({ id, fill, tag });
      }
    }
  }

  // Check water mask - if white rect is visible, could cause white artifacts
  const water = document.getElementById("water");
  if (water) {
    const rect = water.querySelector("rect");
    info.waterInfo = {
      rectFill: rect?.getAttribute("fill"),
      rectWidth: rect?.getAttribute("width"),
      rectHeight: rect?.getAttribute("height"),
    };
  }

  // Check if there are path elements with white/empty fill outside statesBody
  const whiteFilledPaths = [];
  document.querySelectorAll("path").forEach(p => {
    const fill = p.getAttribute("fill");
    const id = p.getAttribute("id") || "";
    if ((fill === "#ffffff" || fill === "white" || fill === "#fff") && !id.includes("coast") && !id.includes("river") && !id.includes("border")) {
      whiteFilledPaths.push({
        id,
        fill,
        parent: p.parentElement?.id,
        d: p.getAttribute("d")?.substring(0, 60),
      });
    }
  });

  return { ...info, whiteFilledPaths: whiteFilledPaths.slice(0, 15) };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
