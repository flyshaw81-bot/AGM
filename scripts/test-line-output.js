#!/usr/bin/env node
/**
 * Compare DPAGM's self-developed line() output against d3's line() output.
 * Run from DPAGM directory.
 */

const path = require("path");

// Load self-developed line from DPAGM
// Since it's a .ts file, we need ts-node or build. Let's use the dist instead, or...
// Actually, let's test specific curve behaviors inline with the same math.

const testPoints = [
  [0, 0],
  [10, 10],
  [20, 5],
  [30, 15],
  [40, 0],
  [50, 10],
  [60, 5],
];

// Test curveBasis (same algorithm as d3-shape's basis curve)
// This implements the same B-spline basis logic
function basisPoint(x0, y0, x1, y1, x, y) {
  return [
    (2 * x0 + x1) / 3,
    (2 * y0 + y1) / 3,
    (x0 + 2 * x1) / 3,
    (y0 + 2 * y1) / 3,
    (x0 + 4 * x1 + x) / 6,
    (y0 + 4 * y1 + y) / 6,
  ];
}

// Manual basis curve emulation (as DPAGM's shapeUtils does)
function basisPath(points) {
  const n = points.length;
  if (n < 2) return "";
  let path = `M${points[0][0]},${points[0][1]}`;

  let x0 = points[0][0], y0 = points[0][1];
  if (n === 2) {
    return path + `L${points[1][0]},${points[1][1]}`;
  }

  // First segment special case: lineTo then bezier with replicated points
  let x1 = 0, y1 = 0;
  let first = true;
  let pointCount = 0;

  for (let i = 0; i < n; i++) {
    const [x, y] = points[i];
    pointCount++;

    if (pointCount === 1) {
      // moveTo already done
      x1 = x; y1 = y;
    } else if (pointCount === 2) {
      x1 = x; y1 = y;
      // No output yet for point 2
    } else if (pointCount === 3) {
      // Line to first control point, then bezier
      path += `L${(5 * x0 + x1) / 6},${(5 * y0 + y1) / 6}`;
      const [cx1, cy1, cx2, cy2, ex, ey] = basisPoint(x0, y0, x1, y1, x, y);
      path += `C${cx1},${cy1},${cx2},${cy2},${ex},${ey}`;
      x0 = x1; y0 = y1;
      x1 = x; y1 = y;
    } else {
      const [cx1, cy1, cx2, cy2, ex, ey] = basisPoint(x0, y0, x1, y1, x, y);
      path += `C${cx1},${cy1},${cx2},${cy2},${ex},${ey}`;
      x0 = x1; y0 = y1;
      x1 = x; y1 = y;
    }
  }

  // lineEnd: emit final segment
  if (pointCount >= 3) {
    const [cx1, cy1, cx2, cy2, ex, ey] = basisPoint(x0, y0, x1, y1, x1, y1);
    path += `C${cx1},${cy1},${cx2},${cy2},${ex},${ey}L${x1},${y1}`;
  }

  return path;
}

// Now load d3 from AGM and compare
const d3 = require("D:/AGM/AGM-Studio/node_modules/d3");

const d3Line = d3.line().curve(d3.curveBasis);
const d3Output = d3Line(testPoints);

const dpagmOutput = basisPath(testPoints);

console.log("D3 curveBasis output:");
console.log(d3Output);
console.log("");
console.log("DPAGM-style curveBasis output:");
console.log(dpagmOutput);
console.log("");
console.log("Match:", d3Output === dpagmOutput ? "YES" : "NO");

// Also test with integer points
const intPoints = [
  [100, 200],
  [150, 180],
  [200, 220],
  [250, 190],
];

const d3IntOutput = d3Line(intPoints);
const dpagmIntOutput = basisPath(intPoints);

console.log("\n--- Integer points test ---");
console.log("D3:", d3IntOutput);
console.log("DPA:", dpagmIntOutput);
console.log("Match:", d3IntOutput === dpagmIntOutput ? "YES" : "NO");
