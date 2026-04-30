import { describe, expect, it } from "vitest";
import type { PackedGraph } from "../types/PackedGraph";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import { MarkersModule } from "./markers-generator";
import {
  createTestNoteService,
  createTestRuntimeAdapters,
} from "./test-runtime-context";

function createMarkersContext(): EngineRuntimeContext {
  return {
    grid: {
      cells: {},
    },
    pack: {
      cells: {
        i: [],
      },
      markers: [{ i: 0, type: "stale", icon: "x", cell: 0 }],
    } as unknown as PackedGraph,
    options: {},
    seed: "markers-test",
    worldSettings: {},
    generationSettings: {
      pointsCount: 0,
      heightExponent: 1,
      lakeElevationLimit: 80,
      resolveDepressionsSteps: 100,
      religionsCount: 0,
      stateSizeVariety: 1,
      globalGrowthRate: 1,
      statesGrowthRate: 1,
    },
    populationSettings: {
      populationRate: 1,
      urbanDensity: 1,
      urbanization: 1,
    },
    naming: {
      getCulture: (culture) => `Culture ${culture}`,
      getCultureShort: (culture) => `C${culture}`,
      getState: (baseName, culture) => `${baseName} State ${culture}`,
    },
    ...createTestRuntimeAdapters(),
    notes: createTestNoteService(),
    timing: {
      shouldTime: false,
    },
    biomesData: {
      i: [],
      name: [],
      color: [],
      biomesMatrix: [],
      habitability: [],
      iconsDensity: [],
      icons: [],
      cost: [],
    },
  } as EngineRuntimeContext;
}

describe("MarkersModule", () => {
  it("generates markers against an explicit runtime context", () => {
    const context = createMarkersContext();
    const markers = new MarkersModule();
    markers.setConfig([]);

    markers.generate(context, false);

    expect(context.pack.markers).toEqual([]);
  });

  it("adds and deletes manual markers against an explicit runtime context", () => {
    const context = createMarkersContext();
    const markers = new MarkersModule();
    markers.setConfig([]);

    const marker = markers.add(
      { i: 0, type: "manual", icon: "x", cell: 4 },
      context,
    );
    context.notes.push({ id: `marker${marker.i}`, name: "Manual", legend: "" });

    expect(context.pack.markers).toContainEqual({
      i: 1,
      type: "manual",
      icon: "x",
      cell: 4,
    });

    markers.deleteMarker(marker.i, context);

    expect(context.pack.markers).toEqual([
      { i: 0, type: "stale", icon: "x", cell: 0 },
    ]);
    expect(context.notes.all()).toEqual([]);
  });
});
