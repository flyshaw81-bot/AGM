import { describe, expect, it, vi } from "vitest";

import {
  createGlobalStudioStyleTargets,
  createStudioStyleTargets,
} from "./stylesTargets";

describe("stylesTargets", () => {
  it("composes style targets from injected document adapters", () => {
    const targets = {
      getStyleElement: vi.fn(() => null),
      createStyleElement: vi.fn(() => ({ id: "" }) as HTMLStyleElement),
      appendToHead: vi.fn(),
    };

    expect(createStudioStyleTargets(targets)).toBe(targets);
  });

  it("composes default style document adapters", () => {
    const appended: HTMLStyleElement[] = [];
    const existing = { id: "studioShellStyles" } as HTMLElement;
    const originalDocument = globalThis.document;
    globalThis.document = {
      createElement: vi.fn(() => ({ id: "" }) as HTMLStyleElement),
      getElementById: vi.fn((id: string) =>
        id === "studioShellStyles" ? existing : null,
      ),
      head: {
        appendChild: vi.fn((element: HTMLStyleElement) => {
          appended.push(element);
          return element;
        }),
      },
    } as unknown as Document;

    try {
      const targets = createGlobalStudioStyleTargets();
      const style = targets.createStyleElement();

      expect(targets.getStyleElement("studioShellStyles")).toBe(existing);
      targets.appendToHead(style);
      expect(appended).toEqual([style]);
    } finally {
      globalThis.document = originalDocument;
    }
  });

  it("keeps default style document adapters safe when document is absent", () => {
    const originalDocument = globalThis.document;
    globalThis.document = undefined as unknown as Document;

    try {
      const targets = createGlobalStudioStyleTargets();
      const style = targets.createStyleElement();

      expect(targets.getStyleElement("studioShellStyles")).toBeNull();
      expect(style.id).toBe("");
      expect(() => targets.appendToHead(style)).not.toThrow();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
