/**
 * Self-developed Delaunay triangulation implementation.
 * Replacement for the delaunator npm package.
 *
 * Algorithm: incremental sweep-hull Delaunay triangulation.
 * Uses robust geometric predicates for numerical correctness.
 *
 * Based on the mathematical algorithms described in:
 * - Shewchuk, J.R. "Adaptive Precision Floating-Point Arithmetic
 *   and Fast Robust Geometric Predicates" (1997)
 * - The sweep-hull approach for incremental Delaunay triangulation
 */

// ─── Robust predicates ───────────────────────────────────────────────

const EPSILON = 1.1102230246251565e-16;
const SPLITTER = 134217729;
const RESULTERRBOUND = (3 + 8 * EPSILON) * EPSILON;
const CCWERRBBOUND_A = (3 + 16 * EPSILON) * EPSILON;
const CCWERRBBOUND_B = (2 + 12 * EPSILON) * EPSILON;
const CCWERRBBOUND_C = (9 + 64 * EPSILON) * EPSILON * EPSILON;

const B_VEC = new Float64Array(4);
const C1_VEC = new Float64Array(8);
const C2_VEC = new Float64Array(12);
const D_VEC = new Float64Array(16);
const U_VEC = new Float64Array(4);

function estimate(elen: number, e: Float64Array): number {
  let Q = e[0];
  for (let i = 1; i < elen; i++) Q += e[i];
  return Q;
}

function expansionSum(
  elen: number,
  e: Float64Array,
  flen: number,
  f: Float64Array,
  h: Float64Array,
): number {
  let Q: number;
  let Qnew: number;
  let hh: number;
  let bvirt: number;
  let enow = e[0];
  let fnow = f[0];
  let eindex = 0;
  let findex = 0;
  if (fnow > enow === fnow > -enow) {
    Q = enow;
    enow = e[++eindex];
  } else {
    Q = fnow;
    fnow = f[++findex];
  }
  let hindex = 0;
  if (eindex < elen && findex < flen) {
    if (fnow > enow === fnow > -enow) {
      Qnew = enow + Q;
      hh = Q - (Qnew - enow);
      enow = e[++eindex];
    } else {
      Qnew = fnow + Q;
      hh = Q - (Qnew - fnow);
      fnow = f[++findex];
    }
    Q = Qnew;
    if (hh !== 0) h[hindex++] = hh;
    while (eindex < elen && findex < flen) {
      if (fnow > enow === fnow > -enow) {
        Qnew = Q + enow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (enow - bvirt);
        enow = e[++eindex];
      } else {
        Qnew = Q + fnow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (fnow - bvirt);
        fnow = f[++findex];
      }
      Q = Qnew;
      if (hh !== 0) h[hindex++] = hh;
    }
  }
  while (eindex < elen) {
    Qnew = Q + enow;
    bvirt = Qnew - Q;
    hh = Q - (Qnew - bvirt) + (enow - bvirt);
    enow = e[++eindex];
    Q = Qnew;
    if (hh !== 0) h[hindex++] = hh;
  }
  while (findex < flen) {
    Qnew = Q + fnow;
    bvirt = Qnew - Q;
    hh = Q - (Qnew - bvirt) + (fnow - bvirt);
    fnow = f[++findex];
    Q = Qnew;
    if (hh !== 0) h[hindex++] = hh;
  }
  if (Q !== 0 || hindex === 0) h[hindex++] = Q;
  return hindex;
}

function orient2dAdapt(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  detsum: number,
): number {
  let bvirt: number;
  let c: number;
  let ahi: number;
  let alo: number;
  let bhi: number;
  let blo: number;
  let _i: number;
  let _j: number;
  let _0: number;
  let s1: number;
  let s0: number;
  let t1: number;
  let t0: number;
  let u3: number;

  const acx = ax - cx;
  const bcx = bx - cx;
  const acy = ay - cy;
  const bcy = by - cy;

  s1 = acx * bcy;
  c = SPLITTER * acx;
  ahi = c - (c - acx);
  alo = acx - ahi;
  c = SPLITTER * bcy;
  bhi = c - (c - bcy);
  blo = bcy - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acy * bcx;
  c = SPLITTER * acy;
  ahi = c - (c - acy);
  alo = acy - ahi;
  c = SPLITTER * bcx;
  bhi = c - (c - bcx);
  blo = bcx - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  B_VEC[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  B_VEC[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  B_VEC[2] = _j - (u3 - bvirt) + (_i - bvirt);
  B_VEC[3] = u3;

  let det = estimate(4, B_VEC);
  let errbound = CCWERRBBOUND_B * detsum;
  if (det >= errbound || -det >= errbound) return det;

  bvirt = ax - acx;
  const acxtail = ax - (acx + bvirt) + (bvirt - cx);
  bvirt = bx - bcx;
  const bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
  bvirt = ay - acy;
  const acytail = ay - (acy + bvirt) + (bvirt - cy);
  bvirt = by - bcy;
  const bcytail = by - (bcy + bvirt) + (bvirt - cy);

  if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
    return det;
  }

  errbound = CCWERRBBOUND_C * detsum + RESULTERRBOUND * Math.abs(det);
  det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
  if (det >= errbound || -det >= errbound) return det;

  s1 = acxtail * bcy;
  c = SPLITTER * acxtail;
  ahi = c - (c - acxtail);
  alo = acxtail - ahi;
  c = SPLITTER * bcy;
  bhi = c - (c - bcy);
  blo = bcy - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acytail * bcx;
  c = SPLITTER * acytail;
  ahi = c - (c - acytail);
  alo = acytail - ahi;
  c = SPLITTER * bcx;
  bhi = c - (c - bcx);
  blo = bcx - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  U_VEC[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  U_VEC[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  U_VEC[2] = _j - (u3 - bvirt) + (_i - bvirt);
  U_VEC[3] = u3;
  const C1len = expansionSum(4, B_VEC, 4, U_VEC, C1_VEC);

  s1 = acx * bcytail;
  c = SPLITTER * acx;
  ahi = c - (c - acx);
  alo = acx - ahi;
  c = SPLITTER * bcytail;
  bhi = c - (c - bcytail);
  blo = bcytail - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acy * bcxtail;
  c = SPLITTER * acy;
  ahi = c - (c - acy);
  alo = acy - ahi;
  c = SPLITTER * bcxtail;
  bhi = c - (c - bcxtail);
  blo = bcxtail - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  U_VEC[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  U_VEC[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  U_VEC[2] = _j - (u3 - bvirt) + (_i - bvirt);
  U_VEC[3] = u3;
  const C2len = expansionSum(C1len, C1_VEC, 4, U_VEC, C2_VEC);

  s1 = acxtail * bcytail;
  c = SPLITTER * acxtail;
  ahi = c - (c - acxtail);
  alo = acxtail - ahi;
  c = SPLITTER * bcytail;
  bhi = c - (c - bcytail);
  blo = bcytail - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acytail * bcxtail;
  c = SPLITTER * acytail;
  ahi = c - (c - acytail);
  alo = acytail - ahi;
  c = SPLITTER * bcxtail;
  bhi = c - (c - bcxtail);
  blo = bcxtail - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  U_VEC[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  U_VEC[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  U_VEC[2] = _j - (u3 - bvirt) + (_i - bvirt);
  U_VEC[3] = u3;
  const Dlen = expansionSum(C2len, C2_VEC, 4, U_VEC, D_VEC);

  return D_VEC[Dlen - 1];
}

function orient2d(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const detleft = (ay - cy) * (bx - cx);
  const detright = (ax - cx) * (by - cy);
  const det = detleft - detright;

  const detsum = Math.abs(detleft + detright);
  if (Math.abs(det) >= CCWERRBBOUND_A * detsum) return det;

  return -orient2dAdapt(ax, ay, bx, by, cx, cy, detsum);
}

// ─── Geometric helpers ───────────────────────────────────────────────

const FP_EPSILON = 2 ** -52;
const EDGE_STACK = new Uint32Array(512);

function pseudoAngle(dx: number, dy: number): number {
  const p = dx / (Math.abs(dx) + Math.abs(dy));
  return (dy > 0 ? 3 - p : 1 + p) / 4;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function inCircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  px: number,
  py: number,
): boolean {
  const dx = ax - px;
  const dy = ay - py;
  const ex = bx - px;
  const ey = by - py;
  const fx = cx - px;
  const fy = cy - py;

  const ap = dx * dx + dy * dy;
  const bp = ex * ex + ey * ey;
  const cp = fx * fx + fy * fy;

  return (
    dx * (ey * cp - bp * fy) -
      dy * (ex * cp - bp * fx) +
      ap * (ex * fy - ey * fx) <
    0
  );
}

function circumradius(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;

  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);

  const x = (ey * bl - dy * cl) * d;
  const y = (dx * cl - ex * bl) * d;

  return x * x + y * y;
}

function circumcenter(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;

  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);

  return {
    x: ax + (ey * bl - dy * cl) * d,
    y: ay + (dx * cl - ex * bl) * d,
  };
}

function quicksort(
  ids: Uint32Array,
  dists: Float64Array,
  left: number,
  right: number,
): void {
  if (right - left <= 20) {
    for (let i = left + 1; i <= right; i++) {
      const temp = ids[i];
      const tempDist = dists[temp];
      let j = i - 1;
      while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
      ids[j + 1] = temp;
    }
  } else {
    const median = (left + right) >> 1;
    let i = left + 1;
    let j = right;
    swap(ids, median, i);
    if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
    if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
    if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

    const temp = ids[i];
    const tempDist = dists[temp];
    for (;;) {
      do i++;
      while (dists[ids[i]] < tempDist);
      do j--;
      while (dists[ids[j]] > tempDist);
      if (j < i) break;
      swap(ids, i, j);
    }
    ids[left + 1] = ids[j];
    ids[j] = temp;

    if (right - i + 1 >= j - left) {
      quicksort(ids, dists, i, right);
      quicksort(ids, dists, left, j - 1);
    } else {
      quicksort(ids, dists, left, j - 1);
      quicksort(ids, dists, i, right);
    }
  }
}

function swap(arr: Uint32Array, i: number, j: number): void {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

// ─── Delaunator class ────────────────────────────────────────────────

export default class Delaunator<_T = Float64Array> {
  coords: Float64Array;
  triangles!: Uint32Array;
  halfedges!: Int32Array;
  hull!: Uint32Array;

  trianglesLen = 0;

  private _triangles: Uint32Array;
  private _halfedges: Int32Array;
  private _hashSize: number;
  private _hullPrev: Uint32Array;
  private _hullNext: Uint32Array;
  private _hullTri: Uint32Array;
  private _hullHash: Int32Array;
  private _hullStart = 0;
  private _ids: Uint32Array;
  private _dists: Float64Array;
  private _cx = 0;
  private _cy = 0;

  static from(
    points: ArrayLike<{ [key: number]: number }>,
    getX: (p: { [key: number]: number }) => number = (p) => p[0],
    getY: (p: { [key: number]: number }) => number = (p) => p[1],
  ): Delaunator {
    const n = points.length;
    const coords = new Float64Array(n * 2);

    for (let i = 0; i < n; i++) {
      const p = points[i];
      coords[2 * i] = getX(p);
      coords[2 * i + 1] = getY(p);
    }

    return new Delaunator(coords);
  }

  constructor(coords: Float64Array) {
    const n = coords.length >> 1;
    if (n > 0 && typeof coords[0] !== "number")
      throw new Error("Expected coords to contain numbers.");

    this.coords = coords;

    const maxTriangles = Math.max(2 * n - 5, 0);
    this._triangles = new Uint32Array(maxTriangles * 3);
    this._halfedges = new Int32Array(maxTriangles * 3);

    this._hashSize = Math.ceil(Math.sqrt(n));
    this._hullPrev = new Uint32Array(n);
    this._hullNext = new Uint32Array(n);
    this._hullTri = new Uint32Array(n);
    this._hullHash = new Int32Array(this._hashSize);

    this._ids = new Uint32Array(n);
    this._dists = new Float64Array(n);

    this.update();
  }

  update(): void {
    const {
      coords,
      _hullPrev: hullPrev,
      _hullNext: hullNext,
      _hullTri: hullTri,
      _hullHash: hullHash,
    } = this;
    const n = coords.length >> 1;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < n; i++) {
      const x = coords[2 * i];
      const y = coords[2 * i + 1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      this._ids[i] = i;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    let i0 = 0;
    let i1 = 0;
    let i2 = 0;

    for (let i = 0, minDist = Infinity; i < n; i++) {
      const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
      if (d < minDist) {
        i0 = i;
        minDist = d;
      }
    }
    const i0x = coords[2 * i0];
    const i0y = coords[2 * i0 + 1];

    for (let i = 0, minDist = Infinity; i < n; i++) {
      if (i === i0) continue;
      const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
      if (d < minDist && d > 0) {
        i1 = i;
        minDist = d;
      }
    }
    let i1x = coords[2 * i1];
    let i1y = coords[2 * i1 + 1];

    let minRadius = Infinity;

    for (let i = 0; i < n; i++) {
      if (i === i0 || i === i1) continue;
      const r = circumradius(
        i0x,
        i0y,
        i1x,
        i1y,
        coords[2 * i],
        coords[2 * i + 1],
      );
      if (r < minRadius) {
        i2 = i;
        minRadius = r;
      }
    }
    let i2x = coords[2 * i2];
    let i2y = coords[2 * i2 + 1];

    if (minRadius === Infinity) {
      for (let i = 0; i < n; i++) {
        this._dists[i] =
          coords[2 * i] - coords[0] || coords[2 * i + 1] - coords[1];
      }
      quicksort(this._ids, this._dists, 0, n - 1);
      const hull = new Uint32Array(n);
      let j = 0;
      for (let i = 0, d0 = -Infinity; i < n; i++) {
        const id = this._ids[i];
        const d = this._dists[id];
        if (d > d0) {
          hull[j++] = id;
          d0 = d;
        }
      }
      this.hull = hull.subarray(0, j);
      this.triangles = new Uint32Array(0);
      this.halfedges = new Int32Array(0);
      return;
    }

    if (orient2d(i0x, i0y, i1x, i1y, i2x, i2y) < 0) {
      const i = i1;
      const x = i1x;
      const y = i1y;
      i1 = i2;
      i1x = i2x;
      i1y = i2y;
      i2 = i;
      i2x = x;
      i2y = y;
    }

    const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
    this._cx = center.x;
    this._cy = center.y;

    for (let i = 0; i < n; i++) {
      this._dists[i] = dist(
        coords[2 * i],
        coords[2 * i + 1],
        center.x,
        center.y,
      );
    }

    quicksort(this._ids, this._dists, 0, n - 1);

    this._hullStart = i0;
    let hullSize = 3;

    hullNext[i0] = hullPrev[i2] = i1;
    hullNext[i1] = hullPrev[i0] = i2;
    hullNext[i2] = hullPrev[i1] = i0;

    hullTri[i0] = 0;
    hullTri[i1] = 1;
    hullTri[i2] = 2;

    hullHash.fill(-1);
    hullHash[this._hashKey(i0x, i0y)] = i0;
    hullHash[this._hashKey(i1x, i1y)] = i1;
    hullHash[this._hashKey(i2x, i2y)] = i2;

    this.trianglesLen = 0;
    this._addTriangle(i0, i1, i2, -1, -1, -1);

    let xp = 0;
    let yp = 0;
    for (let k = 0; k < this._ids.length; k++) {
      const i = this._ids[k];
      const x = coords[2 * i];
      const y = coords[2 * i + 1];

      if (
        k > 0 &&
        Math.abs(x - xp) <= FP_EPSILON &&
        Math.abs(y - yp) <= FP_EPSILON
      )
        continue;
      xp = x;
      yp = y;

      if (i === i0 || i === i1 || i === i2) continue;

      let start = 0;
      for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
        start = hullHash[(key + j) % this._hashSize];
        if (start !== -1 && start !== hullNext[start]) break;
      }

      start = hullPrev[start];
      let e = start;
      let q = hullNext[e];
      while (
        orient2d(
          x,
          y,
          coords[2 * e],
          coords[2 * e + 1],
          coords[2 * q],
          coords[2 * q + 1],
        ) >= 0
      ) {
        e = q;
        if (e === start) {
          e = -1;
          break;
        }
        q = hullNext[e];
      }
      if (e === -1) continue;

      let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

      hullTri[i] = this._legalize(t + 2);
      hullTri[e] = t;
      hullSize++;

      let nn = hullNext[e];
      q = hullNext[nn];
      while (
        orient2d(
          x,
          y,
          coords[2 * nn],
          coords[2 * nn + 1],
          coords[2 * q],
          coords[2 * q + 1],
        ) < 0
      ) {
        t = this._addTriangle(nn, i, q, hullTri[i], -1, hullTri[nn]);
        hullTri[i] = this._legalize(t + 2);
        hullNext[nn] = nn;
        hullSize--;
        nn = q;
        q = hullNext[nn];
      }

      if (e === start) {
        q = hullPrev[e];
        while (
          orient2d(
            x,
            y,
            coords[2 * q],
            coords[2 * q + 1],
            coords[2 * e],
            coords[2 * e + 1],
          ) < 0
        ) {
          t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
          this._legalize(t + 2);
          hullTri[q] = t;
          hullNext[e] = e;
          hullSize--;
          e = q;
          q = hullPrev[e];
        }
      }

      this._hullStart = hullPrev[i] = e;
      hullNext[e] = hullPrev[nn] = i;
      hullNext[i] = nn;

      hullHash[this._hashKey(x, y)] = i;
      hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
    }

    this.hull = new Uint32Array(hullSize);
    for (let i = 0, e = this._hullStart; i < hullSize; i++) {
      this.hull[i] = e;
      e = hullNext[e];
    }

    this.triangles = this._triangles.subarray(0, this.trianglesLen);
    this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
  }

  private _hashKey(x: number, y: number): number {
    return (
      Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) %
      this._hashSize
    );
  }

  private _legalize(a: number): number {
    const { _triangles: triangles, _halfedges: halfedges, coords } = this;

    let i = 0;
    let ar = 0;

    for (;;) {
      const b = halfedges[a];

      const a0 = a - (a % 3);
      ar = a0 + ((a + 2) % 3);

      if (b === -1) {
        if (i === 0) break;
        a = EDGE_STACK[--i];
        continue;
      }

      const b0 = b - (b % 3);
      const al = a0 + ((a + 1) % 3);
      const bl = b0 + ((b + 2) % 3);

      const p0 = triangles[ar];
      const pr = triangles[a];
      const pl = triangles[al];
      const p1 = triangles[bl];

      const illegal = inCircle(
        coords[2 * p0],
        coords[2 * p0 + 1],
        coords[2 * pr],
        coords[2 * pr + 1],
        coords[2 * pl],
        coords[2 * pl + 1],
        coords[2 * p1],
        coords[2 * p1 + 1],
      );

      if (illegal) {
        triangles[a] = p1;
        triangles[b] = p0;

        const hbl = halfedges[bl];

        if (hbl === -1) {
          let e = this._hullStart;
          do {
            if (this._hullTri[e] === bl) {
              this._hullTri[e] = a;
              break;
            }
            e = this._hullPrev[e];
          } while (e !== this._hullStart);
        }
        this._link(a, hbl);
        this._link(b, halfedges[ar]);
        this._link(ar, bl);

        const br = b0 + ((b + 1) % 3);

        if (i < EDGE_STACK.length) {
          EDGE_STACK[i++] = br;
        }
      } else {
        if (i === 0) break;
        a = EDGE_STACK[--i];
      }
    }

    return ar;
  }

  private _link(a: number, b: number): void {
    this._halfedges[a] = b;
    if (b !== -1) this._halfedges[b] = a;
  }

  private _addTriangle(
    i0: number,
    i1: number,
    i2: number,
    a: number,
    b: number,
    c: number,
  ): number {
    const t = this.trianglesLen;

    this._triangles[t] = i0;
    this._triangles[t + 1] = i1;
    this._triangles[t + 2] = i2;

    this._link(t, a);
    this._link(t + 1, b);
    this._link(t + 2, c);

    this.trianglesLen += 3;

    return t;
  }
}
