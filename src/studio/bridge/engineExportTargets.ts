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

const EXPORT_SETTING_INPUT_IDS: Record<EngineExportSetting, string> = {
  "png-resolution": "pngResolutionInput",
  "tile-cols": "tileColsOutput",
  "tile-rows": "tileRowsOutput",
  "tile-scale": "tileScaleOutput",
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
  return ((globalThis as typeof globalThis & { window?: EngineExportRuntime })
    .window ?? globalThis) as EngineExportRuntime;
}

function getExportSettingInput(setting: EngineExportSetting) {
  return globalThis.document?.getElementById(
    EXPORT_SETTING_INPUT_IDS[setting],
  ) as HTMLInputElement | null;
}

export function createGlobalEngineExportTargets(): EngineExportTargets {
  return {
    readSetting: (setting, fallback) => {
      const value = Number(getExportSettingInput(setting)?.value || fallback);
      return Number.isFinite(value) ? value : fallback;
    },
    writeSetting: (setting, value) => {
      const input = getExportSettingInput(setting);
      if (!input) return;

      input.value = String(value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    canExport: (format) =>
      typeof getGlobalExportRuntime()[EXPORT_RUNTIME_KEYS[format]] ===
      "function",
    runExport: (format) => {
      const exportAction =
        getGlobalExportRuntime()[EXPORT_RUNTIME_KEYS[format]];
      if (typeof exportAction === "function") exportAction();
    },
  };
}
