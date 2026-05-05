import { afterEach, describe, expect, it } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createGlobalStateWritebackTargets,
  createRuntimeStateWritebackTargets,
  createStateWritebackTargets,
} from "./engineAutoFixStateTargets";

const originalPack = globalThis.pack;
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);

describe("createGlobalStateWritebackTargets", () => {
  afterEach(() => {
    if (originalPackDescriptor) {
      Object.defineProperty(globalThis, "pack", originalPackDescriptor);
    } else {
      Object.defineProperty(globalThis, "pack", {
        configurable: true,
        value: originalPack,
        writable: true,
      });
    }
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

  it("creates state writeback targets from an injected runtime context", () => {
    const state = { i: 2, agmPriority: "high" };
    const context = {
      pack: {
        states: {
          2: state,
          3: { i: 3, removed: true },
        },
      },
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeStateWritebackTargets(context);

    expect(targets.getWritableState(2)).toBe(state);
    expect(targets.getWritableState(3)).toBeUndefined();
  });

  it("keeps global state writeback safe when pack access throws", () => {
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      get: () => {
        throw new Error("pack blocked");
      },
    });

    expect(
      createGlobalStateWritebackTargets().getWritableState(2),
    ).toBeUndefined();
  });
});
