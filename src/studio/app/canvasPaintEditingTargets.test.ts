import { describe, expect, it, vi } from "vitest";

import { createGlobalCanvasPaintEditingTargets } from "./canvasPaintEditingTargets";

describe("canvasPaintEditingTargets", () => {
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
});
