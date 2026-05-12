import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import { renderNativeStudioShell } from "./nativeShell";

vi.mock("../bridge/engineActions", () => ({
  getEngineEntitySummary: () => ({
    states: [],
    burgs: [],
    cultures: [],
    religions: [],
  }),
  getEngineTopbarActions: () => ({
    new: true,
    open: true,
    save: true,
    export: true,
  }),
  getEngineLayerStates: () => ({
    toggleCells: true,
    toggleBiomes: false,
    toggleRivers: false,
    toggleRelief: false,
    toggleBorders: false,
    toggleRoutes: false,
    toggleReligions: false,
    toggleMarkers: false,
  }),
  getEngineWorldResourceSummary: () => ({
    biomes: [],
    provinces: [],
    routes: [],
    zones: [],
    markers: [],
    military: [],
  }),
}));

function makeDirectEditor(): StudioState["directEditor"] {
  return {
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
    selectedMarkerId: null,
    markerSearchQuery: "",
    markerFilterMode: "all",
    lastAppliedMarkerId: null,
    selectedDiplomacySubjectId: null,
    selectedDiplomacyObjectId: null,
    diplomacySearchQuery: "",
    diplomacyFilterMode: "all",
    lastAppliedDiplomacyPair: null,
    militarySearchQuery: "",
    militaryFilterMode: "all",
    relationshipQueueHistory: null,
    relationshipQueueHistoryLog: [],
  };
}

function makeState(canvasTool: StudioState["viewport"]["canvasTool"]) {
  return {
    language: "en",
    theme: "night",
    shell: { activeEditorModule: "states", navigationCollapsed: false, visibleLayerCards: ["toggleCells","toggleBiomes","toggleRivers","toggleRelief","toggleBorders","toggleRoutes","toggleReligions","toggleMarkers","toggleStates","toggleLabels"] },
    section: "canvas",
    document: {
      name: "Untitled map",
      documentWidth: 1440,
      documentHeight: 900,
      seed: "123",
      stylePreset: "gloom",
      dirty: false,
      source: "agm",
      gameProfile: "rpg",
      designIntent: "",
    },
    projectCenter: {
      recentProjects: [],
      activeProjectId: "",
      lastSavedAt: null,
    },
    viewport: {
      presetId: "desktop-landscape",
      width: 1440,
      height: 900,
      orientation: "landscape",
      fitMode: "contain",
      zoom: 1,
      panX: 0,
      panY: 0,
      safeAreaEnabled: true,
      guidesEnabled: true,
      canvasTool,
      selectedCanvasEntity: null,
      paintPreview: null,
      canvasEditHistory: [],
    },
    export: { format: "png" },
    editor: {
      activeEditor: null,
      editorDialogOpen: false,
      lastEditorSection: null,
    },
    directEditor: makeDirectEditor(),
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
  } as unknown as StudioState;
}

describe("native biome adjustment popover", () => {
  it("keeps biome adjustment out of the canvas inspector in v8", () => {
    const html = renderNativeStudioShell(makeState("brush"));

    expect(html).toContain('data-native-v8-info-panel="true"');
    expect(html).not.toContain('data-studio-biome-insights="true"');
    expect(html).not.toContain(
      "Biome coverage appears after a map is generated.",
    );
    expect(html).not.toContain('data-native-biome-adjustment="true"');
    expect(html).not.toContain("studio-native-biome-popover");
    expect(html).not.toContain("Close biome adjustment");
    expect(html).toContain('data-studio-action="canvas-tool"');
    expect(html).toContain('data-value="brush"');
    expect(html).not.toContain('data-canvas-tool-hud="true"');
  });

  it("stays hidden for ordinary canvas tools", () => {
    const html = renderNativeStudioShell(makeState("select"));

    expect(html).not.toContain('data-native-biome-adjustment="true"');
  });
});
