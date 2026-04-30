import { describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createCanvasInteractionGeometryTargets,
  createGlobalCanvasInteractionGeometryTargets,
  createRuntimeCanvasInteractionGeometryTargets,
} from "./canvasInteractionGeometryTargets";

describe("canvas interaction geometry targets", () => {
  it("composes geometry targets from injected adapters", () => {
    const targets = {
      getCanvasFrame: vi.fn(() => null),
      getGraphSize: vi.fn(() => ({ width: 1000, height: 700 })),
      getPack: vi.fn(() => undefined),
      getPaintPreviewForCell: vi.fn(() => null),
    };

    expect(createCanvasInteractionGeometryTargets(targets)).toBe(targets);
  });

  it("composes default frame, graph, and pack adapters", () => {
    const frame = { id: "studioCanvasFrame" };
    const originalDocument = globalThis.document;
    globalThis.document = {
      getElementById: vi.fn((id: string) =>
        id === "studioCanvasFrame" ? frame : null,
      ),
    } as unknown as Document;

    try {
      const targets = createGlobalCanvasInteractionGeometryTargets();

      expect(targets.getCanvasFrame()).toBe(frame);
      expect(targets.getGraphSize).toEqual(expect.any(Function));
      expect(targets.getPack).toEqual(expect.any(Function));
      expect(targets.getPaintPreviewForCell).toEqual(expect.any(Function));
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("composes runtime graph, pack, and paint preview adapters", () => {
    const frame = { id: "studioCanvasFrame" };
    const originalDocument = globalThis.document;
    globalThis.document = {
      getElementById: vi.fn((id: string) =>
        id === "studioCanvasFrame" ? frame : null,
      ),
    } as unknown as Document;
    const context = {
      worldSettings: {
        graphWidth: 1400,
        graphHeight: 900,
      },
      pack: {
        cells: {
          p: { 5: [700, 450] },
          h: { 5: 35 },
          biome: { 5: 2 },
        },
      },
      grid: { cells: {} },
    } as unknown as EngineRuntimeContext;

    try {
      const targets = createRuntimeCanvasInteractionGeometryTargets(context);

      expect(targets.getCanvasFrame()).toBe(frame);
      expect(targets.getGraphSize()).toEqual({ width: 1400, height: 900 });
      expect(targets.getPack()).toBe(context.pack);
      expect(targets.getPaintPreviewForCell("terrain", 5)).toMatchObject({
        cellId: 5,
        height: 35,
        biomeId: 2,
        x: 50,
        y: 50,
      });
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
