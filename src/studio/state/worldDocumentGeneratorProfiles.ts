import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import type { GameWorldProfile, StudioState } from "../types";
import type {
  EffectiveProfileParameters,
  GeneratorParameterDraft,
  GeneratorProfileSuggestion,
  SpawnCandidateHint,
  WorldRulesDraft,
} from "./worldDocumentDraftTypes";
import { createProfilePriorities } from "./worldDocumentProfilePriorities";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createProfileDefaultParameters(
  priority: WorldRulesDraft["profileRules"]["priorities"][number],
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
): Omit<GeneratorParameterDraft, "overridden"> {
  const routePointCount = resources.routes.reduce(
    (total, route) => total + (route.pointCount || 0),
    0,
  );
  const drafts: Record<
    GeneratorProfileSuggestion["target"],
    Omit<GeneratorParameterDraft, "overridden">
  > = {
    spawn: {
      key: "spawnFairnessWeight",
      label: "Spawn fairness weight",
      value: Number(priority.weight.toFixed(2)),
      unit: "profile-weight",
      source: priority.id,
    },
    settlement: {
      key: "settlementDensityTarget",
      label: "Settlement density target",
      value: Math.max(
        1,
        Math.round(entities.burgs.length / Math.max(1, entities.states.length)),
      ),
      unit: "count",
      source: priority.id,
    },
    connectivity: {
      key: "routeConnectivityScore",
      label: "Route connectivity score",
      value: clampScore(routePointCount),
      unit: "score",
      source: priority.id,
    },
    habitability: {
      key: "biomeFrictionWeight",
      label: "Biome friction weight",
      value: Number(priority.weight.toFixed(2)),
      unit: "profile-weight",
      source: priority.id,
    },
    resource: {
      key: "resourceCoverageTarget",
      label: "Resource coverage target",
      value: clampScore(
        resources.biomes.filter((item) => item.agmResourceTag !== undefined)
          .length *
          10 +
          spawnCandidates.length * 5,
      ),
      unit: "percent",
      source: priority.id,
    },
  };

  return drafts[priority.target];
}

export function createEffectiveProfileParameters(
  profile: GameWorldProfile,
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  overrides: StudioState["generationProfileOverrides"],
): EffectiveProfileParameters {
  const defaults = Object.fromEntries(
    createProfilePriorities(profile).map((priority) => {
      const draft = createProfileDefaultParameters(
        priority,
        spawnCandidates,
        entities,
        resources,
      );
      return [draft.key, draft.value];
    }),
  ) as EffectiveProfileParameters;

  return {
    ...defaults,
    ...(overrides.profile === profile ? overrides.values : {}),
  };
}

function createGeneratorParameterDraft(
  profile: GameWorldProfile,
  priority: WorldRulesDraft["profileRules"]["priorities"][number],
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  overrides: StudioState["generationProfileOverrides"],
): GeneratorParameterDraft {
  const draft = createProfileDefaultParameters(
    priority,
    spawnCandidates,
    entities,
    resources,
  );
  const overrideValue =
    overrides.profile === profile ? overrides.values[draft.key] : undefined;

  return {
    ...draft,
    value: overrideValue ?? draft.value,
    overridden: overrideValue !== undefined,
  };
}

export function createProfileGeneratorSuggestions(
  profile: GameWorldProfile,
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  overrides: StudioState["generationProfileOverrides"],
): GeneratorProfileSuggestion[] {
  const refsByTarget: Record<
    GeneratorProfileSuggestion["target"],
    Record<string, number[]>
  > = {
    spawn: {
      states: spawnCandidates
        .map((item) => item.state)
        .filter((value): value is number => value !== undefined)
        .slice(0, 6),
      provinces: spawnCandidates
        .map((item) => item.province)
        .filter((value): value is number => value !== undefined)
        .slice(0, 6),
    },
    settlement: {
      states: entities.states.map((item) => item.id).slice(0, 6),
      burgs: entities.burgs.map((item) => item.id).slice(0, 6),
    },
    connectivity: {
      routes: resources.routes.map((item) => item.id).slice(0, 6),
      provinces: resources.provinces.map((item) => item.id).slice(0, 6),
    },
    habitability: {
      biomes: resources.biomes.map((item) => item.id).slice(0, 6),
    },
    resource: {
      biomes: resources.biomes
        .filter((item) => item.agmResourceTag !== undefined)
        .map((item) => item.id)
        .slice(0, 6),
      provinces: resources.provinces.map((item) => item.id).slice(0, 6),
    },
  };
  const recommendationByTarget: Record<
    GeneratorProfileSuggestion["target"],
    string
  > = {
    spawn:
      "Bias generation toward profile-weighted fair-start candidates before finalizing states and provinces.",
    settlement:
      "Tune settlement density and support hubs around the profile's intended play scale.",
    connectivity:
      "Preserve or create route connectors that support the profile's travel and expansion loop.",
    habitability:
      "Use biome habitability and movement cost as profile-specific terrain friction inputs.",
    resource:
      "Distribute biome-tag-derived resources according to the profile's starter, neutral and challenge roles.",
  };

  return createProfilePriorities(profile).map((priority) => ({
    id: `generator-suggestion-${profile}-${priority.id}`,
    profile,
    priorityId: priority.id,
    target: priority.target,
    weight: priority.weight,
    recommendation: recommendationByTarget[priority.target],
    parameterDraft: createGeneratorParameterDraft(
      profile,
      priority,
      spawnCandidates,
      entities,
      resources,
      overrides,
    ),
    refs: refsByTarget[priority.target],
  }));
}
