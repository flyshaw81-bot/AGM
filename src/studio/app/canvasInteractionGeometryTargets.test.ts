import { describe, expect, it, vi } from "vitest";
import {
  createCanvasInteractionGeometryTargets,
  createGlobalCanvasInteractionGeometryTargets,
} from "./canvasInteractionGeometryTargets";

describe("canvas interaction geometry targets", () => {
  it("composes geometry targets from injected adapters", () => {
    const targets = {
      getCanvasFrame: vi.fn(() => null),
      getGraphSize: vi.fn(() => ({ width: 1000, height: 700 })),
      getPack: vi.fn(() => undefined),
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
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
