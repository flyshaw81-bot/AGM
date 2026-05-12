import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

// 先记录当前状态
const before = await page.evaluate(() => {
  return {
    textPaths: document.querySelectorAll("#textPaths path").length,
    statesLabels: document.querySelectorAll("g#labels > g#states text").length,
  };
});
console.log("Before:", JSON.stringify(before));

// 调用 drawStateLabels
await page.evaluate(() => {
  window.drawStateLabels();
});

// 等待渲染
await page.waitForTimeout(3000);

// 检查结果
const after = await page.evaluate(() => {
  const firstPath = document.querySelector("#textPaths path");
  return {
    textPaths: document.querySelectorAll("#textPaths path").length,
    statesLabels: document.querySelectorAll("g#labels > g#states text").length,
    firstD: firstPath ? firstPath.getAttribute("d") : "none",
    // 也检查一个特定的 state 的 pole
    state1Pole: window.__agmActiveEngineRuntimeContext?.pack?.states?.[1]?.pole,
  };
});
console.log("After:", JSON.stringify(after, null, 2));

// 关闭
await browser.close();
