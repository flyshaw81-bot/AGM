import { getEngineProjectSummary } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { PROJECT_MAP_WIND_TIER_SETTINGS } from "./projectMapSettingsModel";
import { bindNumberInput } from "./shellEventDom";

type ProjectWorkspaceChangeKey =
  | "layers-preset"
  | "document-name"
  | "game-profile"
  | "design-intent"
  | "autosave-interval"
  | "seed"
  | "points"
  | "states"
  | "provinces-ratio"
  | "growth-rate"
  | "temperature-equator"
  | "temperature-north-pole"
  | "temperature-south-pole"
  | "map-size"
  | "latitude"
  | "longitude"
  | "wind-tier-0"
  | "wind-tier-1"
  | "wind-tier-2"
  | "wind-tier-3"
  | "wind-tier-4"
  | "wind-tier-5"
  | "precipitation"
  | "size-variety"
  | "cultures"
  | "burgs"
  | "religions"
  | "state-labels-mode"
  | "culture-set"
  | "template"
  | "width"
  | "height";

export type ProjectWorkspaceChangeHandler = (
  setting: ProjectWorkspaceChangeKey,
  value: string,
) => void;

type ProjectWorkspaceControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

type ProjectSummaryKey = keyof ReturnType<typeof getEngineProjectSummary>;

type PendingProjectControl = {
  id: string;
  setting: ProjectWorkspaceChangeKey;
  summaryKey: ProjectSummaryKey;
  fallbackToCurrent?: boolean;
};

function getProjectWorkspaceElement(id: string) {
  return document.getElementById(id) as ProjectWorkspaceControlElement | null;
}

function asControlValue(value: unknown) {
  return value == null ? "" : String(value);
}

const pendingProjectControls: PendingProjectControl[] = [
  {
    id: "studioProjectSeedInput",
    setting: "seed",
    summaryKey: "pendingSeed",
    fallbackToCurrent: false,
  },
  {
    id: "studioProjectPointsInput",
    setting: "points",
    summaryKey: "pendingPoints",
  },
  {
    id: "studioProjectStatesInput",
    setting: "states",
    summaryKey: "pendingStates",
  },
  {
    id: "studioProjectProvincesRatioInput",
    setting: "provinces-ratio",
    summaryKey: "pendingProvincesRatio",
  },
  {
    id: "studioProjectGrowthRateInput",
    setting: "growth-rate",
    summaryKey: "pendingGrowthRate",
  },
  {
    id: "studioProjectTemperatureEquatorInput",
    setting: "temperature-equator",
    summaryKey: "pendingTemperatureEquator",
  },
  {
    id: "studioProjectTemperatureNorthPoleInput",
    setting: "temperature-north-pole",
    summaryKey: "pendingTemperatureNorthPole",
  },
  {
    id: "studioProjectTemperatureSouthPoleInput",
    setting: "temperature-south-pole",
    summaryKey: "pendingTemperatureSouthPole",
  },
  {
    id: "studioProjectMapSizeInput",
    setting: "map-size",
    summaryKey: "pendingMapSize",
  },
  {
    id: "studioProjectLatitudeInput",
    setting: "latitude",
    summaryKey: "pendingLatitude",
  },
  {
    id: "studioProjectLongitudeInput",
    setting: "longitude",
    summaryKey: "pendingLongitude",
  },
  ...PROJECT_MAP_WIND_TIER_SETTINGS.map(({ inputId, setting, summaryKey }) => ({
    id: inputId,
    setting,
    summaryKey,
  })),
  {
    id: "studioProjectPrecipitationInput",
    setting: "precipitation",
    summaryKey: "pendingPrecipitation",
  },
  {
    id: "studioProjectSizeVarietyInput",
    setting: "size-variety",
    summaryKey: "pendingSizeVariety",
  },
  {
    id: "studioProjectCulturesInput",
    setting: "cultures",
    summaryKey: "pendingCultures",
  },
  {
    id: "studioProjectBurgsInput",
    setting: "burgs",
    summaryKey: "pendingBurgs",
  },
  {
    id: "studioProjectReligionsInput",
    setting: "religions",
    summaryKey: "pendingReligions",
  },
  {
    id: "studioProjectStateLabelsModeSelect",
    setting: "state-labels-mode",
    summaryKey: "pendingStateLabelsMode",
  },
  {
    id: "studioProjectCultureSetSelect",
    setting: "culture-set",
    summaryKey: "pendingCultureSet",
    fallbackToCurrent: false,
  },
  {
    id: "studioProjectTemplateSelect",
    setting: "template",
    summaryKey: "pendingTemplate",
    fallbackToCurrent: false,
  },
  {
    id: "studioProjectWidthInput",
    setting: "width",
    summaryKey: "pendingWidth",
    fallbackToCurrent: false,
  },
  {
    id: "studioProjectHeightInput",
    setting: "height",
    summaryKey: "pendingHeight",
    fallbackToCurrent: false,
  },
];

export function bindProjectWorkspaceEvents(
  state: StudioState,
  onProjectWorkspaceChange: ProjectWorkspaceChangeHandler,
) {
  const projectSummary = getEngineProjectSummary();
  const bindControl = (
    id: string,
    setting: ProjectWorkspaceChangeKey,
    resolveValue: (element: ProjectWorkspaceControlElement) => string,
  ) => {
    const element = getProjectWorkspaceElement(id);
    if (!element) return;
    element.value = resolveValue(element);
    element.addEventListener("change", () =>
      onProjectWorkspaceChange(setting, element.value),
    );
  };
  const sectionSummaryValue =
    (
      section: StudioState["section"],
      summaryKey: ProjectSummaryKey,
      fallbackToCurrent = false,
    ) =>
    (element: ProjectWorkspaceControlElement) => {
      if (state.section !== section) return element.value;
      const value = asControlValue(projectSummary[summaryKey]);
      return fallbackToCurrent ? value || element.value : value;
    };
  const projectPendingValue =
    (summaryKey: ProjectSummaryKey, fallbackToCurrent = true) =>
    (element: ProjectWorkspaceControlElement) =>
      sectionSummaryValue("project", summaryKey, fallbackToCurrent)(element);

  bindControl(
    "studioProjectLayersPresetSelect",
    "layers-preset",
    sectionSummaryValue("project", "lastLayersPreset"),
  );
  bindControl(
    "studioLayersPresetSelect",
    "layers-preset",
    sectionSummaryValue("layers", "lastLayersPreset"),
  );
  bindControl("studioProjectNameInput", "document-name", () =>
    asControlValue(state.document.name),
  );
  bindControl("studioProjectGameProfileSelect", "game-profile", () =>
    asControlValue(state.document.gameProfile),
  );
  bindControl("studioTopbarGameProfileSelect", "game-profile", () =>
    asControlValue(state.document.gameProfile),
  );
  bindControl("studioProjectDesignIntentInput", "design-intent", () =>
    asControlValue(state.document.designIntent),
  );

  bindNumberInput("studioProjectAutosaveInput", (value) =>
    onProjectWorkspaceChange("autosave-interval", String(value)),
  );

  bindControl("studioTopbarSeedInput", "seed", (element) =>
    asControlValue(
      projectSummary.pendingSeed || state.document.seed || element.value,
    ),
  );

  pendingProjectControls.forEach(
    ({ id, setting, summaryKey, fallbackToCurrent = true }) => {
      bindControl(
        id,
        setting,
        projectPendingValue(summaryKey, fallbackToCurrent),
      );
    },
  );
}
