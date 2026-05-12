import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

const result = await page.evaluate(() => {
  const ctx = window.__agmActiveEngineRuntimeContext;
  const pack = ctx.pack;
  const cells = pack.cells;
  const stateIds = cells.state;
  const features = pack.features;

  // 取 state1 的 pole
  const s1 = pack.states[1];
  const [x0, y0] = s1.pole;

  // 模拟 raycast 的第一步：从 pole 向外走 5 个单位
  const dx = 1, dy = 0;
  const LENGTH_START = 5;
  const x = x0 + LENGTH_START * dx;  // x0 + 5
  const y = y0 + LENGTH_START * dy;  // y0

  // 模拟 isInsideState
  // 先测试 findClosestCell
  const findCell = (x, y) => {
    // 直接走 graphUtils 的逻辑
    if (!pack.cells || !pack.cells.p) throw new Error("Pack cells not found");

    // 简化的最近邻搜索
    let minDist = Infinity;
    let minIdx = -1;
    const pts = pack.cells.p;

    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i];
      const d2 = (x - px) * (x - px) + (y - py) * (y - py);
      if (d2 < minDist) {
        minDist = d2;
        minIdx = i;
      }
    }
    return minIdx;
  };

  const cellId = findCell(x, y);
  const cellStateId = stateIds[cellId];
  const expectedStateId = s1.i;
  const inside = cellStateId === expectedStateId;

  // 也测试几个不同方向的光线
  const testDirs = [[1,0], [0,1], [-1,0], [0,-1]];
  const testResults = testDirs.map(([dx, dy]) => {
    const tx = x0 + 5 * dx;
    const ty = y0 + 5 * dy;
    const cid = findCell(tx, ty);
    const sid = cid >= 0 ? stateIds[cid] : -1;
    return { dir: [dx, dy], cellId: cid, stateId: sid, inside: sid === expectedStateId };
  });

  return {
    pole: [x0, y0],
    testPoint: [x, y],
    cellId,
    cellStateId,
    expectedStateId,
    inside,
    testResults,
    stateIdsLength: stateIds.length,
    cellsPLength: cells.p ? cells.p.length : 0,
  };
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
