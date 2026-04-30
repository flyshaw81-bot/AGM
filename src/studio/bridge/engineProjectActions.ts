import type { ProjectAction } from "./engineActionTypes";
import {
  createGlobalProjectActionTargets,
  type EngineProjectActionTargets,
} from "./engineProjectActionTargets";

function getInput(
  id: string,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  return targets.getInput(id);
}

function setInputValue(
  input: HTMLInputElement,
  value: string,
  targets: EngineProjectActionTargets,
) {
  input.value = value;
  targets.dispatchInputAndChange(input);
}

function setIntegerInput(
  id: string,
  value: number,
  min: number,
  fallbackMax: number,
  targets: EngineProjectActionTargets,
) {
  const input = getInput(id, targets);
  if (!input) return "";
  const max = Number(input.max || String(fallbackMax));
  const nextValue = String(
    Math.max(min, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))),
  );
  setInputValue(input, nextValue, targets);
  return nextValue;
}

function setIntegerInputFromBounds(
  id: string,
  value: number,
  fallbackMin: number,
  fallbackMax: number,
  targets: EngineProjectActionTargets,
) {
  const input = getInput(id, targets);
  if (!input) return "";
  const min = Number(input.min || String(fallbackMin));
  const max = Number(input.max || String(fallbackMax));
  const nextValue = String(
    Math.max(min, Math.min(max || Number.MAX_SAFE_INTEGER, Math.trunc(value))),
  );
  setInputValue(input, nextValue, targets);
  return nextValue;
}

function setDecimalInput(
  id: string,
  value: number,
  fallbackMin: number,
  fallbackMax: number,
  targets: EngineProjectActionTargets,
) {
  const input = getInput(id, targets);
  if (!input || !Number.isFinite(value)) return;
  const min = Number(input.min || String(fallbackMin));
  const max = Number(input.max || String(fallbackMax));
  const nextValue = String(
    Math.max(min, Math.min(max, Math.round(value * 10) / 10)),
  );
  setInputValue(input, nextValue, targets);
}

export function setEngineLayersPreset(
  preset: string,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const select = targets.getSelect("layersPreset");
  if (!select) return;
  select.value = preset;
  targets.dispatchChange(select);
}

export function setEngineAutosaveInterval(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const nextValue = String(Math.max(0, Math.min(60, Math.trunc(value))));
  const output = getInput("autosaveIntervalOutput", targets);
  const input = getInput("autosaveIntervalInput", targets);
  if (output) setInputValue(output, nextValue, targets);
  if (input) setInputValue(input, nextValue, targets);
}

export function runEngineLayersPresetAction(
  action: "save" | "remove",
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const buttonId =
    action === "save" ? "savePresetButton" : "removePresetButton";
  targets.clickElement(buttonId);
}

export function runEngineProjectAction(
  action: ProjectAction,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const buttonId =
    action === "seed-history"
      ? "optionsMapHistory"
      : action === "copy-seed-url"
        ? "optionsCopySeed"
        : "restoreDefaultCanvasSize";
  targets.clickElement(buttonId);
}

export function setEnginePendingSeed(
  seed: string,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const input = getInput("optionsSeed", targets);
  if (!input) return;
  setInputValue(input, seed, targets);
}

export function setEnginePendingPoints(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setIntegerInput("pointsInput", value, 1, 13, targets);
}

export function setEnginePendingCultures(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setIntegerInput("culturesInput", value, 1, 0, targets);
}

export function setEnginePendingBurgs(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const output = targets.getOutput("manorsOutput");
  const nextValue = setIntegerInputFromBounds(
    "manorsInput",
    value,
    0,
    1000,
    targets,
  );
  if (!nextValue) return;
  if (output) output.value = nextValue === "1000" ? "auto" : nextValue;
}

export function setEnginePendingReligions(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setIntegerInputFromBounds("religionsNumber", value, 0, 50, targets);
}

export function setEnginePendingStates(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setIntegerInput("statesNumber", value, 0, 100, targets);
}

export function setEnginePendingProvincesRatio(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setIntegerInputFromBounds("provincesRatio", value, 0, 100, targets);
}

export function setEnginePendingSizeVariety(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setDecimalInput("sizeVariety", value, 0, 10, targets);
}

export function setEnginePendingGrowthRate(
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  setDecimalInput("growthRate", value, 0.1, 2, targets);
}

export {
  setEngineLatitude,
  setEngineLongitude,
  setEngineMapSize,
  setEnginePrecipitation,
  setEngineTemperatureEquator,
  setEngineTemperatureNorthPole,
  setEngineTemperatureSouthPole,
  setEngineWindTier0,
  setEngineWindTier1,
  setEngineWindTier2,
  setEngineWindTier3,
  setEngineWindTier4,
  setEngineWindTier5,
} from "./engineProjectControls";

export function setEngineStateLabelsMode(
  value: string,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const select = targets.getSelect("stateLabelsModeInput");
  if (!select) return;
  select.value = value;
  targets.dispatchInputAndChange(select);
}

export function setEngineCultureSet(
  value: string,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const select = targets.getSelect("culturesSet");
  if (!select) return;
  select.value = value;
  targets.dispatchInputAndChange(select);
}

export function setEnginePendingTemplate(
  template: string,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const select = targets.getSelect("templateInput");
  if (!select) return;

  const option = targets.findSelectOption(select, template);
  const label = option?.textContent || targets.getTemplateLabel(template);

  if (targets.applyOption(select, template, label)) {
    // Applied by the current engine helper.
  } else {
    if (!option) targets.addSelectOption(select, label, template);
    select.value = template;
  }

  targets.dispatchInputAndChange(select);
}

export function setEnginePendingCanvasSize(
  dimension: "width" | "height",
  value: number,
  targets: EngineProjectActionTargets = createGlobalProjectActionTargets(),
) {
  const inputId = dimension === "width" ? "mapWidthInput" : "mapHeightInput";
  const input = getInput(inputId, targets);
  if (!input) return;
  setInputValue(input, String(value), targets);
}

export {
  getEngineProjectSummary,
  syncEngineProjectSummary,
} from "./engineProjectSummary";
