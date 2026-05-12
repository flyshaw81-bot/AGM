/**
 * Use Playwright to screenshot DPAGM and capture console errors.
 */
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") {
    errors.push(`[ERROR] ${msg.text()}`);
  }
});
page.on("pageerror", (err) => {
  errors.push(`[PAGE ERROR] ${err.message}`);
});

console.log("Navigating to DPAGM...");
await page.goto("http://127.0.0.1:5180/AGM-Studio/", {
  waitUntil: "networkidle",
  timeout: 30000,
});

// Wait for map to generate
await page.waitForTimeout(8000);

// Screenshot
await page.screenshot({ path: "scripts/dpagm-screenshot.png", fullPage: false });
console.log("Screenshot saved to scripts/dpagm-screenshot.png");

// Check SVG layers
const svgInfo = await page.evaluate(() => {
  const svg = document.querySelector("svg#map");
  if (!svg) return { error: "No SVG found" };

  const layers = {};
  svg.querySelectorAll("g[id]").forEach((g) => {
    const id = g.getAttribute("id");
    const children = g.children.length;
    let innerHTML = g.innerHTML.substring(0, 200);
    layers[id] = { children, innerHTML };
  });

  return {
    svgExists: true,
    svgWidth: svg.getAttribute("width"),
    svgHeight: svg.getAttribute("height"),
    viewboxTransform: svg.querySelector("g#viewbox")?.getAttribute("transform"),
    layers,
  };
});

console.log("\n=== SVG Info ===");
console.log(JSON.stringify(svgInfo, null, 2).substring(0, 5000));

// Check state labels specifically
const labelsInfo = await page.evaluate(() => {
  const statesGroup = document.querySelector("g#labels > g#states");
  if (!statesGroup) return { error: "No g#labels > g#states found" };

  const textPaths = [];
  statesGroup.querySelectorAll("text").forEach((t) => {
    textPaths.push({
      id: t.getAttribute("id"),
      innerHTML: t.innerHTML.substring(0, 200),
    });
  });

  const parentLabels = document.querySelector("g#labels");
  return {
    labelsDisplay: parentLabels?.style.display,
    labelsChildren: parentLabels?.children.length,
    statesChildren: statesGroup.children.length,
    textPaths: textPaths.slice(0, 5),
  };
});

console.log("\n=== Labels Info ===");
console.log(JSON.stringify(labelsInfo, null, 2));

// Check states body
const statesInfo = await page.evaluate(() => {
  const statesBody = document.querySelector("g#statesBody");
  if (!statesBody) return { error: "No g#statesBody found" };

  const paths = [];
  statesBody.querySelectorAll("path").forEach((p) => {
    const d = p.getAttribute("d");
    paths.push({
      id: p.getAttribute("id"),
      dPreview: d?.substring(0, 100),
      dLength: d?.length,
    });
  });

  return {
    childrenCount: statesBody.children.length,
    firstPaths: paths.slice(0, 5),
    totalPaths: paths.length,
  };
});

console.log("\n=== States Body Info ===");
console.log(JSON.stringify(statesInfo, null, 2));

// Print all console errors
console.log("\n=== Console Errors ===");
if (errors.length === 0) {
  console.log("No errors found");
} else {
  errors.forEach((e) => console.log(e));
}

await browser.close();
