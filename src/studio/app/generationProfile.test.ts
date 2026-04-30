import { describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "../bridge/engineActions";
import type { WorldDocumentDraft } from "../state/worldDocumentDraft";
import type { StudioState } from "../types";
import {
  applyGenerationProfileOverridesToEngineSettings,
  createGenerationProfileResultSample,
  type GenerationProfileTargets,
  getActiveGenerationProfileOverrides,
} from "./generationProfile";

function createProjectSummary(
  overrides: Partial<EngineProjectSummary> = {},
): EngineProjectSummary {
  return {
    pendingStates: "2",
    pendingBurgs: "20",
    pendingGrowthRate: "1",
    pendingSizeVariety: "5",
    pendingProvincesRatio: "50",
    ...overrides,
  } as EngineProjectSummary;
}

function createWorldDraft(): WorldDocumentDraft {
  return {
    playability: {
      spawnCandidates: [{ score: 10 }, { score: 30 }],
      generatorProfileSuggestions: [
        {
          profile: "balanced",
          parameterDraft: {
            key: "spawnFairnessWeight",
            value: 4,
          },
        },
        {
          profile: "balanced",
          parameterDraft: {
            key: "settlementDensityTarget",
            value: 6,
          },
        },
      ],
    },
    entities: {
      states: [{}, {}],
      burgs: [{}],
    },
    resources: {
      provinces: [{}, {}, {}],
      routes: [{ pointCount: 2 }, { pointCount: 3 }],
      biomes: [{ agmResourceTag: "grain" }, {}],
    },
  } as unknown as WorldDocumentDraft;
}

function createState(
  values: StudioState["generationProfileOverrides"]["values"] = {},
): StudioState {
  return {
    document: {
      gameProfile: "balanced",
    },
    generationProfileOverrides: {
      profile: "balanced",
      values,
    },
    generationProfileImpact: null,
  } as unknown as StudioState;
}

function createTargets(
  summary: EngineProjectSummary = createProjectSummary(),
  worldDraft: WorldDocumentDraft = createWorldDraft(),
): GenerationProfileTargets {
  return {
    getProjectSummary: vi.fn(() => summary),
    createWorldDraft: vi.fn(() => worldDraft),
    setPendingStates: vi.fn(),
    setPendingBurgs: vi.fn(),
    setPendingGrowthRate: vi.fn(),
    setPendingSizeVariety: vi.fn(),
    setPendingProvincesRatio: vi.fn(),
    now: vi.fn(() => 1234),
  };
}

describe("generationProfile", () => {
  it("resolves profile defaults through injected targets", () => {
    const targets = createTargets();
    const overrides = getActiveGenerationProfileOverrides(
      createState({ settlementDensityTarget: 8 }),
      targets,
    );

    expect(overrides).toMatchObject({
      spawnFairnessWeight: 4,
      settlementDensityTarget: 8,
    });
    expect(targets.createWorldDraft).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
    );
  });

  it("samples generation results through injected world draft data", () => {
    const sample = createGenerationProfileResultSample(
      createState(),
      createTargets(),
    );

    expect(sample).toMatchObject({
      spawnCandidates: 2,
      averageSpawnScore: 20,
      states: 2,
      burgs: 1,
      provinces: 3,
      routes: 2,
      routePointCount: 5,
      resourceTaggedBiomes: 1,
    });
  });

  it("applies profile overrides through injected settings targets", () => {
    const targets = createTargets();
    const state = createState({
      routeConnectivityScore: 75,
      resourceCoverageTarget: 25,
    });

    applyGenerationProfileOverridesToEngineSettings(state, targets);

    expect(targets.setPendingStates).toHaveBeenCalledWith(40);
    expect(targets.setPendingBurgs).toHaveBeenCalledWith(12);
    expect(targets.setPendingGrowthRate).toHaveBeenCalledWith(1.5);
    expect(targets.setPendingProvincesRatio).toHaveBeenCalledWith(25);
    expect(state.generationProfileImpact).toMatchObject({
      profile: "balanced",
      appliedAt: 1234,
      changes: expect.arrayContaining([
        expect.objectContaining({ key: "spawnFairnessWeight", after: 40 }),
        expect.objectContaining({ key: "settlementDensityTarget", after: 12 }),
        expect.objectContaining({ key: "routeConnectivityScore", after: 1.5 }),
        expect.objectContaining({ key: "resourceCoverageTarget", after: 25 }),
      ]),
    });
  });
});
