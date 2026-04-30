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

function getControlWindow(): EngineProjectControlWindow {
  return (globalThis.window ?? globalThis) as EngineProjectControlWindow;
}

function getDocument(): Document | undefined {
  return globalThis.document;
}

function getLocalStorage(): Storage | undefined {
  return globalThis.localStorage;
}

function getWindPath(tier: number) {
  return getDocument()?.querySelector(
    `#globeWindArrows path[data-tier='${tier}']`,
  ) as SVGPathElement | null | undefined;
}

export function createGlobalProjectControlTargets(): EngineProjectControlTargets {
  return {
    getTemperatureLabel: (id) =>
      (getDocument()?.getElementById(id) as HTMLElement | null | undefined) ??
      null,
    setOptionNumber: (key, value) => {
      const optionsRef = getControlWindow().options;
      if (optionsRef) optionsRef[key] = value;
    },
    convertTemperature: (value, unit) =>
      getControlWindow().convertTemperature?.(value, unit),
    getWindTransform: (tier) => {
      const windPath = getWindPath(tier);
      return windPath ? (windPath.getAttribute("transform") ?? "") : null;
    },
    setWindTransform: (tier, transform) => {
      getWindPath(tier)?.setAttribute("transform", transform);
    },
    applyWindTierToRuntime: (tier, value) => {
      const engineWindow = getControlWindow();
      if (Array.isArray(engineWindow.options?.winds)) {
        engineWindow.options.winds[tier] = value;
        getLocalStorage()?.setItem("winds", String(engineWindow.options.winds));
      }

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
