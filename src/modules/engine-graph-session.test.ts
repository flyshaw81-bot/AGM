import { describe, expect, it } from "vitest";
import {
  createRuntimeGraphSession,
  createRuntimeGraphSessionTargets,
  EngineGraphSessionModule,
  type EngineGraphSessionTargets,
} from "./engine-graph-session";
import type { EngineRuntimeContext } from "./engine-runtime-context";

type Call = {
  selector: string;
  name: string;
  value: unknown;
};

function createSelection(calls: Call[], selector: string) {
  const target = {
    attr: (name: string, value: unknown) => {
      calls.push({ selector, name, value });
      return target;
    },
    select: (nextSelector: string) => createSelection(calls, nextSelector),
    selectAll: (nextSelector: string) => createSelection(calls, nextSelector),
  };

  return target;
}

describe("EngineGraphSessionModule", () => {
  it("applies graph dimensions to the runtime graph and canvas masks", () => {
    const calls: Call[] = [];
    const root = createSelection(calls, "root");
    (globalThis as any).mapWidthInput = { value: "1200" };
    (globalThis as any).mapHeightInput = { value: "800" };
    (globalThis as any).landmass = root;
    (globalThis as any).oceanPattern = root;
    globalThis.oceanLayers = root as any;
    (globalThis as any).fogging = root;
    (globalThis as any).defs = root;

    new EngineGraphSessionModule().applyGraphSize();

    expect(globalThis.graphWidth).toBe(1200);
    expect(globalThis.graphHeight).toBe(800);
    expect(calls).toContainEqual({
      selector: "mask#fog > rect",
      name: "width",
      value: 1200,
    });
    expect(calls).toContainEqual({
      selector: "mask#water > rect",
      name: "height",
      value: 800,
    });
  });

  it("applies graph dimensions through injected targets", () => {
    const calls: Call[] = [];
    const root = createSelection(calls, "root");
    const targets: EngineGraphSessionTargets = {
      getMapWidth: () => 1400,
      getMapHeight: () => 900,
      setGraphSize: (width, height) => {
        calls.push({ selector: "graph", name: "width", value: width });
        calls.push({ selector: "graph", name: "height", value: height });
      },
      setRectBounds: (target, width, height) => {
        target
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height);
      },
      getLandmassRect: () => root.select("landmass"),
      getOceanPatternRect: () => root.select("oceanPattern"),
      getOceanLayersRect: () => root.select("oceanLayers"),
      getFoggingRects: () => root.selectAll("fogging"),
      getFogMaskRect: () => root.select("mask#fog > rect"),
      getWaterMaskRect: () => root.select("mask#water > rect"),
    };

    new EngineGraphSessionModule(targets).applyGraphSize();

    expect(calls).toContainEqual({
      selector: "graph",
      name: "width",
      value: 1400,
    });
    expect(calls).toContainEqual({
      selector: "mask#water > rect",
      name: "height",
      value: 900,
    });
  });

  it("writes graph dimensions into the runtime context before delegating", () => {
    const calls: Call[] = [];
    const root = createSelection(calls, "root");
    const context = {
      worldSettings: {
        graphWidth: 1600,
        graphHeight: 950,
      },
    } as EngineRuntimeContext;
    const fallback: EngineGraphSessionTargets = {
      getMapWidth: () => 1200,
      getMapHeight: () => 800,
      setGraphSize: (width, height) => {
        calls.push({ selector: "graph", name: "width", value: width });
        calls.push({ selector: "graph", name: "height", value: height });
      },
      setRectBounds: (target, width, height) => {
        target.attr("width", width).attr("height", height);
      },
      getLandmassRect: () => root.select("landmass"),
      getOceanPatternRect: () => root.select("oceanPattern"),
      getOceanLayersRect: () => root.select("oceanLayers"),
      getFoggingRects: () => root.selectAll("fogging"),
      getFogMaskRect: () => root.select("mask#fog > rect"),
      getWaterMaskRect: () => root.select("mask#water > rect"),
    };

    createRuntimeGraphSession(
      context,
      createRuntimeGraphSessionTargets(context, fallback),
    ).applyGraphSize();

    expect(context.worldSettings.graphWidth).toBe(1600);
    expect(context.worldSettings.graphHeight).toBe(950);
    expect(calls).toContainEqual({
      selector: "graph",
      name: "width",
      value: 1600,
    });
    expect(calls).toContainEqual({
      selector: "mask#water > rect",
      name: "height",
      value: 950,
    });
  });
});
