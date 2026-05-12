// Debug: investigate white/blocky artifacts in the map
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const stateIds = pack.cells.state;

  // 检查 state 0 (neutral) 的渲染颜色
  // 看看 statesBody 中 state 0 的路径
  const statesBody = document.getElementById("statesBody");
  const statePaths = statesBody ? statesBody.querySelectorAll("path") : [];

  const state0Paths = [];
  const stateOtherPaths = [];
  statePaths.forEach(p => {
    const id = p.getAttribute("id");
    const fill = p.getAttribute("fill");
    const d = p.getAttribute("d");

    if (id && id.includes("state")) {
      if (id.includes("state0") || fill === "#ffffff" || fill === "white" || fill === "#fff") {
        state0Paths.push({ id, fill, dlen: d?.length });
      } else {
        stateOtherPaths.push({ id, fill, dlen: d?.length });
      }
    }
  });

  // 检查 statesHalo
  const statesHalo = document.getElementById("statesHalo");
  const haloPaths = statesHalo ? statesHalo.querySelectorAll("path") : [];
  const haloInfo = [];
  haloPaths.forEach(p => {
    const id = p.getAttribute("id");
    const fill = p.getAttribute("fill");
    const stroke = p.getAttribute("stroke");
    haloInfo.push({ id, fill, stroke });
  });

  // 统计每个state的cell数量
  const stateCellCounts = {};
  for (let i = 0; i < stateIds.length; i++) {
    const sid = stateIds[i];
    stateCellCounts[sid] = (stateCellCounts[sid] || 0) + 1;
  }

  // 列出所有state的cells和pole
  const stateInfo = pack.states.filter(s => s.i && !s.removed).map(s => ({
    i: s.i,
    cells: s.cells,
    pole: s.pole,
    name: s.name,
    color: s.color,
  }));

  // 检查neutral (state 0) cells
  const neutralCount = stateCellCounts["0"] || 0;

  return {
    state0Paths: state0Paths.slice(0, 5),
    otherStatePaths: stateOtherPaths.slice(0, 5),
    totalStatePaths: statePaths.length,
    haloInfo: haloInfo.slice(0, 5),
    totalHaloPaths: haloPaths.length,
    stateCellCounts: Object.entries(stateCellCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
    neutralCount,
    stateInfo: stateInfo.slice(0, 10),
    features: pack.features.map(f => f ? { type: f.type, cells: f.cells, group: f.group } : null),
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
