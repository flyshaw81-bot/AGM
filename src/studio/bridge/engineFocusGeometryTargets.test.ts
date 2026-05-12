import { afterEach, describe, expect, it } from "vitest";
import {
  clearActiveEngineRuntimeContext,
  setActiveEngineRuntimeContext,
} from "../../modules/engine-runtime-active-context";
import type { EngineRuntimeContext } from "../../modules/engine-runtime-context";
import {
  createFocusGeometryTargets,
  createGlobalFocusGeometryTargets,
  createRuntimeFocusGeometryTargets,
} from "./engineFocusGeometryTargets";

const originalPack = globalThis.pack;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalSvgWidth = globalThis.svgWidth;
const originalSvgHeight = globalThis.svgHeight;
const originalDescriptors = new Map(
  ["pack", "graphWidth", "graphHeight", "svgWidth", "svgHeight"].map(
    (name) =>
      [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  ),
);

describe("createGlobalFocusGeometryTargets", () => {
  afterEach(() => {
    clearActiveEngineRuntimeContext();

    for (const [name, value] of [
      ["pack", originalPack],
      ["graphWidth", originalGraphWidth],
      ["graphHeight", originalGraphHeight],
      ["svgWidth", originalSvgWidth],
      ["svgHeight", originalSvgHeight],
    ] as const) {
      const descriptor = originalDescriptors.get(name);
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

  it("reads dimensions and cell data from the current engine runtime", () => {
    globalThis.graphWidth = 1200;
    globalThis.graphHeight = 800;
    globalThis.pack = {
      cells: {
        i: [1, 2],
        p: { 1: [10, 20] },
        state: { 1: 3 },
      },
    } as unknown as typeof pack;

    const targets = createGlobalFocusGeometryTargets();

    expect(targets.getWidth()).toBe(1200);
    expect(targets.getHeight()).toBe(800);
    expect(targets.getCellIds()).toEqual([1, 2]);
    expect(targets.getCellPoint(1)).toEqual([10, 20]);
    expect(targets.getCellFieldValue("state", 1)).toBe(3);
  });

  it("resolves entity lookups from pack collections", () => {
    const state = { i: 2 };
    const zone = { i: 9 };
    globalThis.pack = {
      states: [undefined, undefined, state],
      zones: [zone],
    } as unknown as typeof pack;

    const targets = createGlobalFocusGeometryTargets();

    expect(targets.getState(2)).toBe(state);
    expect(targets.getZone(9)).toBe(zone);
    expect(targets.getZone(99)).toBeUndefined();
  });

  it("prefers the active engine context over stale global pack data", () => {
    const activeState = { i: 1, name: "Context State" };
    const staleState = { i: 1, name: "Global State" };
    globalThis.graphWidth = 1200;
    globalThis.pack = {
      states: [undefined, staleState],
      cells: { i: [9], p: { 9: [90, 90] }, state: { 9: 9 } },
    } as unknown as typeof pack;
    setActiveEngineRuntimeContext({
      worldSettings: {
        graphWidth: 1440,
        graphHeight: 900,
      },
      pack: {
        states: [undefined, activeState],
        cells: { i: [1], p: { 1: [10, 20] }, state: { 1: 3 } },
      },
    } as unknown as EngineRuntimeContext);

    const targets = createGlobalFocusGeometryTargets();

    expect(targets.getWidth()).toBe(1440);
    expect(targets.getCellIds()).toEqual([1]);
    expect(targets.getCellPoint(1)).toEqual([10, 20]);
    expect(targets.getState(1)).toBe(activeState);
  });

  it("keeps global focus geometry safe when globals are blocked", () => {
    for (const name of [
      "pack",
      "graphWidth",
      "graphHeight",
      "svgWidth",
      "svgHeight",
    ]) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get: () => {
          throw new Error(`${name} blocked`);
        },
      });
    }
    const targets = createGlobalFocusGeometryTargets();

    expect(targets.getWidth()).toBeUndefined();
    expect(targets.getHeight()).toBeUndefined();
    expect(targets.getCellIds()).toEqual([]);
    expect(targets.getCellPoint(1)).toBeUndefined();
    expect(targets.getCellFieldValue("state", 1)).toBeUndefined();
    expect(targets.getState(1)).toBeUndefined();
    expect(targets.getProvince(1)).toBeUndefined();
    expect(targets.getBurg(1)).toBeUndefined();
    expect(targets.getRoute(1)).toBeUndefined();
    expect(targets.getZone(1)).toBeUndefined();
  });

  it("composes focus geometry targets from injected dimension, cell, and entity adapters", () => {
    const state = { i: 2 };
    const targets = createFocusGeometryTargets(
      {
        getWidth: () => 1024,
        getHeight: () => 768,
      },
      {
        getCellIds: () => [1],
        getCellPoint: () => [10, 20],
        getCellFieldValue: () => 2,
      },
      {
        getState: () => state,
        getProvince: () => undefined,
        getBurg: () => undefined,
        getRoute: () => undefined,
        getZone: () => undefined,
      },
    );

    expect(targets.getWidth()).toBe(1024);
    expect(targets.getHeight()).toBe(768);
    expect(targets.getCellIds()).toEqual([1]);
    expect(targets.getCellPoint(1)).toEqual([10, 20]);
    expect(targets.getCellFieldValue("state", 1)).toBe(2);
    expect(targets.getState(2)).toBe(state);
  });

  it("creates focus geometry targets from an injected runtime context", () => {
    const state = { i: 2 };
    const zone = { i: 9 };
    const context = {
      worldSettings: {
        graphWidth: 1200,
        graphHeight: 800,
      },
      pack: {
        cells: {
          i: [1, 2],
          p: { 1: [10, 20] },
          state: { 1: 3 },
        },
        states: [undefined, undefined, state],
        zones: [zone],
      },
    } as unknown as EngineRuntimeContext;
    const targets = createRuntimeFocusGeometryTargets(context);

    expect(targets.getWidth()).toBe(1200);
    expect(targets.getHeight()).toBe(800);
    expect(targets.getCellIds()).toEqual([1, 2]);
    expect(targets.getCellPoint(1)).toEqual([10, 20]);
    expect(targets.getCellFieldValue("state", 1)).toBe(3);
    expect(targets.getState(2)).toBe(state);
    expect(targets.getZone(9)).toBe(zone);
  });
});
