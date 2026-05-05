import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectVertices,
  createGlobalPathLogTargets,
  findPath,
} from "./pathUtils";

describe("findPath", () => {
  it("finds the lowest-cost path without browser globals", () => {
    const graph = {
      cells: {
        c: [
          [1, 2],
          [0, 3],
          [0, 3],
          [1, 2],
        ],
      },
    };

    const costs = new Map([
      ["0-1", 10],
      ["1-3", 10],
      ["0-2", 1],
      ["2-3", 1],
    ]);

    const path = findPath(
      0,
      (cell) => cell === 3,
      (current, next) => costs.get(`${current}-${next}`) ?? Infinity,
      graph,
    );

    expect(path).toEqual([0, 2, 3]);
  });
});

describe("connectVertices", () => {
  const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "window",
  );

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    }
  });

  it("reports invalid vertex chains through injected log targets", () => {
    const error = vi.fn();

    const chain = connectVertices({
      vertices: {
        c: [
          [1, 2, 3],
          [1, 1, 1],
        ],
        v: [
          [99, 0, 0],
          [1, 1, 1],
        ],
      },
      startingVertex: 0,
      ofSameType: (cellId) => cellId === 1,
      logTargets: { error },
    });

    expect(chain).toEqual([0]);
    expect(error).toHaveBeenCalledWith(
      "ConnectVertices: next vertex is out of bounds",
    );
  });

  it("keeps global path log targets safe when window access throws", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      createGlobalPathLogTargets().error("blocked window"),
    ).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });
});
