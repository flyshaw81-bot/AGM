type EngineProjectFormWindow = typeof globalThis & {
  options?: {
    winds?: unknown[];
    temperatureEquator?: unknown;
    temperatureNorthPole?: unknown;
    temperatureSouthPole?: unknown;
  };
  precipitationPercent?: number;
  mapSizePercent?: number;
  latitudePercent?: number;
  longitudePercent?: number;
};

export type EngineSelectOption = {
  value: string;
  label: string;
};

export type EngineCultureSetOption = EngineSelectOption & {
  max: string;
};

export type EngineProjectFormDomAdapter = {
  getElementById: (id: string) => HTMLElement | null;
};

export type EngineProjectFormRuntimeAdapter = {
  getWinds: () => unknown[] | undefined;
  getPrecipitationPercent: () => number | undefined;
  getTemperatureOption: (
    key: "temperatureEquator" | "temperatureNorthPole" | "temperatureSouthPole",
  ) => number | undefined;
  convertTemperature: (value: number, unit: string) => unknown;
  getMapPlacementPercent: (
    key: "mapSize" | "latitude" | "longitude",
  ) => number | undefined;
};

export type EngineProjectFormTargets = {
  getInputValue: (id: string, fallback?: string) => string;
  getOutputValue: (id: string, fallback?: string) => string;
  getTextValue: (id: string, fallback?: string) => string;
  getSelect: (id: string) => HTMLSelectElement | null;
  getSelectValue: (
    select: HTMLSelectElement | null,
    fallback?: string,
  ) => string;
  getSelectedOptionLabel: (
    select: HTMLSelectElement | null,
    fallback?: string,
  ) => string;
  getSelectOptions: (select: HTMLSelectElement | null) => EngineSelectOption[];
  getCultureSetOptions: (
    select: HTMLSelectElement | null,
  ) => EngineCultureSetOption[];
  getTemperatureValue: (
    key: "temperatureEquator" | "temperatureNorthPole" | "temperatureSouthPole",
    fallback?: string,
  ) => string;
  getTemperatureFahrenheitLabel: (
    key: "temperatureEquator" | "temperatureNorthPole" | "temperatureSouthPole",
    fallback?: string,
  ) => string;
  getMapPlacementValue: (
    key: "mapSize" | "latitude" | "longitude",
    fallback?: string,
  ) => string;
  hasVisibleInlineDisplay: (id: string, fallback?: boolean) => boolean;
  getWindOption: (tier: number) => string;
};

function getFormWindow(): EngineProjectFormWindow {
  try {
    return (globalThis.window ?? globalThis) as EngineProjectFormWindow;
  } catch {
    return globalThis as EngineProjectFormWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalProjectFormDomAdapter(): EngineProjectFormDomAdapter {
  return {
    getElementById: (id) => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    },
  };
}

export function createGlobalProjectFormRuntimeAdapter(): EngineProjectFormRuntimeAdapter {
  return {
    getWinds: () => {
      try {
        return getFormWindow().options?.winds;
      } catch {
        return undefined;
      }
    },
    getPrecipitationPercent: () => {
      try {
        const value = getFormWindow().precipitationPercent;
        return typeof value === "number" ? value : undefined;
      } catch {
        return undefined;
      }
    },
    getTemperatureOption: (key) => {
      try {
        const value = getFormWindow().options?.[key];
        return typeof value === "number" ? value : undefined;
      } catch {
        return undefined;
      }
    },
    convertTemperature: (value, unit) => {
      try {
        const converter = (
          getFormWindow() as EngineProjectFormWindow & {
            convertTemperature?: (value: number, unit: string) => unknown;
          }
        ).convertTemperature;
        return converter?.(value, unit);
      } catch {
        return undefined;
      }
    },
    getMapPlacementPercent: (key) => {
      try {
        const engineWindow = getFormWindow();
        const value =
          key === "mapSize"
            ? engineWindow.mapSizePercent
            : key === "latitude"
              ? engineWindow.latitudePercent
              : engineWindow.longitudePercent;
        return typeof value === "number" ? value : undefined;
      } catch {
        return undefined;
      }
    },
  };
}

export function createProjectFormTargets(
  domAdapter: EngineProjectFormDomAdapter,
  runtimeAdapter: EngineProjectFormRuntimeAdapter,
): EngineProjectFormTargets {
  return {
    getInputValue: (id, fallback = "") => {
      const inputValue = (
        domAdapter.getElementById(id) as HTMLInputElement | null
      )?.value;
      if (inputValue) return inputValue;
      if (id === "precInput") {
        const runtimeValue = runtimeAdapter.getPrecipitationPercent();
        return typeof runtimeValue === "number"
          ? String(runtimeValue)
          : fallback;
      }
      return fallback;
    },
    getOutputValue: (id, fallback = "") => {
      const output = domAdapter.getElementById(id) as HTMLOutputElement | null;
      return output?.value || output?.textContent?.trim() || fallback;
    },
    getTextValue: (id, fallback = "") =>
      domAdapter.getElementById(id)?.textContent?.trim() || fallback,
    getSelect: (id) =>
      (domAdapter.getElementById(id) as HTMLSelectElement | null) ?? null,
    getSelectValue: (select, fallback = "") => select?.value || fallback,
    getSelectedOptionLabel: (select, fallback = "") =>
      select?.selectedOptions?.[0]?.textContent?.trim() || fallback,
    getSelectOptions: (select) =>
      Array.from(select?.options || []).map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || option.value,
      })),
    getCultureSetOptions: (select) =>
      Array.from(select?.options || []).map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || option.value,
        max: option.dataset.max || "",
      })),
    getTemperatureValue: (key, fallback = "") => {
      const runtimeValue = runtimeAdapter.getTemperatureOption(key);
      return typeof runtimeValue === "number" ? String(runtimeValue) : fallback;
    },
    getTemperatureFahrenheitLabel: (key, fallback = "") => {
      const runtimeValue = runtimeAdapter.getTemperatureOption(key);
      if (typeof runtimeValue !== "number") return fallback;

      const converted = runtimeAdapter.convertTemperature(
        runtimeValue,
        "\u00b0F",
      );
      return typeof converted === "string" || typeof converted === "number"
        ? String(converted)
        : fallback;
    },
    getMapPlacementValue: (key, fallback = "") => {
      const runtimeValue = runtimeAdapter.getMapPlacementPercent(key);
      return typeof runtimeValue === "number" ? String(runtimeValue) : fallback;
    },
    hasVisibleInlineDisplay: (id, fallback = false) =>
      (domAdapter.getElementById(id)?.style.display ||
        (fallback ? "inline-block" : "none")) !== "none",
    getWindOption: (tier) => {
      const winds = runtimeAdapter.getWinds();
      return Array.isArray(winds) ? String(winds[tier] ?? "") : "";
    },
  };
}

export function createGlobalProjectFormTargets(): EngineProjectFormTargets {
  return createProjectFormTargets(
    createGlobalProjectFormDomAdapter(),
    createGlobalProjectFormRuntimeAdapter(),
  );
}
