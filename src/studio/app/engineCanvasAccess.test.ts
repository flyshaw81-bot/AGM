import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalEngineCanvasAccessTargets,
  type EngineCanvasAccessTargets,
  getEngineCanvasGraphSize,
  getEngineGridCells,
  getEnginePack,
  getEnginePackCells,
  redrawEngineCanvasEditLayers,
} from "./engineCanvasAccess";

const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalPack = globalThis.pack;
const originalGrid = globalThis.grid;
const originalDrawHeightmap = globalThis.drawHeightmap;
const originalDrawBiomes = (globalThis as any).drawBiomes;
const originalDrawCells = (globalThis as any).drawCells;
const originalLayerIsOn = globalThis.layerIsOn;
const originalInvokeActiveZooming = globalThis.invokeActiveZooming;

function createTargets(
  overrides: Partial<EngineCanvasAccessTargets>,
): EngineCanvasAccessTargets {
  return {
    getGraphWidth: vi.fn(() => 1000),
    getGraphHeight: vi.fn(() => 500),
    getPack: vi.fn(() => ({ cells: { i: [1] }, states: [] })),
    getGridCells: vi.fn(() => ({ i: [2] })),
    drawHeightmap: vi.fn(),
    drawBiomes: vi.fn(),
    drawCells: vi.fn(),
    isLayerOn: vi.fn(() => false),
    invokeActiveZooming: vi.fn(),
    ...overrides,
  };
}

describe("engineCanvasAccess", () => {
  afterEach(() => {
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.pack = originalPack;
    globalThis.grid = originalGrid;
    globalThis.drawHeightmap = originalDrawHeightmap;
    (globalThis as any).drawBiomes = originalDrawBiomes;
    (globalThis as any).drawCells = originalDrawCells;
    globalThis.layerIsOn = originalLayerIsOn;
    globalThis.invokeActiveZooming = originalInvokeActiveZooming;
  });

  it("reads canvas graph, pack, and grid through injected targets", () => {
    const pack = { cells: { i: [1] }, states: [] };
    const gridCells = { i: [2] };
    const targets = createTargets({
      getGraphWidth: vi.fn(() => "1200"),
      getGraphHeight: vi.fn(() => 800),
      getPack: vi.fn(() => pack),
      getGridCells: vi.fn(() => gridCells),
    });

    expect(getEngineCanvasGraphSize(targets)).toEqual({
      width: 1200,
      height: 800,
    });
    expect(getEnginePack(targets)).toBe(pack);
    expect(getEnginePackCells(targets)).toBe(pack.cells);
    expect(getEngineGridCells(targets)).toBe(gridCells);
  });

  it("redraws edit layers through injected targets", () => {
    const targets = createTargets({
      isLayerOn: vi.fn(() => true),
      drawHeightmap: vi.fn(),
      drawBiomes: vi.fn(),
      drawCells: vi.fn(),
      invokeActiveZooming: vi.fn(),
    });

    redrawEngineCanvasEditLayers(targets);

    expect(targets.drawHeightmap).toHaveBeenCalledWith();
    expect(targets.drawBiomes).toHaveBeenCalledWith();
    expect(targets.isLayerOn).toHaveBeenCalledWith("toggleCells");
    expect(targets.drawCells).toHaveBeenCalledWith();
    expect(targets.invokeActiveZooming).toHaveBeenCalledWith();
  });

  it("creates a global adapter for the current engine canvas runtime", () => {
    const pack = { cells: { i: [1] }, states: [] };
    const grid = { cells: { i: [2] } };
    const drawHeightmap = vi.fn();
    const drawBiomes = vi.fn();
    const drawCells = vi.fn();
    const invokeActiveZooming = vi.fn();
    globalThis.graphWidth = 900;
    globalThis.graphHeight = 700;
    globalThis.pack = pack as unknown as typeof globalThis.pack;
    globalThis.grid = grid as typeof globalThis.grid;
    globalThis.drawHeightmap = drawHeightmap;
    (globalThis as any).drawBiomes = drawBiomes;
    (globalThis as any).drawCells = drawCells;
    globalThis.layerIsOn = vi.fn(() => true);
    globalThis.invokeActiveZooming = invokeActiveZooming;

    const targets = createGlobalEngineCanvasAccessTargets();

    expect(targets.getGraphWidth()).toBe(900);
    expect(targets.getGraphHeight()).toBe(700);
    expect(targets.getPack()).toBe(pack);
    expect(targets.getGridCells()).toBe(grid.cells);
    targets.drawHeightmap();
    targets.drawBiomes();
    targets.drawCells();
    targets.invokeActiveZooming();
    expect(drawHeightmap).toHaveBeenCalledWith();
    expect(drawBiomes).toHaveBeenCalledWith();
    expect(drawCells).toHaveBeenCalledWith();
    expect(invokeActiveZooming).toHaveBeenCalledWith();
  });
});
