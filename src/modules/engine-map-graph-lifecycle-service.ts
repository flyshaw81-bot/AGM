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

export function createGlobalMapGraphLifecycleTargets(): EngineMapGraphLifecycleTargets {
  return {
    rebuildGraph: () => {
      globalThis.reGraph?.();
    },
    createDefaultRuler: () => {
      globalThis.createDefaultRuler?.();
    },
  };
}

export function createGlobalMapGraphLifecycleService(
  targets: EngineMapGraphLifecycleTargets = createGlobalMapGraphLifecycleTargets(),
): EngineMapGraphLifecycleService {
  return createMapGraphLifecycleService(targets);
}
