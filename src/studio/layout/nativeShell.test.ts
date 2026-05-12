import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderNativeStudioShell } from "./nativeShell";

const engineMockState = vi.hoisted(() => ({
  entitySummary: {
    states: [],
    burgs: [],
    cultures: [],
    religions: [],
  } as EngineEntitySummary,
  worldResources: {
    biomes: [],
    provinces: [],
    routes: [],
    zones: [],
    markers: [],
    military: [],
  } as EngineWorldResourceSummary,
}));

vi.mock("../bridge/engineActions", () => ({
  getEngineEntitySummary: () => engineMockState.entitySummary,
  getEngineTopbarActions: () => ({
    new: true,
    open: true,
    save: true,
    export: true,
  }),
  getEngineProjectSummary: () => ({
    pendingSeed: "",
    canSetSeed: true,
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
  getEngineWorldResourceSummary: () => engineMockState.worldResources,
}));

const DEFAULT_VISIBLE_LAYER_CARDS = [
  "toggleCells",
  "toggleBiomes",
  "toggleRivers",
  "toggleRelief",
  "toggleBorders",
  "toggleRoutes",
  "toggleReligions",
  "toggleMarkers",
  "toggleStates",
  "toggleLabels",
];

function resetEngineMocks() {
  engineMockState.entitySummary = {
    states: [],
    burgs: [],
    cultures: [],
    religions: [],
  };
  engineMockState.worldResources = {
    biomes: [],
    provinces: [],
    routes: [],
    zones: [],
    markers: [],
    military: [],
  };
}

function mockBlockedRelationships() {
  engineMockState.entitySummary = {
    states: [{ id: 1, name: "Northwatch", culture: 99, capital: 88 }],
    burgs: [{ id: 10, name: "Saltport", state: 99, culture: 1 }],
    cultures: [{ id: 1, name: "Northfolk" }],
    religions: [],
  };
  engineMockState.worldResources = {
    biomes: [],
    provinces: [{ id: 20, name: "North Coast", state: 1, burg: 10 }],
    routes: [],
    zones: [],
    markers: [],
    military: [],
  };
}

beforeEach(() => {
  resetEngineMocks();
});

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

function makeState(overrides: Partial<StudioState> = {}): StudioState {
  const shellOverrides = (overrides as any).shell ?? {};
  return {
    language: "zh-CN",
    theme: "night",
    shell: {
      activeEditorModule: "states",
      navigationCollapsed: false,
      visibleLayerCards: [...DEFAULT_VISIBLE_LAYER_CARDS],
      ...shellOverrides,
    },
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
      canvasTool: "select",
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
    ...overrides,
  };
}

describe("native shell product navigation", () => {
  it("renders a compact native topbar instead of the legacy generation form", () => {
    const html = renderNativeStudioShell(makeState({ language: "en" }));

    expect(html).toContain('data-native-ui="v8"');
    expect(html).toContain('data-native-v8-topbar="true"');
    expect(html).toContain("studio-native-topbar");
    expect(html).toContain("studio-topbar__native-menu");
    expect(html).toContain('data-studio-icon="menu"');
    expect(html).toContain("AGM Studio");
    expect(html).toContain("Atlas Generation Matrix");
    expect(html).toContain('data-native-v8-viewport="true"');
    expect(html).not.toContain("studio-native-v8-topbar__context-label");
    expect(html).not.toContain("studio-native-v8-topbar__world-chip");
    expect(html).not.toContain("studio-native-v8-topbar__seed-chip");
    expect(html).toContain('data-studio-icon="sun"');
    expect(html).toContain('data-studio-icon="translate"');
    expect(html).toContain('data-studio-icon-set="pencil-lucide-icon-font"');
    expect(html).toContain('data-studio-action="section" data-value="project"');
    expect(html).not.toContain("studioTopbarGameProfileSelect");
    expect(html).not.toContain("studioTopbarSeedInput");
  });

  it("renders the Pencil moon icon when daylight mode can switch back to night", () => {
    const html = renderNativeStudioShell(
      makeState({ language: "en", theme: "daylight" }),
    );

    expect(html).toContain(
      'data-studio-action="theme-toggle" data-value="night"',
    );
    expect(html).toContain('data-studio-icon="moon"');
    expect(html).toContain('data-studio-icon-name="moon"');
    expect(html).toContain('data-studio-icon-set="pencil-lucide-icon-font"');
  });

  it("renders Pencil-style editor modules in the left icon bar", () => {
    const html = renderNativeStudioShell(makeState({ language: "en" }));
    const modulesStart = html.indexOf('aria-label="Editor modules"');
    const modulesEnd = html.indexOf('data-native-v8-canvas-tools="true"');
    const modulesHtml = html.slice(modulesStart, modulesEnd);

    expect(html).toContain('aria-label="Editor modules"');
    expect(modulesHtml).toContain(
      'data-workbench-target="studioDirectStatesWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectCulturesWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectProvincesWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectBurgsWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectDiplomacyWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectReligionsWorkbench"',
    );
    expect(modulesHtml).toContain(
      'data-workbench-target="studioDirectRoutesWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectMarkersWorkbench"',
    );
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectZonesWorkbench"',
    );
    expect(modulesHtml).toContain(
      'data-workbench-target="studioDirectBiomesWorkbench"',
    );
    expect(modulesHtml).toContain(
      '<span class="studio-native-iconbar__item-label">States</span>',
    );
    expect(modulesHtml).not.toContain("<span>Cultures</span>");
    expect(modulesHtml).not.toContain("<span>Provinces</span>");
    expect(modulesHtml).not.toContain("<span>Towns</span>");
    expect(modulesHtml).not.toContain("<span>Diplomacy</span>");
    expect(modulesHtml).not.toContain("<span>Religions</span>");
    expect(modulesHtml).toContain(
      '<span class="studio-native-iconbar__item-label">Map features</span>',
    );
    expect(modulesHtml).not.toContain("<span>Routes</span>");
    expect(modulesHtml).not.toContain("<span>Markers</span>");
    expect(modulesHtml).not.toContain("<span>Zones</span>");
    expect(modulesHtml).not.toContain(
      'data-workbench-target="studioDirectMilitaryWorkbench"',
    );
    expect(modulesHtml).not.toContain("<span>Military</span>");
    expect(modulesHtml).not.toContain('data-value="measure"');
    expect(modulesHtml).not.toContain("<span>Measure</span>");
  });

  it("keeps export and repair as v8 topbar section entries instead of iconbar globals", () => {
    const html = renderNativeStudioShell(makeState({ language: "en" }));

    expect(html).toContain(
      'class="studio-native-v8-topbar__action studio-native-v8-topbar__action--export"',
    );
    expect(html).toContain(
      'class="studio-native-v8-topbar__action studio-native-v8-topbar__action--repair"',
    );
    expect(html).toContain('data-studio-action="section" data-value="repair"');
    expect(html).toContain('data-studio-action="section" data-value="export"');
    expect(html).not.toContain(
      'data-studio-action="topbar" data-value="export"',
    );
    expect(html).not.toContain('class="studio-native-iconbar__global-area"');
    expect(html).not.toContain('aria-label="Delivery tools"');
  });

  it("marks the v8 workbench as collapsed when the top-left collapse button is active", () => {
    const html = renderNativeStudioShell(
      makeState({
        language: "en",
        shell: {
          activeEditorModule: "states",
          navigationCollapsed: true,
          visibleLayerCards: [...DEFAULT_VISIBLE_LAYER_CARDS],
        },
      }),
    );

    expect(html).toContain("studio-native-app--v8 is-nav-collapsed");
    expect(html).toContain('data-navigation-collapsed="true"');
    expect(html).toContain('aria-label="Expand navigation"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-native-v8-info-panel="true"');
  });

  it("opens the states workbench from project-home entry points instead of the canvas inspector", () => {
    const html = renderNativeStudioShell(
      makeState({
        language: "en",
        section: "project",
        shell: {
          activeEditorModule: "biomes",
          navigationCollapsed: false,
          visibleLayerCards: [...DEFAULT_VISIBLE_LAYER_CARDS],
        },
      }),
    );

    expect(html).toContain("studio-project-home");
    expect(html).toContain(
      'data-studio-action="direct-workbench-jump" data-workbench-target="studioDirectStatesWorkbench" data-value="states"',
    );
    expect(html).toContain("<span>Enter workbench</span>");
    expect(html).not.toContain(
      'class="studio-project-home__action" data-studio-action="section" data-value="canvas"',
    );
    expect(html).not.toContain(
      'class="studio-project-home__recent-row" data-studio-action="section" data-value="canvas"',
    );
    expect(html).not.toContain(
      'class="studio-project-home__template" data-studio-action="section" data-value="canvas"',
    );
  });

  it("renders native shell Chinese copy without mojibake", () => {
    const html = renderNativeStudioShell(
      makeState({ language: "zh-CN", section: "project" }),
    );

    expect(html).toContain("Atlas 生成矩阵");
    expect(html).toContain("程序化世界生成编辑器");
    expect(html).toContain("最近项目");
    expect(html).toContain("引擎就绪");
    expect(html).not.toMatch(
      /鐢熸垚|鐭╅樀|寮曟搸|褰撳墠|缂栬緫|鍒囨|澶栬|瑷|鏆|芒鈧|â€/,
    );
  });
});

describe("native shell delivery workflows", () => {
  it("renders export delivery status in the v8 right info panel when repair is ready", () => {
    const html = renderNativeStudioShell(
      makeState({ language: "en", section: "export" }),
    );

    expect(html).toContain('data-native-export-panel="true"');
    expect(html).toContain('data-relationship-export-gate="ready"');
    expect(html).toContain('data-export-delivery-decision="ready"');
    expect(html).toContain('data-export-run-policy="package-export-ready"');
    expect(html).toContain("Ready to deliver");
    expect(html).toContain(
      'data-studio-action="project" data-value="export-engine-package"',
    );
    expect(html).toContain("Export Engine Package ZIP");
    expect(html).toContain('data-studio-action="run-export"');
    expect(html).toContain("Review Repair Center");
    expect(html).not.toContain('data-native-workflow="export"');
  });

  it("renders blocked export delivery status in the v8 right info panel", () => {
    mockBlockedRelationships();

    const html = renderNativeStudioShell(
      makeState({ language: "en", section: "export" }),
    );

    expect(html).toContain('data-native-export-panel="true"');
    expect(html).toContain('data-relationship-export-gate="blocked"');
    expect(html).toContain('data-relationship-delivery-status="needs-repair"');
    expect(html).toContain('data-export-delivery-decision="needs-repair"');
    expect(html).toContain(
      'data-export-run-policy="image-export-allowed-delivery-blocked"',
    );
    expect(html).toContain("Needs repair before delivery");
    expect(html).toContain('data-studio-action="section" data-value="repair"');
    expect(html).toContain("Open Repair Center");
    expect(html).toContain('data-studio-action="run-export"');
    expect(html).not.toContain('data-native-workflow="export"');
  });
});

describe("native shell canvas overlays", () => {
  it("renders the official v8 canvas tools in the left rail", () => {
    const html = renderNativeStudioShell(makeState({ language: "en" }));

    expect(html).toContain('data-native-v8-canvas-tools="true"');
    expect(html).not.toContain("studio-native-v8-tool-status");
    expect(html).not.toContain('data-canvas-tool-hud="true"');
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-label="Canvas tools"');
    expect(html).toContain('data-native-v8-viewport="true"');
    expect(html).toContain('aria-label="Size: 16:10"');
    expect(html).toContain('aria-label="Fit mode: Contain"');
    expect(html).not.toContain('data-floating-toolbar="canvas"');
    expect(html).not.toContain('name="studio-floating-toolbar-viewport"');
    expect(html).not.toContain('data-viewport-field="orientation"');
    expect(html).not.toContain("data-studio-viewport-select");
    expect(html).not.toContain('data-studio-action="viewport-preset-cycle"');
    expect(html).not.toContain('data-studio-action="orientation"');
    expect(html).not.toContain('data-studio-action="fitmode"');
    expect(html).not.toContain('data-studio-action="viewport-zoom"');
    expect(html).not.toContain("studio-map-zoom");
    expect(html).not.toContain('data-value="local-generate"');
    expect(html).not.toContain('data-command-state="pending"');
    expect(html).not.toContain(
      "Local generation will land with the generation workflow pass",
    );
    expect(html).toContain('data-value="measure"');
    expect(html).toContain('aria-label="Measure distance and scale"');
    expect(html).toContain('aria-label="Paint map data"');
    expect(html).toContain('aria-label="Inspect map entities"');
  });

  it("renders permanent v8 layer cards with a restored bottom status strip", () => {
    const html = renderNativeStudioShell(makeState({ language: "en" }));

    expect(html).toContain('data-native-v8-bottom-bar="true"');
    expect(html).toContain('data-native-v8-layer-card="true"');
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-label="Layer visibility"');
    expect(html).toContain('data-value="toggleCells"');
    expect(html).toContain('data-layer-state="shown"');
    expect(html).toContain('aria-label="Grid: On"');
    expect(html).toContain('data-value="toggleBiomes"');
    expect(html).toContain('data-layer-state="hidden"');
    expect(html).toContain('aria-label="Biomes: Off"');
    expect(html).toContain("Generation Complete");
    expect(html).toContain("Warnings <strong>");
    expect(html).toContain("Errors <strong>");
    expect(html).toContain("Layers <strong>");
    expect(html).not.toContain('data-native-layerbar="true"');
  });

  it("keeps the v8 iconbar before the main workspace and bottom bar", () => {
    const html = renderNativeStudioShell(makeState({ language: "en" }));

    const iconbarStart = html.indexOf('class="studio-native-iconbar"');
    const mainStart = html.indexOf('class="studio-native-v8-main"');
    const bottomStart = html.indexOf('data-native-v8-bottom-bar="true"');

    expect(iconbarStart).toBeGreaterThan(-1);
    expect(mainStart).toBeGreaterThan(iconbarStart);
    expect(bottomStart).toBeGreaterThan(mainStart);
  });

  it("renders the official v8 shell with a fixed right-side info panel instead of a floating editor drawer", () => {
    engineMockState.entitySummary = {
      ...engineMockState.entitySummary,
      states: [{ id: 1, name: "Northwatch", color: "#26bfdb" }],
    };
    const html = renderNativeStudioShell(
      makeState({
        language: "en",
        section: "editors",
        shell: {
          activeEditorModule: "states",
          navigationCollapsed: false,
          visibleLayerCards: [
            "toggleCells",
            "toggleBiomes",
            "toggleRivers",
            "toggleRelief",
            "toggleBorders",
            "toggleRoutes",
            "toggleReligions",
            "toggleMarkers",
            "toggleStates",
            "toggleLabels",
          ],
        },
        directEditor: {
          ...makeDirectEditor(),
          selectedStateId: 1,
        },
      }),
      "v8",
    );

    expect(html).toContain('data-native-ui="v8"');
    expect(html).toContain('data-native-v8-topbar="true"');
    expect(html).toContain('class="studio-native-v8-topbar__context"');
    expect(html).toContain('data-native-v8-viewport="true"');
    expect(html).not.toContain("studio-native-v8-topbar__context-label");
    expect(html).not.toContain("studio-native-v8-topbar__world-chip");
    expect(html).not.toContain("studio-native-v8-topbar__seed-chip");
    expect(html).not.toContain("studio-native-v8-topbar__field--project");
    expect(html).not.toContain("生成档案");
    expect(html).not.toContain("Generation Profile");
    expect(html).not.toContain("studio-native-v8-topbar__field--seed");
    expect(html.indexOf('data-native-v8-viewport="true"')).toBeGreaterThan(
      html.indexOf('class="studio-native-v8-topbar__context"'),
    );
    expect(html.indexOf('data-native-v8-viewport="true"')).toBeLessThan(
      html.indexOf('class="studio-native-v8-topbar__actions"'),
    );
    expect(html).toContain('data-studio-action="section" data-value="project"');
    expect(html).toContain(
      'class="studio-native-v8-topbar__action studio-native-v8-topbar__action--generate"',
    );
    expect(html).toContain(
      'class="studio-native-v8-topbar__action studio-native-v8-topbar__action--repair"',
    );
    expect(html).toContain('data-studio-action="section" data-value="repair"');
    expect(html).toContain('data-studio-action="topbar" data-value="save"');
    expect(html).toContain('data-studio-action="section" data-value="export"');
    expect(
      html.indexOf('data-studio-action="section" data-value="repair"'),
    ).toBeLessThan(
      html.indexOf('data-studio-action="topbar" data-value="save"'),
    );
    expect(
      html.indexOf('data-studio-action="section" data-value="export"'),
    ).toBeLessThan(
      html.indexOf('data-studio-action="topbar" data-value="save"'),
    );
    expect(html).toContain('data-native-v8-canvas-tools="true"');
    expect(html).toContain('class="studio-native-v8-canvas-tool is-active"');
    expect(html).toContain('class="studio-native-iconbar__module-area"');
    expect(html).toContain('class="studio-native-v8-main"');
    expect(html).toContain('data-native-v8-info-panel="true"');
    expect(html).toContain('data-native-v8-panel-mode="workbench"');
    expect(html).toContain('data-native-v8-workbench-tabs="true"');
    expect(html).toContain('aria-label="Entity editing categories"');
    expect(html).toContain('class="studio-native-v8-workbench-tab is-active"');
    expect(html).toContain(
      'data-workbench-target="studioDirectStatesWorkbench" data-value="states"',
    );
    expect(html).toContain(
      'data-workbench-target="studioDirectCulturesWorkbench" data-value="cultures"',
    );
    expect(html).toContain(
      'data-workbench-target="studioDirectReligionsWorkbench" data-value="religions"',
    );
    expect(html).toContain(
      'data-workbench-target="studioDirectProvincesWorkbench" data-value="provinces"',
    );
    expect(html).toContain(
      'data-workbench-target="studioDirectBurgsWorkbench" data-value="burgs"',
    );
    expect(html).toContain(
      'data-workbench-target="studioDirectDiplomacyWorkbench" data-value="diplomacy"',
    );
    expect(html).not.toContain(
      'data-workbench-target="studioDirectMilitaryWorkbench" data-value="military"',
    );
    expect(html).toContain("<strong>国家</strong>");
    expect(html).toContain("<strong>文化</strong>");
    expect(html).toContain("<strong>宗教</strong>");
    expect(html).toContain("<strong>省份</strong>");
    expect(html).toContain("<strong>城镇</strong>");
    expect(html).toContain("<strong>外交</strong>");
    expect(html).not.toContain("<small>States</small>");
    expect(html).not.toContain("<em>");
    expect(html).not.toContain('data-native-v8-workbench-header="true"');
    expect(html).not.toContain("States Workbench");
    expect(html).not.toContain("studio-native-v8-info-panel__summary");
    expect(html).not.toContain('data-summary-state="ready"');
    expect(html).not.toContain("Current workbench summary");
    expect(html).not.toContain("studio-native-v8-info-panel__icon");
    expect(html).not.toContain("studio-native-v8-info-panel__tabs");
    expect(html).not.toContain("studio-native-v8-info-panel__tab");
    expect(html).toContain('data-native-v8-bottom-bar="true"');
    expect(html).toContain('data-native-v8-layer-card="true"');
    expect(html).toContain("studio-native-v8-layer-card__glyph");
    expect(html).toContain('data-value="toggleCells"');
    expect(html).toContain("Generation Complete");
    expect(html).toContain("Warnings <strong>");
    expect(html).toContain("Errors <strong>");
    expect(html).toContain('data-native-editor-module="states"');
    expect(html).not.toContain('data-social-workbench-tabs="true"');
    expect(html).toContain('id="studioDirectStatesWorkbench"');
    expect(html).not.toContain('data-floating-toolbar="canvas"');
    expect(html).not.toContain('data-native-layerbar="true"');
    expect(html).not.toContain("studio-statusbar");
    expect(html).not.toContain('class="studio-native-drawer');
    expect(html.indexOf('data-value="mapFeatures"')).toBeGreaterThan(-1);
    expect(html.indexOf('data-value="layers"')).toBeGreaterThan(-1);
    expect(html.indexOf('data-native-v8-canvas-tools="true"')).toBeGreaterThan(
      html.indexOf('data-value="mapFeatures"'),
    );
    expect(html).not.toContain('class="studio-native-iconbar__global-area"');
    expect(html).not.toContain('aria-label="Delivery tools"');
    expect(html.indexOf('class="studio-native-v8-info-panel"')).toBeGreaterThan(
      html.indexOf('class="studio-stage studio-native-stage"'),
    );
  });

  it("keeps biome distribution out of the default v8 canvas info panel", () => {
    const html = renderNativeStudioShell(
      makeState({ language: "en", section: "canvas" }),
      "v8",
    );

    expect(html).toContain('data-native-v8-info-panel="true"');
    expect(html).not.toContain('data-studio-biome-insights="true"');
    expect(html).not.toContain("Output canvas");
    expect(html).not.toContain("Map info");
    expect(html).not.toContain("studioInspectorPresetSelect");
    expect(html).not.toContain("studio-canvas-summary");
  });

  it("does not show entity category tabs for single-module v8 editors", () => {
    const html = renderNativeStudioShell(
      makeState({
        language: "en",
        section: "editors",
        shell: {
          activeEditorModule: "biomes",
          navigationCollapsed: false,
          visibleLayerCards: [...DEFAULT_VISIBLE_LAYER_CARDS],
        },
      }),
      "v8",
    );
    const panelStart = html.indexOf('class="studio-native-v8-info-panel"');
    const panelHtml = html.slice(panelStart);

    expect(panelStart).toBeGreaterThan(-1);
    expect(panelHtml).toContain('data-native-v8-panel-tabs="none"');
    expect(panelHtml).not.toContain('data-native-v8-workbench-tabs="true"');
    expect(panelHtml).not.toContain("Entity editing categories");
    expect(panelHtml).not.toContain("Map feature categories");
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectStatesWorkbench" data-value="states"',
    );
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectCulturesWorkbench" data-value="cultures"',
    );
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectReligionsWorkbench" data-value="religions"',
    );
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectProvincesWorkbench" data-value="provinces"',
    );
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectBurgsWorkbench" data-value="burgs"',
    );
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectDiplomacyWorkbench" data-value="diplomacy"',
    );
    expect(panelHtml).toContain('id="studioDirectBiomesWorkbench"');
    expect(panelHtml).toContain('data-studio-biome-insights="true"');
  });

  it("groups route marker and zone editors behind map feature tabs in v8", () => {
    const html = renderNativeStudioShell(
      makeState({
        language: "en",
        section: "editors",
        shell: {
          activeEditorModule: "markers",
          navigationCollapsed: false,
          visibleLayerCards: [...DEFAULT_VISIBLE_LAYER_CARDS],
        },
      }),
      "v8",
    );
    const panelStart = html.indexOf('class="studio-native-v8-info-panel"');
    const panelHtml = html.slice(panelStart);

    expect(panelStart).toBeGreaterThan(-1);
    expect(panelHtml).toContain('aria-label="Map features"');
    expect(panelHtml).toContain('data-native-v8-panel-tabs="map-features"');
    expect(panelHtml).toContain('data-native-v8-workbench-tabs-count="3"');
    expect(panelHtml).not.toContain('data-map-feature-workbench-tabs="true"');
    expect(panelHtml).toContain("Map feature categories");
    expect(panelHtml).toContain(
      'data-workbench-target="studioDirectRoutesWorkbench" data-value="routes"',
    );
    expect(panelHtml).toContain(
      'data-workbench-target="studioDirectMarkersWorkbench" data-value="markers"',
    );
    expect(panelHtml).toContain(
      'data-workbench-target="studioDirectZonesWorkbench" data-value="zones"',
    );
    expect(panelHtml).toContain('id="studioDirectMarkersWorkbench"');
    expect(panelHtml).not.toContain(
      'data-workbench-target="studioDirectStatesWorkbench" data-value="states"',
    );
  });

  it("keeps biome adjustment out of the v8 canvas panel and removes the duplicate floating popover", () => {
    const state = makeState({ language: "en", section: "canvas" });
    const html = renderNativeStudioShell(
      { ...state, viewport: { ...state.viewport, canvasTool: "brush" } },
      "v8",
    );

    expect(html).not.toContain('data-studio-biome-insights="true"');
    expect(html).not.toContain('data-native-biome-adjustment="true"');
    expect(html).not.toContain("studio-native-biome-popover");
  });

  it("does not duplicate repair or export workflow cards inside the v8 info panel", () => {
    const html = renderNativeStudioShell(
      makeState({ language: "en", section: "export" }),
      "v8",
    );

    expect(html).toContain('data-native-export-panel="true"');
    expect(html).not.toContain('data-native-workflow="export"');
  });

  it("does not render the legacy safe-area overlay in the native canvas", () => {
    const html = renderNativeStudioShell(makeState());

    expect(html).not.toContain("studio-canvas-frame__overlay--safe-area");
    expect(html).toContain("studio-canvas-frame__overlay--guides");
  });

  it("renders a generation busy overlay while canvas resize regeneration is running", () => {
    const html = renderNativeStudioShell(
      makeState({
        shell: {
          activeEditorModule: "states",
          navigationCollapsed: false,
          generationBusy: {
            title: "正在重新生成画布",
            detail: "1440 × 900",
          },
          visibleLayerCards: [...DEFAULT_VISIBLE_LAYER_CARDS],
        },
      }),
    );

    expect(html).toContain('data-generation-busy="true"');
    expect(html).toContain("正在重新生成画布");
    expect(html).toContain("1440 × 900");
  });
});
