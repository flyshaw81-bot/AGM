import { describe, expect, it } from "vitest";
import { findPath } from "./pathUtils";

describe("findPath", () => {
  it("finds the lowest-cost path without browser globals", () => {
    const graph = {
      cells: {
        c: [
          [1, 2],
          [0, 3],
          [0, 3],
          [1, 2],
        ],
      },
    };

    const costs = new Map([
      ["0-1", 10],
      ["1-3", 10],
      ["0-2", 1],
      ["2-3", 1],
    ]);

    const path = findPath(
      0,
      (cell) => cell === 3,
      (current, next) => costs.get(`${current}-${next}`) ?? Infinity,
      graph,
    );

    expect(path).toEqual([0, 2, 3]);
  });
});
