import { getEngineDocumentState } from "../bridge/engineMapHost";
import { getEngineStylePreset } from "../bridge/engineStyle";
import { getPresetById } from "../canvas/presets";
import type { StudioState } from "../types";
import {
  applyDocumentPreferences,
  createGlobalStudioPreferenceTargets,
  getInitialLanguage,
  getInitialNavigationCollapsed,
  getInitialTheme,
  type StudioPreferenceTargets,
} from "./preferences";
import {
  createGlobalProjectCenterTargets,
  loadProjectCenterState,
  type ProjectCenterTargets,
} from "./projectCenter";

export type InitialStateTargets = {
  getEngineDocumentState: typeof getEngineDocumentState;
  getEngineStylePreset: typeof getEngineStylePreset;
  getPresetById: typeof getPresetById;
  preferences: StudioPreferenceTargets;
  projectCenter: Pick<ProjectCenterTargets, "getStorageItem">;
};

export function createGlobalInitialStateTargets(): InitialStateTargets {
  return {
    getEngineDocumentState,
    getEngineStylePreset,
    getPresetById,
    preferences: createGlobalStudioPreferenceTargets(),
    projectCenter: createGlobalProjectCenterTargets(),
  };
}

export function createInitialState(
  targets: InitialStateTargets = createGlobalInitialStateTargets(),
): StudioState {
  const documentState = targets.getEngineDocumentState();
  const initialPreset = targets.getPresetById("desktop-landscape");
  const language = getInitialLanguage(targets.preferences);
  const theme = getInitialTheme(targets.preferences);
  applyDocumentPreferences(language, theme, targets.preferences);

  const initialDocument: StudioState["document"] = {
    ...documentState,
    stylePreset: targets.getEngineStylePreset(),
    gameProfile: "rpg",
    designIntent: "",
  };

  return {
    language,
    theme,
    shell: {
      navigationCollapsed: getInitialNavigationCollapsed(targets.preferences),
    },
    section: "project",
    document: initialDocument,
    projectCenter: loadProjectCenterState(
      initialDocument,
      targets.projectCenter,
    ),
    viewport: {
      presetId: initialPreset.id,
      width: initialPreset.width,
      height: initialPreset.height,
      orientation: initialPreset.orientation,
      fitMode: "cover",
      zoom: 1,
      panX: 0,
      panY: 0,
      safeAreaEnabled: true,
      guidesEnabled: false,
      canvasTool: "select",
      selectedCanvasEntity: null,
      paintPreview: null,
      canvasEditHistory: [],
    },
    export: {
      format: "png",
    },
    editor: {
      activeEditor: null,
      editorDialogOpen: false,
      lastEditorSection: null,
    },
    directEditor: {
      selectedStateId: null,
      stateSearchQuery: "",
      stateSortMode: "name",
      stateFilterMode: "all",
      lastAppliedStateId: null,
      selectedBurgId: null,
      burgSearchQuery: "",
      burgFilterMode: "all",
      lastAppliedBurgId: null,
      selectedProvinceId: null,
      provinceSearchQuery: "",
      provinceFilterMode: "all",
      lastAppliedProvinceId: null,
      selectedRouteId: null,
      routeSearchQuery: "",
      routeFilterMode: "all",
      lastAppliedRouteId: null,
      selectedBiomeId: null,
      biomeSearchQuery: "",
      biomeFilterMode: "all",
      lastAppliedBiomeId: null,
      selectedCultureId: null,
      cultureSearchQuery: "",
      cultureFilterMode: "all",
      lastAppliedCultureId: null,
      selectedReligionId: null,
      religionSearchQuery: "",
      religionFilterMode: "all",
      lastAppliedReligionId: null,
      selectedZoneId: null,
      zoneSearchQuery: "",
      zoneFilterMode: "all",
      lastAppliedZoneId: null,
      selectedDiplomacySubjectId: null,
      selectedDiplomacyObjectId: null,
      diplomacySearchQuery: "",
      diplomacyFilterMode: "all",
      lastAppliedDiplomacyPair: null,
      relationshipQueueHistory: null,
      relationshipQueueHistoryLog: [],
    },
    balanceFocus: null,
    autoFixPreview: {
      appliedDraftIds: [],
      discardedDraftIds: [],
      undoStack: [],
      redoStack: [],
    },
    generationProfileOverrides: {
      profile: "rpg",
      values: {},
    },
    generationProfileImpact: null,
  };
}
