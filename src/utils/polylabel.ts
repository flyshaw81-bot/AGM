/**
 * Polylabel — finds the pole of inaccessibility of a polygon.
 * Self-developed TypeScript implementation of the iterative grid algorithm.
 */

type Point = [number, number];
type Ring = Point[];
type Polygon = Ring[];
type PolylabelResult = Point & { distance: number };

class Cell {
  readonly d: number;
  readonly max: number;

  constructor(
    readonly x: number,
    readonly y: number,
    readonly h: number,
    polygon: Polygon,
  ) {
    this.d = pointToPolygonDist(x, y, polygon);
    this.max = this.d + this.h * Math.SQRT2;
  }
}

function pointToPolygonDist(x: number, y: number, polygon: Polygon): number {
  let inside = false;
  let minDistSq = Infinity;

  for (const ring of polygon) {
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
      const a = ring[i];
      const b = ring[j];

      if (
        a[1] > y !== b[1] > y &&
        x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
      )
        inside = !inside;

      minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
    }
  }

  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

function getSegDistSq(px: number, py: number, a: Point, b: Point): number {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = px - x;
  dy = py - y;
  return dx * dx + dy * dy;
}

function getCentroidCell(polygon: Polygon): Cell {
  let area = 0;
  let x = 0;
  let y = 0;
  const points = polygon[0];

  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    const a = points[i];
    const b = points[j];
    const f = a[0] * b[1] - b[0] * a[1];
    x += (a[0] + b[0]) * f;
    y += (a[1] + b[1]) * f;
    area += f * 3;
  }

  const centroid = new Cell(x / area, y / area, 0, polygon);
  if (area === 0 || centroid.d < 0)
    return new Cell(points[0][0], points[0][1], 0, polygon);
  return centroid;
}

/** Simple binary heap priority queue */
class PriorityQueue {
  private data: Cell[] = [];

  push(cell: Cell) {
    this.data.push(cell);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): Cell {
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  get length() {
    return this.data.length;
  }

  private bubbleUp(pos: number) {
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      if (this.data[pos].max <= this.data[parent].max) break;
      [this.data[pos], this.data[parent]] = [this.data[parent], this.data[pos]];
      pos = parent;
    }
  }

  private sinkDown(pos: number) {
    const len = this.data.length;
    for (;;) {
      let best = pos;
      const left = 2 * pos + 1;
      const right = 2 * pos + 2;
      if (left < len && this.data[left].max > this.data[best].max) best = left;
      if (right < len && this.data[right].max > this.data[best].max)
        best = right;
      if (best === pos) break;
      [this.data[pos], this.data[best]] = [this.data[best], this.data[pos]];
      pos = best;
    }
  }
}

export default function polylabel(
  polygon: Polygon,
  precision = 1.0,
): PolylabelResult {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of polygon[0]) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cellSize = Math.max(precision, Math.min(width, height));

  if (cellSize === precision) {
    const result = [minX, minY] as PolylabelResult;
    result.distance = 0;
    return result;
  }

  const cellQueue = new PriorityQueue();
  let bestCell = getCentroidCell(polygon);

  const bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
  if (bboxCell.d > bestCell.d) bestCell = bboxCell;

  function potentiallyQueue(x: number, y: number, h: number) {
    const cell = new Cell(x, y, h, polygon);
    if (cell.max > bestCell.d + precision) cellQueue.push(cell);
    if (cell.d > bestCell.d) bestCell = cell;
  }

  let h = cellSize / 2;
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      potentiallyQueue(x + h, y + h, h);
    }
  }

  while (cellQueue.length) {
    const cell = cellQueue.pop();
    if (cell.max - bestCell.d <= precision) break;

    h = cell.h / 2;
    potentiallyQueue(cell.x - h, cell.y - h, h);
    potentiallyQueue(cell.x + h, cell.y - h, h);
    potentiallyQueue(cell.x - h, cell.y + h, h);
    potentiallyQueue(cell.x + h, cell.y + h, h);
  }

  const result = [bestCell.x, bestCell.y] as PolylabelResult;
  result.distance = bestCell.d;
  return result;
}
