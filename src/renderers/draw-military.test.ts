import { afterEach, describe, expect, it, vi } from "vitest";

describe("military renderer compatibility mount", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("can be imported when window is absent", async () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;

    await expect(import("./draw-military")).resolves.toBeTruthy();
  });
});
