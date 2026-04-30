import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";

import {
  createCanvasPaintEditingTargets,
  createGlobalCanvasPaintEditingTargets,
  createRuntimeCanvasPaintEditingTargets,
} from "./canvasPaintEditingTargets";

describe("canvasPaintEditingTargets", () => {
  it("composes paint editing targets from injected adapters", () => {
    const targets = {
      getGraphSize: vi.fn(() => ({ width: 1000, height: 700 })),
      getPackCells: vi.fn(() => undefined),
      getGridCells: vi.fn(() => undefined),
      redrawEditLayers: vi.fn(),
      now: vi.fn(() => 1000),
    };

    expect(createCanvasPaintEditingTargets(targets)).toBe(targets);
  });

  it("composes default graph, cells, redraw, and clock adapters", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T08:15:00Z"));

    try {
      const targets = createGlobalCanvasPaintEditingTargets();

      expect(targets.getGraphSize).toEqual(expect.any(Function));
      expect(targets.getPackCells).toEqual(expect.any(Function));
      expect(targets.getGridCells).toEqual(expect.any(Function));
      expect(targets.redrawEditLayers).toEqual(expect.any(Function));
      expect(targets.now()).toBe(new Date("2026-04-30T08:15:00Z").getTime());
    } finally {
      vi.useRealTimers();
    }
  });

  it("composes runtime graph, cells, and redraw adapters from context", () => {
    const drawHeightmap = vi.fn();
    const drawBiomes = vi.fn();
    const drawCells = vi.fn();
    const invokeActiveZooming = vi.fn();
    const context = {
      worldSettings: {
        graphWidth: 1440,
        graphHeight: 900,
      },
      pack: {
        cells: { h: { 3: 42 } },
      },
      grid: {
        cells: { h: { 7: 24 } },
      },
      rendering: {
        drawHeightmap,
        drawBiomes,
        drawCells,
        isLayerOn: () => true,
        invokeActiveZooming,
      },
    } as unknown as EngineRuntimeContext;

    const targets = createRuntimeCanvasPaintEditingTargets(context);

    expect(targets.getGraphSize()).toEqual({ width: 1440, height: 900 });
    expect(targets.getPackCells()).toBe(context.pack.cells);
    expect(targets.getGridCells()).toBe(context.grid.cells);
    targets.redrawEditLayers();
    expect(drawHeightmap).toHaveBeenCalledWith();
    expect(drawBiomes).toHaveBeenCalledWith();
    expect(drawCells).toHaveBeenCalledWith();
    expect(invokeActiveZooming).toHaveBeenCalledWith();
  });
});
