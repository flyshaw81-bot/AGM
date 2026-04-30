import {
  getEngineProjectSummary,
  setEnginePendingBurgs,
  setEnginePendingGrowthRate,
  setEnginePendingProvincesRatio,
  setEnginePendingSizeVariety,
  setEnginePendingStates,
} from "../bridge/engineActions";
import { createWorldDocumentDraft } from "../state/worldDocumentDraft";
import type {
  GenerationProfileImpactChange,
  GenerationProfileImpactState,
  GenerationProfileOverrideKey,
  StudioState,
} from "../types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getExplicitGenerationProfileOverrides(state: StudioState) {
  return state.generationProfileOverrides.profile === state.document.gameProfile
    ? state.generationProfileOverrides.values
    : {};
}

export function getActiveGenerationProfileOverrides(state: StudioState) {
  const projectSummary = getEngineProjectSummary();
  const worldDraft = createWorldDocumentDraft(state, projectSummary);
  const profileDefaults: Partial<Record<GenerationProfileOverrideKey, number>> =
    {};

  worldDraft.playability.generatorProfileSuggestions.forEach((suggestion) => {
    if (suggestion.profile !== state.document.gameProfile) return;
    profileDefaults[suggestion.parameterDraft.key] =
      suggestion.parameterDraft.value;
  });

  return {
    ...profileDefaults,
    ...getExplicitGenerationProfileOverrides(state),
  };
}

function numberFromSummary(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function recordGenerationProfileImpactChange(
  changes: GenerationProfileImpactChange[],
  change: GenerationProfileImpactChange,
) {
  if (change.before === change.after) return;
  changes.push(change);
}

export function createGenerationProfileResultSample(state: StudioState) {
  const projectSummary = getEngineProjectSummary();
  const worldDraft = createWorldDocumentDraft(state, projectSummary);
  const routePointCount = worldDraft.resources.routes.reduce(
    (total, route) => total + (route.pointCount || 0),
    0,
  );
  const averageSpawnScore = worldDraft.playability.spawnCandidates.length
    ? Math.round(
        worldDraft.playability.spawnCandidates.reduce(
          (total, candidate) => total + candidate.score,
          0,
        ) / worldDraft.playability.spawnCandidates.length,
      )
    : 0;

  return {
    spawnCandidates: worldDraft.playability.spawnCandidates.length,
    averageSpawnScore,
    states: worldDraft.entities.states.length,
    burgs: worldDraft.entities.burgs.length,
    provinces: worldDraft.resources.provinces.length,
    routes: worldDraft.resources.routes.length,
    routePointCount,
    resourceTaggedBiomes: worldDraft.resources.biomes.filter(
      (biome) => biome.agmResourceTag !== undefined,
    ).length,
  };
}

export function createGenerationProfileResultMetrics(
  before: ReturnType<typeof createGenerationProfileResultSample>,
  after: ReturnType<typeof createGenerationProfileResultSample>,
): GenerationProfileImpactState["resultMetrics"] {
  return (Object.keys(before) as (keyof typeof before)[]).map((key) => ({
    key,
    before: before[key],
    after: after[key],
    delta: after[key] - before[key],
  }));
}

export function applyGenerationProfileOverridesToEngineSettings(
  state: StudioState,
) {
  const overrides = getActiveGenerationProfileOverrides(state);
  const projectSummary = getEngineProjectSummary();
  const changes: GenerationProfileImpactChange[] = [];

  if (typeof overrides.spawnFairnessWeight === "number") {
    const after = Math.round(clamp(overrides.spawnFairnessWeight, 0, 10) * 10);
    recordGenerationProfileImpactChange(changes, {
      key: "spawnFairnessWeight",
      target: "states",
      before: numberFromSummary(projectSummary.pendingStates),
      after,
    });
    setEnginePendingStates(after);
  }
  if (typeof overrides.settlementDensityTarget === "number") {
    const states = Number(projectSummary.pendingStates) || 1;
    const after = Math.round(
      clamp(overrides.settlementDensityTarget, 1, 1000) * states,
    );
    recordGenerationProfileImpactChange(changes, {
      key: "settlementDensityTarget",
      target: "burgs",
      before: numberFromSummary(projectSummary.pendingBurgs),
      after,
    });
    setEnginePendingBurgs(after);
  }
  if (typeof overrides.routeConnectivityScore === "number") {
    const after = clamp(overrides.routeConnectivityScore / 50, 0.1, 2);
    recordGenerationProfileImpactChange(changes, {
      key: "routeConnectivityScore",
      target: "growthRate",
      before: numberFromSummary(projectSummary.pendingGrowthRate),
      after,
    });
    setEnginePendingGrowthRate(after);
  }
  if (typeof overrides.biomeFrictionWeight === "number") {
    const after = clamp(overrides.biomeFrictionWeight * 5, 0, 10);
    recordGenerationProfileImpactChange(changes, {
      key: "biomeFrictionWeight",
      target: "sizeVariety",
      before: numberFromSummary(projectSummary.pendingSizeVariety),
      after,
    });
    setEnginePendingSizeVariety(after);
  }
  if (typeof overrides.resourceCoverageTarget === "number") {
    const after = clamp(overrides.resourceCoverageTarget, 0, 100);
    recordGenerationProfileImpactChange(changes, {
      key: "resourceCoverageTarget",
      target: "provincesRatio",
      before: numberFromSummary(projectSummary.pendingProvincesRatio),
      after,
    });
    setEnginePendingProvincesRatio(after);
  }

  state.generationProfileImpact = changes.length
    ? {
        profile: state.document.gameProfile,
        appliedAt: Date.now(),
        changes,
        resultMetrics: [],
      }
    : null;
}
