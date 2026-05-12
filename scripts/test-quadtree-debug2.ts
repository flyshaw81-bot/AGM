import { quadtree } from "../src/utils/quadtree";

const pts: [number, number][] = [
  [10, 20], [50, 30], [80, 70], [20, 80], [90, 10],
  [40, 50], [60, 40], [30, 60], [70, 90], [15, 55],
];

const data = pts.map(([x, y], i) => [x, y, i] as [number, number, number]);
const qTree = quadtree(data);

// Let's look at the ACTUAL quadtree internal structure
const root = (qTree as any)._root;

// Find ALL leaves in the tree
function findAllLeaves(node: any, path: string = ""): { path: string; data: any }[] {
  if (!node) return [];
  if (node.data !== undefined) {
    const results = [{ path, data: node.data }];
    if (node.next) {
      let cur = node.next;
      while (cur) {
        results.push({ path: path + "->next", data: cur.data });
        cur = cur.next;
      }
    }
    return results;
  }
  // Internal node
  const results: { path: string; data: any }[] = [];
  for (let q = 0; q < 4; q++) {
    if (node[q]) {
      results.push(...findAllLeaves(node[q], path + `[${q}]`));
    }
  }
  return results;
}

const leaves = findAllLeaves(root);
console.log("All leaves in tree:");
leaves.forEach(l => console.log(`  ${l.path}: ${JSON.stringify(l.data)}`));

// Find how many levels deep each leaf is
leaves.forEach(l => {
  const depth = (l.path.match(/\[/g) || []).length;
  console.log(`  Depth ${depth}: ${l.path} -> ${JSON.stringify(l.data)}`);
});

// The find algorithm with bounds tracking issue:
// In _addPoint, when point A and point B fall in the same quadrant,
// a new {length:4} node is created. But the bounds are split correctly.
// The issue might be that both points are in the SAME sub-quadrant,
// requiring further splitting, each time creating a new level.
// This is expected. The find should work.

// But wait - the "skip" check in find:
//   const dxMin = dx0 > 0 ? dx0 * dx0 : dx1 < 0 ? dx1 * dx1 : 0;
// This computes the min SQUARED distance from query point to quadrant.
// If closestDist is already set to a value, and the distance to quadrant
// is larger, the quadrant is skipped.

// The problem: when the internal nodes have bounds computed ON THE FLY
// from parent bounds, the bounds should be correct.
// Let me trace find(42, 42):

const qTree2 = quadtree(data);
console.log("\n\nManual find(42, 42) verbose:");

let closestData: any = undefined;
let closestDist = Infinity;
let level = 0;

const x0 = (qTree2 as any)._x0;
const y0 = (qTree2 as any)._y0;
const x1 = (qTree2 as any)._x1;
const y1 = (qTree2 as any)._y1;

const queryX = 42, queryY = 42;

interface Frame { node: any; x0: number; y0: number; x1: number; y1: number; depth: number }
const stack: Frame[] = [{ node: (qTree2 as any)._root, x0, y0, x1, y1, depth: 0 }];

while (stack.length > 0) {
  const frame = stack.pop()!;
  const { node: n, x0: fx0, y0: fy0, x1: fx1, y1: fy1, depth } = frame;

  const dx0 = queryX - fx1;
  const dy0 = queryY - fy1;
  const dx1 = queryX - fx0;
  const dy1 = queryY - fy0;
  const dxMin = dx0 > 0 ? dx0 * dx0 : dx1 < 0 ? dx1 * dx1 : 0;
  const dyMin = dy0 > 0 ? dy0 * dy0 : dy1 < 0 ? dy1 * dy1 : 0;
  const minDistToQuadrant = dxMin + dyMin;

  console.log(`[depth ${depth}] Bounds [${fx0},${fy0}]-[${fx1},${fy1}], minDist2=${minDistToQuadrant}, closest=${Math.sqrt(closestDist).toFixed(1)}, skip=${minDistToQuadrant >= closestDist}`);

  if (minDistToQuadrant >= closestDist) continue;

  const xm = (fx0 + fx1) / 2;
  const ym = (fy0 + fy1) / 2;

  for (let q = 3; q >= 0; q--) {
    const child = n[q];
    if (!child) continue;

    if (child.data !== undefined && child.length === undefined) {
      // Leaf
      let leaf = child;
      while (leaf) {
        const dx = queryX - leaf.data[0];
        const dy = queryY - leaf.data[1];
        const d2 = dx * dx + dy * dy;
        console.log(`  [depth ${depth}] Leaf q${q}: [${leaf.data}] d2=${d2} d=${Math.sqrt(d2).toFixed(1)}`);
        if (d2 < closestDist) {
          closestDist = d2;
          closestData = leaf.data;
          console.log(`  -> NEW CLOSEST: d=${Math.sqrt(d2).toFixed(1)}`);
        }
        leaf = leaf.next;
      }
    } else {
      // Internal
      const cx0 = q & 1 ? fx0 : xm;
      const cy0 = q & 2 ? fy0 : ym;
      const cx1 = q & 1 ? xm : fx1;
      const cy1 = q & 2 ? ym : fy1;
      console.log(`  [depth ${depth}] Push q${q} internal at [${cx0},${cy0}]-[${cx1},${cy1}]`);
      stack.push({ node: child, x0: cx0, y0: cy0, x1: cx1, y1: cy1, depth: depth + 1 });
    }
  }
}

console.log(`\nResult: ${JSON.stringify(closestData)}, dist=${Math.sqrt(closestDist).toFixed(2)}`);
