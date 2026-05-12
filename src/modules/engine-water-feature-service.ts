import { byId } from "../utils/shorthands";
import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineWaterFeatureService = {
  addLakesInDeepDepressions: (
    context: EngineRuntimeContext,
    lakeElevationLimit: number,
  ) => void;
  openNearSeaLakes: (
    context: EngineRuntimeContext,
    heightmapTemplateId: string | undefined,
  ) => void;
  drawOceanLayers: (context: EngineRuntimeContext) => void;
  isWetLand: (moisture: number, temperature: number, height: number) => boolean;
};

export type EngineWaterFeatureTargets = EngineWaterFeatureService;

type MutableGrid = {
  cells: {
    b: Record<number, boolean>;
    c: Record<number, number[]>;
    f: Record<number, number>;
    h: Record<number, number>;
    i: number[];
    t: Record<number, number>;
  };
  features: Array<{
    border?: boolean;
    i?: number;
    land?: boolean;
    type: string;
  }>;
};

declare global {
  var EngineWaterFeatureService: EngineWaterFeatureService;

  interface Window {
    EngineWaterFeatureService: EngineWaterFeatureService;
    isWetLand: (
      moisture: number,
      temperature: number,
      height: number,
    ) => boolean;
  }
}

export function createWaterFeatureService(
  targets: EngineWaterFeatureTargets,
): EngineWaterFeatureService {
  return {
    addLakesInDeepDepressions: (context, lakeElevationLimit) => {
      targets.addLakesInDeepDepressions(context, lakeElevationLimit);
    },
    openNearSeaLakes: (context, heightmapTemplateId) => {
      targets.openNearSeaLakes(context, heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      targets.drawOceanLayers(context);
    },
    isWetLand: (moisture, temperature, height) => {
      return targets.isWetLand(moisture, temperature, height);
    },
  };
}

function getGlobalFunction<T extends (...args: never[]) => unknown>(
  name: string,
): T | undefined {
  try {
    const value = (globalThis as Record<string, unknown>)[name];
    return typeof value === "function" ? (value as T) : undefined;
  } catch {
    return undefined;
  }
}

function isMutableGrid(candidateGrid: unknown): candidateGrid is MutableGrid {
  if (!candidateGrid || typeof candidateGrid !== "object") return false;
  const candidate = candidateGrid as Partial<MutableGrid>;
  const cells = candidate.cells;
  return Boolean(
    cells &&
      Array.isArray(cells.i) &&
      cells.b &&
      cells.c &&
      cells.f &&
      cells.h &&
      cells.t &&
      Array.isArray(candidate.features),
  );
}

export function addLakesInDeepDepressionsForGrid(
  grid: MutableGrid,
  lakeElevationLimit: number,
): void {
  const elevationLimit = lakeElevationLimit;
  if (elevationLimit === 80) return;

  const { cells, features } = grid;
  const { c, h, b } = cells;

  for (const i of cells.i) {
    if (b[i] || h[i] < 20) continue;

    const minHeight = Math.min(...c[i].map((cellId) => h[cellId]));
    if (h[i] > minHeight) continue;

    let deep = true;
    const threshold = h[i] + elevationLimit;
    const queue = [i];
    const checked: boolean[] = [];
    checked[i] = true;

    while (deep && queue.length) {
      const q = queue.pop();
      if (q === undefined) break;

      for (const n of c[q]) {
        if (checked[n]) continue;
        if (h[n] >= threshold) continue;
        if (h[n] < 20) {
          deep = false;
          break;
        }

        checked[n] = true;
        queue.push(n);
      }
    }

    if (deep) {
      const lakeCells = [i].concat(c[i].filter((cellId) => h[cellId] === h[i]));
      addLake(cells, features, lakeCells);
    }
  }
}

function addLake(
  cells: MutableGrid["cells"],
  features: MutableGrid["features"],
  lakeCells: number[],
): void {
  const featureId = features.length;

  lakeCells.forEach((cellId) => {
    cells.h[cellId] = 19;
    cells.t[cellId] = -1;
    cells.f[cellId] = featureId;
    cells.c[cellId].forEach((neighborId) => {
      if (!lakeCells.includes(neighborId)) {
        cells.t[cells.c as unknown as number] = 1;
      }
    });
  });

  features.push({ i: featureId, land: false, border: false, type: "lake" });
}

export function openNearSeaLakesForGrid(
  grid: MutableGrid,
  heightmapTemplateId: string | undefined,
): void {
  if (heightmapTemplateId === "Atoll") return;

  const cells = grid.cells;
  const features = grid.features;
  if (!features.find((feature) => feature.type === "lake")) return;
  const limit = 22;

  for (const i of cells.i) {
    const lakeFeatureId = cells.f[i];
    if (features[lakeFeatureId]?.type !== "lake") continue;

    check_neighbours: for (const c of cells.c[i]) {
      if (cells.t[c] !== 1 || cells.h[c] > limit) continue;

      for (const n of cells.c[c]) {
        const ocean = cells.f[n];
        if (features[ocean]?.type !== "ocean") continue;
        removeLake(cells, features, c, lakeFeatureId, ocean);
        break check_neighbours;
      }
    }
  }
}

function removeLake(
  cells: MutableGrid["cells"],
  features: MutableGrid["features"],
  thresholdCellId: number,
  lakeFeatureId: number,
  oceanFeatureId: number,
): void {
  cells.h[thresholdCellId] = 19;
  cells.t[thresholdCellId] = -1;
  cells.f[thresholdCellId] = oceanFeatureId;
  cells.c[thresholdCellId].forEach((cellId) => {
    if (cells.h[cellId] >= 20) cells.t[cellId] = 1;
  });

  cells.i.forEach((cellId) => {
    if (cells.f[cellId] === lakeFeatureId) cells.f[cellId] = oceanFeatureId;
  });
  features[lakeFeatureId].type = "ocean";
}

export function isWetLand(
  moisture: number,
  temperature: number,
  height: number,
): boolean {
  if (moisture > 40 && temperature > -2 && height < 25) return true;
  if (moisture > 24 && temperature > -2 && height > 24 && height < 60) {
    return true;
  }
  return false;
}

export function createGlobalWaterFeatureTargets(): EngineWaterFeatureTargets {
  return {
    addLakesInDeepDepressions: (context, lakeElevationLimit) => {
      if (!isMutableGrid(context.grid)) return;
      addLakesInDeepDepressionsForGrid(context.grid, lakeElevationLimit);
    },
    openNearSeaLakes: (context, heightmapTemplateId) => {
      if (!isMutableGrid(context.grid)) return;
      openNearSeaLakesForGrid(context.grid, heightmapTemplateId);
    },
    drawOceanLayers: (context) => {
      getGlobalFunction<(context: EngineRuntimeContext) => void>(
        "OceanLayers",
      )?.(context);
    },
    isWetLand,
  };
}

export function createGlobalWaterFeatureService(
  targets: EngineWaterFeatureTargets = createGlobalWaterFeatureTargets(),
): EngineWaterFeatureService {
  return createWaterFeatureService(targets);
}

function getRuntimeWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

type WaterRuntimeWindow = Window & {
  TIME?: boolean;
  grid: unknown;
  addLakesInDeepDepressions?: (lakeElevationLimit?: number) => void;
  openNearSeaLakes?: (heightmapTemplateId?: string) => void;
};

const runtimeWindow = getRuntimeWindow() as WaterRuntimeWindow | undefined;
if (runtimeWindow) {
  runtimeWindow.EngineWaterFeatureService = createGlobalWaterFeatureService();
  runtimeWindow.addLakesInDeepDepressions = (lakeElevationLimit?: number) => {
    if (runtimeWindow.TIME) console.time("addLakesInDeepDepressions");
    runtimeWindow.EngineWaterFeatureService.addLakesInDeepDepressions(
      { grid: runtimeWindow.grid } as EngineRuntimeContext,
      lakeElevationLimit ??
        Number(byId<HTMLInputElement>("lakeElevationLimitOutput")?.value),
    );
    if (runtimeWindow.TIME) console.timeEnd("addLakesInDeepDepressions");
  };
  runtimeWindow.openNearSeaLakes = (heightmapTemplateId?: string) => {
    if (runtimeWindow.TIME) console.time("openLakes");
    runtimeWindow.EngineWaterFeatureService.openNearSeaLakes(
      { grid: runtimeWindow.grid } as EngineRuntimeContext,
      heightmapTemplateId ?? byId<HTMLInputElement>("templateInput")?.value,
    );
    if (runtimeWindow.TIME) console.timeEnd("openLakes");
  };
  runtimeWindow.isWetLand = isWetLand;
}
