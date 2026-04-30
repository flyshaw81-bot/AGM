import type { getEngineProjectSummary } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  renderProjectInputSetting,
  renderWindTierSettings,
} from "./projectMapSettingsControls";
import {
  formatProjectPercent,
  formatProjectTemperature,
  PROJECT_MAP_EMPTY_VALUE,
} from "./projectMapSettingsModel";
import { t } from "./shellShared";

type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;

export function renderProjectClimateSettings(
  projectSummary: ProjectSummary,
  language: StudioLanguage,
) {
  return `
      ${renderProjectInputSetting(
        t(language, "赤道温度", "Equator temperature"),
        formatProjectTemperature(
          projectSummary.pendingTemperatureEquator,
          projectSummary.pendingTemperatureEquatorF,
        ),
        t(language, "修改赤道温度", "Change equator temperature"),
        "studioProjectTemperatureEquatorInput",
        "number",
        `min="-50" max="50" step="1" value="${projectSummary.pendingTemperatureEquator || "0"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "北极温度", "North Pole temperature"),
        formatProjectTemperature(
          projectSummary.pendingTemperatureNorthPole,
          projectSummary.pendingTemperatureNorthPoleF,
        ),
        t(language, "修改北极温度", "Change North Pole temperature"),
        "studioProjectTemperatureNorthPoleInput",
        "number",
        `min="-50" max="50" step="1" value="${projectSummary.pendingTemperatureNorthPole || "0"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "南极温度", "South Pole temperature"),
        formatProjectTemperature(
          projectSummary.pendingTemperatureSouthPole,
          projectSummary.pendingTemperatureSouthPoleF,
        ),
        t(language, "修改南极温度", "Change South Pole temperature"),
        "studioProjectTemperatureSouthPoleInput",
        "number",
        `min="-50" max="50" step="1" value="${projectSummary.pendingTemperatureSouthPole || "0"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "地图尺寸", "Map size"),
        formatProjectPercent(projectSummary.pendingMapSize),
        t(language, "修改地图尺寸", "Change map size"),
        "studioProjectMapSizeInput",
        "number",
        `min="1" max="100" step="0.1" value="${projectSummary.pendingMapSize || "100"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "纬度", "Latitude"),
        formatProjectPercent(projectSummary.pendingLatitude),
        t(language, "修改纬度", "Change latitude"),
        "studioProjectLatitudeInput",
        "number",
        `min="0" max="100" step="0.1" value="${projectSummary.pendingLatitude || "50"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "经度", "Longitude"),
        formatProjectPercent(projectSummary.pendingLongitude),
        t(language, "修改经度", "Change longitude"),
        "studioProjectLongitudeInput",
        "number",
        `min="0" max="100" step="0.1" value="${projectSummary.pendingLongitude || "50"}"`,
      )}
      ${renderWindTierSettings(projectSummary, language)}
      ${renderProjectInputSetting(
        t(language, "降水", "Precipitation"),
        formatProjectPercent(projectSummary.pendingPrecipitation),
        t(language, "修改降水", "Change precipitation"),
        "studioProjectPrecipitationInput",
        "number",
        `min="0" max="500" step="1" value="${projectSummary.pendingPrecipitation || "100"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "尺寸变化", "Size variety"),
        projectSummary.pendingSizeVariety || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改尺寸变化", "Change size variety"),
        "studioProjectSizeVarietyInput",
        "number",
        `min="0" max="10" step="0.1" value="${projectSummary.pendingSizeVariety || "4"}"`,
      )}
    `;
}
