import { describe, expect, it } from "vitest";
import {
  findNearestCanvasCell,
  getCanvasPointPercent,
  toCanvasCellPoint,
} from "./canvasCellGeometry";

describe("canvasCellGeometry", () => {
  it("normalizes valid cell points and rejects invalid coordinates", () => {
    expect(toCanvasCellPoint([12, 24])).toEqual([12, 24]);
    expect(toCanvasCellPoint([12, Number.NaN])).toBeNull();
    expect(toCanvasCellPoint("12,24")).toBeNull();
  });

  it("finds the nearest cell from sparse legacy point records", () => {
    expect(
      findNearestCanvasCell(
        [1, 2, 3],
        {
          1: [0, 0],
          2: [40, 30],
          3: [100, 100],
        },
        { x: 44, y: 33 },
      ),
    ).toMatchObject({ cellId: 2, point: [40, 30] });
  });

  it("converts world positions to clamped canvas percentages", () => {
    expect(getCanvasPointPercent(50, 200)).toBe(25);
    expect(getCanvasPointPercent(-20, 200)).toBe(0);
    expect(getCanvasPointPercent(500, 200)).toBe(100);
  });
});
