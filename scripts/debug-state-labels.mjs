import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(8000);

// 检查每个 textPath 的具体 d 值
const result = await page.evaluate(() => {
  const textPaths = document.querySelectorAll("#textPaths path");
  const paths = [];
  textPaths.forEach(p => {
    paths.push({
      id: p.getAttribute("id"),
      d: p.getAttribute("d"),
    });
  });

  // 也检查 states 的 d 值
  const states = document.querySelectorAll("#statesBody path[id^='state'][id$='1'], #statesBody path[id^='state'][id$='2']");
  const statePaths = [];
  states.forEach(p => {
    statePaths.push({
      id: p.getAttribute("id"),
      d: p.getAttribute("d")?.substring(0, 300),
    });
  });

  return { textPaths: paths.slice(0, 5), statePaths };
});

console.log("=== TextPaths ===");
result.textPaths.forEach(p => console.log(p.id, p.d));
console.log("\n=== States ===");
result.statePaths.forEach(p => console.log(p.id, p.d));

await browser.close();
