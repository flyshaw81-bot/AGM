/**
 * Self-developed replacements for d3-shape.
 * Pixel-exact implementations of line generator + 7 curve factories.
 *
 * Curve factories: curveLinear, curveStep, curveBasis, curveBasisClosed,
 *                  curveBundle, curveCatmullRom, curveNatural
 *
 * All algorithms match d3-shape's exact mathematical formulas to ensure
 * pixel-level visual consistency.
 */

const epsilon = 1e-12;

// ---------------------------------------------------------------------------
// Path context — minimal SVG path builder (matches d3-path interface subset)
// ---------------------------------------------------------------------------

class Path {
  private _d: string[] = [];
  private _valid = false;

  moveTo(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    if (isNaN(xn) || isNaN(yn)) return;
    this._d.push(`M${xn},${yn}`);
    this._valid = true;
  }

  lineTo(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    if (isNaN(xn) || isNaN(yn)) return;
    this._d.push(`L${xn},${yn}`);
  }

  bezierCurveTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number,
  ): void {
    const cx1 = +cpx1, cy1 = +cpy1;
    const cx2 = +cpx2, cy2 = +cpy2;
    const xe = +x, ye = +y;
    if (isNaN(cx1) || isNaN(cy1) || isNaN(cx2) || isNaN(cy2) || isNaN(xe) || isNaN(ye)) return;
    this._d.push(`C${cx1},${cy1},${cx2},${cy2},${xe},${ye}`);
  }

  closePath(): void {
    this._d.push("Z");
  }

  toString(): string {
    return this._valid ? this._d.join("") : "";
  }
}

// ---------------------------------------------------------------------------
// Curve context interface (subset of CanvasRenderingContext2D / d3-path)
// ---------------------------------------------------------------------------

interface CurveContext {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number,
  ): void;
  closePath(): void;
}

// ---------------------------------------------------------------------------
// CurveGenerator / CurveFactory types (matches d3's interface)
// ---------------------------------------------------------------------------

interface CurveGenerator {
  areaStart(): void;
  areaEnd(): void;
  lineStart(): void;
  lineEnd(): void;
  point(x: number, y: number): void;
}

export type CurveFactory = (context: CurveContext) => CurveGenerator;

// ---------------------------------------------------------------------------
// curveLinear
// ---------------------------------------------------------------------------

class Linear implements CurveGenerator {
  private _context: CurveContext;
  private _point = 0;
  private _line = NaN;

  constructor(context: CurveContext) {
    this._context = context;
  }

  areaStart(): void {
    this._line = 0;
  }
  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._point = 0;
  }

  lineEnd(): void {
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    this._line = 1 - this._line;
  }

  point(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        if (this._line) this._context.lineTo(xn, yn);
        else this._context.moveTo(xn, yn);
        break;
      case 1:
        this._point = 2;
        this._context.lineTo(xn, yn);
        break;
      default:
        this._context.lineTo(xn, yn);
        break;
    }
  }
}

export const curveLinear: CurveFactory = (context: CurveContext) =>
  new Linear(context);

// ---------------------------------------------------------------------------
// curveStep
// ---------------------------------------------------------------------------

class Step implements CurveGenerator {
  private _context: CurveContext;
  private _t: number;
  private _point = 0;
  private _line = NaN;
  private _x = 0;
  private _y = 0;

  constructor(context: CurveContext, t: number) {
    this._context = context;
    this._t = t;
  }

  areaStart(): void {
    this._line = 0;
  }
  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._point = 0;
  }

  lineEnd(): void {
    if (0 < this._t && this._t < 1 && this._point === 2)
      this._context.lineTo(this._x, this._y);
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    if (this._line >= 0) {
      this._t = 1 - this._t;
      this._line = 1 - this._line;
    }
  }

  point(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        if (this._line) this._context.lineTo(xn, yn);
        else this._context.moveTo(xn, yn);
        break;
      case 1:
        this._point = 2;
        if (this._t <= 0) {
          this._context.lineTo(this._x, yn);
          this._context.lineTo(xn, yn);
        } else {
          const x1a = this._x * (1 - this._t) + xn * this._t;
          this._context.lineTo(x1a, this._y);
          this._context.lineTo(x1a, yn);
        }
        break;
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, yn);
          this._context.lineTo(xn, yn);
        } else {
          const x1 = this._x * (1 - this._t) + xn * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, yn);
        }
        break;
      }
    }
    this._x = xn;
    this._y = yn;
  }
}

export const curveStep: CurveFactory = (context: CurveContext) =>
  new Step(context, 0.5);

// ---------------------------------------------------------------------------
// curveBasis — uniform cubic B-spline
// ---------------------------------------------------------------------------

/** Shared B-spline Bezier emit used by Basis, BasisClosed, and Bundle */
function basisPoint(
  ctx: CurveContext,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x: number,
  y: number,
): void {
  ctx.bezierCurveTo(
    (2 * x0 + x1) / 3,
    (2 * y0 + y1) / 3,
    (x0 + 2 * x1) / 3,
    (y0 + 2 * y1) / 3,
    (x0 + 4 * x1 + x) / 6,
    (y0 + 4 * y1 + y) / 6,
  );
}

class Basis implements CurveGenerator {
  protected _context: CurveContext;
  protected _point = 0;
  protected _line = NaN;
  protected _x0 = 0;
  protected _x1 = 0;
  protected _y0 = 0;
  protected _y1 = 0;

  constructor(context: CurveContext) {
    this._context = context;
  }

  areaStart(): void {
    this._line = 0;
  }
  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  }

  lineEnd(): void {
    switch (this._point) {
      case 3:
        basisPoint(
          this._context,
          this._x0,
          this._y0,
          this._x1,
          this._y1,
          this._x1,
          this._y1,
        );
        this._context.lineTo(this._x1, this._y1);
        break;
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    this._line = 1 - this._line;
  }

  point(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        if (this._line) this._context.lineTo(xn, yn);
        else this._context.moveTo(xn, yn);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._context.lineTo(
          (5 * this._x0 + this._x1) / 6,
          (5 * this._y0 + this._y1) / 6,
        );
        basisPoint(
          this._context,
          this._x0,
          this._y0,
          this._x1,
          this._y1,
          xn,
          yn,
        );
        break;
      default:
        basisPoint(
          this._context,
          this._x0,
          this._y0,
          this._x1,
          this._y1,
          xn,
          yn,
        );
        break;
    }
    this._x0 = this._x1;
    this._x1 = xn;
    this._y0 = this._y1;
    this._y1 = yn;
  }
}

export const curveBasis: CurveFactory = (context: CurveContext) =>
  new Basis(context);

// ---------------------------------------------------------------------------
// curveBasisClosed — closed uniform cubic B-spline
// ---------------------------------------------------------------------------

class BasisClosed implements CurveGenerator {
  private _context: CurveContext;
  private _point = 0;
  private _x0 = 0;
  private _y0 = 0;
  private _x1 = 0;
  private _y1 = 0;
  private _x2 = 0;
  private _y2 = 0;
  private _x3 = 0;
  private _y3 = 0;
  private _x4 = 0;
  private _y4 = 0;

  constructor(context: CurveContext) {
    this._context = context;
  }

  areaStart(): void {
    // noop — closed curves don't have area start/end
  }
  areaEnd(): void {
    // noop
  }

  lineStart(): void {
    this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
        NaN;
    this._point = 0;
  }

  lineEnd(): void {
    switch (this._point) {
      case 1:
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      case 2:
        this._context.moveTo(
          (this._x2 + 2 * this._x3) / 3,
          (this._y2 + 2 * this._y3) / 3,
        );
        this._context.lineTo(
          (this._x3 + 2 * this._x2) / 3,
          (this._y3 + 2 * this._y2) / 3,
        );
        this._context.closePath();
        break;
      case 3:
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
    }
  }

  point(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x2 = xn;
        this._y2 = yn;
        break;
      case 1:
        this._point = 2;
        this._x3 = xn;
        this._y3 = yn;
        break;
      case 2:
        this._point = 3;
        this._x4 = xn;
        this._y4 = yn;
        this._context.moveTo(
          (this._x0 + 4 * this._x1 + xn) / 6,
          (this._y0 + 4 * this._y1 + yn) / 6,
        );
        break;
      default:
        basisPoint(
          this._context,
          this._x0,
          this._y0,
          this._x1,
          this._y1,
          xn,
          yn,
        );
        break;
    }
    this._x0 = this._x1;
    this._x1 = xn;
    this._y0 = this._y1;
    this._y1 = yn;
  }
}

export const curveBasisClosed: CurveFactory = (context: CurveContext) =>
  new BasisClosed(context);

// ---------------------------------------------------------------------------
// curveBundle — basis spline blended with straight line via beta parameter
// ---------------------------------------------------------------------------

class Bundle implements CurveGenerator {
  private _basis: Basis;
  private _beta: number;
  private _x: number[] = [];
  private _y: number[] = [];

  constructor(context: CurveContext, beta: number) {
    this._basis = new Basis(context);
    this._beta = beta;
  }

  lineStart(): void {
    this._x = [];
    this._y = [];
    this._basis.lineStart();
  }

  lineEnd(): void {
    const x = this._x;
    const y = this._y;
    const j = x.length - 1;

    if (j > 0) {
      const x0 = x[0];
      const y0 = y[0];
      const dx = x[j] - x0;
      const dy = y[j] - y0;

      for (let i = 0; i <= j; ++i) {
        const t = j > 0 ? i / j : 0;
        this._basis.point(
          this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
          this._beta * y[i] + (1 - this._beta) * (y0 + t * dy),
        );
      }
    }

    this._x = [];
    this._y = [];
    this._basis.lineEnd();
  }

  point(x: number, y: number): void {
    this._x.push(+x);
    this._y.push(+y);
  }

  areaStart(): void {
    // noop — bundle doesn't support area
  }
  areaEnd(): void {
    // noop
  }
}

interface CurveBundleFactory extends CurveFactory {
  beta(beta: number): CurveBundleFactory;
}

export const curveBundle: CurveBundleFactory = Object.assign(
  ((context: CurveContext) => new Bundle(context, 0.85)) as CurveFactory,
  {
    beta(beta: number): CurveBundleFactory {
      return Object.assign(
        ((context: CurveContext) => new Bundle(context, +beta)) as CurveFactory,
        { beta: curveBundle.beta },
      );
    },
  },
);

// ---------------------------------------------------------------------------
// curveCatmullRom — centripetal Catmull-Rom spline
// ---------------------------------------------------------------------------

// Cardinal spline (used when alpha === 0)
class Cardinal implements CurveGenerator {
  _context: CurveContext;
  _k: number;
  private _point = 0;
  private _line = NaN;
  _x0 = 0;
  _x1 = 0;
  _x2 = 0;
  _y0 = 0;
  _y1 = 0;
  _y2 = 0;

  constructor(context: CurveContext, tension: number) {
    this._context = context;
    this._k = (1 - tension) / 6;
  }

  areaStart(): void {
    this._line = 0;
  }
  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  }

  lineEnd(): void {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        cardinalPoint(this, this._x2, this._y2);
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    this._line = 1 - this._line;
  }

  point(x: number, y: number): void {
    const xn = +x;
    const yn = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        if (this._line) this._context.lineTo(xn, yn);
        else this._context.moveTo(xn, yn);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        cardinalPoint(this, xn, yn);
        break;
      default:
        cardinalPoint(this, xn, yn);
        break;
    }
    this._x0 = this._x1;
    this._x1 = this._x2;
    this._x2 = xn;
    this._y0 = this._y1;
    this._y1 = this._y2;
    this._y2 = yn;
  }
}

function cardinalPoint(that: Cardinal, x: number, y: number): void {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x),
    that._y2 + that._k * (that._y1 - y),
    that._x2,
    that._y2,
  );
}

// CatmullRom with alpha > 0 (non-uniform parameterization)
class CatmullRom implements CurveGenerator {
  private _context: CurveContext;
  private _alpha: number;
  private _point = 0;
  private _line = NaN;
  private _x0 = 0;
  private _x1 = 0;
  private _x2 = 0;
  private _y0 = 0;
  private _y1 = 0;
  private _y2 = 0;
  private _l01_a = 0;
  private _l12_a = 0;
  private _l23_a = 0;
  private _l01_2a = 0;
  private _l12_2a = 0;
  private _l23_2a = 0;

  constructor(context: CurveContext, alpha: number) {
    this._context = context;
    this._alpha = alpha;
  }

  areaStart(): void {
    this._line = 0;
  }
  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a =
      this._l12_a =
      this._l23_a =
      this._l01_2a =
      this._l12_2a =
      this._l23_2a =
        0;
    this._point = 0;
  }

  lineEnd(): void {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this._emitPoint(this._x2, this._y2);
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    this._line = 1 - this._line;
  }

  point(x: number, y: number): void {
    const xn = +x;
    const yn = +y;

    if (this._point) {
      const x23 = this._x2 - xn;
      const y23 = this._y2 - yn;
      this._l23_2a = (x23 * x23 + y23 * y23) ** this._alpha;
      this._l23_a = Math.sqrt(this._l23_2a);
    }

    switch (this._point) {
      case 0:
        this._point = 1;
        if (this._line) this._context.lineTo(xn, yn);
        else this._context.moveTo(xn, yn);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._emitPoint(xn, yn);
        break;
      default:
        this._emitPoint(xn, yn);
        break;
    }

    this._l01_a = this._l12_a;
    this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a;
    this._l12_2a = this._l23_2a;
    this._x0 = this._x1;
    this._x1 = this._x2;
    this._x2 = xn;
    this._y0 = this._y1;
    this._y1 = this._y2;
    this._y2 = yn;
  }

  private _emitPoint(x: number, y: number): void {
    let x1: number;
    let y1: number;
    if (this._l01_a > epsilon) {
      const a = 2 * this._l01_2a + 3 * this._l01_a * this._l12_a + this._l12_2a;
      const n = 3 * this._l01_a * (this._l01_a + this._l12_a);
      x1 =
        (this._x1 * a - this._x0 * this._l12_2a + this._x2 * this._l01_2a) / n;
      y1 =
        (this._y1 * a - this._y0 * this._l12_2a + this._y2 * this._l01_2a) / n;
    } else {
      x1 = this._x1;
      y1 = this._y1;
    }

    let x2: number;
    let y2: number;
    if (this._l23_a > epsilon) {
      const b = 2 * this._l23_2a + 3 * this._l23_a * this._l12_a + this._l12_2a;
      const m = 3 * this._l23_a * (this._l23_a + this._l12_a);
      x2 = (this._x2 * b + this._x1 * this._l23_2a - x * this._l12_2a) / m;
      y2 = (this._y2 * b + this._y1 * this._l23_2a - y * this._l12_2a) / m;
    } else {
      x2 = this._x2;
      y2 = this._y2;
    }

    this._context.bezierCurveTo(x1, y1, x2, y2, this._x2, this._y2);
  }
}

interface CurveCatmullRomFactory extends CurveFactory {
  alpha(alpha: number): CurveCatmullRomFactory;
}

export const curveCatmullRom: CurveCatmullRomFactory = Object.assign(
  ((context: CurveContext) => {
    // default alpha 0.5 — centripetal Catmull-Rom
    return new CatmullRom(context, 0.5);
  }) as CurveFactory,
  {
    alpha(alpha: number): CurveCatmullRomFactory {
      const a = +alpha;
      if (a === 0) {
        // uniform — use Cardinal with tension=0
        return Object.assign(
          ((context: CurveContext) => new Cardinal(context, 0)) as CurveFactory,
          { alpha: curveCatmullRom.alpha },
        );
      }
      return Object.assign(
        ((context: CurveContext) => new CatmullRom(context, a)) as CurveFactory,
        { alpha: curveCatmullRom.alpha },
      );
    },
  },
);

// ---------------------------------------------------------------------------
// curveNatural — natural cubic spline
// ---------------------------------------------------------------------------

function naturalControlPoints(x: number[]): [number[], number[]] {
  const n = x.length - 1;
  if (n < 1) return [[], []];

  const a = new Array<number>(n);
  const b = new Array<number>(n);
  const r = new Array<number>(n);

  // Setup tridiagonal system
  a[0] = 0;
  b[0] = 2;
  r[0] = x[0] + 2 * x[1];

  for (let i = 1; i < n - 1; ++i) {
    a[i] = 1;
    b[i] = 4;
    r[i] = 4 * x[i] + 2 * x[i + 1];
  }

  a[n - 1] = 2;
  b[n - 1] = 7;
  r[n - 1] = 8 * x[n - 1] + x[n];

  // Forward elimination (Thomas algorithm)
  for (let i = 1; i < n; ++i) {
    const m = a[i] / b[i - 1];
    b[i] -= m;
    r[i] -= m * r[i - 1];
  }

  // Back substitution → a[i] becomes the first control point
  a[n - 1] = r[n - 1] / b[n - 1];
  for (let i = n - 2; i >= 0; --i) {
    a[i] = (r[i] - a[i + 1]) / b[i];
  }

  // Compute second control points
  b[n - 1] = (x[n] + a[n - 1]) / 2;
  for (let i = 0; i < n - 1; ++i) {
    b[i] = 2 * x[i + 1] - a[i + 1];
  }

  return [a, b];
}

class Natural implements CurveGenerator {
  private _context: CurveContext;
  private _line = NaN;
  private _x: number[] = [];
  private _y: number[] = [];

  constructor(context: CurveContext) {
    this._context = context;
  }

  areaStart(): void {
    this._line = 0;
  }
  areaEnd(): void {
    this._line = NaN;
  }

  lineStart(): void {
    this._x = [];
    this._y = [];
  }

  lineEnd(): void {
    const x = this._x;
    const y = this._y;
    const n = x.length;

    if (n) {
      if (this._line) this._context.lineTo(x[0], y[0]);
      else this._context.moveTo(x[0], y[0]);

      if (n === 2) {
        this._context.lineTo(x[1], y[1]);
      } else {
        const [px0, px1] = naturalControlPoints(x);
        const [py0, py1] = naturalControlPoints(y);
        for (let i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(
            px0[i0],
            py0[i0],
            px1[i0],
            py1[i0],
            x[i1],
            y[i1],
          );
        }
      }
    }

    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
    this._line = 1 - this._line;
    this._x = [];
    this._y = [];
  }

  point(x: number, y: number): void {
    this._x.push(+x);
    this._y.push(+y);
  }
}

export const curveNatural: CurveFactory = (context: CurveContext) =>
  new Natural(context);

// ---------------------------------------------------------------------------
// line() generator
// ---------------------------------------------------------------------------

type Accessor<T> = (d: T, i: number, data: T[]) => number;
type Defined<T> = (d: T, i: number, data: T[]) => boolean;

export interface LineGenerator<T = [number, number]> {
  (data: Iterable<T>): string | null;
  x(): Accessor<T>;
  x(x: number | Accessor<T>): LineGenerator<T>;
  y(): Accessor<T>;
  y(y: number | Accessor<T>): LineGenerator<T>;
  defined(): Defined<T>;
  defined(defined: boolean | Defined<T>): LineGenerator<T>;
  curve(): CurveFactory;
  curve(curve: CurveFactory): LineGenerator<T>;
}

export function line<T = [number, number]>(): LineGenerator<T> {
  let _x: Accessor<T> = ((d: any) => d[0]) as Accessor<T>;
  let _y: Accessor<T> = ((d: any) => d[1]) as Accessor<T>;
  let _defined: Defined<T> = () => true;
  let _curve: CurveFactory = curveLinear;

  function generate(dataIter: Iterable<T>): string | null {
    const data = Array.from(dataIter);
    const n = data.length;
    let defined0 = false;

    const buffer = new Path();
    const output = _curve(buffer);

    for (let i = 0; i <= n; ++i) {
      const d = i < n ? data[i] : (undefined as any);
      if (!(i < n && _defined(d, i, data)) !== !defined0) {
        defined0 = !defined0;
        if (defined0) {
          output.lineStart();
        } else {
          output.lineEnd();
        }
      }
      if (defined0) {
        output.point(+_x(d, i, data), +_y(d, i, data));
      }
    }

    const result = buffer.toString();
    return result || null;
  }

  generate.x = (v?: number | Accessor<T>): any => {
    if (v === undefined) return _x;
    if (typeof v === "function") {
      _x = v as Accessor<T>;
    } else {
      const c = +v;
      _x = (() => c) as Accessor<T>;
    }
    return generate;
  };

  generate.y = (v?: number | Accessor<T>): any => {
    if (v === undefined) return _y;
    if (typeof v === "function") {
      _y = v as Accessor<T>;
    } else {
      const c = +v;
      _y = (() => c) as Accessor<T>;
    }
    return generate;
  };

  generate.defined = (v?: boolean | Defined<T>): any => {
    if (v === undefined) return _defined;
    if (typeof v === "function") {
      _defined = v as Defined<T>;
    } else {
      const c = Boolean(v);
      _defined = (() => c) as Defined<T>;
    }
    return generate;
  };

  generate.curve = (v?: CurveFactory): any => {
    if (v === undefined) return _curve;
    _curve = v;
    return generate;
  };

  return generate as LineGenerator<T>;
}
