import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

await page.screenshot({ path: "D:/DPAGM/scripts/dpagm-debug.png", fullPage: false });
console.log("Screenshot saved to D:/DPAGM/scripts/dpagm-debug.png");

// 同时检查一下地图上的白色元素可能是什么
const info = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const features = pack.features;
  const cells = pack.cells;

  // 检查features中有哪些类型
  const featureTypes = {};
  features.forEach(f => {
    if (f && f.type) {
      featureTypes[f.type] = (featureTypes[f.type] || 0) + 1;
    }
  });

  // 检查白色/海洋相关
  const oceanCellCount = cells.state.filter(s => s === 0).length;
  const totalCells = cells.state.length;

  // 检查SVG中是否有白色元素
  const whiteElements = [];
  document.querySelectorAll("path, rect, polygon").forEach(el => {
    const fill = el.getAttribute("fill");
    const style = el.getAttribute("style");
    if ((fill && (fill === "white" || fill === "#fff" || fill === "#ffffff")) ||
        (style && style.includes("white"))) {
      whiteElements.push({
        tag: el.tagName,
        id: el.getAttribute("id"),
        fill,
        d: el.getAttribute("d")?.substring(0, 80),
      });
    }
  });

  return {
    featureTypes,
    oceanCells: oceanCellCount,
    neutralCells: oceanCellCount,
    totalCells,
    whiteElements: whiteElements.slice(0, 10),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
