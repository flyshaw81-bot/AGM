export type EngineMapGraphLifecycleService = {
  rebuildGraph: () => void;
  createDefaultRuler: () => void;
};

export type EngineMapGraphLifecycleTargets = EngineMapGraphLifecycleService;

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
      getGlobalFunction("reGraph")?.();
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
