export type EngineExportFormat = "svg" | "png" | "jpeg";
export type EngineExportSetting =
  | "png-resolution"
  | "tile-cols"
  | "tile-rows"
  | "tile-scale";

type EngineExportRuntime = {
  exportToSvg?: () => void;
  exportToPng?: () => void;
  exportToJpeg?: () => void;
};

export type EngineExportTargets = {
  readSetting: (setting: EngineExportSetting, fallback: number) => number;
  writeSetting: (setting: EngineExportSetting, value: number) => void;
  canExport: (format: EngineExportFormat) => boolean;
  runExport: (format: EngineExportFormat) => void;
};

export type EngineExportSettingsAdapter = {
  readSetting: (setting: EngineExportSetting, fallback: number) => number;
  writeSetting: (setting: EngineExportSetting, value: number) => void;
};

export type EngineExportRuntimeAdapter = {
  canExport: (format: EngineExportFormat) => boolean;
  runExport: (format: EngineExportFormat) => void;
};

const EXPORT_SETTING_INPUT_IDS: Record<EngineExportSetting, string> = {
  "png-resolution": "studioPngResolutionInput",
  "tile-cols": "studioTileColsInput",
  "tile-rows": "studioTileRowsInput",
  "tile-scale": "studioTileScaleInput",
};

const EXPORT_RUNTIME_KEYS: Record<
  EngineExportFormat,
  keyof EngineExportRuntime
> = {
  svg: "exportToSvg",
  png: "exportToPng",
  jpeg: "exportToJpeg",
};

function getGlobalExportRuntime(): EngineExportRuntime {
  try {
    return ((globalThis as typeof globalThis & { window?: EngineExportRuntime })
      .window ?? globalThis) as EngineExportRuntime;
  } catch {
    return globalThis as EngineExportRuntime;
  }
}

function getExportSettingInput(setting: EngineExportSetting) {
  try {
    return globalThis.document?.getElementById(
      EXPORT_SETTING_INPUT_IDS[setting],
    ) as HTMLInputElement | null;
  } catch {
    return null;
  }
}

function dispatchDomEvent(element: HTMLElement, type: string) {
  try {
    if (typeof globalThis.Event !== "function") return;
    element.dispatchEvent(new globalThis.Event(type, { bubbles: true }));
  } catch {
    // Export setting DOM events are best-effort in compatibility mode.
  }
}

export function createGlobalEngineExportSettingsAdapter(): EngineExportSettingsAdapter {
  return {
    readSetting: (setting, fallback) => {
      try {
        const value = Number(getExportSettingInput(setting)?.value || fallback);
        return Number.isFinite(value) ? value : fallback;
      } catch {
        return fallback;
      }
    },
    writeSetting: (setting, value) => {
      try {
        const input = getExportSettingInput(setting);
        if (!input) return;

        input.value = String(value);
        dispatchDomEvent(input, "input");
        dispatchDomEvent(input, "change");
      } catch {
        // Export setting writes are best-effort for browser compatibility.
      }
    },
  };
}

export function createGlobalEngineExportRuntimeAdapter(): EngineExportRuntimeAdapter {
  return {
    canExport: (format) => {
      try {
        return (
          typeof getGlobalExportRuntime()[EXPORT_RUNTIME_KEYS[format]] ===
          "function"
        );
      } catch {
        return false;
      }
    },
    runExport: (format) => {
      try {
        const exportAction =
          getGlobalExportRuntime()[EXPORT_RUNTIME_KEYS[format]];
        if (typeof exportAction === "function") exportAction();
      } catch {
        // Export runtime calls are best-effort for compatibility helpers.
      }
    },
  };
}

export function createEngineExportTargets(
  settingsAdapter: EngineExportSettingsAdapter,
  runtimeAdapter: EngineExportRuntimeAdapter,
): EngineExportTargets {
  return {
    readSetting: settingsAdapter.readSetting,
    writeSetting: settingsAdapter.writeSetting,
    canExport: runtimeAdapter.canExport,
    runExport: runtimeAdapter.runExport,
  };
}

export function createGlobalEngineExportTargets(): EngineExportTargets {
  return createEngineExportTargets(
    createGlobalEngineExportSettingsAdapter(),
    createGlobalEngineExportRuntimeAdapter(),
  );
}
