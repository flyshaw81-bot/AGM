import { afterEach, describe, expect, it, vi } from "vitest";

describe("draw burg label renderer globals", () => {
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

  it("keeps removeBurgLabel safe when document access throws", async () => {
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

    await import("./draw-burg-labels");

    expect(() => windowTarget.removeBurgLabel(7)).not.toThrow();
  });

  it("removes labels through injected renderer targets", async () => {
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

    const { removeBurgLabelRenderer } = await import("./draw-burg-labels");
    const label = { remove: vi.fn() };
    const getElementById = vi.fn((id: string) =>
      id === "burgLabel7" ? label : null,
    );

    removeBurgLabelRenderer(7, {
      getDocument: () =>
        ({
          getElementById,
        }) as unknown as Document,
    });

    expect(getElementById).toHaveBeenCalledWith("burgLabel7");
    expect(label.remove).toHaveBeenCalledTimes(1);
  });
});
