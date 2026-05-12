/**
 * Line and polygon clipping algorithms.
 * Self-developed TypeScript implementation.
 *
 * clipPolyline: Cohen-Sutherland line clipping for polylines.
 * clipPolygon: Sutherland-Hodgman polygon clipping.
 */

type Point = [number, number];
type BBox = [number, number, number, number]; // [minX, minY, maxX, maxY]

function bitCode(p: Point, bbox: BBox): number {
  let code = 0;
  if (p[0] < bbox[0]) code |= 1;
  else if (p[0] > bbox[2]) code |= 2;
  if (p[1] < bbox[1]) code |= 4;
  else if (p[1] > bbox[3]) code |= 8;
  return code;
}

function intersect(a: Point, b: Point, edge: number, bbox: BBox): Point {
  if (edge & 8)
    return [a[0] + ((b[0] - a[0]) * (bbox[3] - a[1])) / (b[1] - a[1]), bbox[3]];
  if (edge & 4)
    return [a[0] + ((b[0] - a[0]) * (bbox[1] - a[1])) / (b[1] - a[1]), bbox[1]];
  if (edge & 2)
    return [bbox[2], a[1] + ((b[1] - a[1]) * (bbox[2] - a[0])) / (b[0] - a[0])];
  return [bbox[0], a[1] + ((b[1] - a[1]) * (bbox[0] - a[0])) / (b[0] - a[0])];
}

export function clipPolyline(
  points: Point[],
  bbox: BBox,
  result?: Point[][],
): Point[][] {
  const len = points.length;
  let codeA = bitCode(points[0], bbox);
  let part: Point[] = [];
  const out = result ?? [];

  for (let i = 1; i < len; i++) {
    let a: Point = points[i - 1];
    let b: Point = points[i];
    let codeB: number = bitCode(b, bbox);
    const lastCode = codeB;

    for (;;) {
      if (!(codeA | codeB)) {
        part.push(a);
        if (codeB !== lastCode) {
          part.push(b);
          if (i < len - 1) {
            out.push(part);
            part = [];
          }
        } else if (i === len - 1) {
          part.push(b);
        }
        break;
      }
      if (codeA & codeB) break;
      if (codeA) {
        a = intersect(a, b, codeA, bbox);
        codeA = bitCode(a, bbox);
      } else {
        b = intersect(a, b, codeB, bbox);
        codeB = bitCode(b, bbox);
      }
    }

    codeA = lastCode;
  }

  if (part.length) out.push(part);
  return out;
}

export function clipPolygon(points: Point[], bbox: BBox): Point[] {
  let result: Point[] = [];
  let current = points;

  for (let edge = 1; edge <= 8; edge *= 2) {
    result = [];
    let prev = current[current.length - 1];
    let prevInside = !(bitCode(prev, bbox) & edge);

    for (let i = 0; i < current.length; i++) {
      const p = current[i];
      const inside = !(bitCode(p, bbox) & edge);

      if (inside !== prevInside) result.push(intersect(prev, p, edge, bbox));
      if (inside) result.push(p);

      prev = p;
      prevInside = inside;
    }

    current = result;
    if (!current.length) break;
  }

  return result;
}
