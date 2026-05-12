/**
 * Simplify — high-performance polyline simplification.
 * Self-developed TypeScript implementation using Ramer-Douglas-Peucker + radial distance.
 */

type Point = [number, number];

function getSqDist(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}

function getSqSegDist(p: Point, a: Point, b: Point): number {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplifyRadialDist(points: Point[], sqTolerance: number): Point[] {
  let prevPoint = points[0];
  const newPoints = [prevPoint];
  let point: Point = prevPoint;

  for (let i = 1; i < points.length; i++) {
    point = points[i];
    if (!point) continue;

    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) newPoints.push(point);
  return newPoints;
}

function simplifyDPStep(
  points: Point[],
  first: number,
  last: number,
  sqTolerance: number,
  simplified: Point[],
): void {
  let maxSqDist = sqTolerance;
  let index = first;

  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index - first > 1)
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1)
      simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

function simplifyDouglasPeucker(points: Point[], sqTolerance: number): Point[] {
  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}

export function simplify(
  points: Point[],
  tolerance: number,
  highestQuality = false,
): Point[] {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance * tolerance;
  const filtered = highestQuality
    ? points
    : simplifyRadialDist(points, sqTolerance);
  return simplifyDouglasPeucker(filtered, sqTolerance);
}
