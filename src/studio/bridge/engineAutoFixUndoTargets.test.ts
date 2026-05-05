import { afterEach, describe, expect, it } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createAutoFixUndoTargets,
  createGlobalAutoFixUndoTargets,
  createRuntimeAutoFixUndoTargets,
} from "./engineAutoFixUndoTargets";

const originalPack = globalThis.pack;
const originalBiomesData = globalThis.biomesData;
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);
const originalBiomesDataDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "biomesData",
);

describe("createGlobalAutoFixUndoTargets", () => {
  afterEach(() => {
    for (const [name, descriptor, value] of [
      ["pack", originalPackDescriptor, originalPack],
      ["biomesData", originalBiomesDataDescriptor, originalBiomesData],
    ] as const) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
      } else {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          value,
          writable: true,
        });
      }
    }
  });

  it("resolves writable province and skips removed province", () => {
    const province = { i: 4, agmConnectorTarget: 8 };
    globalThis.pack = {
      provinces: {
        4: province,
        5: { i: 5, removed: true },
      },
    } as unknown as typeof pack;

    const targets = createGlobalAutoFixUndoTargets();

    expect(targets.getWritableProvince(4)).toBe(province);
    expect(targets.getWritableProvince(5)).toBeUndefined();
    expect(targets.getWritableProvince(99)).toBeUndefined();
  });

  it("resolves writable state and skips removed state", () => {
    const state = { i: 2, agmPriority: "frontier" };
    globalThis.pack = {
      states: {
        2: state,
        3: { i: 3, removed: true },
      },
    } as unknown as typeof pack;

    const targets = createGlobalAutoFixUndoTargets();

    expect(targets.getWritableState(2)).toBe(state);
    expect(targets.getWritableState(3)).toBeUndefined();
    expect(targets.getWritableState(99)).toBeUndefined();
  });

  it("resolves biome data only when habitability is available", () => {
    const biomeData = {
      habitability: { 1: 20 },
      agmRuleWeight: { 1: 1.5 },
    };
    globalThis.biomesData = biomeData as unknown as typeof biomesData;

    expect(createGlobalAutoFixUndoTargets().getWritableBiomeData()).toBe(
      biomeData,
    );

    globalThis.biomesData = {} as unknown as typeof biomesData;
    expect(
      createGlobalAutoFixUndoTargets().getWritableBiomeData(),
    ).toBeUndefined();
  });

  it("composes undo targets from injected province, state, and biome adapters", () => {
    const province = { i: 4, agmConnectorTarget: 8 };
    const state = { i: 2, agmPriority: "frontier" };
    const biomeData = {
      habitability: { 1: 20 },
    };
    const targets = createAutoFixUndoTargets(
      {
        getProvince: (provinceId) =>
          provinceId === 4
            ? province
            : ({ i: provinceId, removed: true } as Record<string, unknown>),
      },
      {
        getState: (stateId) =>
          stateId === 2
            ? state
            : ({ i: stateId, removed: true } as Record<string, unknown>),
      },
      {
        getBiomeData: () => biomeData,
      },
    );

    expect(targets.getWritableProvince(4)).toBe(province);
    expect(targets.getWritableProvince(5)).toBeUndefined();
    expect(targets.getWritableState(2)).toBe(state);
    expect(targets.getWritableState(3)).toBeUndefined();
    expect(targets.getWritableBiomeData()).toBe(biomeData);
  });

  it("keeps global undo targets safe when pack access throws", () => {
    Object.defineProperty(globalThis, "pack", {
      configurable: true,
      get: () => {
        throw new Error("pack blocked");
      },
    });
    const targets = createGlobalAutoFixUndoTargets();

    expect(targets.getWritableProvince(4)).toBeUndefined();
    expect(targets.getWritableState(2)).toBeUndefined();
  });

  it("creates undo targets from an injected runtime context", () => {
    const province = { i: 4, agmConnectorTarget: 8 };
    const state = { i: 2, agmPriority: "frontier" };
    const biomeData = {
      habitability: { 1: 20 },
    };
    const context = {
      biomesData: biomeData,
      pack: {
        provinces: {
          4: province,
          5: { i: 5, removed: true },
        },
        states: {
          2: state,
          3: { i: 3, removed: true },
        },
      },
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeAutoFixUndoTargets(context);

    expect(targets.getWritableProvince(4)).toBe(province);
    expect(targets.getWritableProvince(5)).toBeUndefined();
    expect(targets.getWritableState(2)).toBe(state);
    expect(targets.getWritableState(3)).toBeUndefined();
    expect(targets.getWritableBiomeData()).toBe(biomeData);
  });
});
