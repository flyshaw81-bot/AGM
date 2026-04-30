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
  setGrid: (nextGrid: typeof grid) => void;
  setPack: (nextPack: PackedGraph) => void;
  setNotes: (nextNotes: EngineNote[]) => void;
  createGrid: () => typeof grid;
};

export function createGlobalMapStoreRuntimeAdapter(): EngineMapStoreRuntimeAdapter {
  return {
    getGrid: () => grid,
    getPack: () => pack,
    getNotes: () => notes,
    setGrid: (nextGrid) => {
      grid = nextGrid;
    },
    setPack: (nextPack) => {
      pack = nextPack;
    },
    setNotes: (nextNotes) => {
      notes = nextNotes;
    },
    createGrid: () => generateGrid(seed, graphWidth, graphHeight),
  };
}

export function createMapStore(
  runtimeAdapter: EngineMapStoreRuntimeAdapter,
  getCurrentContext: () => EngineRuntimeContext,
): EngineMapStore {
  return {
    createSnapshot: () => ({
      grid: structuredClone(runtimeAdapter.getGrid()),
      pack: structuredClone(runtimeAdapter.getPack()),
      notes: structuredClone(runtimeAdapter.getNotes()),
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
