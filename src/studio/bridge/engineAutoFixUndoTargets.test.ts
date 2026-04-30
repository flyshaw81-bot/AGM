import { afterEach, describe, expect, it } from "vitest";
import { createGlobalAutoFixUndoTargets } from "./engineAutoFixUndoTargets";

const originalPack = globalThis.pack;
const originalBiomesData = globalThis.biomesData;

describe("createGlobalAutoFixUndoTargets", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
    globalThis.biomesData = originalBiomesData;
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
});
