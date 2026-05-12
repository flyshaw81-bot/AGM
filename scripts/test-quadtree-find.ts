import { quadtree } from "../src/utils/quadtree";

// Test with a small dataset: 10 random 2D points with indices
const pts: [number, number][] = [
  [10, 20], [50, 30], [80, 70], [20, 80], [90, 10],
  [40, 50], [60, 40], [30, 60], [70, 90], [15, 55],
];

// Build quadtree the same way as graphUtils.ts
const data = pts.map(([x, y], i) => [x, y, i] as [number, number, number]);
const qTree = quadtree(data);

console.log("Quadtree root:", JSON.stringify(qTree));

// Test find() for each point
for (const p of pts) {
  const found = qTree.find(p[0], p[1]);
  console.log(`find(${p}) =`, found);
}

// Test find() for a point between points
const testX = 42, testY = 42;
const found = qTree.find(testX, testY);
console.log(`\nfind(${testX}, ${testY}) =`, found);

// Brute force check
let bestI = -1, bestD = Infinity;
for (let i = 0; i < pts.length; i++) {
  const d2 = (testX - pts[i][0]) ** 2 + (testY - pts[i][1]) ** 2;
  if (d2 < bestD) { bestD = d2; bestI = i; }
}
console.log(`Brute force best: index ${bestI} at ${pts[bestI]}, dist2=${bestD}`);

// Now test with a 3-element data as in graphUtils format
const bigData = pts.map(([x, y], i) => [x, y, i]);
const qTree2 = quadtree(bigData);
const found2 = qTree2.find(42, 42);
console.log(`\nBig data format find(42, 42) =`, found2);

// Test quadtree size
console.log("Size:", qTree2.size());

// Test data access
for (const d of bigData) {
  const f = qTree2.find(d[0], d[1]);
  if (!f) {
    console.log(`FAILED: cannot find own point ${d}`);
  } else if (f[2] !== d[2]) {
    console.log(`WRONG: find(${d[0]}, ${d[1]}) returned index ${f[2]}, expected ${d[2]}`);
  }
}
console.log("Self-find test complete");
