import { describe, expect, it } from "vitest";
import { getGlobalEngineRuntimeContext } from "./engine-runtime-context";

describe("getGlobalEngineRuntimeContext", () => {
  it("assembles generation session services into the runtime context", () => {
    const originalDocument = globalThis.document;

    globalThis.document = {
      getElementById: () => null,
    } as unknown as Document;
    globalThis.grid = { cells: {} };
    globalThis.pack = {} as typeof pack;
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
    globalThis.notes = [];
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
    expect(context.seedSession).toBe(globalThis.EngineSeedSession);
    expect(context.graphSession).toBe(globalThis.EngineGraphSession);
    expect(typeof context.optionsSession.randomizeOptions).toBe("function");
    expect(typeof context.gridSession.prepareGrid).toBe("function");
    expect(typeof context.sessionLifecycle.resetActiveView).toBe("function");
    expect(typeof context.generationSession.prepare).toBe("function");

    globalThis.document = originalDocument;
  });
});
