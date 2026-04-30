import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  AGM_DRAFT_STORAGE_KEY,
  createGlobalWorldDocumentDraftTargets,
  exportAgmDocumentDraft,
  exportHeightmapRaw16Draft,
  saveAgmDocumentDraft,
  type WorldDocumentDraftTargets,
} from "./worldDocumentDraft";
import type {
  AgmDocumentDraft,
  WorldDocumentDraftBuilderTargets,
} from "./worldDocumentDraftBuilders";

function createDraft(): AgmDocumentDraft {
  return {
    schema: "agm.document.v0",
    document: {
      name: "Northwatch",
      gameProfile: "balanced",
      designIntent: "",
    },
    world: {
      package: {
        schema: "agm.world-package.v0",
        manifest: {
          id: "northwatch",
          name: "Northwatch",
          profile: "balanced",
          profileLabel: "Balanced",
        },
        map: {
          seed: "42",
          width: 1000,
          height: 800,
          style: "default",
          heightmap: "volcano",
        },
        maps: {
          resourceMap: {
            schema: "agm.resource-map.v0",
            tiles: [],
          },
          provinceMap: {
            schema: "agm.province-map.v0",
            tiles: [],
          },
          biomeMap: {
            schema: "agm.biome-map.v0",
            biomes: [],
          },
        },
      },
      rules: {
        profileRules: {
          profile: "balanced",
        },
      },
    },
  } as unknown as AgmDocumentDraft;
}

function createTargets(draft: AgmDocumentDraft): WorldDocumentDraftTargets {
  return {
    createDraft: vi.fn(() => draft),
    setStorageItem: vi.fn(),
    getStorageItem: vi.fn(),
    readFileText: vi.fn(),
    downloadJson: vi.fn(),
    downloadBlob: vi.fn(),
    createPngBlob: vi.fn(async () => new Blob(["png"])),
    createRaw16Blob: vi.fn(() => new Blob(["raw"])),
    exportEnginePackage: vi.fn(async () => ({
      filename: "Northwatch.agm-engine-package.zip",
      manifest: {},
      heightfield: {},
    })),
  } as unknown as WorldDocumentDraftTargets;
}

function createState(): StudioState {
  return {
    document: {
      name: "Northwatch",
      source: "agm",
      gameProfile: "strategy",
      designIntent: "balanced fantasy campaign",
      seed: "42",
      documentWidth: 1200,
      documentHeight: 800,
      stylePreset: "default",
    },
    generationProfileOverrides: {
      profile: "strategy",
      values: {},
    },
    generationProfileImpact: null,
    autoFixPreview: {
      appliedDraftIds: [],
      discardedDraftIds: [],
      undoStack: [],
      redoStack: [],
    },
    viewport: {
      presetId: "desktop",
      orientation: "landscape",
      fitMode: "contain",
    },
    export: {
      format: "png",
    },
  } as unknown as StudioState;
}

function createSummary(): EngineProjectSummary {
  return {
    pendingSeed: "42",
    pendingPoints: "1000",
    pendingCellsLabel: "10K",
    pendingStates: "4",
    pendingProvincesRatio: "60",
    pendingGrowthRate: "1",
    pendingSizeVariety: "5",
    pendingTemplate: "volcano",
    pendingTemplateLabel: "Volcano",
    pendingWidth: "1200",
    pendingHeight: "800",
    pendingTemperatureEquator: "30",
    pendingTemperatureNorthPole: "-10",
    pendingTemperatureSouthPole: "-12",
    pendingPrecipitation: "100",
    pendingMapSize: "50",
    pendingLatitude: "45",
    pendingLongitude: "0",
    pendingWindTier0: "0",
    pendingWindTier1: "45",
    pendingWindTier2: "90",
    pendingWindTier3: "135",
    pendingWindTier4: "180",
    pendingWindTier5: "225",
    pendingCultures: "3",
    pendingBurgs: "20",
    pendingBurgsLabel: "20",
    pendingReligions: "2",
    pendingStateLabelsMode: "auto",
    pendingStateLabelsModeLabel: "Auto",
    pendingCultureSet: "fantasy",
    pendingCultureSetLabel: "Fantasy",
    lastLayersPreset: "custom",
  } as EngineProjectSummary;
}

function createBuilderTargets(): WorldDocumentDraftBuilderTargets {
  return {
    getEntities: vi.fn(() => ({
      states: [{ id: 1, name: "Northwatch" }],
      burgs: [],
      cultures: [],
      religions: [],
    })),
    getResources: vi.fn(() => ({
      biomes: [],
      provinces: [],
      routes: [],
      zones: [],
    })),
    getLayerStates: vi.fn(
      () =>
        ({
          toggleBorders: true,
        }) as ReturnType<WorldDocumentDraftBuilderTargets["getLayerStates"]>,
    ),
    getLayerDetails: vi.fn(() => []),
  };
}

describe("worldDocumentDraft", () => {
  it("saves AGM drafts through injected storage targets", () => {
    const draft = createDraft();
    const targets = createTargets(draft);

    expect(
      saveAgmDocumentDraft(
        {} as StudioState,
        {} as EngineProjectSummary,
        targets,
      ),
    ).toBe(draft);
    expect(targets.setStorageItem).toHaveBeenCalledWith(
      AGM_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  });

  it("exports AGM drafts through injected JSON download targets", () => {
    const draft = createDraft();
    const targets = createTargets(draft);

    expect(
      exportAgmDocumentDraft(
        {} as StudioState,
        {} as EngineProjectSummary,
        targets,
      ),
    ).toBe(draft);
    expect(targets.downloadJson).toHaveBeenCalledWith("Northwatch.agm", draft);
  });

  it("exports heightmap RAW16 through injected blob targets", () => {
    const draft = createDraft();
    const targets = createTargets(draft);

    const result = exportHeightmapRaw16Draft(
      {} as StudioState,
      {} as EngineProjectSummary,
      targets,
    );

    expect(result.filename).toBe("Northwatch.agm-heightmap-r16.raw");
    expect(targets.createRaw16Blob).toHaveBeenCalledWith(result.heightfield);
    expect(targets.downloadBlob).toHaveBeenCalledWith(
      result.filename,
      expect.any(Blob),
    );
  });

  it("composes default draft targets from injected builder targets", () => {
    const builderTargets = createBuilderTargets();
    const targets = createGlobalWorldDocumentDraftTargets({ builderTargets });

    const draft = targets.createDraft(createState(), createSummary());

    expect(draft.world.entities.states[0]?.name).toBe("Northwatch");
    expect(draft.world.layers.visible.toggleBorders).toBe(true);
    expect(builderTargets.getEntities).toHaveBeenCalledWith();
    expect(builderTargets.getLayerStates).toHaveBeenCalledWith();
  });
});
