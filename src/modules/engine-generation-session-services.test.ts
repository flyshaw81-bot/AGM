import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGenerationSessionAdapter,
  createGenerationSessionLifecycle,
  createGlobalGenerationSessionAdapter,
  createGlobalGenerationSessionLifecycleTargets,
  createGlobalGenerationSessionServices,
  createGridSessionService,
} from "./engine-generation-session-services";
import { EngineOptionsSession } from "./engine-options-session";

describe("createGlobalGenerationSessionServices", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("assembles the default compatibility session services", () => {
    const seedSession = {
      apply: vi.fn(() => "seed"),
      resolve: vi.fn(() => "seed"),
    };
    const graphSession = {
      applyGraphSize: vi.fn(),
    };
    vi.stubGlobal("EngineSeedSession", seedSession);
    vi.stubGlobal("EngineGraphSession", graphSession);

    const services = createGlobalGenerationSessionServices();

    expect(services.seedSession).toBe(seedSession);
    expect(services.graphSession).toBe(graphSession);
    expect(services.optionsSession).toBe(EngineOptionsSession);
    expect(typeof services.gridSession.prepareGrid).toBe("function");
    expect(typeof services.sessionLifecycle.resetActiveView).toBe("function");
  });

  it("composes grid session service from injected targets", () => {
    const currentGrid = {
      cells: { h: new Uint8Array([1]) },
    } as typeof grid;
    const generatedGrid = {
      cells: { i: [1] },
    } as typeof grid;
    const targets = {
      getGrid: vi.fn(() => currentGrid),
      setGrid: vi.fn(),
      getSeed: vi.fn(() => "target-seed"),
      getGraphWidth: vi.fn(() => 900),
      getGraphHeight: vi.fn(() => 600),
      generateGrid: vi.fn(() => generatedGrid),
      shouldRegenerateGrid: vi.fn(() => true),
    };

    createGridSessionService(targets).prepareGrid();

    expect(targets.shouldRegenerateGrid).toHaveBeenCalledWith(
      currentGrid,
      Number.NaN,
      900,
      600,
    );
    expect(targets.generateGrid).toHaveBeenCalledWith("target-seed", 900, 600);
    expect(targets.setGrid).toHaveBeenCalledWith(generatedGrid);
  });

  it("clears injected heightmap cells when grid regeneration is not required", () => {
    const currentGrid = {
      cells: { h: new Uint8Array([1]) },
    } as typeof grid;

    createGridSessionService({
      getGrid: () => currentGrid,
      setGrid: vi.fn(),
      getSeed: () => "target-seed",
      getGraphWidth: () => 900,
      getGraphHeight: () => 600,
      generateGrid: vi.fn(),
      shouldRegenerateGrid: () => false,
    }).prepareGrid({ seed: "target-seed" });

    expect(currentGrid.cells.h).toBeUndefined();
  });

  it("composes session lifecycle from injected targets", () => {
    const targets = {
      invokeActiveZooming: vi.fn(),
    };

    createGenerationSessionLifecycle(targets).resetActiveView();

    expect(targets.invokeActiveZooming).toHaveBeenCalledWith();
  });

  it("keeps active-view reset inside default lifecycle targets", () => {
    const invokeActiveZooming = vi.fn();
    vi.stubGlobal("invokeActiveZooming", invokeActiveZooming);

    createGlobalGenerationSessionLifecycleTargets().invokeActiveZooming();

    expect(invokeActiveZooming).toHaveBeenCalledWith();
  });
});

describe("createGlobalGenerationSessionAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses a complete runtime service set without touching global fallback services", () => {
    const calls: string[] = [];

    createGlobalGenerationSessionAdapter().prepare({ seed: "runtime-seed" }, {
      sessionLifecycle: {
        resetActiveView: () => {
          calls.push("reset");
        },
      },
      seedSession: {
        apply: (seed?: string) => {
          calls.push(`seed:${seed}`);
          return seed || "";
        },
        resolve: (seed?: string) => seed || "",
      },
      graphSession: {
        applyGraphSize: () => {
          calls.push("graph");
        },
      },
      optionsSession: {
        randomizeOptions: () => {
          calls.push("options");
        },
      },
      gridSession: {
        prepareGrid: (request?: { seed?: string }) => {
          calls.push(`grid:${request?.seed}`);
        },
      },
    } as any);

    expect(calls).toEqual([
      "reset",
      "seed:runtime-seed",
      "graph",
      "options",
      "grid:runtime-seed",
    ]);
  });

  it("composes generation session adapter with an injected fallback factory", () => {
    const calls: string[] = [];
    const createFallbackServices = vi.fn(() => ({
      sessionLifecycle: {
        resetActiveView: () => {
          calls.push("reset");
        },
      },
      seedSession: {
        apply: (seed?: string) => {
          calls.push(`seed:${seed}`);
          return seed || "";
        },
        resolve: (seed?: string) => seed || "",
      },
      graphSession: {
        applyGraphSize: () => {
          calls.push("graph");
        },
      },
      optionsSession: {
        randomizeOptions: () => {
          calls.push("options");
        },
      },
      gridSession: {
        prepareGrid: (request?: { seed?: string }) => {
          calls.push(`grid:${request?.seed}`);
        },
      },
    }));

    createGenerationSessionAdapter(createFallbackServices as never).prepare({
      seed: "fallback-seed",
    });

    expect(calls).toEqual([
      "reset",
      "seed:fallback-seed",
      "graph",
      "options",
      "grid:fallback-seed",
    ]);
    expect(createFallbackServices).toHaveBeenCalledTimes(1);
  });

  it("falls back to compatibility services and clears stale heightmap cells", () => {
    const calls: string[] = [];
    const originalRandomizeOptions = EngineOptionsSession.randomizeOptions;
    const originalDocument = globalThis.document;

    globalThis.document = {
      getElementById: (id: string) =>
        id === "pointsInput" ? { dataset: { cells: "100" } } : null,
    } as unknown as Document;
    globalThis.graphWidth = 100;
    globalThis.graphHeight = 100;
    globalThis.seed = "session";
    globalThis.grid = {
      seed: "session",
      cellsDesired: 100,
      spacing: 10,
      cellsX: 10,
      cellsY: 10,
      cells: {
        h: new Uint8Array([1, 2, 3]),
      },
    };
    globalThis.invokeActiveZooming = () => {
      calls.push("reset");
    };
    vi.stubGlobal("EngineSeedSession", {
      apply: (seed?: string) => {
        calls.push(`seed:${seed}`);
        return seed || "";
      },
      resolve: (seed?: string) => seed || "",
    });
    vi.stubGlobal("EngineGraphSession", {
      applyGraphSize: () => {
        calls.push("graph");
      },
    });
    EngineOptionsSession.randomizeOptions = () => {
      calls.push("options");
    };

    createGlobalGenerationSessionAdapter().prepare({ seed: "session" });

    expect(calls).toEqual(["reset", "seed:session", "graph", "options"]);
    expect(globalThis.grid.cells.h).toBeUndefined();

    EngineOptionsSession.randomizeOptions = originalRandomizeOptions;
    globalThis.document = originalDocument;
  });
});
