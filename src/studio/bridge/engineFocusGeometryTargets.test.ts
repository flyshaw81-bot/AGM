import { afterEach, describe, expect, it } from "vitest";
import { createGlobalFocusGeometryTargets } from "./engineFocusGeometryTargets";

const originalPack = globalThis.pack;
const originalGraphWidth = globalThis.graphWidth;
const originalGraphHeight = globalThis.graphHeight;
const originalSvgWidth = globalThis.svgWidth;
const originalSvgHeight = globalThis.svgHeight;

describe("createGlobalFocusGeometryTargets", () => {
  afterEach(() => {
    globalThis.pack = originalPack;
    globalThis.graphWidth = originalGraphWidth;
    globalThis.graphHeight = originalGraphHeight;
    globalThis.svgWidth = originalSvgWidth;
    globalThis.svgHeight = originalSvgHeight;
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
});
