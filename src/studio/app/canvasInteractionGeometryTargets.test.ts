import { describe, expect, it, vi } from "vitest";
import { createGlobalCanvasInteractionGeometryTargets } from "./canvasInteractionGeometryTargets";

describe("createGlobalCanvasInteractionGeometryTargets", () => {
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
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
