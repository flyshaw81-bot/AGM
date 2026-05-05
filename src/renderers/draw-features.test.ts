import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalFeatureRendererLogTargets,
  renderFeaturePath,
} from "./draw-features";

describe("feature renderer compatibility mount", () => {
  const originalWindow = globalThis.window;
  const originalPack = globalThis.pack;
  const originalError = globalThis.ERROR;

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      value: originalPack,
      writable: true,
    });
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      value: originalError,
      writable: true,
    });
  });

  it("can be imported when window is absent", async () => {
    globalThis.window = undefined as unknown as Window & typeof globalThis;

    await expect(import("./draw-features")).resolves.toBeTruthy();
  });

  it("reports undefined feature vertices through injected log targets", () => {
    const error = vi.fn();
    globalThis.pack = {
      vertices: { p: [[10, 20]] },
    } as typeof pack;

    expect(
      renderFeaturePath(
        {
          i: 1,
          type: "island",
          vertices: [0, 1],
        } as unknown as Parameters<typeof renderFeaturePath>[0],
        { error },
      ),
    ).toBe("");
    expect(error).toHaveBeenCalledWith("Undefined point in getFeaturePath");
  });

  it("keeps global feature renderer log targets safe when ERROR access throws", () => {
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      get: () => {
        throw new Error("ERROR blocked");
      },
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      createGlobalFeatureRendererLogTargets().error("blocked error flag"),
    ).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });
});
