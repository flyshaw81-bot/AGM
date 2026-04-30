import { describe, expect, it } from "vitest";
import {
  calculateCanvasFitScale,
  calculateCanvasWorldPoint,
} from "./canvasGeometry";

describe("canvasGeometry", () => {
  it("calculates contain, cover and actual-size fit scales", () => {
    expect(calculateCanvasFitScale(800, 600, 1600, 600, "contain")).toBe(0.5);
    expect(calculateCanvasFitScale(800, 600, 1600, 600, "cover")).toBe(1);
    expect(calculateCanvasFitScale(800, 600, 1600, 600, "actual-size")).toBe(1);
  });

  it("maps frame points into clamped world coordinates", () => {
    expect(
      calculateCanvasWorldPoint(
        { x: 400, y: 300 },
        { width: 800, height: 600 },
        { width: 1600, height: 600 },
        { fitMode: "contain", panX: 0, panY: 0, zoom: 1 },
      ),
    ).toMatchObject({ graphHeight: 600, graphWidth: 1600, x: 800, y: 300 });
    expect(
      calculateCanvasWorldPoint(
        { x: -500, y: 9999 },
        { width: 800, height: 600 },
        { width: 1600, height: 600 },
        { fitMode: "contain", panX: 0, panY: 0, zoom: 1 },
      ),
    ).toMatchObject({ x: 0, y: 600 });
  });

  it("accounts for zoom and pan", () => {
    expect(
      calculateCanvasWorldPoint(
        { x: 450, y: 300 },
        { width: 800, height: 600 },
        { width: 800, height: 600 },
        { fitMode: "contain", panX: 50, panY: 0, zoom: 2 },
      ),
    ).toMatchObject({ x: 400, y: 300 });
  });
});
