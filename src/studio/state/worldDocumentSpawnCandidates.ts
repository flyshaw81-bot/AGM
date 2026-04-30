import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import type {
  EffectiveProfileParameters,
  SpawnCandidateHint,
} from "./worldDocumentDraftTypes";
import { createEffectiveProfileParameters } from "./worldDocumentGeneratorProfiles";
import {
  clampScore,
  getProfilePriorityForHint,
} from "./worldDocumentPlayabilityPriorities";

type SpawnScoringProfileContext = {
  priorityId?: string;
  weight: number;
  parameters: EffectiveProfileParameters;
};

function createSpawnScoringProfileContext(
  state: StudioState,
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
): SpawnScoringProfileContext {
  const spawnPriority = getProfilePriorityForHint(
    state.document.gameProfile,
    "spawn",
  );
  const provisionalCandidates: SpawnCandidateHint[] = [];
  return {
    priorityId: spawnPriority?.id,
    weight: spawnPriority?.weight || 1,
    parameters: createEffectiveProfileParameters(
      state.document.gameProfile,
      provisionalCandidates,
      entities,
      resources,
      state.generationProfileOverrides,
    ),
  };
}

function applyProfileSpawnScore(
  baseScore: number,
  fairnessSignal: number,
  context: SpawnScoringProfileContext,
) {
  const fairnessWeight =
    context.parameters.spawnFairnessWeight ?? context.weight;
  const normalizedWeight = Math.max(0, Math.min(3, fairnessWeight));
  return clampScore(baseScore + fairnessSignal * normalizedWeight);
}

function createProfileSpawnReason(context: SpawnScoringProfileContext) {
  const fairnessWeight =
    context.parameters.spawnFairnessWeight ?? context.weight;
  return `Profile ${context.priorityId || "spawn"} applies spawn fairness weight ${Number(fairnessWeight.toFixed(2))}`;
}

export function createSpawnCandidates(
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  state: StudioState,
  habitableBiomes: EngineWorldResourceSummary["biomes"],
  routePointCount: number,
) {
  const mostHabitableBiome = habitableBiomes[0];
  const routeBonus = routePointCount > 0 ? 10 : 0;
  const burgsByState = new Map<number, number>();
  entities.burgs.forEach((burg) => {
    if (burg.state === undefined) return;
    burgsByState.set(burg.state, (burgsByState.get(burg.state) || 0) + 1);
  });

  const spawnScoringProfile = createSpawnScoringProfileContext(
    state,
    entities,
    resources,
  );

  const provinceCandidates = resources.provinces
    .filter((province) => province.state !== undefined)
    .slice(0, 8)
    .map((province, index): SpawnCandidateHint => {
      const stateBurgCount =
        province.state === undefined
          ? 0
          : burgsByState.get(province.state) || 0;
      const burgBonus =
        province.burg !== undefined || stateBurgCount > 0 ? 12 : 0;
      const biomeScore = mostHabitableBiome?.habitability || 50;
      const baseScore =
        35 + biomeScore * 0.35 + burgBonus + routeBonus - index * 2;
      const fairnessSignal =
        (province.burg !== undefined ? 4 : 0) +
        (stateBurgCount > 0 ? 3 : -2) +
        (routePointCount > 0 ? 2 : -1) -
        index * 0.5;
      const score = applyProfileSpawnScore(
        baseScore,
        fairnessSignal,
        spawnScoringProfile,
      );
      const reasons = [
        province.name
          ? `Province ${province.name} provides a bounded start region`
          : "Province provides a bounded start region",
        province.burg !== undefined || stateBurgCount > 0
          ? "Nearby settlement support is available"
          : "Settlement support should be reviewed",
        routePointCount > 0
          ? "Existing route network can support early movement"
          : "Route connectivity should be reviewed",
        createProfileSpawnReason(spawnScoringProfile),
      ];
      if (mostHabitableBiome)
        reasons.push(
          `${mostHabitableBiome.name} is the strongest known habitability biome`,
        );

      return {
        id: `spawn-province-${province.id}`,
        state: province.state,
        province: province.id,
        burg: province.burg,
        biome: mostHabitableBiome?.id,
        score,
        reasons,
      };
    });

  const fallbackCandidates = entities.states
    .slice(0, 6)
    .map((state, index): SpawnCandidateHint => {
      const stateBurgCount = burgsByState.get(state.id) || 0;
      const baseScore = 42 + stateBurgCount * 4 + routeBonus - index * 2;
      const fairnessSignal =
        (stateBurgCount > 0 ? 4 : -2) +
        (routePointCount > 0 ? 2 : -1) -
        index * 0.5;
      return {
        id: `spawn-state-${state.id}`,
        state: state.id,
        biome: mostHabitableBiome?.id,
        score: applyProfileSpawnScore(
          baseScore,
          fairnessSignal,
          spawnScoringProfile,
        ),
        reasons: [
          `${state.name} provides a political start region`,
          stateBurgCount > 0
            ? "State has known settlement support"
            : "State settlement support should be reviewed",
          routePointCount > 0
            ? "Known routes can support expansion checks"
            : "Route connectivity should be reviewed",
          createProfileSpawnReason(spawnScoringProfile),
        ],
      };
    });

  return (
    provinceCandidates.length ? provinceCandidates : fallbackCandidates
  ).sort((a, b) => b.score - a.score);
}
