/**
 * Compare DPAGM self-developed curves vs d3-shape on identical inputs.
 */

import { curveBasis, curveBasisClosed, curveNatural, curveLinear, curveStep, curveCatmullRom, line } from "d3-shape";

// --- Also load DPAGM curves via inline implementation (same as shapeUtils.ts) ---
// We copy the exact math from DPAGM's shapeUtils.ts

class Path {
  _d = [];
  _valid = false;
  moveTo(x, y) {
    const xn = +x, yn = +y;
    if (isNaN(xn) || isNaN(yn)) return;
    this._d.push(`M${xn},${yn}`);
    this._valid = true;
  }
  lineTo(x, y) {
    const xn = +x, yn = +y;
    if (isNaN(xn) || isNaN(yn)) return;
    this._d.push(`L${xn},${yn}`);
  }
  bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y) {
    const cx1 = +cpx1, cy1 = +cpy1, cx2 = +cpx2, cy2 = +cpy2, xe = +x, ye = +y;
    if (isNaN(cx1) || isNaN(cy1) || isNaN(cx2) || isNaN(cy2) || isNaN(xe) || isNaN(ye)) return;
    this._d.push(`C${cx1},${cy1},${cx2},${cy2},${xe},${ye}`);
  }
  closePath() { this._d.push("Z"); }
  toString() { return this._valid ? this._d.join("") : ""; }
}

// --- curveLinear (DPAGM) ---
class Linear {
  _context; _point = 0; _line = NaN;
  constructor(context) { this._context = context; }
  areaStart() { this._line = 0; }
  areaEnd() { this._line = NaN; }
  lineStart() { this._point = 0; }
  lineEnd() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x, y) {
    const xn = +x, yn = +y;
    switch (this._point) {
      case 0: this._point = 1;
        if (this._line) this._context.lineTo(xn, yn);
        else this._context.moveTo(xn, yn); break;
      case 1: this._point = 2; this._context.lineTo(xn, yn); break;
      default: this._context.lineTo(xn, yn); break;
    }
  }
}

// --- curveNatural (DPAGM) ---
function naturalControlPoints(x) {
  const n = x.length - 1;
  const a = new Float64Array(n);
  const b = new Float64Array(n);
  const r = new Float64Array(n);
  a[0] = 0; b[0] = 2; r[0] = x[0] + 2 * x[1];
  for (let i = 1; i < n - 1; ++i) {
    a[i] = 1; b[i] = 4; r[i] = 4 * x[i] + 2 * x[i + 1];
  }
  a[n - 1] = 2; b[n - 1] = 7; r[n - 1] = 8 * x[n - 1] + x[n];
  for (let i = 1; i < n; ++i) {
    const m = a[i] / b[i - 1];
    b[i] -= m; r[i] -= m * r[i - 1];
  }
  a[n - 1] = r[n - 1] / b[n - 1];
  for (let i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (x[n] + a[n - 1]) / 2;
  for (let i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
  return [a, b];
}

class Natural {
  _context; _line = NaN; _x = []; _y = [];
  constructor(context) { this._context = context; }
  areaStart() { this._line = 0; }
  areaEnd() { this._line = NaN; }
  lineStart() { this._x = []; this._y = []; }
  lineEnd() {
    const x = this._x, y = this._y, n = x.length;
    if (n) {
      if (this._line) this._context.lineTo(x[0], y[0]);
      else this._context.moveTo(x[0], y[0]);
      if (n === 2) {
        this._context.lineTo(x[1], y[1]);
      } else {
        const [px0, px1] = naturalControlPoints(x);
        const [py0, py1] = naturalControlPoints(y);
        for (let i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px0[i0], py0[i0], px1[i0], py1[i0], x[i1], y[i1]);
        }
      }
    }
    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
    this._line = 1 - this._line; this._x = []; this._y = [];
  }
  point(x, y) { this._x.push(+x); this._y.push(+y); }
}

// --- curveBasis (DPAGM) ---
function basisPoint(ctx, x0, y0, x1, y1, x, y) {
  ctx.bezierCurveTo(
    (2 * x0 + x1) / 3, (2 * y0 + y1) / 3,
    (x0 + 2 * x1) / 3, (y0 + 2 * y1) / 3,
    (x0 + 4 * x1 + x) / 6, (y0 + 4 * y1 + y) / 6
  );
}

class Basis {
  _context; _point = 0; _line = NaN; _x0 = 0; _x1 = 0; _y0 = 0; _y1 = 0;
  constructor(context) { this._context = context; }
  areaStart() { this._line = 0; }
  areaEnd() { this._line = NaN; }
  lineStart() { this._x0 = this._x1 = this._y0 = this._y1 = NaN; this._point = 0; }
  lineEnd() {
    switch (this._point) {
      case 3: basisPoint(this._context, this._x0, this._y0, this._x1, this._y1, this._x1, this._y1);
        this._context.lineTo(this._x1, this._y1); break;
      case 2: this._context.lineTo(this._x1, this._y1); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x, y) {
    const xn = +x, yn = +y;
    switch (this._point) {
      case 0: this._point = 1;
        if (this._line) this._context.lineTo(xn, yn); else this._context.moveTo(xn, yn); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3;
        this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
        basisPoint(this._context, this._x0, this._y0, this._x1, this._y1, xn, yn); break;
      default:
        basisPoint(this._context, this._x0, this._y0, this._x1, this._y1, xn, yn); break;
    }
    this._x0 = this._x1; this._x1 = xn; this._y0 = this._y1; this._y1 = yn;
  }
}

// --- curveBasisClosed (DPAGM) ---
class BasisClosed {
  _context; _point = 0; _x0 = 0; _y0 = 0; _x1 = 0; _y1 = 0;
  _x2 = 0; _y2 = 0; _x3 = 0; _y3 = 0; _x4 = 0; _y4 = 0;
  constructor(context) { this._context = context; }
  areaStart() {}
  areaEnd() {}
  lineStart() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
    this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 1: this._context.moveTo(this._x2, this._y2); this._context.closePath(); break;
      case 2: this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath(); break;
      case 3: this.point(this._x2, this._y2); this.point(this._x3, this._y3); this.point(this._x4, this._y4); break;
    }
  }
  point(x, y) {
    const xn = +x, yn = +y;
    switch (this._point) {
      case 0: this._point = 1; this._x2 = xn; this._y2 = yn; break;
      case 1: this._point = 2; this._x3 = xn; this._y3 = yn; break;
      case 2: this._point = 3; this._x4 = xn; this._y4 = yn;
        this._context.moveTo((this._x0 + 4 * this._x1 + xn) / 6, (this._y0 + 4 * this._y1 + yn) / 6); break;
      default:
        basisPoint(this._context, this._x0, this._y0, this._x1, this._y1, xn, yn); break;
    }
    this._x0 = this._x1; this._x1 = xn; this._y0 = this._y1; this._y1 = yn;
  }
}

// --- catmullRom (DPAGM) ---
function catmullRomPoint(ctx, x0, y0, x1, y1, x2, y2, x3, y3, alpha) {
  const t0 = 0, t1 = Math.pow(((x1 - x0) ** 2 + (y1 - y0) ** 2), alpha / 2) + t0;
  const t2 = Math.pow(((x2 - x1) ** 2 + (y2 - y1) ** 2), alpha / 2) + t1;
  const t3 = Math.pow(((x3 - x2) ** 2 + (y3 - y2) ** 2), alpha / 2) + t2;
  const m1x = (t2 - t1) * ((x0 - x1) / (t1 - t0 || 1) - (x0 - x2) / (t2 - t0 || 1) + (x1 - x2) / (t2 - t1 || 1));
  const m1y = (t2 - t1) * ((y0 - y1) / (t1 - t0 || 1) - (y0 - y2) / (t2 - t0 || 1) + (y1 - y2) / (t2 - t1 || 1));
  const m2x = (t2 - t1) * ((x1 - x2) / (t2 - t1 || 1) - (x1 - x3) / (t3 - t1 || 1) + (x2 - x3) / (t3 - t2 || 1));
  const m2y = (t2 - t1) * ((y1 - y2) / (t2 - t1 || 1) - (y1 - y3) / (t3 - t1 || 1) + (y2 - y3) / (t3 - t2 || 1));
  ctx.bezierCurveTo(
    x1 + m1x / 3, y1 + m1y / 3,
    x2 - m2x / 3, y2 - m2y / 3,
    x2, y2
  );
}

class CatmullRom {
  _context; _alpha; _point = 0; _line = NaN;
  _x0 = 0; _y0 = 0; _x1 = 0; _y1 = 0; _x2 = 0; _y2 = 0;
  constructor(context, alpha) { this._context = context; this._alpha = alpha; }
  areaStart() { this._line = 0; }
  areaEnd() { this._line = NaN; }
  lineStart() { this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN; this._point = 0; }
  lineEnd() {
    switch (this._point) {
      case 3: catmullRomPoint(this._context, this._x0, this._y0, this._x1, this._y1, this._x2, this._y2, this._x2, this._y2, this._alpha); break;
      case 2: this._context.lineTo(this._x2, this._y2); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x, y) {
    const xn = +x, yn = +y;
    switch (this._point) {
      case 0: this._point = 1;
        if (this._line) this._context.lineTo(xn, yn); else this._context.moveTo(xn, yn); break;
      case 1: this._point = 2; this._x1 = xn; this._y1 = yn; break;
      case 2: this._point = 3;
        catmullRomPoint(this._context, this._x0, this._y0, this._x1, this._y1, this._x2, this._y2, xn, yn, this._alpha); break;
      default:
        catmullRomPoint(this._context, this._x0, this._y0, this._x1, this._y1, this._x2, this._y2, xn, yn, this._alpha); break;
    }
    this._x0 = this._x1; this._x1 = this._x2; this._x2 = xn;
    this._y0 = this._y1; this._y1 = this._y2; this._y2 = yn;
  }
}

// --- line generator (DPAGM) ---
function dpagmLine(curveFactory) {
  const _x = (d) => d[0], _y = (d) => d[1];
  const _defined = () => true;
  return function generate(data) {
    const n = data.length;
    let defined0 = false;
    const buffer = new Path();
    const output = curveFactory(buffer);
    for (let i = 0; i <= n; ++i) {
      const d = i < n ? data[i] : undefined;
      if (!(i < n && _defined(d, i, data)) !== !defined0) {
        defined0 = !defined0;
        if (defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+_x(d, i, data), +_y(d, i, data));
    }
    const result = buffer.toString();
    return result || null;
  };
}

const testPoints = [[0, 0],[10, 10],[20, 5],[30, 15],[40, 0],[50, 10],[60, 5]];

function compare(name, d3Curve, dpagmCurve) {
  const d3Out = line().curve(d3Curve)(testPoints);
  const dpagmOut = dpagmLine(dpagmCurve)(testPoints);

  // Parse to compare numerically
  function parsePath(p) {
    if (!p) return [];
    const nums = p.match(/-?\d+\.?\d*/g);
    return nums ? nums.map(Number) : [];
  }

  const d3Nums = parsePath(d3Out);
  const dpNums = parsePath(dpagmOut);

  let maxDiff = 0;
  const minLen = Math.min(d3Nums.length, dpNums.length);
  for (let i = 0; i < minLen; i++) {
    const diff = Math.abs(d3Nums[i] - dpNums[i]);
    if (diff > maxDiff) maxDiff = diff;
  }

  const match = d3Out === dpagmOut;
  const lenMatch = d3Nums.length === dpNums.length;
  console.log(`\n=== ${name} ===`);
  console.log(`String match: ${match ? 'YES' : 'NO'}`);
  console.log(`Length match: ${lenMatch ? 'YES' : 'NO'} (d3:${d3Nums.length} dpagm:${dpNums.length})`);
  console.log(`Max diff: ${maxDiff.toExponential(2)}`);
  if (!match) {
    console.log(`d3:    ${d3Out}`);
    console.log(`dpagm: ${dpagmOut}`);
  }
}

compare("curveLinear", curveLinear, (ctx) => new Linear(ctx));
compare("curveBasis", curveBasis, (ctx) => new Basis(ctx));
compare("curveBasisClosed", curveBasisClosed, (ctx) => new BasisClosed(ctx));
compare("curveNatural", curveNatural, (ctx) => new Natural(ctx));
compare("curveCatmullRom (alpha=0.5)", curveCatmullRom.alpha(0.5), (ctx) => new CatmullRom(ctx, 0.5));
