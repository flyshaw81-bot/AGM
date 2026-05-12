/**
 * Compare the EXACT DPAGM CatmullRom implementation against d3-shape's.
 * Using the exact code from shapeUtils.ts.
 */

import { curveCatmullRom as d3CatmullRom, line } from "d3-shape";

const epsilon = 1e-12;

class Path {
  _d = []; _valid = false;
  moveTo(x, y) { const xn=+x,yn=+y; if(isNaN(xn)||isNaN(yn)) return; this._d.push(`M${xn},${yn}`); this._valid=true; }
  lineTo(x, y) { const xn=+x,yn=+y; if(isNaN(xn)||isNaN(yn)) return; this._d.push(`L${xn},${yn}`); }
  bezierCurveTo(cx1,cy1,cx2,cy2,x,y) { const a=+cx1,b=+cy1,c=+cx2,d=+cy2,e=+x,f=+y; if(isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)||isNaN(e)||isNaN(f)) return; this._d.push(`C${a},${b},${c},${d},${e},${f}`); }
  closePath() { this._d.push("Z"); }
  toString() { return this._valid?this._d.join(""):""; }
}

class CatmullRom {
  _context; _alpha; _point=0; _line=NaN;
  _x0=0; _x1=0; _x2=0; _y0=0; _y1=0; _y2=0;
  _l01_a=0; _l12_a=0; _l23_a=0; _l01_2a=0; _l12_2a=0; _l23_2a=0;

  constructor(context, alpha) {
    this._context = context;
    this._alpha = alpha;
  }
  areaStart() { this._line = 0; }
  areaEnd() { this._line = NaN; }

  lineStart() {
    this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN;
    this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=0;
    this._point = 0;
  }

  lineEnd() {
    switch(this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break;
      case 3: this._emitPoint(this._x2, this._y2); break;
    }
    if(this._line||(this._line!==0&&this._point===1)) this._context.closePath();
    this._line = 1 - this._line;
  }

  point(x, y) {
    const xn=+x, yn=+y;
    if(this._point) {
      const x23=this._x2-xn, y23=this._y2-yn;
      this._l23_2a = (x23*x23 + y23*y23) ** this._alpha;
      this._l23_a = Math.sqrt(this._l23_2a);
    }
    switch(this._point) {
      case 0: this._point=1; if(this._line) this._context.lineTo(xn,yn); else this._context.moveTo(xn,yn); break;
      case 1: this._point=2; break;
      case 2: this._point=3; this._emitPoint(xn, yn); break;
      default: this._emitPoint(xn, yn); break;
    }
    this._l01_a=this._l12_a; this._l12_a=this._l23_a;
    this._l01_2a=this._l12_2a; this._l12_2a=this._l23_2a;
    this._x0=this._x1; this._x1=this._x2; this._x2=xn;
    this._y0=this._y1; this._y1=this._y2; this._y2=yn;
  }

  _emitPoint(x, y) {
    let x1, y1, x2, y2;
    if(this._l01_a > epsilon) {
      const a = 2*this._l01_2a + 3*this._l01_a*this._l12_a + this._l12_2a;
      const n = 3*this._l01_a*(this._l01_a + this._l12_a);
      x1 = (this._x1*a - this._x0*this._l12_2a + this._x2*this._l01_2a) / n;
      y1 = (this._y1*a - this._y0*this._l12_2a + this._y2*this._l01_2a) / n;
    } else { x1=this._x1; y1=this._y1; }
    if(this._l23_a > epsilon) {
      const b = 2*this._l23_2a + 3*this._l23_a*this._l12_a + this._l12_2a;
      const m = 3*this._l23_a*(this._l23_a + this._l12_a);
      x2 = (this._x2*b + this._x1*this._l23_2a - x*this._l12_2a) / m;
      y2 = (this._y2*b + this._y1*this._l23_2a - y*this._l12_2a) / m;
    } else { x2=this._x2; y2=this._y2; }
    this._context.bezierCurveTo(x1, y1, x2, y2, this._x2, this._y2);
  }
}

function dpagmLine(alpha) {
  return function(data) {
    const n = data.length;
    let def0 = false;
    const buf = new Path();
    const out = new CatmullRom(buf, alpha);
    for(let i=0;i<=n;++i) {
      const d = i<n ? data[i] : undefined;
      if(!(i<n) !== !def0) { def0=!def0; if(def0)out.lineStart(); else out.lineEnd(); }
      if(def0)out.point(+d[0], +d[1]);
    }
    const res = buf.toString();
    return res||null;
  };
}

const testPoints = [[0,0],[10,10],[20,5],[30,15],[40,0],[50,10],[60,5]];

// Test alpha = 0.5 (default centripetal)
console.log("=== alpha=0.5 ===");
const d3_05 = line().curve(d3CatmullRom.alpha(0.5))(testPoints);
const dp_05 = dpagmLine(0.5)(testPoints);
console.log("d3:", d3_05);
console.log("dpagm:", dp_05);
console.log("Match:", d3_05 === dp_05 ? "YES" : "NO");

function numericDiff(a, b) {
  const na = (a?.match(/-?\d+\.?\d*/g)||[]).map(Number);
  const nb = (b?.match(/-?\d+\.?\d*/g)||[]).map(Number);
  let maxD = 0;
  for(let i=0;i<Math.min(na.length,nb.length);i++) {
    const d = Math.abs(na[i]-nb[i]);
    if(d>maxD) maxD=d;
  }
  console.log(`Length d3:${na.length} dpagm:${nb.length} Max diff: ${maxD}`);
}

numericDiff(d3_05, dp_05);

// Test alpha = 0.1 (used by river generator)
console.log("\n=== alpha=0.1 ===");
const d3_01 = line().curve(d3CatmullRom.alpha(0.1))(testPoints);
const dp_01 = dpagmLine(0.1)(testPoints);
console.log("d3:", d3_01);
console.log("dpagm:", dp_01);
numericDiff(d3_01, dp_01);

// Test alpha = 0 (uniform, should use Cardinal)
console.log("\n=== alpha=0 ===");
const d3_0 = line().curve(d3CatmullRom.alpha(0))(testPoints);
const dp_0 = dpagmLine(0)(testPoints);
console.log("d3:", d3_0);
console.log("dpagm:", dp_0);
numericDiff(d3_0, dp_0);
