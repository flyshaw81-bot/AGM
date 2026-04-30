import { generateGrid, shouldRegenerateGrid } from "../utils/graphUtils";
import type { EngineGraphSessionModule as EngineGraphSessionService } from "./engine-graph-session";
import {
  EngineOptionsSession,
  type EngineOptionsSessionModule,
} from "./engine-options-session";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import type { EngineSeedSessionModule as EngineSeedSessionService } from "./engine-seed-session";

export type EngineGenerationSessionRequest = {
  seed?: string;
  graph?: typeof grid;
};

export type EngineGridSessionService = {
  prepareGrid: (request?: EngineGenerationSessionRequest) => void;
};

export type EngineGenerationSessionLifecycle = {
  resetActiveView: () => void;
};

export type EngineGenerationSessionServices = {
  sessionLifecycle: EngineGenerationSessionLifecycle;
  seedSession: EngineSeedSessionService;
  graphSession: EngineGraphSessionService;
  optionsSession: EngineOptionsSessionModule;
  gridSession: EngineGridSessionService;
};

export type EngineGenerationSessionAdapter = {
  prepare: (
    request?: EngineGenerationSessionRequest,
    context?: EngineRuntimeContext,
  ) => void;
};

export function createGlobalGridSessionService(): EngineGridSessionService {
  return {
    prepareGrid: (request = {}) => {
      const precreatedSeed = request.seed;

      if (
        shouldRegenerateGrid(
          globalThis.grid,
          precreatedSeed as any,
          globalThis.graphWidth,
          globalThis.graphHeight,
        )
      ) {
        globalThis.grid =
          request.graph ||
          generateGrid(
            globalThis.seed,
            globalThis.graphWidth,
            globalThis.graphHeight,
          );
      } else {
        delete globalThis.grid.cells.h;
      }
    },
  };
}

export function createGlobalGenerationSessionLifecycle(): EngineGenerationSessionLifecycle {
  return {
    resetActiveView: () => {
      invokeActiveZooming();
    },
  };
}

export function createGlobalGenerationSessionServices(): EngineGenerationSessionServices {
  return {
    sessionLifecycle: createGlobalGenerationSessionLifecycle(),
    seedSession: EngineSeedSession,
    graphSession: EngineGraphSession,
    optionsSession: EngineOptionsSession,
    gridSession: createGlobalGridSessionService(),
  };
}

export function createGlobalGenerationSessionAdapter(): EngineGenerationSessionAdapter {
  return {
    prepare: (request = {}, context) => {
      const precreatedSeed = request.seed;
      let fallback: EngineGenerationSessionServices | undefined;
      const getFallback = () => {
        fallback ??= createGlobalGenerationSessionServices();
        return fallback;
      };
      const services = {
        sessionLifecycle:
          context?.sessionLifecycle ?? getFallback().sessionLifecycle,
        seedSession: context?.seedSession ?? getFallback().seedSession,
        graphSession: context?.graphSession ?? getFallback().graphSession,
        optionsSession: context?.optionsSession ?? getFallback().optionsSession,
        gridSession: context?.gridSession ?? getFallback().gridSession,
      };

      services.sessionLifecycle.resetActiveView();
      services.seedSession.apply(precreatedSeed);
      services.graphSession.applyGraphSize();
      services.optionsSession.randomizeOptions();
      services.gridSession.prepareGrid(request);
    },
  };
}
