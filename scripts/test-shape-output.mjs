/**
 * Test DPAGM's self-developed shapeUtils against d3-shape via dynamic import.
 */

const testPoints = [
  [0, 0],
  [10, 10],
  [20, 5],
  [30, 15],
  [40, 0],
  [50, 10],
  [60, 5],
];

// Test 1: Compare natural curve output (used by state labels)
const d3 = await import("d3-shape");

const d3Line = d3.line().curve(d3.curveNatural);
const d3Output = d3Line(testPoints);
console.log("=== d3 curveNatural ===");
console.log(d3Output);
console.log("");

const d3Basis = d3.line().curve(d3.curveBasis);
console.log("=== d3 curveBasis ===");
console.log(d3Basis(testPoints));
console.log("");

const d3BasisClosed = d3.line().curve(d3.curveBasisClosed);
console.log("=== d3 curveBasisClosed ===");
console.log(d3BasisClosed(testPoints));
console.log("");

// Now import DPAGM's shapeUtils (need to transpile .ts)
// Can't directly import TS, so let's use the AGM node_modules d3-shape for reference
// and check that DPAGM's output would be identical.

// Check d3-shape version
const pkg = await import("d3-shape/package.json", { assert: { type: "json" } });
console.log("d3-shape version:", pkg.default.version);
