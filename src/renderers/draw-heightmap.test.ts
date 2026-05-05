import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectHeightmapVertices,
  createGlobalHeightmapRendererLogTargets,
} from "./draw-heightmap";

describe("heightmap renderer compatibility mount", () => {
  const originalWindow = globalThis.window;
  const originalError = globalThis.ERROR;

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
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

    await expect(import("./draw-heightmap")).resolves.toBeTruthy();
  });

  it("reports stalled heightmap vertex chains through injected log targets", () => {
    const error = vi.fn();
    const used = new Uint8Array(3);

    const chain = connectHeightmapVertices({
      cells: {
        i: [0, 1, 2],
        h: [20, 20, 20],
      },
      vertices: {
        c: [[0, 1, 2]],
        v: [[0, 0, 0]],
      },
      start: 0,
      height: 20,
      used,
      logTargets: { error },
    });

    expect(chain).toEqual([0]);
    expect(Array.from(used)).toEqual([1, 1, 1]);
    expect(error).toHaveBeenCalledWith("Next vertex is not found");
  });

  it("keeps global heightmap log targets safe when ERROR access throws", () => {
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      get: () => {
        throw new Error("ERROR blocked");
      },
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      createGlobalHeightmapRendererLogTargets().error("blocked error flag"),
    ).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });
});
