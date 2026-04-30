import Delaunator from "delaunator";
import { describe, expect, it } from "vitest";
import { type Point, Voronoi } from "./voronoi";

function normalizeZero(value: number) {
  return Object.is(value, -0) ? 0 : value;
}

function createVoronoi(points: Point[]) {
  const delaunay = Delaunator.from(points) as unknown as Delaunator<
    Float64Array<ArrayBufferLike>
  >;
  return new Voronoi(delaunay, points, points.length);
}

describe("Voronoi", () => {
  it("builds cells and circumcenter vertices from a Delaunator graph", () => {
    const voronoi = createVoronoi([
      [0, 0],
      [10, 0],
      [0, 10],
      [10, 10],
      [5, 5],
    ]);

    expect(
      voronoi.vertices.p.map(([x, y]) => [normalizeZero(x), normalizeZero(y)]),
    ).toEqual([
      [5, 0],
      [0, 5],
      [5, 10],
      [10, 5],
    ]);
    expect(voronoi.vertices.c).toEqual([
      [4, 1, 0],
      [0, 2, 4],
      [2, 3, 4],
      [4, 3, 1],
    ]);
    expect(voronoi.cells.b[4]).toBe(0);
    expect(new Set(voronoi.cells.c[4])).toEqual(new Set([0, 1, 2, 3]));
    expect(voronoi.cells.v[4]).toHaveLength(4);
  });
});
