import { describe, expect, it, vi } from "vitest";
import {
  createCanvasOverlayTargets,
  createGlobalCanvasOverlayTargets,
} from "./canvasOverlayTargets";

describe("canvas overlay targets", () => {
  it("composes overlay targets from injected DOM adapters", () => {
    const targets = {
      getPaintPreviewOverlay: vi.fn(() => null),
      getToolHud: vi.fn(() => null),
      getCanvasFrame: vi.fn(() => null),
    };

    expect(createCanvasOverlayTargets(targets)).toBe(targets);
  });

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

  it("keeps default overlay DOM lookups safe when document is absent", () => {
    const originalDocument = globalThis.document;
    globalThis.document = undefined as unknown as Document;

    try {
      const targets = createGlobalCanvasOverlayTargets();

      expect(targets.getPaintPreviewOverlay()).toBeNull();
      expect(targets.getToolHud()).toBeNull();
      expect(targets.getCanvasFrame()).toBeNull();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
