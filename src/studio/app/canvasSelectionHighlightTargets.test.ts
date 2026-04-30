import { describe, expect, it, vi } from "vitest";
import {
  createCanvasSelectionHighlightTargets,
  createGlobalCanvasSelectionHighlightTargets,
} from "./canvasSelectionHighlightTargets";

describe("canvas selection highlight targets", () => {
  it("composes selection highlight targets from injected DOM adapters", () => {
    const targets = {
      getSelectedStateElements: vi.fn(() => []),
      getSelectedStateBorderElements: vi.fn(() => []),
      getCanvasFrame: vi.fn(() => null),
      getMapHost: vi.fn(() => null),
      getStatePath: vi.fn(() => null),
      getStateBorder: vi.fn(() => null),
      appendToParent: vi.fn(),
    };

    expect(createCanvasSelectionHighlightTargets(targets)).toBe(targets);
  });

  it("composes default selection highlight DOM lookups", () => {
    const selectedState = { id: "state7" };
    const selectedBorder = { id: "state-border7" };
    const frame = { id: "studioCanvasFrame" };
    const host = { id: "studioMapHost" };
    const originalDocument = globalThis.document;
    globalThis.document = {
      querySelectorAll: vi.fn((selector: string) => {
        if (selector === "[data-studio-selected-state='true']")
          return [selectedState];
        if (selector === "[data-studio-selected-state-border='true']")
          return [selectedBorder];
        return [];
      }),
      getElementById: vi.fn((id: string) => {
        if (id === "studioCanvasFrame") return frame;
        if (id === "studioMapHost") return host;
        return null;
      }),
    } as unknown as Document;

    try {
      const targets = createGlobalCanvasSelectionHighlightTargets();

      expect(targets.getSelectedStateElements()).toEqual([selectedState]);
      expect(targets.getSelectedStateBorderElements()).toEqual([
        selectedBorder,
      ]);
      expect(targets.getCanvasFrame()).toBe(frame);
      expect(targets.getMapHost()).toBe(host);
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
