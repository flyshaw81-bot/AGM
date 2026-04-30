import type { EngineProjectSummary } from "./engineActionTypes";
import {
  createGlobalProjectFormTargets,
  type EngineProjectFormTargets,
} from "./engineProjectFormTargets";

export function getInputValue(
  id: string,
  fallback = "",
  targets: EngineProjectFormTargets = createGlobalProjectFormTargets(),
) {
  return targets.getInputValue(id, fallback);
}

function getOutputValue(
  id: string,
  fallback = "",
  targets: EngineProjectFormTargets,
) {
  return targets.getOutputValue(id, fallback);
}

export function getSelect(
  id: string,
  targets: EngineProjectFormTargets = createGlobalProjectFormTargets(),
) {
  return targets.getSelect(id);
}

export function getSelectValue(
  select: HTMLSelectElement | null,
  fallback = "",
  targets: EngineProjectFormTargets = createGlobalProjectFormTargets(),
) {
  return targets.getSelectValue(select, fallback);
}

function getSelectedOptionLabel(
  select: HTMLSelectElement | null,
  fallback = "",
  targets: EngineProjectFormTargets,
) {
  return targets.getSelectedOptionLabel(select, fallback);
}

function getSelectOptions(
  select: HTMLSelectElement | null,
  targets: EngineProjectFormTargets,
) {
  return targets.getSelectOptions(select);
}

function getCultureSetOptions(
  select: HTMLSelectElement | null,
  targets: EngineProjectFormTargets,
) {
  return targets.getCultureSetOptions(select);
}

export function getLayersPresetOptions(
  targets: EngineProjectFormTargets = createGlobalProjectFormTargets(),
) {
  return getSelectOptions(targets.getSelect("layersPreset"), targets).map(
    (option) => option.value,
  );
}

export function hasVisibleInlineDisplay(
  id: string,
  fallback = false,
  targets: EngineProjectFormTargets = createGlobalProjectFormTargets(),
) {
  return targets.hasVisibleInlineDisplay(id, fallback);
}

function getPendingWindTier(
  tier: number,
  targets: EngineProjectFormTargets,
  cachedValue?: string,
) {
  return (
    targets.getWindTierRotation(tier) ||
    targets.getWindOption(tier) ||
    cachedValue ||
    ""
  );
}

export function readEngineProjectForm(
  cachedSummary?: EngineProjectSummary,
  targets: EngineProjectFormTargets = createGlobalProjectFormTargets(),
) {
  const templateSelect = targets.getSelect("templateInput");
  const availableTemplates = getSelectOptions(templateSelect, targets);
  const culturesSet = targets.getSelect("culturesSet");
  const availableCultureSets = getCultureSetOptions(culturesSet, targets);
  const stateLabelsModeSelect = targets.getSelect("stateLabelsModeInput");
  const pendingPoints = getInputValue(
    "pointsInput",
    cachedSummary?.pendingPoints || "",
    targets,
  );
  const pendingCellsLabel = getOutputValue(
    "pointsOutputFormatted",
    cachedSummary?.pendingCellsLabel || "",
    targets,
  );
  const pendingStates = getInputValue(
    "statesNumber",
    cachedSummary?.pendingStates || "",
    targets,
  );
  const pendingProvincesRatio = getInputValue(
    "provincesRatio",
    cachedSummary?.pendingProvincesRatio || "",
    targets,
  );
  const pendingSizeVariety = getInputValue(
    "sizeVariety",
    cachedSummary?.pendingSizeVariety || "",
    targets,
  );
  const pendingGrowthRate = getInputValue(
    "growthRate",
    cachedSummary?.pendingGrowthRate || "",
    targets,
  );
  const pendingTemperatureEquator = getInputValue(
    "temperatureEquatorInput",
    cachedSummary?.pendingTemperatureEquator || "",
    targets,
  );
  const pendingTemperatureEquatorF =
    targets.getTextValue("temperatureEquatorF") ||
    cachedSummary?.pendingTemperatureEquatorF ||
    "";
  const pendingTemperatureNorthPole = getInputValue(
    "temperatureNorthPoleInput",
    cachedSummary?.pendingTemperatureNorthPole || "",
    targets,
  );
  const pendingTemperatureNorthPoleF =
    targets.getTextValue("temperatureNorthPoleF") ||
    cachedSummary?.pendingTemperatureNorthPoleF ||
    "";
  const pendingTemperatureSouthPole = getInputValue(
    "temperatureSouthPoleInput",
    cachedSummary?.pendingTemperatureSouthPole || "",
    targets,
  );
  const pendingTemperatureSouthPoleF =
    targets.getTextValue("temperatureSouthPoleF") ||
    cachedSummary?.pendingTemperatureSouthPoleF ||
    "";
  const pendingMapSize = getInputValue(
    "mapSizeInput",
    cachedSummary?.pendingMapSize || "",
    targets,
  );
  const pendingLatitude = getInputValue(
    "latitudeInput",
    cachedSummary?.pendingLatitude || "",
    targets,
  );
  const pendingLongitude = getInputValue(
    "longitudeInput",
    cachedSummary?.pendingLongitude || "",
    targets,
  );
  const pendingWindTier0 = getPendingWindTier(
    0,
    targets,
    cachedSummary?.pendingWindTier0,
  );
  const pendingWindTier1 = getPendingWindTier(
    1,
    targets,
    cachedSummary?.pendingWindTier1,
  );
  const pendingWindTier2 = getPendingWindTier(
    2,
    targets,
    cachedSummary?.pendingWindTier2,
  );
  const pendingWindTier3 = getPendingWindTier(
    3,
    targets,
    cachedSummary?.pendingWindTier3,
  );
  const pendingWindTier4 = getPendingWindTier(
    4,
    targets,
    cachedSummary?.pendingWindTier4,
  );
  const pendingWindTier5 = getPendingWindTier(
    5,
    targets,
    cachedSummary?.pendingWindTier5,
  );
  const pendingPrecipitation = getInputValue(
    "precInput",
    cachedSummary?.pendingPrecipitation || "",
    targets,
  );
  const pendingCultures = getInputValue(
    "culturesInput",
    cachedSummary?.pendingCultures || "",
    targets,
  );
  const pendingBurgs = getInputValue(
    "manorsInput",
    cachedSummary?.pendingBurgs || "",
    targets,
  );
  const pendingBurgsLabel = getOutputValue(
    "manorsOutput",
    cachedSummary?.pendingBurgsLabel ||
      (pendingBurgs === "1000" ? "auto" : pendingBurgs),
    targets,
  );
  const pendingReligions = getInputValue(
    "religionsNumber",
    cachedSummary?.pendingReligions || "",
    targets,
  );
  const pendingStateLabelsMode = getSelectValue(
    stateLabelsModeSelect,
    cachedSummary?.pendingStateLabelsMode || "",
    targets,
  );
  const pendingStateLabelsModeLabel = getSelectedOptionLabel(
    stateLabelsModeSelect,
    cachedSummary?.pendingStateLabelsModeLabel || pendingStateLabelsMode || "",
    targets,
  );
  const pendingCultureSet = getSelectValue(
    culturesSet,
    cachedSummary?.pendingCultureSet || "",
    targets,
  );
  const pendingCultureSetLabel =
    availableCultureSets.find((option) => option.value === pendingCultureSet)
      ?.label ||
    cachedSummary?.pendingCultureSetLabel ||
    pendingCultureSet ||
    "";
  const pendingTemplate = getSelectValue(
    templateSelect,
    cachedSummary?.pendingTemplate || "",
    targets,
  );
  const pendingTemplateLabel =
    availableTemplates.find((option) => option.value === pendingTemplate)
      ?.label ||
    cachedSummary?.pendingTemplateLabel ||
    pendingTemplate ||
    "";

  return {
    pendingPoints,
    pendingCellsLabel,
    pendingStates,
    pendingProvincesRatio,
    pendingSizeVariety,
    pendingGrowthRate,
    pendingTemperatureEquator,
    pendingTemperatureEquatorF,
    pendingTemperatureNorthPole,
    pendingTemperatureNorthPoleF,
    pendingTemperatureSouthPole,
    pendingTemperatureSouthPoleF,
    pendingMapSize,
    pendingLatitude,
    pendingLongitude,
    pendingWindTier0,
    pendingWindTier1,
    pendingWindTier2,
    pendingWindTier3,
    pendingWindTier4,
    pendingWindTier5,
    pendingPrecipitation,
    pendingCultures,
    pendingBurgs,
    pendingBurgsLabel,
    pendingReligions,
    pendingStateLabelsMode,
    pendingStateLabelsModeLabel,
    pendingCultureSet,
    pendingCultureSetLabel,
    availableCultureSets: availableCultureSets.length
      ? availableCultureSets
      : cachedSummary?.availableCultureSets || [],
    pendingTemplate,
    pendingTemplateLabel,
    availableTemplates: availableTemplates.length
      ? availableTemplates
      : cachedSummary?.availableTemplates || [],
  };
}
