import { afterEach, describe, expect, it } from "vitest";
import { createGlobalResourceSummaryTargets } from "./engineResourceSummaryTargets";

const originalPack = globalThis.pack;
const originalBiomesData = globalThis.biomesData;
const originalBiomes = globalThis.Biomes;

describe("createGlobalResourceSummaryTargets", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
    globalThis.biomesData = originalBiomesData;
    globalThis.Biomes = originalBiomes;
  });

  it("reads resource collections and cell metrics from the active pack", () => {
    const states = [{ i: 1, name: "Aurelia" }];
    const zones = [{ i: 2, name: "Zone" }];
    globalThis.pack = {
      states,
      zones,
      cells: {
        area: { 7: 12 },
        pop: { 7: 3 },
      },
    } as unknown as typeof pack;

    const targets = createGlobalResourceSummaryTargets();

    expect(targets.getStates()).toBe(states);
    expect(targets.getZones()).toBe(zones);
    expect(targets.getCellArea(7)).toBe(12);
    expect(targets.getCellPopulation(7)).toBe(3);
  });

  it("initializes biome data from the mounted AGM Biomes module", () => {
    const biomeData = { i: [1], name: { 1: "Forest" } };
    globalThis.biomesData = undefined as unknown as typeof biomesData;
    globalThis.Biomes = {
      getDefault: () => biomeData,
    } as unknown as typeof Biomes;

    const targets = createGlobalResourceSummaryTargets();

    expect(targets.getBiomeData()).toBe(biomeData);
    expect(globalThis.biomesData).toBe(biomeData);
  });
});
