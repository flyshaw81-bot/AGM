import { describe, expect, it, vi } from "vitest";
import type { CanvasToolMode } from "../types";
import {
  createCanvasInteractionTargets,
  createGlobalCanvasInteractionTargets,
} from "./canvasInteractionTargets";

describe("canvas interaction targets", () => {
  it("composes canvas interaction targets from injected adapters", () => {
    const targets = {
      getCanvasFrame: vi.fn(() => null),
      getMapHost: vi.fn(() => null),
      isControlEvent: vi.fn(() => false),
      getPaintPreviewAt: vi.fn(),
      getSelectionAt: vi.fn(),
      syncPaintPreview: vi.fn(),
      syncToolHud: vi.fn(),
      syncViewport: vi.fn(),
      isPaintTool: (
        _tool: CanvasToolMode,
      ): _tool is "terrain" | "water" | "brush" => false,
    };

    expect(createCanvasInteractionTargets(targets)).toBe(targets);
  });

  it("composes default canvas interaction adapters", () => {
    const originalDocument = globalThis.document;
    globalThis.document = {
      getElementById: vi.fn((id: string) => ({ id })),
    } as unknown as Document;

    try {
      const targets = createGlobalCanvasInteractionTargets();

      expect(targets.getCanvasFrame()).toMatchObject({
        id: "studioCanvasFrame",
      });
      expect(targets.getMapHost()).toMatchObject({ id: "studioMapHost" });
      expect(targets.getPaintPreviewAt).toEqual(expect.any(Function));
      expect(targets.getSelectionAt).toEqual(expect.any(Function));
      expect(targets.syncPaintPreview).toEqual(expect.any(Function));
      expect(targets.syncToolHud).toEqual(expect.any(Function));
      expect(targets.syncViewport).toEqual(expect.any(Function));
      expect(targets.isPaintTool).toEqual(expect.any(Function));
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
