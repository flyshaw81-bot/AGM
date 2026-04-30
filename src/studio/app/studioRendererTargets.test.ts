import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import type { StudioState } from "../types";
import {
  createGlobalStudioRendererTargets,
  createRuntimeStudioRendererTargets,
  createStudioRendererTargets,
  type StudioRendererTargets,
} from "./studioRendererTargets";

function createTargets(): StudioRendererTargets {
  return {
    syncEditorWorkflow: vi.fn(() => false),
    syncDocument: vi.fn(() => false),
    updateProjectCenter: vi.fn(),
    preserveEngineNode: vi.fn(),
    renderShell: vi.fn(() => "<main>Studio</main>"),
    setRootHtml: vi.fn(),
    setRootTheme: vi.fn(),
    setDocumentTheme: vi.fn(),
    relocateEngineMapHost: vi.fn(),
    syncOverlays: vi.fn(),
    syncViewport: vi.fn(),
    syncCanvasSelectionHighlight: vi.fn(),
    syncDialogsPosition: vi.fn(),
    bindCanvasToolInteractions: vi.fn(),
    resolveFocusGeometry: vi.fn(),
    applyCanvasPaintPreview: vi.fn(() => false),
    bindShellEvents: vi.fn(),
    syncProjectSummary: vi.fn(async () => undefined),
    updateViewportDimensions: vi.fn((_state: StudioState) => undefined),
  };
}

describe("studio renderer targets", () => {
  it("composes renderer targets from injected adapters", () => {
    const targets = createTargets();

    expect(createStudioRendererTargets(targets)).toBe(targets);
  });

  it("composes default renderer adapters", () => {
    const targets = createGlobalStudioRendererTargets();
    const root = {
      dataset: {},
      innerHTML: "",
    } as unknown as HTMLElement;

    targets.setRootHtml(root, "<main>Studio</main>");
    targets.setRootTheme(root, "night");

    expect(root.innerHTML).toBe("<main>Studio</main>");
    expect(root.dataset.studioTheme).toBe("night");
    expect(targets.syncEditorWorkflow).toEqual(expect.any(Function));
    expect(targets.syncDocument).toEqual(expect.any(Function));
    expect(targets.renderShell).toEqual(expect.any(Function));
    expect(targets.bindCanvasToolInteractions).toEqual(expect.any(Function));
    expect(targets.bindShellEvents).toEqual(expect.any(Function));
    expect(targets.syncProjectSummary).toEqual(expect.any(Function));
    expect(vi.isMockFunction(targets.syncProjectSummary)).toBe(false);
  });

  it("routes renderer canvas paint through runtime context", () => {
    const drawHeightmap = vi.fn();
    const context = {
      worldSettings: {
        graphWidth: 1000,
        graphHeight: 600,
      },
      pack: {
        cells: {
          p: { 2: [200, 100] },
          g: { 2: 9 },
          h: { 2: 40 },
          biome: { 2: 3 },
        },
      },
      grid: {
        cells: { h: { 9: 40 } },
      },
      rendering: {
        drawHeightmap,
        drawBiomes: vi.fn(),
        drawCells: vi.fn(),
        isLayerOn: () => false,
        invokeActiveZooming: vi.fn(),
      },
    } as unknown as EngineRuntimeContext;
    const state = {
      document: { source: "loaded" },
      viewport: { canvasEditHistory: [] },
    } as unknown as StudioState;
    const targets = createRuntimeStudioRendererTargets(context);

    expect(
      targets.applyCanvasPaintPreview(state, {
        tool: "water",
        cellId: 2,
        label: "Cell #2",
        x: 20,
        y: 16,
        height: 40,
        biomeId: 3,
        stateId: null,
      }),
    ).toBe(true);

    expect(context.pack.cells.h[2]).toBe(15);
    expect(context.grid.cells.h[9]).toBe(15);
    expect(state.document.source).toBe("core");
    expect(drawHeightmap).toHaveBeenCalledWith();
  });
});
