import {
  createGlobalEngineExportTargets,
  type EngineExportFormat,
  type EngineExportSetting,
  type EngineExportTargets,
} from "./engineExportTargets";

export function getEngineExportSettings(
  targets = createGlobalEngineExportTargets(),
) {
  const pngResolution = targets.readSetting("png-resolution", 1);
  const tileCols = targets.readSetting("tile-cols", 8);
  const tileRows = targets.readSetting("tile-rows", 8);
  const tileScale = targets.readSetting("tile-scale", 1);

  return {
    pngResolution,
    tileCols,
    tileRows,
    tileScale,
  };
}

export function setEngineExportSetting(
  setting: EngineExportSetting,
  value: number,
  targets = createGlobalEngineExportTargets(),
) {
  targets.writeSetting(setting, value);
}

export function exportWithEngine(
  format: EngineExportFormat,
  targets: EngineExportTargets = createGlobalEngineExportTargets(),
) {
  if (targets.canExport(format)) targets.runExport(format);
}
