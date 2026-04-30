import { getEngineDocumentState } from "../bridge/engineMapHost";
import { getEngineStylePreset } from "../bridge/engineStyle";
import { getPresetById } from "../canvas/presets";
import type { StudioState } from "../types";
import {
  getInitialLanguage,
  getInitialNavigationCollapsed,
  getInitialTheme,
} from "./preferences";
import { loadProjectCenterState } from "./projectCenter";

export function createInitialState(): StudioState {
  const documentState = getEngineDocumentState();
  const initialPreset = getPresetById("desktop-landscape");
  const language = getInitialLanguage();
  const theme = getInitialTheme();
  document.documentElement.lang = language;
  document.documentElement.dataset.studioTheme = theme;

  const initialDocument: StudioState["document"] = {
    ...documentState,
    stylePreset: getEngineStylePreset(),
    gameProfile: "rpg",
    designIntent: "",
  };

  return {
    language,
    theme,
    shell: {
      navigationCollapsed: getInitialNavigationCollapsed(),
    },
    section: "project",
    document: initialDocument,
    projectCenter: loadProjectCenterState(initialDocument),
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
