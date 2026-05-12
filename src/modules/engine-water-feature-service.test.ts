import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import {
  addLakesInDeepDepressionsForGrid,
  createGlobalWaterFeatureService,
  createGlobalWaterFeatureTargets,
  createWaterFeatureService,
  isWetLand,
  openNearSeaLakesForGrid,
} from "./engine-water-feature-service";

type TestGrid = Parameters<typeof addLakesInDeepDepressionsForGrid>[0];

const originalOceanLayers = globalThis.OceanLayers;
const originalOceanLayersDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "OceanLayers",
);

describe("EngineWaterFeatureService", () => {
  afterEach(() => {
    if (originalOceanLayersDescriptor) {
      Object.defineProperty(
        globalThis,
        "OceanLayers",
        originalOceanLayersDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "OceanLayers", {
        configurable: true,
        value: originalOceanLayers,
        writable: true,
      });
    }
  });

  it("routes water feature operations through injected targets", () => {
    const context = {} as EngineRuntimeContext;
    const targets = {
      addLakesInDeepDepressions: vi.fn(),
      openNearSeaLakes: vi.fn(),
      drawOceanLayers: vi.fn(),
      isWetLand: vi.fn(() => true),
    };
    const service = createWaterFeatureService(targets);

    service.addLakesInDeepDepressions(context, 24);
    service.openNearSeaLakes(context, "volcano");
    service.drawOceanLayers(context);

    expect(service.isWetLand(45, 4, 18)).toBe(true);
    expect(targets.addLakesInDeepDepressions).toHaveBeenCalledWith(context, 24);
    expect(targets.openNearSeaLakes).toHaveBeenCalledWith(context, "volcano");
    expect(targets.drawOceanLayers).toHaveBeenCalledWith(context);
    expect(targets.isWetLand).toHaveBeenCalledWith(45, 4, 18);
  });

  it("adds lakes in deep depressions on the runtime grid", () => {
    const grid: TestGrid = {
      cells: {
        b: { 0: false, 1: false, 2: false },
        c: { 0: [1, 2], 1: [0], 2: [0] },
        f: { 0: 0, 1: 0, 2: 0 },
        h: { 0: 30, 1: 30, 2: 32 },
        i: [0, 1, 2],
        t: { 0: 0, 1: 0, 2: 0 },
      },
      features: [{ i: 0, land: true, border: false, type: "land" }],
    };

    addLakesInDeepDepressionsForGrid(grid, 5);

    expect(grid.features.at(-1)).toEqual({
      i: 1,
      land: false,
      border: false,
      type: "lake",
    });
    expect(grid.cells.h[0]).toBe(19);
    expect(grid.cells.h[1]).toBe(19);
    expect(grid.cells.f[0]).toBe(1);
    expect(grid.cells.f[1]).toBe(1);
  });

  it("opens near-sea lakes into the adjacent ocean feature", () => {
    const grid: TestGrid = {
      cells: {
        b: { 0: false, 1: false, 2: false },
        c: { 0: [1], 1: [0, 2], 2: [1] },
        f: { 0: 1, 1: 0, 2: 2 },
        h: { 0: 19, 1: 21, 2: 10 },
        i: [0, 1, 2],
        t: { 0: -1, 1: 1, 2: -1 },
      },
      features: [
        { i: 0, land: true, border: false, type: "land" },
        { i: 1, land: false, border: false, type: "lake" },
        { i: 2, land: false, border: false, type: "ocean" },
      ],
    };

    openNearSeaLakesForGrid(grid, "archipelago");

    expect(grid.features[1].type).toBe("ocean");
    expect(grid.cells.h[1]).toBe(19);
    expect(grid.cells.f[0]).toBe(2);
    expect(grid.cells.f[1]).toBe(2);
  });

  it("keeps wetland classification compatible with the old helper", () => {
    expect(isWetLand(45, 0, 19)).toBe(true);
    expect(isWetLand(25, 1, 40)).toBe(true);
    expect(isWetLand(24, 1, 40)).toBe(false);
    expect(isWetLand(45, -4, 19)).toBe(false);
  });

  it("runs global water targets against the provided runtime grid", () => {
    const grid: TestGrid = {
      cells: {
        b: { 0: false, 1: false },
        c: { 0: [1], 1: [0] },
        f: { 0: 0, 1: 0 },
        h: { 0: 30, 1: 30 },
        i: [0, 1],
        t: { 0: 0, 1: 0 },
      },
      features: [{ i: 0, land: true, border: false, type: "land" }],
    };
    const context = { grid } as unknown as EngineRuntimeContext;
    globalThis.OceanLayers = vi.fn();
    const targets = createGlobalWaterFeatureTargets();

    targets.addLakesInDeepDepressions(context, 5);
    targets.drawOceanLayers(context);

    expect(grid.features.at(-1)?.type).toBe("lake");
    expect(globalThis.OceanLayers).toHaveBeenCalledWith(context);
  });

  it("keeps global water targets safe when runtime grid data is absent", () => {
    const context = { grid: {} } as EngineRuntimeContext;
    globalThis.OceanLayers = undefined as unknown as typeof OceanLayers;
    const targets = createGlobalWaterFeatureTargets();

    expect(() => targets.addLakesInDeepDepressions(context, 31)).not.toThrow();
    expect(() =>
      targets.openNearSeaLakes(context, "archipelago"),
    ).not.toThrow();
    expect(() => targets.drawOceanLayers(context)).not.toThrow();
  });

  it("creates a global water feature service from explicit targets", () => {
    const targets = {
      addLakesInDeepDepressions: vi.fn(),
      openNearSeaLakes: vi.fn(),
      drawOceanLayers: vi.fn(),
      isWetLand,
    };
    const context = {} as EngineRuntimeContext;

    createGlobalWaterFeatureService(targets).openNearSeaLakes(
      context,
      "peninsula",
    );

    expect(targets.openNearSeaLakes).toHaveBeenCalledWith(context, "peninsula");
  });
});
