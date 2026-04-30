import { describe, expect, it, vi } from "vitest";
import {
  exportWithEngine,
  getEngineExportSettings,
  setEngineExportSetting,
} from "./engineExport";
import type {
  EngineExportSetting,
  EngineExportTargets,
} from "./engineExportTargets";

function createTargets(): EngineExportTargets & {
  settings: Record<string, number>;
  exports: string[];
} {
  const settings: Record<EngineExportSetting, number> = {
    "png-resolution": 2,
    "tile-cols": 4,
    "tile-rows": 5,
    "tile-scale": 3,
  };
  const exports: string[] = [];
  return {
    settings,
    exports,
    readSetting: (setting, fallback) => settings[setting] ?? fallback,
    writeSetting: vi.fn((setting: EngineExportSetting, value) => {
      settings[setting] = value;
    }),
    canExport: (format) => format !== "jpeg",
    runExport: vi.fn((format) => {
      exports.push(format);
    }),
  };
}

describe("engine export bridge", () => {
  it("reads export settings through injected targets", () => {
    const targets = createTargets();

    expect(getEngineExportSettings(targets)).toEqual({
      pngResolution: 2,
      tileCols: 4,
      tileRows: 5,
      tileScale: 3,
    });
  });

  it("writes export settings through injected targets", () => {
    const targets = createTargets();

    setEngineExportSetting("tile-cols", 12, targets);

    expect(targets.writeSetting).toHaveBeenCalledWith("tile-cols", 12);
    expect(targets.settings["tile-cols"]).toBe(12);
  });

  it("runs supported export formats through injected targets", () => {
    const targets = createTargets();

    exportWithEngine("svg", targets);
    exportWithEngine("jpeg", targets);

    expect(targets.runExport).toHaveBeenCalledTimes(1);
    expect(targets.exports).toEqual(["svg"]);
  });
});
