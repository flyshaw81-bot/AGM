import { afterEach, describe, expect, it, vi } from "vitest";
import { createGlobalOceanLayerLogTargets, OceanModule } from "./ocean-layers";

describe("OceanModule", () => {
  const originalWindow = globalThis.window;
  const originalErrorDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "ERROR",
  );

  afterEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
    if (originalErrorDescriptor) {
      Object.defineProperty(globalThis, "ERROR", originalErrorDescriptor);
    }
  });

  it("can be imported without browser globals", () => {
    expect(OceanModule).toBeTypeOf("function");
  });

  it("can be imported when window access throws", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });

    await expect(import("./ocean-layers")).resolves.toBeDefined();
  });

  it("reports stalled vertex chains through injected log targets", () => {
    const error = vi.fn();
    const module = new OceanModule({} as never, { error }) as unknown as {
      cells: { t: number[] };
      vertices: { c: number[][]; v: number[][] };
      pointsN: number;
      used: Uint8Array;
      connectVertices: (start: number, t: number) => number[];
    };
    module.cells = { t: [1, 0, 0] };
    module.vertices = {
      c: [[0, 1, 2]],
      v: [[]],
    };
    module.pointsN = 3;
    module.used = new Uint8Array(3);

    expect(module.connectVertices(0, 1)).toEqual([0, 0]);
    expect(error).toHaveBeenCalledWith("Next vertex is not found");
  });

  it("keeps global log targets safe when error flag access throws", () => {
    Object.defineProperty(globalThis, "ERROR", {
      configurable: true,
      get: () => {
        throw new Error("ERROR blocked");
      },
    });
    const targets = createGlobalOceanLayerLogTargets();

    expect(() => targets.error("Next vertex is not found")).not.toThrow();
  });
});
