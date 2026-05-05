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

  it("removes icons through injected renderer targets", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
      writable: true,
    });

    const { removeBurgIconRenderer } = await import("./draw-burg-icons");
    const icon = { remove: vi.fn() } as unknown as Element;
    const anchor = { remove: vi.fn() } as unknown as Element;
    const getElementById = vi.fn((id: string) => {
      if (id === "burg7") return icon;
      if (id === "anchor7") return anchor;
      return null;
    });

    removeBurgIconRenderer(7, {
      getDocument: () => ({}) as Document,
      getElementById,
      querySelector: () => null,
      querySelectorAll: () => [],
    });

    expect(getElementById).toHaveBeenCalledWith("burg7");
    expect(getElementById).toHaveBeenCalledWith("anchor7");
    expect(icon.remove).toHaveBeenCalledTimes(1);
    expect(anchor.remove).toHaveBeenCalledTimes(1);
  });
});
