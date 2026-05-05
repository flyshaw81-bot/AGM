import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createGlobalResourceSummaryTargets,
  createResourceSummaryTargets,
  createRuntimeResourceSummaryTargets,
} from "./engineResourceSummaryTargets";

const originalPack = globalThis.pack;
const originalBiomesData = globalThis.biomesData;
const originalBiomes = globalThis.Biomes;
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);
const originalBiomesDataDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "biomesData",
);
const originalBiomesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "Biomes",
);

describe("createGlobalResourceSummaryTargets", () => {
  afterEach(() => {
    for (const [name, descriptor, value] of [
      ["pack", originalPackDescriptor, originalPack],
      ["biomesData", originalBiomesDataDescriptor, originalBiomesData],
      ["Biomes", originalBiomesDescriptor, originalBiomes],
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

  it("keeps global resource targets safe when global access throws", () => {
    for (const name of ["pack", "biomesData", "Biomes"]) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
        set: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }
    const targets = createGlobalResourceSummaryTargets();

    expect(targets.getBiomeData()).toBeUndefined();
    expect(() => targets.setBiomeData({ i: [1] })).not.toThrow();
    expect(targets.getStates()).toBeUndefined();
    expect(targets.getBurgs()).toBeUndefined();
    expect(targets.getCultures()).toBeUndefined();
    expect(targets.getReligions()).toBeUndefined();
    expect(targets.getProvinces()).toBeUndefined();
    expect(targets.getRoutes()).toBeUndefined();
    expect(targets.getZones()).toBeUndefined();
    expect(targets.getCellArea(7)).toBeUndefined();
    expect(targets.getCellPopulation(7)).toBeUndefined();
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

  it("creates resource summary targets from an injected runtime context", () => {
    const nextBiomeData = { i: [2] };
    const context = {
      biomesData: { i: [1] },
      pack: {
        states: [{ i: 1, name: "Aurelia" }],
        routes: [{ i: 3, group: "roads" }],
        cells: {
          area: { 7: 12 },
          pop: { 7: 3 },
        },
      },
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeResourceSummaryTargets(context);

    expect(targets.getBiomeData()).toBe(context.biomesData);
    targets.setBiomeData(nextBiomeData);
    expect(context.biomesData).toBe(nextBiomeData);
    expect(targets.getStates()).toBe(context.pack.states);
    expect(targets.getRoutes()).toBe(context.pack.routes);
    expect(targets.getCellArea(7)).toBe(12);
    expect(targets.getCellPopulation(7)).toBe(3);
  });
});
