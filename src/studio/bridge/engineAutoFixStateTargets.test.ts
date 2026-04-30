import { afterEach, describe, expect, it } from "vitest";
import { createGlobalStateWritebackTargets } from "./engineAutoFixStateTargets";

const originalPack = globalThis.pack;

describe("createGlobalStateWritebackTargets", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
  });

  it("resolves writable state and skips removed state", () => {
    const state = { i: 2, agmPriority: "high" };
    globalThis.pack = {
      states: {
        2: state,
        3: { i: 3, removed: true },
      },
    } as unknown as typeof pack;

    const targets = createGlobalStateWritebackTargets();

    expect(targets.getWritableState(2)).toBe(state);
    expect(targets.getWritableState(3)).toBeUndefined();
    expect(targets.getWritableState(99)).toBeUndefined();
  });
});
