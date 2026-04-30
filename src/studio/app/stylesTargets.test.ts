import { describe, expect, it, vi } from "vitest";

import { createGlobalStudioStyleTargets } from "./stylesTargets";

describe("stylesTargets", () => {
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
});
