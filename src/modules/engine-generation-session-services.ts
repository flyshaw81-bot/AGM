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

export type EngineGridSessionTargets = {
  getGrid: () => typeof grid;
  setGrid: (nextGrid: typeof grid) => void;
  getSeed: () => string;
  getGraphWidth: () => number;
  getGraphHeight: () => number;
  generateGrid: (
    seed: string,
    graphWidth: number,
    graphHeight: number,
  ) => typeof grid;
  shouldRegenerateGrid: (
    currentGrid: typeof grid,
    seed: number,
    graphWidth: number,
    graphHeight: number,
  ) => boolean;
};

export type EngineGenerationSessionLifecycle = {
  resetActiveView: () => void;
};

export type EngineGenerationSessionLifecycleTargets = {
  invokeActiveZooming: () => void;
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

export function createGridSessionService(
  targets: EngineGridSessionTargets,
): EngineGridSessionService {
  return {
    prepareGrid: (request = {}) => {
      const precreatedSeed = request.seed;
      const expectedSeed = Number(precreatedSeed);

      if (
        targets.shouldRegenerateGrid(
          targets.getGrid(),
          expectedSeed,
          targets.getGraphWidth(),
          targets.getGraphHeight(),
        )
      ) {
        targets.setGrid(
          request.graph ||
            targets.generateGrid(
              targets.getSeed(),
              targets.getGraphWidth(),
              targets.getGraphHeight(),
            ),
        );
      } else {
        delete targets.getGrid().cells.h;
      }
    },
  };
}

export function createGlobalGridSessionService(): EngineGridSessionService {
  return createGridSessionService({
    getGrid: () => globalThis.grid,
    setGrid: (nextGrid) => {
      globalThis.grid = nextGrid;
    },
    getSeed: () => globalThis.seed,
    getGraphWidth: () => globalThis.graphWidth,
    getGraphHeight: () => globalThis.graphHeight,
    generateGrid,
    shouldRegenerateGrid,
  });
}

export function createRuntimeGridSessionService(
  context: EngineRuntimeContext,
  utilities: Pick<
    EngineGridSessionTargets,
    "generateGrid" | "shouldRegenerateGrid"
  > = {
    generateGrid,
    shouldRegenerateGrid,
  },
): EngineGridSessionService {
  const getWorldSettings = () =>
    context.worldSettingsStore?.get() ?? context.worldSettings;

  return createGridSessionService({
    getGrid: () => context.grid,
    setGrid: (nextGrid) => {
      context.grid = nextGrid;
    },
    getSeed: () => context.seed,
    getGraphWidth: () => Number(getWorldSettings().graphWidth) || 0,
    getGraphHeight: () => Number(getWorldSettings().graphHeight) || 0,
    generateGrid: utilities.generateGrid,
    shouldRegenerateGrid: utilities.shouldRegenerateGrid,
  });
}

export function createGlobalGenerationSessionLifecycleTargets(): EngineGenerationSessionLifecycleTargets {
  return {
    invokeActiveZooming: () => {
      invokeActiveZooming();
    },
  };
}

export function createGenerationSessionLifecycle(
  targets: EngineGenerationSessionLifecycleTargets,
): EngineGenerationSessionLifecycle {
  return {
    resetActiveView: () => {
      targets.invokeActiveZooming();
    },
  };
}

export function createGlobalGenerationSessionLifecycle(
  targets: EngineGenerationSessionLifecycleTargets = createGlobalGenerationSessionLifecycleTargets(),
): EngineGenerationSessionLifecycle {
  return createGenerationSessionLifecycle(targets);
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

export function createRuntimeGenerationSessionServices(
  context: EngineRuntimeContext,
): EngineGenerationSessionServices {
  return {
    sessionLifecycle: context.sessionLifecycle,
    seedSession: context.seedSession,
    graphSession: context.graphSession,
    optionsSession: context.optionsSession,
    gridSession: context.gridSession,
  };
}

export function createGenerationSessionAdapter(
  createFallbackServices: () => EngineGenerationSessionServices,
): EngineGenerationSessionAdapter {
  return {
    prepare: (request = {}, context) => {
      const precreatedSeed = request.seed;
      let fallback: EngineGenerationSessionServices | undefined;
      const getFallback = () => {
        fallback ??= createFallbackServices();
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

export function createRuntimeGenerationSessionAdapter(
  context: EngineRuntimeContext,
): EngineGenerationSessionAdapter {
  return createGenerationSessionAdapter(() =>
    createRuntimeGenerationSessionServices(context),
  );
}

export function createGlobalGenerationSessionAdapter(): EngineGenerationSessionAdapter {
  return createGenerationSessionAdapter(createGlobalGenerationSessionServices);
}
