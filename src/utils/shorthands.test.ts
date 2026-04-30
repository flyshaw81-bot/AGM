import { describe, expect, it, vi } from "vitest";
import { byId, type DomLookupTargets } from "./shorthands";

describe("byId", () => {
  it("uses injected DOM lookup targets", () => {
    const element = { id: "map" } as HTMLElement;
    const targets: DomLookupTargets = {
      getElementById: vi.fn(() => element),
    };

    expect(byId("map", targets)).toBe(element);
    expect(targets.getElementById).toHaveBeenCalledWith("map");
  });
});
