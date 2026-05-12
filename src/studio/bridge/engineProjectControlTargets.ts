type EngineProjectControlWindow = typeof globalThis & {
  options?: Record<string, unknown> & {
    winds?: number[];
  };
  precipitationPercent?: number;
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
  mapCoordinates?: {
    latN?: number;
    latS?: number;
  };
};

export type EngineProjectControlTargets = {
  setOptionNumber: (key: string, value: number) => void;
  applyWindTierToRuntime: (tier: number, value: number) => boolean;
  setPrecipitationPercent: (value: number) => void;
  setMapPlacementPercent: (
    key: "mapSize" | "latitude" | "longitude",
    value: number,
  ) => void;
};

export type EngineProjectControlDomAdapter = Record<string, never>;

export type EngineProjectControlRuntimeAdapter = {
  setOptionNumber: (key: string, value: number) => void;
  setWindTierValue: (tier: number, value: number) => number[] | undefined;
  isWindTierInCurrentMap: (tier: number) => boolean;
  setPrecipitationPercent: (value: number) => void;
  setMapPlacementPercent: (
    key: "mapSize" | "latitude" | "longitude",
    value: number,
  ) => void;
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

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function createGlobalProjectControlDomAdapter(): EngineProjectControlDomAdapter {
  return {};
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
        if (!Number.isFinite(latN) || !Number.isFinite(latS)) {
          return false;
        }

        // Build range from latN to latS in steps of -30
        const mapTiers: number[] = [];
        for (let lat = latN!; lat > latS!; lat -= 30) {
          mapTiers.push(((90 - lat) / 30) | 0);
        }
        return mapTiers.includes(tier);
      } catch {
        return false;
      }
    },
    setPrecipitationPercent: (value) => {
      try {
        getControlWindow().precipitationPercent = value;
      } catch {
        // Runtime compatibility options may be unavailable in isolated contexts.
      }
    },
    setMapPlacementPercent: (key, value) => {
      try {
        const engineWindow = getControlWindow();
        if (key === "mapSize") engineWindow.mapSizePercent = value;
        else if (key === "latitude") engineWindow.latitudePercent = value;
        else engineWindow.longitudePercent = value;
      } catch {
        // Runtime compatibility options may be unavailable in isolated contexts.
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
  _domAdapter: EngineProjectControlDomAdapter,
  runtimeAdapter: EngineProjectControlRuntimeAdapter,
  storageAdapter: EngineProjectControlStorageAdapter,
): EngineProjectControlTargets {
  return {
    setOptionNumber: runtimeAdapter.setOptionNumber,
    applyWindTierToRuntime: (tier, value) => {
      const winds = runtimeAdapter.setWindTierValue(tier, value);
      if (winds) storageAdapter.setWindOptions(winds);
      return runtimeAdapter.isWindTierInCurrentMap(tier);
    },
    setPrecipitationPercent: runtimeAdapter.setPrecipitationPercent,
    setMapPlacementPercent: runtimeAdapter.setMapPlacementPercent,
  };
}

export function createGlobalProjectControlTargets(): EngineProjectControlTargets {
  return createProjectControlTargets(
    createGlobalProjectControlDomAdapter(),
    createGlobalProjectControlRuntimeAdapter(),
    createGlobalProjectControlStorageAdapter(),
  );
}
