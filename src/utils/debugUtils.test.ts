import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalDebugDrawingTargets,
  drawCellsValue,
  drawPath,
  drawPoint,
  drawPolygons,
  drawRouteConnections,
} from "./debugUtils";

describe("debug drawing helpers", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("keeps debug helpers safe when window access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    expect(() => drawCellsValue([], { cells: { p: [] } })).not.toThrow();
    expect(() => drawPolygons([], {}, { cells: { v: [] } })).not.toThrow();
    expect(() =>
      drawRouteConnections({ cells: { p: [], routes: {} } }),
    ).not.toThrow();
    expect(() => drawPoint([0, 0], {})).not.toThrow();
    expect(() => drawPath([[0, 0]], {})).not.toThrow();
  });

  it("keeps debug helpers safe when debug layer is absent", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
      writable: true,
    });

    expect(() => drawCellsValue([], { cells: { p: [] } })).not.toThrow();
    expect(() => drawPolygons([], {}, { cells: { v: [] } })).not.toThrow();
    expect(() =>
      drawRouteConnections({ cells: { p: [], routes: {} } }),
    ).not.toThrow();
    expect(() => drawPoint([0, 0], {})).not.toThrow();
    expect(() => drawPath([[0, 0]], {})).not.toThrow();
  });

  it("draws points through the mounted debug layer when available", () => {
    const attr = vi.fn().mockReturnThis();
    const append = vi.fn(() => ({ attr }));
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        debug: { append },
      },
      writable: true,
    });

    drawPoint([4, 8], { color: "blue", radius: 2 });

    expect(append).toHaveBeenCalledWith("circle");
    expect(attr).toHaveBeenCalledWith("cx", 4);
    expect(attr).toHaveBeenCalledWith("cy", 8);
    expect(attr).toHaveBeenCalledWith("r", 2);
    expect(attr).toHaveBeenCalledWith("fill", "blue");
  });

  it("draws points through injected debug targets", () => {
    const attr = vi.fn().mockReturnThis();
    const append = vi.fn(() => ({ attr }));
    const targets = {
      getDebugLayer: vi.fn(() => ({ append })),
      getColorScheme: vi.fn(),
    };

    drawPoint([4, 8], { color: "blue", radius: 2 }, targets);

    expect(targets.getDebugLayer).toHaveBeenCalled();
    expect(append).toHaveBeenCalledWith("circle");
    expect(attr).toHaveBeenCalledWith("cx", 4);
    expect(attr).toHaveBeenCalledWith("cy", 8);
    expect(attr).toHaveBeenCalledWith("r", 2);
    expect(attr).toHaveBeenCalledWith("fill", "blue");
  });

  it("keeps global debug targets safe when window access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    const targets = createGlobalDebugDrawingTargets();

    expect(targets.getDebugLayer()).toBeUndefined();
    expect(targets.getColorScheme("heightmap")).toBeUndefined();
  });
});
