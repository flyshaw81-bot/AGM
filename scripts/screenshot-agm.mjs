import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`[ERROR] ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`[PAGE ERROR] ${err.message}`));

console.log("Navigating to AGM...");
await page.goto("http://127.0.0.1:5175/AGM-Studio/", {
  waitUntil: "networkidle",
  timeout: 30000,
});
await page.waitForTimeout(8000);

// Check state labels
const labelsInfo = await page.evaluate(() => {
  const textPaths = document.querySelectorAll("#textPaths path");
  const paths = [];
  textPaths.forEach((p) => {
    const d = p.getAttribute("d");
    paths.push({
      id: p.getAttribute("id"),
      d: d?.substring(0, 200),
    });
  });

  const statesGroup = document.querySelector("g#labels > g#states");
  const labelTexts = [];
  statesGroup?.querySelectorAll("text").forEach((t) => {
    labelTexts.push({
      id: t.getAttribute("id"),
      innerHTML: t.innerHTML?.substring(0, 200),
    });
  });

  return {
    textPathCount: textPaths.length,
    firstPaths: paths.slice(0, 5),
    labelTextCount: labelTexts.length,
    firstLabels: labelTexts.slice(0, 5),
  };
});

console.log("\n=== AGM Labels ===");
console.log(JSON.stringify(labelsInfo, null, 2));

const riversInfo = await page.evaluate(() => {
  const rivers = document.querySelectorAll("g#rivers path");
  const firstD = rivers[0]?.getAttribute("d")?.substring(0, 200);
  return {
    count: rivers.length,
    firstD: firstD,
  };
});

console.log("\n=== AGM Rivers ===");
console.log(JSON.stringify(riversInfo, null, 2));

console.log("\n=== AGM Errors ===");
if (errors.length === 0) console.log("No errors");
else errors.forEach((e) => console.log(e));

await browser.close();
