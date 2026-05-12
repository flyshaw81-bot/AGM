import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGlobalMapGraphLifecycleService,
  createGlobalMapGraphLifecycleTargets,
  createMapGraphLifecycleService,
  rebuildEngineGraph,
} from "./engine-map-graph-lifecycle-service";

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalReGraph = globalThis.reGraph;
const originalCreateDefaultRuler = globalThis.createDefaultRuler;
const originalEngineMapGraphLifecycleDescriptor =
  Object.getOwnPropertyDescriptor(globalThis, "EngineMapGraphLifecycle");
const originalReGraphDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "reGraph",
);
const originalCreateDefaultRulerDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "createDefaultRuler",
);
const originalGridDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "grid",
);
const originalPackDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "pack",
);
const originalTimeDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "TIME",
);

function restoreGlobalDescriptor(
  name: string,
  descriptor?: PropertyDescriptor,
) {
  if (descriptor) {
    Object.defineProperty(globalThis, name, descriptor);
    return;
  }

  delete (globalThis as Record<string, unknown>)[name];
}

describe("EngineMapGraphLifecycleService", () => {
  afterEach(() => {
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as Record<string, unknown>).window;
    }
    if (originalReGraphDescriptor) {
      Object.defineProperty(globalThis, "reGraph", originalReGraphDescriptor);
    } else {
      Object.defineProperty(globalThis, "reGraph", {
        configurable: true,
        value: originalReGraph,
        writable: true,
      });
    }
    if (originalCreateDefaultRulerDescriptor) {
      Object.defineProperty(
        globalThis,
        "createDefaultRuler",
        originalCreateDefaultRulerDescriptor,
      );
    } else {
      Object.defineProperty(globalThis, "createDefaultRuler", {
        configurable: true,
        value: originalCreateDefaultRuler,
        writable: true,
      });
    }
    restoreGlobalDescriptor(
      "EngineMapGraphLifecycle",
      originalEngineMapGraphLifecycleDescriptor,
    );
    restoreGlobalDescriptor("grid", originalGridDescriptor);
    restoreGlobalDescriptor("pack", originalPackDescriptor);
    restoreGlobalDescriptor("TIME", originalTimeDescriptor);
  });

  it("routes graph lifecycle operations through injected targets", () => {
    const targets = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    const service = createMapGraphLifecycleService(targets);

    service.rebuildGraph();
    service.createDefaultRuler();

    expect(targets.rebuildGraph).toHaveBeenCalledWith();
    expect(targets.createDefaultRuler).toHaveBeenCalledWith();
  });

  it("rebuilds packed graph cells through injected graph targets", () => {
    const pack = {};
    const calculateVoronoi = vi.fn(() => ({
      cells: { i: [0, 1] },
      vertices: [[0, 0]],
    }));
    const createTypedArray = vi.fn(({ length, from }) =>
      from ? Array.from(from) : Array.from({ length }, () => 0),
    );

    rebuildEngineGraph({
      getGrid: () => ({
        spacing: 10,
        boundary: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        points: [
          [0, 0],
          [10, 0],
          [0, 10],
        ],
        features: [{ type: "ocean" }, { type: "land" }],
        cells: {
          i: [0, 1, 2],
          h: [10, 30, 30],
          t: [-2, 1, 1],
          f: [0, 1, 1],
          b: [false, false, false],
          c: [[1], [0, 2], [1]],
        },
      }),
      getPack: () => pack,
      calculateVoronoi: calculateVoronoi as never,
      createTypedArray: createTypedArray as never,
      getPackPolygon: vi.fn(() => [
        [0, 0],
        [2, 0],
        [0, 2],
      ]),
      polygonArea: vi.fn(() => 2),
      round: (value) => value,
      time: vi.fn(),
      timeEnd: vi.fn(),
    });

    expect(calculateVoronoi).toHaveBeenCalledWith(
      [
        [10, 0],
        [5, 5],
        [0, 10],
      ],
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
    );
    expect(pack).toMatchObject({
      vertices: [[0, 0]],
      cells: {
        i: [0, 1],
        p: [
          [10, 0],
          [5, 5],
          [0, 10],
        ],
        g: [1, 1, 2],
        h: [30, 30, 30],
        area: [2, 2],
      },
    });
  });

  it("keeps graph rebuild behind the module implementation", () => {
    globalThis.TIME = false;
    globalThis.reGraph = vi.fn();
    globalThis.createDefaultRuler = vi.fn();
    globalThis.grid = {
      spacing: 10,
      boundary: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      points: [
        [0, 0],
        [10, 0],
      ],
      features: [{ type: "ocean" }, { type: "land" }],
      cells: {
        i: [0, 1],
        h: [10, 30],
        t: [-2, 1],
        f: [0, 1],
        b: [false, false],
        c: [[1], [0]],
      },
    };
    globalThis.pack = {} as unknown as typeof globalThis.pack;
    const targets = createGlobalMapGraphLifecycleTargets();

    targets.rebuildGraph();
    targets.createDefaultRuler();

    expect(globalThis.reGraph).not.toHaveBeenCalled();
    expect(globalThis.createDefaultRuler).toHaveBeenCalledWith();
  });

  it("keeps global graph lifecycle targets safe when helper access throws", () => {
    Object.defineProperty(globalThis, "createDefaultRuler", {
      configurable: true,
      get: () => {
        throw new Error("createDefaultRuler blocked");
      },
    });
    const targets = createGlobalMapGraphLifecycleTargets();

    expect(() => targets.createDefaultRuler()).not.toThrow();
  });

  it("creates a global graph lifecycle service from explicit targets", () => {
    const targets = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };

    createGlobalMapGraphLifecycleService(targets).rebuildGraph();

    expect(targets.rebuildGraph).toHaveBeenCalledWith();
  });

  it("mounts the legacy reGraph compatibility entrypoint from the module", async () => {
    vi.resetModules();
    const service = {
      rebuildGraph: vi.fn(),
      createDefaultRuler: vi.fn(),
    };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
    });
    restoreGlobalDescriptor("EngineMapGraphLifecycle", undefined);
    restoreGlobalDescriptor("reGraph", undefined);

    await import("./engine-map-graph-lifecycle-service");
    globalThis.EngineMapGraphLifecycle = service;
    globalThis.reGraph();

    expect(service.rebuildGraph).toHaveBeenCalledWith();
  });
});
