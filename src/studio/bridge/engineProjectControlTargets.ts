type EngineProjectControlWindow = typeof globalThis & {
  options?: Record<string, unknown> & {
    winds?: number[];
  };
  convertTemperature?: (value: number, unit: string) => unknown;
  mapCoordinates?: {
    latN?: number;
    latS?: number;
  };
  d3?: {
    range?: (start: number, stop: number, step: number) => number[];
  };
};

export type EngineProjectControlTargets = {
  getTemperatureLabel: (id: string) => HTMLElement | null;
  setOptionNumber: (key: string, value: number) => void;
  convertTemperature: (value: number, unit: string) => unknown;
  getWindTransform: (tier: number) => string | null;
  setWindTransform: (tier: number, transform: string) => void;
  applyWindTierToRuntime: (tier: number, value: number) => boolean;
};

export type EngineProjectControlDomAdapter = {
  getTemperatureLabel: (id: string) => HTMLElement | null;
  getWindTransform: (tier: number) => string | null;
  setWindTransform: (tier: number, transform: string) => void;
};

export type EngineProjectControlRuntimeAdapter = {
  setOptionNumber: (key: string, value: number) => void;
  convertTemperature: (value: number, unit: string) => unknown;
  setWindTierValue: (tier: number, value: number) => number[] | undefined;
  isWindTierInCurrentMap: (tier: number) => boolean;
};

export type EngineProjectControlStorageAdapter = {
  setWindOptions: (winds: number[]) => void;
};

function getControlWindow(): EngineProjectControlWindow {
  try {
    return (globalThis.window ?? globalThis) as EngineProjectControlWindow;
  } catch {
    return globalThis as EngineProjectControlWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function getWindPath(tier: number) {
  try {
    return getDocument()?.querySelector(
      `#globeWindArrows path[data-tier='${tier}']`,
    ) as SVGPathElement | null | undefined;
  } catch {
    return undefined;
  }
}

export function createGlobalProjectControlDomAdapter(): EngineProjectControlDomAdapter {
  return {
    getTemperatureLabel: (id) => {
      try {
        return (
          (getDocument()?.getElementById(id) as
            | HTMLElement
            | null
            | undefined) ?? null
        );
      } catch {
        return null;
      }
    },
    getWindTransform: (tier) => {
      try {
        const windPath = getWindPath(tier);
        return windPath ? (windPath.getAttribute("transform") ?? "") : null;
      } catch {
        return null;
      }
    },
    setWindTransform: (tier, transform) => {
      try {
        getWindPath(tier)?.setAttribute("transform", transform);
      } catch {
        // Compatibility DOM writes are best-effort; injected adapters own strict UI state.
      }
    },
  };
}

export function createGlobalProjectControlRuntimeAdapter(): EngineProjectControlRuntimeAdapter {
  return {
    setOptionNumber: (key, value) => {
      try {
        const optionsRef = getControlWindow().options;
        if (optionsRef) optionsRef[key] = value;
      } catch {
        // Runtime compatibility options may be unavailable in isolated contexts.
      }
    },
    convertTemperature: (value, unit) => {
      try {
        return getControlWindow().convertTemperature?.(value, unit);
      } catch {
        return undefined;
      }
    },
    setWindTierValue: (tier, value) => {
      try {
        const engineWindow = getControlWindow();
        if (Array.isArray(engineWindow.options?.winds)) {
          engineWindow.options.winds[tier] = value;
          return engineWindow.options.winds;
        }
      } catch {
        return undefined;
      }

      return undefined;
    },
    isWindTierInCurrentMap: (tier) => {
      try {
        const engineWindow = getControlWindow();
        const latN = engineWindow.mapCoordinates?.latN;
        const latS = engineWindow.mapCoordinates?.latS;
        if (
          !Number.isFinite(latN) ||
          !Number.isFinite(latS) ||
          typeof engineWindow.d3?.range !== "function"
        ) {
          return false;
        }

        const mapTiers = engineWindow.d3
          .range(latN!, latS!, -30)
          .map((coordinate) => ((90 - coordinate) / 30) | 0);
        return mapTiers.includes(tier);
      } catch {
        return false;
      }
    },
  };
}

export function createGlobalProjectControlStorageAdapter(): EngineProjectControlStorageAdapter {
  return {
    setWindOptions: (winds) => {
      try {
        getLocalStorage()?.setItem("winds", String(winds));
      } catch {
        // Storage persistence is optional for compatibility targets.
      }
    },
  };
}

export function createProjectControlTargets(
  domAdapter: EngineProjectControlDomAdapter,
  runtimeAdapter: EngineProjectControlRuntimeAdapter,
  storageAdapter: EngineProjectControlStorageAdapter,
): EngineProjectControlTargets {
  return {
    getTemperatureLabel: domAdapter.getTemperatureLabel,
    setOptionNumber: runtimeAdapter.setOptionNumber,
    convertTemperature: runtimeAdapter.convertTemperature,
    getWindTransform: domAdapter.getWindTransform,
    setWindTransform: domAdapter.setWindTransform,
    applyWindTierToRuntime: (tier, value) => {
      const winds = runtimeAdapter.setWindTierValue(tier, value);
      if (winds) storageAdapter.setWindOptions(winds);
      return runtimeAdapter.isWindTierInCurrentMap(tier);
    },
  };
}

export function createGlobalProjectControlTargets(): EngineProjectControlTargets {
  return createProjectControlTargets(
    createGlobalProjectControlDomAdapter(),
    createGlobalProjectControlRuntimeAdapter(),
    createGlobalProjectControlStorageAdapter(),
  );
}
