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
  return (globalThis.window ?? globalThis) as EngineProjectControlWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function getWindPath(tier: number) {
  return getDocument()?.querySelector(
    `#globeWindArrows path[data-tier='${tier}']`,
  ) as SVGPathElement | null | undefined;
}

export function createGlobalProjectControlDomAdapter(): EngineProjectControlDomAdapter {
  return {
    getTemperatureLabel: (id) =>
      (getDocument()?.getElementById(id) as HTMLElement | null | undefined) ??
      null,
    getWindTransform: (tier) => {
      const windPath = getWindPath(tier);
      return windPath ? (windPath.getAttribute("transform") ?? "") : null;
    },
    setWindTransform: (tier, transform) => {
      getWindPath(tier)?.setAttribute("transform", transform);
    },
  };
}

export function createGlobalProjectControlRuntimeAdapter(): EngineProjectControlRuntimeAdapter {
  return {
    setOptionNumber: (key, value) => {
      const optionsRef = getControlWindow().options;
      if (optionsRef) optionsRef[key] = value;
    },
    convertTemperature: (value, unit) =>
      getControlWindow().convertTemperature?.(value, unit),
    setWindTierValue: (tier, value) => {
      const engineWindow = getControlWindow();
      if (Array.isArray(engineWindow.options?.winds)) {
        engineWindow.options.winds[tier] = value;
        return engineWindow.options.winds;
      }

      return undefined;
    },
    isWindTierInCurrentMap: (tier) => {
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
    },
  };
}

export function createGlobalProjectControlStorageAdapter(): EngineProjectControlStorageAdapter {
  return {
    setWindOptions: (winds) => {
      getLocalStorage()?.setItem("winds", String(winds));
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
