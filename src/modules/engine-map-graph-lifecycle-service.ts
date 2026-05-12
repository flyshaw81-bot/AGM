import { createTypedArray, TYPED_ARRAY_MAX_VALUES } from "../utils/arrayUtils";
import { calculateVoronoi, getPackPolygon } from "../utils/graphUtils";
import { rn } from "../utils/numberUtils";
import { polygonArea } from "../utils/polygonUtils";
import {
  getBrowserRuntimeGrid,
  getBrowserRuntimePack,
} from "./engine-browser-runtime-globals";
import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineMapGraphLifecycleService = {
  rebuildGraph: () => void;
  createDefaultRuler: () => void;
};

export type EngineMapGraphLifecycleTargets = EngineMapGraphLifecycleService;

export type EngineGraphRebuildTargets = {
  getGrid: () => any;
  getPack: () => any;
  calculateVoronoi: typeof calculateVoronoi;
  createTypedArray: typeof createTypedArray;
  getPackPolygon: typeof getPackPolygon;
  polygonArea: typeof polygonArea;
  round: typeof rn;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
};

declare global {
  var EngineMapGraphLifecycle: EngineMapGraphLifecycleService;

  interface Window {
    EngineMapGraphLifecycle: EngineMapGraphLifecycleService;
    reGraph: () => void;
  }
}

export function createMapGraphLifecycleService(
  targets: EngineMapGraphLifecycleTargets,
): EngineMapGraphLifecycleService {
  return {
    rebuildGraph: () => {
      targets.rebuildGraph();
    },
    createDefaultRuler: () => {
      targets.createDefaultRuler();
    },
  };
}

export function createGlobalGraphRebuildTargets(): EngineGraphRebuildTargets {
  return {
    getGrid: () => getBrowserRuntimeGrid(),
    getPack: () => getBrowserRuntimePack(),
    calculateVoronoi,
    createTypedArray,
    getPackPolygon,
    polygonArea,
    round: rn,
    time: (label) => {
      if (globalThis.TIME) console.time(label);
    },
    timeEnd: (label) => {
      if (globalThis.TIME) console.timeEnd(label);
    },
  };
}

export function createRuntimeGraphRebuildTargets(
  context: EngineRuntimeContext,
  globalTargets: EngineGraphRebuildTargets = createGlobalGraphRebuildTargets(),
): EngineGraphRebuildTargets {
  return {
    ...globalTargets,
    getGrid: () => context.grid,
    getPack: () => context.pack,
    time: (label) => {
      if (context.timing.shouldTime) console.time(label);
    },
    timeEnd: (label) => {
      if (context.timing.shouldTime) console.timeEnd(label);
    },
  };
}

export function rebuildEngineGraph(
  targets: EngineGraphRebuildTargets = createGlobalGraphRebuildTargets(),
) {
  targets.time("reGraph");
  const grid = targets.getGrid();
  const pack = targets.getPack();
  const { cells: gridCells, points, features } = grid;
  const newCells: { p: Array<[number, number]>; g: number[]; h: number[] } = {
    p: [],
    g: [],
    h: [],
  };
  const spacing2 = grid.spacing ** 2;

  for (const i of gridCells.i) {
    const height = gridCells.h[i];
    const type = gridCells.t[i];

    if (height < 20 && type !== -1 && type !== -2) continue;
    if (
      type === -2 &&
      (i % 4 === 0 || features[gridCells.f[i]].type === "lake")
    )
      continue;

    const [x, y] = points[i];
    addNewPoint(i, x, y, height);

    if (type === 1 || type === -1) {
      if (gridCells.b[i]) continue;
      gridCells.c[i].forEach((e: number) => {
        if (i > e) return;
        if (gridCells.t[e] === type) {
          const dist2 = (y - points[e][1]) ** 2 + (x - points[e][0]) ** 2;
          if (dist2 < spacing2) return;
          const x1 = targets.round((x + points[e][0]) / 2, 1);
          const y1 = targets.round((y + points[e][1]) / 2, 1);
          addNewPoint(i, x1, y1, height);
        }
      });
    }
  }

  function addNewPoint(i: number, x: number, y: number, height: number) {
    newCells.p.push([x, y]);
    newCells.g.push(i);
    newCells.h.push(height);
  }

  const { cells: packCells, vertices } = targets.calculateVoronoi(
    newCells.p,
    grid.boundary,
  );
  pack.vertices = vertices;
  pack.cells = packCells;
  pack.cells.p = newCells.p;
  pack.cells.g = targets.createTypedArray({
    maxValue: grid.points.length,
    length: newCells.g.length,
    from: newCells.g,
  });
  pack.cells.h = targets.createTypedArray({
    maxValue: 100,
    length: newCells.h.length,
    from: newCells.h,
  });
  pack.cells.area = targets
    .createTypedArray({
      maxValue: TYPED_ARRAY_MAX_VALUES.UINT16_MAX,
      length: packCells.i.length,
    })
    .map((_, cellId) => {
      const area = Math.abs(
        targets.polygonArea(targets.getPackPolygon(cellId, pack)),
      );
      return Math.min(area, TYPED_ARRAY_MAX_VALUES.UINT16_MAX);
    });

  targets.timeEnd("reGraph");
}

function getGlobalFunction(name: string): (() => void) | undefined {
  try {
    const value = (globalThis as Record<string, unknown>)[name];
    return typeof value === "function" ? (value as () => void) : undefined;
  } catch {
    return undefined;
  }
}

export function createGlobalMapGraphLifecycleTargets(): EngineMapGraphLifecycleTargets {
  return {
    rebuildGraph: () => {
      rebuildEngineGraph();
    },
    createDefaultRuler: () => {
      getGlobalFunction("createDefaultRuler")?.();
    },
  };
}

export function createRuntimeMapGraphLifecycleTargets(
  context: EngineRuntimeContext,
): EngineMapGraphLifecycleTargets {
  return {
    rebuildGraph: () => {
      rebuildEngineGraph(createRuntimeGraphRebuildTargets(context));
    },
    createDefaultRuler: () => {
      getGlobalFunction("createDefaultRuler")?.();
    },
  };
}

export function createGlobalMapGraphLifecycleService(
  targets: EngineMapGraphLifecycleTargets = createGlobalMapGraphLifecycleTargets(),
): EngineMapGraphLifecycleService {
  return createMapGraphLifecycleService(targets);
}

export function createRuntimeMapGraphLifecycleService(
  context: EngineRuntimeContext,
  targets: EngineMapGraphLifecycleTargets = createRuntimeMapGraphLifecycleTargets(
    context,
  ),
): EngineMapGraphLifecycleService {
  return createMapGraphLifecycleService(targets);
}

function getWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.EngineMapGraphLifecycle =
    createGlobalMapGraphLifecycleService();
  runtimeWindow.reGraph = () => {
    runtimeWindow.EngineMapGraphLifecycle.rebuildGraph();
  };
}
