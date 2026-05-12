import { curveNatural, line } from "d3-shape";

// 模拟 state label 的典型3点路径
const testPoints = [
  [726, 311],
  [726, 311],  // 中间点是 pole
  [706, 262],
];

console.log("=== d3 curveNatural ===");
const d3Out = line().curve(curveNatural)(testPoints);
console.log(d3Out);

// DPAGM 实际textPath输出
console.log("\n=== DPAGM 实际输出 ===");
console.log("M726,311C726,311,726,311,726,311C726,311,726,311,726,311");
console.log("（退化路径 - 所有点相同）");

// 诊断：自然三次样条对于3个点的计算
// naturalControlPoints 函数计算控制点
function naturalControlPoints(x) {
  const n = x.length - 1;  // = 2
  const a = new Float64Array(n); // size 2
  const b = new Float64Array(n);
  const r = new Float64Array(n);

  a[0] = 0;
  b[0] = 2;
  r[0] = x[0] + 2 * x[1];  // 726 + 2*726 = 2178

  // i=1 不会进入循环因为 n-1=1

  a[1] = 2;
  b[1] = 7;
  r[1] = 8 * x[1] + x[2];  // 8*726 + 706 = 6514

  // Forward elimination (Thomas)
  // i=1: m = a[1]/b[0] = 2/2 = 1
  //      b[1] -= m = 7 - 1 = 6
  //      r[1] -= m*r[0] = 6514 - 2178 = 4336

  let m = a[1] / b[0];
  b[1] -= m;
  r[1] -= m * r[0];

  // Back substitution
  // a[1] = r[1]/b[1] = 4336/6 = 722.66...
  // a[0] = (r[0] - a[1])/b[0] = (2178 - 722.66)/2 = 727.66...

  a[1] = r[1] / b[1];
  a[0] = (r[0] - a[1]) / b[0];

  // Second control points
  // b[1] = (x[2] + a[1])/2 = (706 + 722.66)/2 = 714.33
  // b[0] = 2*x[1] - a[1] = 2*726 - 722.66 = 729.33

  b[1] = (x[2] + a[1]) / 2;
  b[0] = 2 * x[1] - a[1];

  console.log("First control points (a):", Array.from(a));
  console.log("Second control points (b):", Array.from(b));

  return [a, b];
}

console.log("\n=== DPAGM naturalControlPoints 对 X 坐标的计算 ===");
const [px0, px1] = naturalControlPoints(testPoints.map(p => p[0]));
const [py0, py1] = naturalControlPoints(testPoints.map(p => p[1]));

// 生成贝塞尔曲线
// i0=0,i1=1: bezierCurveTo(px0[0], py0[0], px1[0], py1[0], x[1], y[1])
// px0[0] = ?, px1[0] = ?, x[1] = 726
// i0=1,i1=2: bezierCurveTo(px0[1], py0[1], px1[1], py1[1], x[2], y[2])

console.log("\n第一段贝塞尔:");
console.log(`  C${px0[0]},${py0[0]},${px1[0]},${py1[0]},${testPoints[1][0]},${testPoints[1][1]}`);
console.log("\n第二段贝塞尔:");
console.log(`  C${px0[1]},${py0[1]},${px1[1]},${py1[1]},${testPoints[2][0]},${testPoints[2][1]}`);
