/**
 * Polygon area and containment utilities.
 * Self-developed replacements for d3-polygon functions.
 */

/**
 * Returns the signed area of a polygon using the Shoelace formula.
 * Positive for counter-clockwise, negative for clockwise vertex order.
 */
export function polygonArea(polygon: [number, number][]): number {
  const n = polygon.length;
  let area = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += polygon[j][0] * polygon[i][1] - polygon[i][0] * polygon[j][1];
  }
  return area / 2;
}

/**
 * Tests whether a point is inside a polygon using the ray-casting algorithm.
 */
export function polygonContains(
  polygon: [number, number][],
  point: [number, number],
): boolean {
  const [px, py] = point;
  const n = polygon.length;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
