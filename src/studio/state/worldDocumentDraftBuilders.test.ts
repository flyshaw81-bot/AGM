import { describe, expect, it, vi } from "vitest";
import type {
  EngineEntitySummary,
  EngineProjectSummary,
  EngineWorldResourceSummary,
  LayerAction,
} from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  createAgmDocumentDraft,
  createWorldDocumentDraft,
  type WorldDocumentDraftBuilderTargets,
} from "./worldDocumentDraftBuilders";

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

function createTargets(): WorldDocumentDraftBuilderTargets {
  const entities: EngineEntitySummary = {
    states: [{ id: 1, name: "Northwatch" }],
    burgs: [{ id: 2, name: "Harbor", state: 1 }],
    cultures: [],
    religions: [],
  };
  const resources: EngineWorldResourceSummary = {
    biomes: [],
    provinces: [],
    routes: [],
    zones: [],
  };
  return {
    getEntities: vi.fn(() => entities),
    getResources: vi.fn(() => resources),
    getLayerStates: vi.fn(
      () =>
        ({
          toggleBorders: true,
        }) as Record<LayerAction, boolean>,
    ),
    getLayerDetails: vi.fn(
      () =>
        [
          {
            id: "toggleBorders",
            label: "Borders",
            active: true,
          },
        ] as ReturnType<WorldDocumentDraftBuilderTargets["getLayerDetails"]>,
    ),
  };
}

describe("worldDocumentDraftBuilders", () => {
  it("creates world drafts from injected engine summary targets", () => {
    const targets = createTargets();

    const draft = createWorldDocumentDraft(
      createState(),
      createSummary(),
      targets,
    );

    expect(draft.project.name).toBe("Northwatch");
    expect(draft.layers.visible.toggleBorders).toBe(true);
    expect(draft.layers.details[0]).toMatchObject({
      id: "toggleBorders",
      active: true,
    });
    expect(draft.entities.states[0]?.name).toBe("Northwatch");
    expect(targets.getEntities).toHaveBeenCalledWith();
    expect(targets.getResources).toHaveBeenCalledWith();
  });

  it("creates AGM document drafts from injected world draft targets", () => {
    const documentDraft = createAgmDocumentDraft(
      createState(),
      createSummary(),
      createTargets(),
    );

    expect(documentDraft.schema).toBe("agm.document.v0");
    expect(documentDraft.document.name).toBe("Northwatch");
    expect(documentDraft.world.package.manifest.id).toBe("Northwatch");
  });
});
