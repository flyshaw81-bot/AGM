import { afterEach, describe, expect, it, vi } from "vitest";

describe("draw burg icon renderer globals", () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("keeps removeBurgIcon safe when document access throws", async () => {
    const windowTarget = {} as Window & typeof globalThis;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: windowTarget,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    await import("./draw-burg-icons");

    expect(() => windowTarget.removeBurgIcon(7)).not.toThrow();
  });
});
