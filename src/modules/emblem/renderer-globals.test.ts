import { afterEach, describe, expect, it, vi } from "vitest";

describe("EmblemRenderModule global mount", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  it("can be imported when window access throws", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./renderer")).resolves.toBeDefined();
  });
});
