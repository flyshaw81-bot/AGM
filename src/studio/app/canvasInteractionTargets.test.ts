import { describe, expect, it, vi } from "vitest";
import { createGlobalCanvasInteractionTargets } from "./canvasInteractionTargets";

describe("createGlobalCanvasInteractionTargets", () => {
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
