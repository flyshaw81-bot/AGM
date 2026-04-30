import { describe, expect, it } from "vitest";
import {
  getEngineWorldDimensions,
  getGlobalEngineRuntimeContext,
} from "./engine-runtime-context";

describe("getGlobalEngineRuntimeContext", () => {
  it("assembles generation session services into the runtime context", () => {
    const originalDocument = globalThis.document;

    globalThis.document = {
      getElementById: () => null,
    } as unknown as Document;
    globalThis.grid = { cells: {} };
    const burg = { i: 2, name: "Runtime Burg" };
    const route = { i: 3, group: "roads" };
    globalThis.pack = {
      burgs: [undefined, undefined, burg],
      routes: [route],
    } as unknown as typeof pack;
    globalThis.options = {};
    globalThis.seed = "runtime";
    globalThis.mapCoordinates = {} as typeof mapCoordinates;
    globalThis.graphWidth = 100;
    globalThis.graphHeight = 100;
    globalThis.pointsInput = {
      dataset: { cells: "100" },
    } as unknown as HTMLInputElement;
    globalThis.heightExponentInput = {
      value: "1",
    } as HTMLInputElement;
    globalThis.precInput = {
      value: "100",
    } as HTMLInputElement;
    globalThis.prec = {} as typeof prec;
    const runtimeNotes = [{ id: "n1", name: "Runtime", legend: "Note" }];
    globalThis.notes = runtimeNotes;
    globalThis.populationRate = 1;
    globalThis.urbanDensity = 1;
    globalThis.urbanization = 1;
    globalThis.heightUnit = { value: "m" } as HTMLSelectElement;
    globalThis.TIME = false;
    globalThis.DEBUG = {};
    globalThis.biomesData = {
      i: [],
      name: [],
      color: [],
      biomesMatrix: [],
      habitability: [],
      iconsDensity: [],
      icons: [],
      cost: [],
    };
    globalThis.EngineSeedSession = {
      apply: (seed?: string) => seed || "runtime",
      resolve: (seed?: string) => seed || "generated",
    };
    globalThis.EngineGraphSession = {
      applyGraphSize: () => {},
    };
    globalThis.Burgs = {
      add: () => null,
      remove: () => {},
    } as unknown as typeof Burgs;

    const context = getGlobalEngineRuntimeContext();

    expect(typeof context.burgs.add).toBe("function");
    expect(context.burgs.findById(2)).toBe(burg);
    expect(context.routes.findById(3)).toBe(route);
    expect(context.worldSettingsStore?.get()).toBe(context.worldSettings);
    context.worldSettingsStore?.patch({ graphWidth: 128 });
    expect(context.worldSettings.graphWidth).toBe(128);
    expect(context.generationSettingsStore?.get()).toBe(
      context.generationSettings,
    );
    context.generationSettingsStore?.patch({ statesCount: 18 });
    expect(context.generationSettings.statesCount).toBe(18);
    const snapshot = context.mapStore.createSnapshot();
    expect(snapshot.grid).toEqual(globalThis.grid);
    expect(snapshot.pack).toEqual(globalThis.pack);
    expect(snapshot.notes).toEqual(runtimeNotes);
    expect(typeof context.mapGraphLifecycle?.rebuildGraph).toBe("function");
    expect(typeof context.mapGraphLifecycle?.createDefaultRuler).toBe(
      "function",
    );
    expect(typeof context.mapPlacement?.defineMapSize).toBe("function");
    expect(typeof context.mapPlacement?.calculateMapCoordinates).toBe(
      "function",
    );
    context.notes.push({ id: "n2", name: "Context", legend: "Note" });
    expect(context.notes.all().map((note) => note.id)).toEqual(["n1", "n2"]);
    context.grid = {
      seed: "runtime",
      cellsDesired: 100,
      spacing: 10,
      cellsX: 10,
      cellsY: 10,
      cells: { h: new Uint8Array([1]) },
    } as typeof grid;
    context.gridSession.prepareGrid({ seed: "runtime" });
    expect(context.grid.cells.h).toBeUndefined();
    expect(context.seedSession).not.toBe(globalThis.EngineSeedSession);
    expect(context.graphSession).not.toBe(globalThis.EngineGraphSession);
    expect(typeof context.optionsSession.randomizeOptions).toBe("function");
    expect(typeof context.generationStatistics?.showStatistics).toBe(
      "function",
    );
    expect(typeof context.gridSession.prepareGrid).toBe("function");
    expect(typeof context.sessionLifecycle.resetActiveView).toBe("function");
    expect(typeof context.generationSession.prepare).toBe("function");

    globalThis.document = originalDocument;
  });
});

describe("getEngineWorldDimensions", () => {
  it("prefers explicit runtime world dimensions", () => {
    const context = {
      worldSettings: {
        graphWidth: 320,
        graphHeight: 180,
      },
    } as ReturnType<typeof getGlobalEngineRuntimeContext>;

    expect(getEngineWorldDimensions(context)).toEqual({
      graphWidth: 320,
      graphHeight: 180,
    });
  });

  it("falls back to browser graph globals at the compatibility boundary", () => {
    const originalGraphWidth = globalThis.graphWidth;
    const originalGraphHeight = globalThis.graphHeight;

    try {
      globalThis.graphWidth = 960;
      globalThis.graphHeight = 540;
      const context = {
        worldSettings: {},
      } as ReturnType<typeof getGlobalEngineRuntimeContext>;

      expect(getEngineWorldDimensions(context)).toEqual({
        graphWidth: 960,
        graphHeight: 540,
      });
    } finally {
      globalThis.graphWidth = originalGraphWidth;
      globalThis.graphHeight = originalGraphHeight;
    }
  });
});
