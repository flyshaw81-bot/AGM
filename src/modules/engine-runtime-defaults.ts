export type EngineRuntimeDefaultValue = string | number | boolean;

export type EngineRuntimeDefaultsService = {
  getDefaults: () => Readonly<Record<string, EngineRuntimeDefaultValue>>;
  mountDefaults: (runtime?: Record<string, unknown>) => void;
};

const ENGINE_RUNTIME_DEFAULTS = {
  populationRate: 1000,
  distanceScale: 3,
  urbanization: 1,
  urbanDensity: 10,
  heightExponent: 1.8,
  temperatureScale: "°C",
  heightUnit: "ft",
  distanceUnit: "mi",
  precipitationPercent: 100,
  mapSizePercent: 0,
  latitudePercent: 0,
  longitudePercent: 0,
} as const satisfies Record<string, EngineRuntimeDefaultValue>;

declare global {
  var EngineRuntimeDefaults: EngineRuntimeDefaultsService;

  interface Window {
    EngineRuntimeDefaults: EngineRuntimeDefaultsService;
  }
}

export function createEngineRuntimeDefaultsService(
  defaults: Readonly<
    Record<string, EngineRuntimeDefaultValue>
  > = ENGINE_RUNTIME_DEFAULTS,
): EngineRuntimeDefaultsService {
  return {
    getDefaults: () => defaults,
    mountDefaults: (runtime = globalThis as Record<string, unknown>) => {
      for (const [key, value] of Object.entries(defaults)) {
        if (runtime[key] === undefined) runtime[key] = value;
      }
    },
  };
}

function getRuntimeWindow(): Window | undefined {
  try {
    return window;
  } catch {
    return undefined;
  }
}

const runtimeWindow = getRuntimeWindow();
if (runtimeWindow) {
  runtimeWindow.EngineRuntimeDefaults = createEngineRuntimeDefaultsService();
}
