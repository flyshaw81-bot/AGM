import type { PackedGraph } from "../types/PackedGraph";
import { generateGrid } from "../utils/graphUtils";
import type { EngineNote } from "./engine-note-service";
import type { EngineRuntimeContext } from "./engine-runtime-context";

export type EngineMapSnapshot = {
  grid: typeof grid;
  pack: PackedGraph;
  notes: EngineNote[];
};

export type EngineMapStore = {
  createSnapshot: () => EngineMapSnapshot;
  resetPackForGeneration: () => void;
  resetForResample: (snapshot: EngineMapSnapshot) => void;
  getCurrentContext: () => EngineRuntimeContext;
};

export type EngineMapStoreRuntimeAdapter = {
  getGrid: () => typeof grid;
  getPack: () => PackedGraph;
  getNotes: () => EngineNote[];
  clone: <T>(value: T) => T;
  setGrid: (nextGrid: typeof grid) => void;
  setPack: (nextPack: PackedGraph) => void;
  setNotes: (nextNotes: EngineNote[]) => void;
  createGrid: () => typeof grid;
};

export type EngineMapStoreGlobalTargets = {
  clone: <T>(value: T) => T;
  createGrid: () => typeof grid;
  getGrid: () => typeof grid;
  getNotes: () => EngineNote[];
  getPack: () => PackedGraph;
  setGrid: (nextGrid: typeof grid) => void;
  setNotes: (nextNotes: EngineNote[]) => void;
  setPack: (nextPack: PackedGraph) => void;
};

export function createGlobalMapStoreTargets(): EngineMapStoreGlobalTargets {
  return {
    getGrid: () => getGlobalValue<typeof grid>("grid", {} as typeof grid),
    getPack: () => getGlobalValue<PackedGraph>("pack", {} as PackedGraph),
    getNotes: () => getGlobalValue<EngineNote[]>("notes", []),
    clone: (value) =>
      getGlobalFunction<typeof structuredClone>("structuredClone")?.(value) ??
      cloneFallback(value),
    setGrid: (nextGrid) => {
      setGlobalValue("grid", nextGrid);
    },
    setPack: (nextPack) => {
      setGlobalValue("pack", nextPack);
    },
    setNotes: (nextNotes) => {
      setGlobalValue("notes", nextNotes);
    },
    createGrid: () =>
      generateGrid(
        getGlobalValue<string>("seed", ""),
        getGlobalValue<number>("graphWidth", 0),
        getGlobalValue<number>("graphHeight", 0),
      ),
  };
}

export function createGlobalMapStoreRuntimeAdapter(
  targets: EngineMapStoreGlobalTargets = createGlobalMapStoreTargets(),
): EngineMapStoreRuntimeAdapter {
  return {
    getGrid: targets.getGrid,
    getPack: targets.getPack,
    getNotes: targets.getNotes,
    clone: targets.clone,
    setGrid: targets.setGrid,
    setPack: targets.setPack,
    setNotes: targets.setNotes,
    createGrid: targets.createGrid,
  };
}

export type RuntimeMapStoreGridFactory = () => typeof grid;

export function createRuntimeMapStoreRuntimeAdapter(
  context: EngineRuntimeContext,
  createGrid: RuntimeMapStoreGridFactory,
): EngineMapStoreRuntimeAdapter {
  return {
    getGrid: () => context.grid,
    getPack: () => context.pack,
    getNotes: () => context.notes.all(),
    clone: (value) => structuredClone(value),
    setGrid: (nextGrid) => {
      context.grid = nextGrid;
    },
    setPack: (nextPack) => {
      context.pack = nextPack;
    },
    setNotes: (nextNotes) => {
      const notes = context.notes.all();
      notes.splice(0, notes.length, ...nextNotes);
    },
    createGrid,
  };
}

export function createMapStore(
  runtimeAdapter: EngineMapStoreRuntimeAdapter,
  getCurrentContext: () => EngineRuntimeContext,
): EngineMapStore {
  return {
    createSnapshot: () => ({
      grid: runtimeAdapter.clone(runtimeAdapter.getGrid()),
      pack: runtimeAdapter.clone(runtimeAdapter.getPack()),
      notes: runtimeAdapter.clone(runtimeAdapter.getNotes()),
    }),
    resetPackForGeneration: () => {
      runtimeAdapter.setPack({} as PackedGraph);
    },
    resetForResample: (snapshot) => {
      runtimeAdapter.setGrid(runtimeAdapter.createGrid());
      runtimeAdapter.setPack({} as PackedGraph);
      runtimeAdapter.setNotes(snapshot.notes);
    },
    getCurrentContext,
  };
}

export function createGlobalMapStore(
  getCurrentContext: () => EngineRuntimeContext,
): EngineMapStore {
  return createMapStore(
    createGlobalMapStoreRuntimeAdapter(),
    getCurrentContext,
  );
}

export function createRuntimeMapStore(
  context: EngineRuntimeContext,
  getCurrentContext: () => EngineRuntimeContext,
  createGrid: RuntimeMapStoreGridFactory = () =>
    generateGrid(
      context.seed,
      Number(context.worldSettings.graphWidth) || 0,
      Number(context.worldSettings.graphHeight) || 0,
    ),
): EngineMapStore {
  return createMapStore(
    createRuntimeMapStoreRuntimeAdapter(context, createGrid),
    getCurrentContext,
  );
}

function getGlobalValue<T>(name: string, fallback: T): T {
  try {
    return (
      ((globalThis as Record<string, unknown>)[name] as T | undefined) ??
      fallback
    );
  } catch {
    return fallback;
  }
}

function setGlobalValue(name: string, value: unknown): void {
  try {
    (globalThis as Record<string, unknown>)[name] = value;
  } catch {
    // Blocked compatibility globals degrade to no-op writes.
  }
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

function cloneFallback<T>(value: T): T {
  if (Array.isArray(value)) return [...value] as T;
  if (value && typeof value === "object") return { ...value };
  return value;
}
