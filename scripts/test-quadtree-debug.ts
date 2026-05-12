import { quadtree } from "../src/utils/quadtree";

const pts: [number, number][] = [
  [10, 20], [50, 30], [80, 70], [20, 80], [90, 10],
  [40, 50], [60, 40], [30, 60], [70, 90], [15, 55],
];

const data = pts.map(([x, y], i) => [x, y, i] as [number, number, number]);
const qTree = quadtree(data);

function describe(node: any, depth: number = 0, maxDepth: number = 4): string {
  if (depth > maxDepth) return "...";
  if (!node) return "null";
  if (node.data !== undefined) {
    let result = `[${node.data}]`;
    if (node.next) result += "->" + describe(node.next, depth, maxDepth);
    return result;
  }
  const parts: string[] = [];
  for (let q = 0; q < 4; q++) {
    if (node[q]) {
      parts.push(`q${q}:${describe(node[q], depth + 1, maxDepth)}`);
    }
  }
  return `{${parts.join(",")}}`;
}

const root = (qTree as any)._root;
console.log("Root structure (depth 4):");
console.log(describe(root, 0, 4));

console.log("\nRoot children summary:");
for (let q = 0; q < 4; q++) {
  const child = root[q];
  if (child) {
    if (child.data !== undefined) {
      console.log(`root[${q}]: leaf [${child.data}]` + (child.next ? " (chained)" : ""));
    } else {
      // Count depth
      let depth = 0;
      let n = child;
      while (n && !n.data) {
        depth++;
        let nextChild = null;
        for (let cq = 0; cq < 4; cq++) {
          if (n[cq]) { nextChild = n[cq]; break; }
        }
        n = nextChild;
      }
      const leaf = n ? `[${n.data}]` : "null";
      console.log(`root[${q}]: internal, depth=${depth}, leaf=${leaf}`);
    }
  } else {
    console.log(`root[${q}]: empty`);
  }
}

// Manual find
console.log("\n\n=== Manual find(42, 42) with trace ===");
function manualFind(x: number, y: number, radius?: number) {
  let closestData: any = undefined;
  let closestDist = radius !== undefined ? radius * radius : Infinity;
  let nodesVisited = 0;
  let leavesVisited = 0;

  const root2 = (qTree as any)._root;
  const x0 = (qTree as any)._x0;
  const y0 = (qTree as any)._y0;
  const x1 = (qTree as any)._x1;
  const y1 = (qTree as any)._y1;

  if (!root2) return { closestData, closestDist, nodesVisited, leavesVisited };

  // Leaf-only root
  if (root2.data !== undefined && root2.length === undefined) {
    let leaf = root2;
    while (leaf) {
      leavesVisited++;
      const dx = x - leaf.data[0];
      const dy = y - leaf.data[1];
      const d2 = dx * dx + dy * dy;
      if (d2 < closestDist) { closestDist = d2; closestData = leaf.data; }
      leaf = leaf.next;
    }
    return { closestData, closestDist: Math.sqrt(closestDist), nodesVisited, leavesVisited };
  }

  const stack = [{ node: root2, x0, y0, x1, y1 }];

  while (stack.length > 0) {
    const frame = stack.pop()!;
    nodesVisited++;
    const { node: n, x0: fx0, y0: fy0, x1: fx1, y1: fy1 } = frame;

    // Check if this quadrant could contain a closer point
    const dx0 = x - fx1;
    const dy0 = y - fy1;
    const dx1 = x - fx0;
    const dy1 = y - fy0;
    const dxMin = dx0 > 0 ? dx0 * dx0 : dx1 < 0 ? dx1 * dx1 : 0;
    const dyMin = dy0 > 0 ? dy0 * dy0 : dy1 < 0 ? dy1 * dy1 : 0;

    console.log(`  Node at [${fx0},${fy0}] to [${fx1},${fy1}], dxMin+dyMin=${dxMin+dyMin}, closestDist=${closestDist}, skip=${dxMin + dyMin >= closestDist}`);

    if (dxMin + dyMin >= closestDist) continue;

    const xm = (fx0 + fx1) / 2;
    const ym = (fy0 + fy1) / 2;

    for (let q = 3; q >= 0; q--) {
      const child = n[q];
      if (!child) continue;

      const cx0 = q & 1 ? fx0 : xm;
      const cy0 = q & 2 ? fy0 : ym;
      const cx1 = q & 1 ? xm : fx1;
      const cy1 = q & 2 ? ym : fy1;

      if (child.data !== undefined && child.length === undefined) {
        // Leaf
        let leaf = child;
        while (leaf) {
          leavesVisited++;
          const dx = x - leaf.data[0];
          const dy = y - leaf.data[1];
          const d2 = dx * dx + dy * dy;
          console.log(`    Leaf q${q}: [${leaf.data}] d2=${d2}`);
          if (d2 < closestDist) {
            closestDist = d2;
            closestData = leaf.data;
            console.log(`      -> new closest! dist2=${d2}`);
          }
          leaf = leaf.next;
        }
      } else {
        // Internal
        console.log(`    Push q${q} internal at [${cx0},${cy0}]-[${cx1},${cy1}]`);
        stack.push({ node: child, x0: cx0, y0: cy0, x1: cx1, y1: cy1 });
      }
    }
  }

  return { closestData, closestDist: Math.sqrt(closestDist), nodesVisited, leavesVisited };
}

const result = manualFind(42, 42);
console.log("\nResult:", JSON.stringify(result));
