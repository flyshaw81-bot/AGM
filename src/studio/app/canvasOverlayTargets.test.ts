import { describe, expect, it, vi } from "vitest";
import { createGlobalCanvasOverlayTargets } from "./canvasOverlayTargets";

describe("createGlobalCanvasOverlayTargets", () => {
  it("composes default overlay DOM lookups", () => {
    const preview = { id: "preview" };
    const hud = { id: "hud" };
    const frame = { id: "studioCanvasFrame" };
    const originalDocument = globalThis.document;
    globalThis.document = {
      querySelector: vi.fn((selector: string) => {
        if (selector === "[data-canvas-paint-preview='true']") return preview;
        if (selector === "[data-canvas-tool-hud='true']") return hud;
        return null;
      }),
      getElementById: vi.fn((id: string) =>
        id === "studioCanvasFrame" ? frame : null,
      ),
    } as unknown as Document;

    try {
      const targets = createGlobalCanvasOverlayTargets();

      expect(targets.getPaintPreviewOverlay()).toBe(preview);
      expect(targets.getToolHud()).toBe(hud);
      expect(targets.getCanvasFrame()).toBe(frame);
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
