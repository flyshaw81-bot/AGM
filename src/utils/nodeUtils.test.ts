import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalNodeIdTargets,
  getNextId,
  type NodeIdTargets,
} from "./nodeUtils";

describe("getNextId", () => {
  const originalDocument = globalThis.document;

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
      writable: true,
    });
  });

  it("uses injected DOM lookup targets to find an available id", () => {
    const targets: NodeIdTargets = {
      getElementById: vi.fn((id) =>
        id === "route1" || id === "route2" ? ({} as Element) : null,
      ),
    };

    expect(getNextId("route", 1, targets)).toBe("route3");
    expect(targets.getElementById).toHaveBeenNthCalledWith(1, "route1");
    expect(targets.getElementById).toHaveBeenNthCalledWith(2, "route2");
    expect(targets.getElementById).toHaveBeenNthCalledWith(3, "route3");
  });

  it("keeps global id lookup safe when document access throws", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    expect(getNextId("route", 1, createGlobalNodeIdTargets())).toBe("route1");
  });
});
