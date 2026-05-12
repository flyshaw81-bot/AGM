import { generateGrid, shouldRegenerateGrid } from "../utils/graphUtils";
import type { EngineGraphSessionModule as EngineGraphSessionService } from "./engine-graph-session";
import {
  EngineOptionsSession,
  type EngineOptionsSessionModule,
} from "./engine-options-session";
import {
  createGlobalEngineRenderFunctions,
  type EngineGlobalRenderFunctions,
} from "./engine-render-adapter";
import type { EngineRuntimeContext } from "./engine-runtime-context";
import type { EngineSeedSessionModule as EngineSeedSessionService } from "./engine-seed-session";
import type { EngineGrid } from "./engine-world-state";

export type EngineGenerationSessionRequest = {
  seed?: string;
  graph?: EngineGrid;
};

export type EngineGridSessionService = {
  prepareGrid: (request?: EngineGenerationSessionRequest) => void;
};

export type EngineGridSessionTargets = {
  getGrid: () => EngineGrid;
  setGrid: (nextGrid: EngineGrid) => void;
  getSeed: () => string;
  getGraphWidth: () => number;
  getGraphHeight: () => number;
  generateGrid: (
    seed: string,
    graphWidth: number,
    graphHeight: number,
  ) => EngineGrid;
  shouldRegenerateGrid: (
    currentGrid: EngineGrid,
    seed: number,
    graphWidth: number,
    graphHeight: number,
  ) => boolean;
};

export type EngineGlobalGridSessionTargets = Pick<
  EngineGridSessionTargets,
  "getGrid" | "setGrid" | "getSeed" | "getGraphWidth" | "getGraphHeight"
>;

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

export type EngineGenerationSessionServiceTargets = {
  getSeedSession: () => EngineSeedSessionService;
  getGraphSession: () => EngineGraphSessionService;
  getOptionsSession: () => EngineOptionsSessionModule;
  createSessionLifecycle: () => EngineGenerationSessionLifecycle;
  createGridSession: () => EngineGridSessionService;
};

export type EngineGenerationSessionAdapter = {
  prepare: (
    request?: EngineGenerationSessionRequest,
    context?: EngineRuntimeContext,
  ) => void;
};

function getGlobalValue<T = unknown>(name: string): T | undefined {
  try {
    return (globalThis as Record<string, unknown>)[name] as T | undefined;
  } catch {
    return undefined;
  }
}

function setGlobalValue<T>(name: string, value: T) {
  try {
    (globalThis as Record<string, unknown>)[name] = value;
  } catch {
    // Ignore read-only compatibility globals.
  }
}

function getGlobalNumber(name: string): number {
  const value = getGlobalValue<unknown>(name);
  return typeof value === "number" ? value : 0;
}

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
  return createGridSessionService(createGlobalGridSessionTargets());
}

export function createGlobalGridSessionTargets(
  globalTargets: EngineGlobalGridSessionTargets = createBrowserGlobalGridSessionTargets(),
): EngineGridSessionTargets {
  return {
    ...globalTargets,
    generateGrid,
    shouldRegenerateGrid,
  };
}

export function createBrowserGlobalGridSessionTargets(): EngineGlobalGridSessionTargets {
  return {
    getGrid: () => getGlobalValue<EngineGrid>("grid") ?? ({} as EngineGrid),
    setGrid: (nextGrid) => {
      setGlobalValue("grid", nextGrid);
    },
    getSeed: () => getGlobalValue<string>("seed") ?? "",
    getGraphWidth: () => getGlobalNumber("graphWidth"),
    getGraphHeight: () => getGlobalNumber("graphHeight"),
  };
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
      if (context.worldState) context.worldState.grid = nextGrid;
    },
    getSeed: () => context.seed,
    getGraphWidth: () => Number(getWorldSettings().graphWidth) || 0,
    getGraphHeight: () => Number(getWorldSettings().graphHeight) || 0,
    generateGrid: utilities.generateGrid,
    shouldRegenerateGrid: utilities.shouldRegenerateGrid,
  });
}

export function createGlobalGenerationSessionLifecycleTargets(
  renderFunctions: Pick<
    EngineGlobalRenderFunctions,
    "invokeActiveZooming"
  > = createGlobalEngineRenderFunctions(),
): EngineGenerationSessionLifecycleTargets {
  return {
    invokeActiveZooming: () => {
      try {
        renderFunctions.invokeActiveZooming?.();
      } catch {
        // Resetting the current zoom is best-effort during generation setup.
      }
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

export function createGlobalGenerationSessionServiceTargets(): EngineGenerationSessionServiceTargets {
  return {
    getSeedSession: () => EngineSeedSession,
    getGraphSession: () => EngineGraphSession,
    getOptionsSession: () => EngineOptionsSession,
    createSessionLifecycle: createGlobalGenerationSessionLifecycle,
    createGridSession: createGlobalGridSessionService,
  };
}

export function createGlobalGenerationSessionServices(
  targets: EngineGenerationSessionServiceTargets = createGlobalGenerationSessionServiceTargets(),
): EngineGenerationSessionServices {
  return {
    sessionLifecycle: targets.createSessionLifecycle(),
    seedSession: targets.getSeedSession(),
    graphSession: targets.getGraphSession(),
    optionsSession: targets.getOptionsSession(),
    gridSession: targets.createGridSession(),
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
