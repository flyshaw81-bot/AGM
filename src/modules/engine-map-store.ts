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

export function createGlobalMapStore(
  getCurrentContext: () => EngineRuntimeContext,
): EngineMapStore {
  return {
    createSnapshot: () => ({
      grid: structuredClone(grid),
      pack: structuredClone(pack),
      notes: structuredClone(notes),
    }),
    resetPackForGeneration: () => {
      pack = {} as PackedGraph;
    },
    resetForResample: (snapshot) => {
      grid = generateGrid(seed, graphWidth, graphHeight);
      pack = {} as PackedGraph;
      notes = snapshot.notes;
    },
    getCurrentContext,
  };
}
