import type { EngineMapSnapshot } from "./engine-map-store";
import type { EngineNote, EngineNoteService } from "./engine-note-service";
import type { EngineRuntimeContext } from "./engine-runtime-context";

export function createTestNoteService(
  initialNotes: EngineNote[] = [],
): EngineNoteService {
  const notes = [...initialNotes];
  return {
    all: () => notes,
    push: (note) => {
      notes.push(note);
    },
    find: (predicate) => notes.find(predicate),
    findIndex: (predicate) => notes.findIndex(predicate),
    removeWhere: (predicate) => {
      for (let i = notes.length - 1; i >= 0; i--) {
        if (predicate(notes[i])) notes.splice(i, 1);
      }
    },
    splice: (start, deleteCount) => notes.splice(start, deleteCount),
  };
}

export function createTestRuntimeAdapters(): Pick<
  EngineRuntimeContext,
  | "routes"
  | "states"
  | "units"
  | "heraldry"
  | "mapStore"
  | "seedSession"
  | "graphSession"
  | "optionsSession"
  | "gridSession"
  | "sessionLifecycle"
  | "generationSession"
  | "lifecycle"
  | "feedback"
  | "random"
  | "rendering"
> {
  return {
    routes: {
      isCrossroad: () => false,
      isConnected: () => false,
      hasRoad: () => false,
      getRoute: () => undefined,
      getConnectivityRate: () => 0,
      buildLinks: () => [],
      connect: () => null,
      remove: () => {},
      findById: () => undefined,
    },
    states: {
      generateCampaign: () => [
        {
          name: "Test Campaign",
          start: 1,
          end: 100,
        },
      ],
      getPoles: () => {},
    },
    units: {
      height: "m",
    },
    heraldry: {
      generate: () => ({}),
      getShield: () => "heater",
      getRandomShield: () => "heater",
    },
    mapStore: {
      createSnapshot: () =>
        ({
          grid: { cells: {} },
          pack: { cells: {} },
          notes: [],
        }) as unknown as EngineMapSnapshot,
      resetPackForGeneration: () => {},
      resetForResample: () => {},
      getCurrentContext: () => ({}) as EngineRuntimeContext,
    },
    seedSession: {
      apply: () => "",
      resolve: () => "",
    } as EngineRuntimeContext["seedSession"],
    graphSession: {
      applyGraphSize: () => {},
    } as EngineRuntimeContext["graphSession"],
    optionsSession: {
      randomizeOptions: () => {},
    } as EngineRuntimeContext["optionsSession"],
    gridSession: {
      prepareGrid: () => {},
    },
    sessionLifecycle: {
      resetActiveView: () => {},
    },
    generationSession: {
      prepare: () => {},
    },
    lifecycle: {
      addLakesInDeepDepressions: () => {},
      openNearSeaLakes: () => {},
      drawOceanLayers: () => {},
      defineMapSize: () => {},
      calculateMapCoordinates: () => {},
      rebuildGraph: () => {},
      createDefaultRuler: () => {},
      showStatistics: () => {},
    },
    feedback: {
      showToast: () => {},
    },
    random: {
      next: () => 0.5,
    },
    rendering: {
      findCell: () => undefined,
      addBurgCoa: () => {},
      drawRoute: () => {},
      isLayerOn: () => false,
      drawBurg: () => {},
      removeBurg: () => {},
      removeBurgCoa: () => {},
      redrawIceberg: () => {},
      redrawGlacier: () => {},
      removeElementById: () => {},
      drawScaleBar: () => {},
    },
  };
}

export function createTestMapStore(snapshot: EngineMapSnapshot) {
  return {
    createSnapshot: () => snapshot,
    resetPackForGeneration: () => {},
    resetForResample: () => {},
    getCurrentContext: () => ({}) as EngineRuntimeContext,
  };
}
