import { describe, expect, it, vi } from "vitest";
import type { StudioState } from "../types";
import { renderEditorsPanel } from "./editorsPanel";

vi.mock("../bridge/engineActions", () => ({
  getEngineEditorAvailability: () => ({
    stateWorkbench: true,
    cultureWorkbench: true,
    religionWorkbench: true,
    biomeWorkbench: true,
    provinceWorkbench: true,
    zoneWorkbench: true,
    diplomacyWorkbench: true,
  }),
  getEngineEntitySummary: () => ({
    states: [
      { id: 0, name: "Neutrals" },
      { id: 1, name: "Northwatch", color: "#3366aa" },
    ],
    burgs: [],
    cultures: [{ id: 1, name: "Highland", color: "#b38a58" }],
    religions: [{ id: 1, name: "Old Faith", color: "#7c3aed" }],
  }),
  getEngineWorldResourceSummary: () => ({
    biomes: [{ id: 1, name: "Forest" }],
    provinces: [{ id: 1, name: "Northreach", state: 1 }],
    routes: [{ id: 1, group: "roads", pointCount: 4 }],
    zones: [{ id: 1, name: "North Zone", cellCount: 5 }],
    markers: [
      { id: 1, type: "volcano", cell: 12, pinned: true, hidden: false },
    ],
    military: [
      {
        id: "1:1",
        regimentId: 1,
        stateId: 1,
        stateName: "Northwatch",
        name: "1st Guard",
        total: 1000,
      },
    ],
  }),
}));

function directEditor(): StudioState["directEditor"] {
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

function state(
  activeEditorModule: StudioState["shell"]["activeEditorModule"],
  editorOverrides: Partial<StudioState["editor"]> = {},
) {
  return {
    language: "en",
    shell: {
      activeEditorModule,
      navigationCollapsed: false,
    },
    section: "editors",
    editor: {
      activeEditor: null,
      editorDialogOpen: false,
      lastEditorSection: "canvas",
      ...editorOverrides,
    },
    directEditor: directEditor(),
  } as StudioState;
}

describe("editorsPanel", () => {
  it("renders the active product module as the primary drawer content", () => {
    const html = renderEditorsPanel(state("cultures"));

    expect(html).toContain('data-native-editor-module="cultures"');
    expect(html).toContain("studioDirectCulturesWorkbench");
    expect(html).not.toContain("data-native-editor-compat");
  });

  it("uses states as the native default editor module", () => {
    const html = renderEditorsPanel(state("states"));

    expect(html).toContain('data-native-editor-module="states"');
    expect(html).not.toContain('data-social-workbench-tabs="true"');
    expect(html).toContain("studioDirectStatesWorkbench");
    expect(html).not.toContain("data-native-editor-compat");
  });

  it("renders religions without duplicating the outer nation and society tabs", () => {
    const html = renderEditorsPanel(state("religions"));

    expect(html).toContain('data-native-editor-module="religions"');
    expect(html).not.toContain('data-social-workbench-tabs="true"');
    expect(html).toContain('data-native-identity-drawer="religions"');
    expect(html).toContain('data-studio-action="direct-religion-apply"');
  });

  it("renders military as a native read-only contract module", () => {
    const html = renderEditorsPanel(state("military"));

    expect(html).toContain('data-native-editor-module="military"');
    expect(html).toContain('data-native-module-contract="military"');
    expect(html).toContain('data-military-readonly="true"');
    expect(html).toContain("Read-only intelligence");
  });

  it("renders markers as a native editable module", () => {
    const html = renderEditorsPanel(state("markers"));

    expect(html).toContain('data-native-editor-module="markers"');
    expect(html).not.toContain('data-map-feature-workbench-tabs="true"');
    expect(html).toContain('data-native-marker-drawer="true"');
    expect(html).toContain('data-studio-action="direct-marker-apply"');
  });

  it("keeps compatibility area from rendering duplicate primary workbenches", () => {
    const html = renderEditorsPanel(
      state("biomes", {
        activeEditor: "biomeWorkbench",
        editorDialogOpen: true,
      }),
    );
    const compatibilityHtml = html.slice(
      html.indexOf("data-native-editor-compat"),
    );

    expect(html).toContain('data-native-editor-module="biomes"');
    expect(html).toContain('data-native-biome-drawer="true"');
    expect(compatibilityHtml).toContain('data-editor-bridge-status="true"');
    expect(compatibilityHtml).toContain('data-editor-navigation-note="true"');
    expect(compatibilityHtml).not.toContain("studioDirectStatesWorkbench");
    expect(compatibilityHtml).not.toContain("studioDirectRoutesWorkbench");
    expect(compatibilityHtml).not.toContain("studioDirectBiomesWorkbench");
    expect(compatibilityHtml).not.toContain("direct-workbench-directory");
  });
});
