import { afterEach, describe, expect, it } from "vitest";
import {
  createGlobalStateWritebackTargets,
  createStateWritebackTargets,
} from "./engineAutoFixStateTargets";

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

  it("composes state writeback targets from an injected state lookup adapter", () => {
    const state = { i: 2, agmPriority: "high" };
    const targets = createStateWritebackTargets({
      getState: (stateId) =>
        stateId === 2
          ? state
          : ({ i: stateId, removed: true } as Record<string, unknown>),
    });

    expect(targets.getWritableState(2)).toBe(state);
    expect(targets.getWritableState(3)).toBeUndefined();
  });
});
