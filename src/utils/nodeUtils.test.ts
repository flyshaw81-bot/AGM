import { describe, expect, it, vi } from "vitest";
import { getNextId, type NodeIdTargets } from "./nodeUtils";

describe("getNextId", () => {
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
});
