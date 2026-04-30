import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalResourceSummaryTargets,
  createResourceSummaryTargets,
} from "./engineResourceSummaryTargets";

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

  it("composes resource summary targets from injected biome and pack adapters", () => {
    const biomeData = { i: [1] };
    const states = [{ i: 1, name: "Aurelia" }];
    const setBiomeData = vi.fn();
    const targets = createResourceSummaryTargets(
      {
        getBiomeData: () => biomeData,
        setBiomeData,
      },
      {
        getStates: () => states,
        getBurgs: () => [],
        getCultures: () => [],
        getReligions: () => [],
        getProvinces: () => [],
        getRoutes: () => [],
        getZones: () => [],
        getCellArea: (cellId) => (cellId === 7 ? 12 : undefined),
        getCellPopulation: (cellId) => (cellId === 7 ? 3 : undefined),
      },
    );

    expect(targets.getBiomeData()).toBe(biomeData);
    targets.setBiomeData(biomeData);
    expect(setBiomeData).toHaveBeenCalledWith(biomeData);
    expect(targets.getStates()).toBe(states);
    expect(targets.getCellArea(7)).toBe(12);
    expect(targets.getCellPopulation(7)).toBe(3);
  });
});
