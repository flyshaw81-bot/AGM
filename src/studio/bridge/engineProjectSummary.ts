import type { EngineProjectSummary } from "./engineActionTypes";
import {
  getInputValue,
  getLayersPresetOptions,
  getSelect,
  getSelectValue,
  hasVisibleInlineDisplay,
  readEngineProjectForm,
} from "./engineProjectForm";
import {
  createGlobalProjectSummaryTargets,
  type EngineProjectSummaryTargets,
} from "./engineProjectSummaryTargets";

const PROJECT_SUMMARY_SCALAR_KEYS = [
  "hasLocalSnapshot",
  "stylePreset",
  "lastLayersPreset",
  "autosaveInterval",
  "pendingSeed",
  "pendingPoints",
  "pendingCellsLabel",
  "pendingStates",
  "pendingProvincesRatio",
  "pendingSizeVariety",
  "pendingGrowthRate",
  "pendingTemperatureEquator",
  "pendingTemperatureEquatorF",
  "pendingTemperatureNorthPole",
  "pendingTemperatureNorthPoleF",
  "pendingTemperatureSouthPole",
  "pendingTemperatureSouthPoleF",
  "pendingMapSize",
  "pendingLatitude",
  "pendingLongitude",
  "pendingWindTier0",
  "pendingWindTier1",
  "pendingWindTier2",
  "pendingWindTier3",
  "pendingWindTier4",
  "pendingWindTier5",
  "pendingPrecipitation",
  "pendingCultures",
  "pendingBurgs",
  "pendingBurgsLabel",
  "pendingReligions",
  "pendingStateLabelsMode",
  "pendingStateLabelsModeLabel",
  "pendingCultureSet",
  "pendingCultureSetLabel",
  "pendingTemplate",
  "pendingTemplateLabel",
  "pendingWidth",
  "pendingHeight",
  "canSaveLayersPreset",
  "canRemoveLayersPreset",
  "canOpenSeedHistory",
  "canCopySeedUrl",
  "canSetSeed",
  "canRestoreDefaultCanvasSize",
] satisfies readonly (keyof EngineProjectSummary)[];

function listChanged<T>(
  previous: readonly T[],
  next: readonly T[],
  itemChanged: (previousItem: T, nextItem: T | undefined) => boolean,
) {
  return (
    previous.length !== next.length ||
    previous.some((item, index) => itemChanged(item, next[index]))
  );
}

function engineProjectSummaryChanged(
  previous: EngineProjectSummary | undefined,
  next: EngineProjectSummary,
) {
  if (!previous) return true;
  return (
    PROJECT_SUMMARY_SCALAR_KEYS.some((key) => previous[key] !== next[key]) ||
    listChanged(
      previous.availableCultureSets,
      next.availableCultureSets,
      (option, nextOption) =>
        option.value !== nextOption?.value ||
        option.label !== nextOption?.label ||
        option.max !== nextOption?.max,
    ) ||
    listChanged(
      previous.availableTemplates,
      next.availableTemplates,
      (option, nextOption) =>
        option.value !== nextOption?.value ||
        option.label !== nextOption?.label,
    ) ||
    listChanged(
      previous.availableLayersPresets,
      next.availableLayersPresets,
      (option, nextOption) => option !== nextOption,
    )
  );
}

export async function syncEngineProjectSummary(
  targets: EngineProjectSummaryTargets = createGlobalProjectSummaryTargets(),
) {
  const previous = targets.getCachedSummary();
  let hasLocalSnapshot = Boolean(
    targets.getLocalStorageItem("lastMap") ||
      targets.getSessionStorageItem("lastMap"),
  );
  const projectForm = readEngineProjectForm(undefined, targets.form);

  if (!hasLocalSnapshot) {
    try {
      hasLocalSnapshot = Boolean(await targets.readLocalDatabaseSnapshot());
    } catch (error) {
      console.warn("AGM Studio could not read the local map snapshot.", error);
      hasLocalSnapshot = false;
    }
  }

  const next = {
    hasLocalSnapshot,
    stylePreset: targets.getLocalStorageItem("presetStyle") || "default",
    lastLayersPreset:
      getSelectValue(
        getSelect("layersPreset", targets.form),
        "",
        targets.form,
      ) ||
      targets.getLocalStorageItem("preset") ||
      "custom",
    autosaveInterval: getInputValue(
      "autosaveIntervalOutput",
      "0",
      targets.form,
    ),
    pendingSeed: getInputValue("optionsSeed", "", targets.form),
    ...projectForm,
    pendingWidth: getInputValue("mapWidthInput", "", targets.form),
    pendingHeight: getInputValue("mapHeightInput", "", targets.form),
    availableLayersPresets: getLayersPresetOptions(targets.form),
    canSaveLayersPreset: hasVisibleInlineDisplay(
      "savePresetButton",
      false,
      targets.form,
    ),
    canRemoveLayersPreset: hasVisibleInlineDisplay(
      "removePresetButton",
      false,
      targets.form,
    ),
    canOpenSeedHistory: targets.hasElement("optionsMapHistory"),
    canCopySeedUrl: targets.hasElement("optionsCopySeed"),
    canSetSeed: targets.hasElement("optionsSeed"),
    canRestoreDefaultCanvasSize: targets.hasElement("restoreDefaultCanvasSize"),
  } satisfies EngineProjectSummary;

  targets.setCachedSummary(next);
  return engineProjectSummaryChanged(previous, next);
}

export function getEngineProjectSummary(
  targets: EngineProjectSummaryTargets = createGlobalProjectSummaryTargets(),
) {
  const cachedSummary = targets.getCachedSummary();
  const hasStorageSnapshot = Boolean(
    targets.getLocalStorageItem("lastMap") ||
      targets.getSessionStorageItem("lastMap"),
  );
  const liveLayersPreset = getSelectValue(
    getSelect("layersPreset", targets.form),
    "",
    targets.form,
  );
  const liveAutosaveInterval = getInputValue(
    "autosaveIntervalOutput",
    "",
    targets.form,
  );
  const projectForm = readEngineProjectForm(cachedSummary, targets.form);
  const availableLayersPresets = getLayersPresetOptions(targets.form);

  return {
    hasLocalSnapshot:
      hasStorageSnapshot || Boolean(cachedSummary?.hasLocalSnapshot),
    stylePreset:
      targets.getLocalStorageItem("presetStyle") ||
      cachedSummary?.stylePreset ||
      "default",
    lastLayersPreset:
      liveLayersPreset ||
      cachedSummary?.lastLayersPreset ||
      targets.getLocalStorageItem("preset") ||
      "custom",
    autosaveInterval:
      liveAutosaveInterval || cachedSummary?.autosaveInterval || "0",
    pendingSeed: getInputValue(
      "optionsSeed",
      cachedSummary?.pendingSeed || "",
      targets.form,
    ),
    ...projectForm,
    pendingWidth: getInputValue(
      "mapWidthInput",
      cachedSummary?.pendingWidth || "",
      targets.form,
    ),
    pendingHeight: getInputValue(
      "mapHeightInput",
      cachedSummary?.pendingHeight || "",
      targets.form,
    ),
    availableLayersPresets: availableLayersPresets.length
      ? availableLayersPresets
      : cachedSummary?.availableLayersPresets || [],
    canSaveLayersPreset: hasVisibleInlineDisplay(
      "savePresetButton",
      cachedSummary?.canSaveLayersPreset,
      targets.form,
    ),
    canRemoveLayersPreset: hasVisibleInlineDisplay(
      "removePresetButton",
      cachedSummary?.canRemoveLayersPreset,
      targets.form,
    ),
    canOpenSeedHistory:
      targets.hasElement("optionsMapHistory") ||
      Boolean(cachedSummary?.canOpenSeedHistory),
    canCopySeedUrl:
      targets.hasElement("optionsCopySeed") ||
      Boolean(cachedSummary?.canCopySeedUrl),
    canSetSeed:
      targets.hasElement("optionsSeed") || Boolean(cachedSummary?.canSetSeed),
    canRestoreDefaultCanvasSize:
      targets.hasElement("restoreDefaultCanvasSize") ||
      Boolean(cachedSummary?.canRestoreDefaultCanvasSize),
  } satisfies EngineProjectSummary;
}
