import { describe, expect, it, vi } from "vitest";
import type { CanvasEditHistoryEntry, StudioState } from "../types";
import {
  applyBiomeCoverageTarget,
  applyCanvasPaintPreview,
  type CanvasPaintEditingTargets,
  getCanvasPaintPreviewForCell,
  undoCanvasEditEntry,
} from "./canvasPaintEditing";

function createState(): StudioState {
  return {
    viewport: {
      canvasEditHistory: [],
      paintPreview: null,
    },
    directEditor: {},
    document: {
      source: "agm",
    },
  } as unknown as StudioState;
}

function createTargets(
  overrides: Partial<CanvasPaintEditingTargets> = {},
): CanvasPaintEditingTargets {
  const packCells = {
    biome: [0, 1, 2, 2] as ArrayLike<number> & Record<number, number>,
    g: { 1: 101, 2: 102, 3: 103 },
    h: { 1: 30, 2: 42, 3: 12 },
    p: {
      1: [10, 20],
      2: [60, 40],
      3: [90, 70],
    },
    state: { 1: 5, 2: 6, 3: 7 },
  };
  const gridCells = {
    h: { 101: 30, 102: 42, 103: 12 },
  };
  return {
    getGraphSize: vi.fn(() => ({ width: 100, height: 100 })),
    getPackCells: vi.fn(() => packCells),
    getGridCells: vi.fn(() => gridCells),
    redrawEditLayers: vi.fn(),
    now: vi.fn(() => 1234),
    ...overrides,
  };
}

describe("canvasPaintEditing", () => {
  it("builds paint preview through injected pack and graph targets", () => {
    const preview = getCanvasPaintPreviewForCell("brush", 2, createTargets());

    expect(preview).toEqual({
      tool: "brush",
      cellId: 2,
      label: "Cell #2 - h 42 - biome 2",
      x: 60,
      y: 40,
      height: 42,
      biomeId: 2,
      stateId: 6,
    });
  });

  it("applies paint previews through injected write and redraw targets", () => {
    const state = createState();
    const targets = createTargets();

    const changed = applyCanvasPaintPreview(
      state,
      {
        tool: "terrain",
        cellId: 1,
        label: "Cell #1",
        x: 10,
        y: 20,
        height: 30,
        biomeId: 1,
        stateId: 5,
      },
      targets,
    );

    const cells = targets.getPackCells();
    const gridCells = targets.getGridCells();
    expect(changed).toBe(true);
    expect(cells?.h?.[1]).toBe(35);
    expect(gridCells?.h?.[101]).toBe(35);
    expect(targets.redrawEditLayers).toHaveBeenCalled();
    expect(state.viewport.canvasEditHistory[0]).toMatchObject({
      id: 1234,
      tool: "terrain",
      cellId: 1,
      beforeHeight: 30,
      afterHeight: 35,
    });
    expect(state.document.source).toBe("core");
  });

  it("undoes canvas edit entries through injected targets", () => {
    const targets = createTargets();
    const entry: CanvasEditHistoryEntry = {
      id: 1,
      tool: "terrain",
      cellId: 2,
      beforeHeight: 42,
      afterHeight: 47,
      beforeBiomeId: 2,
      afterBiomeId: 2,
      label: "Cell #2",
      undone: false,
    };

    expect(undoCanvasEditEntry(entry, targets)).toBe(true);
    expect(targets.getPackCells()?.h?.[2]).toBe(42);
    expect(targets.redrawEditLayers).toHaveBeenCalled();
  });

  it("applies biome coverage batches through injected clock and redraw targets", () => {
    const state = createState();
    const targets = createTargets();

    const changed = applyBiomeCoverageTarget(state, 1, 80, targets);

    expect(changed).toBe(true);
    expect(targets.redrawEditLayers).toHaveBeenCalled();
    expect(state.viewport.canvasEditHistory[0]).toMatchObject({
      id: 1234,
      tool: "biome-slider",
      afterBiomeId: 1,
    });
    expect(state.directEditor.selectedBiomeId).toBe(1);
    expect(state.document.source).toBe("core");
  });
});
