import {getLegacyEntitySummary, getLegacyLayerDetails, getLegacyLayerStates, getLegacyWorldResourceSummary} from "../bridge/legacyActions";
import type {LayerAction, LegacyEntitySummary, LegacyProjectSummary, LegacyWorldResourceSummary} from "../bridge/legacyActions";
import type {DocumentState, GameWorldProfile, GenerationProfileOverrideKey, StudioState} from "../types";

export const AGM_DRAFT_STORAGE_KEY = "agm.documentDraft";

export const GAME_WORLD_PROFILE_LABELS: Record<GameWorldProfile, string> = {
  rpg: "RPG world",
  strategy: "Strategy campaign map",
  "4x": "4X civilization map",
  tabletop: "Tabletop campaign map",
  "open-world": "Open world region",
  "city-kingdom-continent": "City / kingdom / continent template",
};

function numberOrNull(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function createSafeFilename(name: string, extension: string) {
  const safeName = name.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/^-+|-+$/g, "") || "agm-world";
  return `${safeName}.${extension}`;
}

function createSafeAgmFilename(name: string) {
  return createSafeFilename(name, "agm");
}

function downloadBlobDraft(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadJsonDraft(filename: string, draft: unknown) {
  downloadBlobDraft(filename, new Blob([JSON.stringify(draft, null, 2)], {type: "application/json"}));
}

function createEntityIndex(entities: LegacyEntitySummary) {
  return {
    states: entities.states.map(item => item.id),
    burgs: entities.burgs.map(item => item.id),
    cultures: entities.cultures.map(item => item.id),
    religions: entities.religions.map(item => item.id),
  };
}

function createResourceIndex(resources: LegacyWorldResourceSummary) {
  return {
    biomes: resources.biomes.map(item => item.id),
    provinces: resources.provinces.map(item => item.id),
    routes: resources.routes.map(item => item.id),
  };
}

type SpawnCandidateHint = {
  id: string;
  state?: number;
  province?: number;
  burg?: number;
  biome?: number;
  score: number;
  reasons: string[];
};

type BalanceHint = {
  id: string;
  category: "spawn" | "settlement" | "connectivity" | "habitability";
  severity: "info" | "warning";
  message: string;
  profileWeight: number;
  profilePriority?: string;
  refs?: Record<string, number[]>;
};

type EffectiveProfileParameters = Partial<Record<GenerationProfileOverrideKey, number>>;

type AutoFixPreviewChange = {
  id: string;
  operation: "create" | "update" | "link";
  entity: "state" | "province" | "burg" | "route" | "biome";
  summary: string;
  refs: Record<string, number[]>;
  fields?: Record<string, string | number | boolean | null>;
};

type AutoFixPreviewDiff = {
  mode: "dry-run";
  title: string;
  changes: AutoFixPreviewChange[];
};

type AutoFixDraft = {
  id: string;
  hintId: string;
  category: BalanceHint["category"];
  action: string;
  status: "draft";
  summary: string;
  profileWeight: number;
  profilePriority?: string;
  targetRefs: Record<string, number[]>;
  steps: string[];
  risks: string[];
  previewDiff?: AutoFixPreviewDiff;
};

type AppliedAutoFixPreviewChange = AutoFixPreviewChange & {
  draftId: string;
  appliedAt: number;
};

type GeneratorParameterDraft = {
  key: GenerationProfileOverrideKey;
  label: string;
  value: number;
  unit: "profile-weight" | "score" | "count" | "percent";
  source: string;
  overridden: boolean;
};

type GeneratorProfileSuggestion = {
  id: string;
  profile: GameWorldProfile;
  priorityId: string;
  target: "spawn" | "settlement" | "connectivity" | "habitability" | "resource";
  weight: number;
  recommendation: string;
  parameterDraft: GeneratorParameterDraft;
  refs: Record<string, number[]>;
};

type WorldPlayabilityHints = {
  spawnCandidates: SpawnCandidateHint[];
  balanceHints: BalanceHint[];
  autoFixDrafts: AutoFixDraft[];
  appliedPreviewChanges: AppliedAutoFixPreviewChange[];
  generatorProfileSuggestions: GeneratorProfileSuggestion[];
  generationProfileImpact: StudioState["generationProfileImpact"];
};

export type WorldRulesDraft = {
  schema: "agm.rules.v0";
  version: 1;
  source: "legacy-biome-summary";
  biomeRules: {
    id: string;
    biomeId: number;
    biomeName: string;
    habitability: number | null;
    movementCost: number | null;
    ruleWeight: number;
    resourceTag: string;
    source: "legacy-biome-summary" | "studio-metadata";
    profileBiomeFrictionWeight: number;
    profileAdjustedHabitability: number | null;
    profileFrictionBand: "low-friction" | "balanced-friction" | "high-friction";
  }[];
  resourceTags: {
    tag: string;
    biomeIds: number[];
    role: "starter" | "challenge" | "neutral";
  }[];
  provinceStructure: {
    id: string;
    provinceId: number;
    stateId: number | null;
    hasSettlementAnchor: boolean;
    profileRouteConnectivityScore: number;
    profileResourceCoverageTarget: number;
    structureScore: number;
    connectorPriority: "primary-connector" | "secondary-connector" | "resource-frontier";
    routeAnchorIds: number[];
    resourceRuleIds: string[];
  }[];
  resourceRules: {
    id: string;
    tag: string;
    role: "starter" | "challenge" | "neutral";
    distribution: "biome-tag-derived";
    priority: "start-support" | "challenge-zone" | "neutral-coverage";
    biomeIds: number[];
    provinceIds: number[];
    routeIds: number[];
    routePointCount: number;
    coverageScore: number;
    profileResourceCoverageTarget: number;
    profileCoverageDelta: number;
    profileCoverageBand: "under-target" | "on-target" | "over-target";
  }[];
  profileRules: {
    profile: GameWorldProfile;
    profileLabel: string;
    priorities: {
      id: string;
      label: string;
      weight: number;
      target: "spawn" | "settlement" | "connectivity" | "habitability" | "resource";
    }[];
    sourceFields: string[];
  };
  weights: {
    defaultRuleWeight: number;
    ruleWeightRange: {min: number; max: number};
    sourceFields: string[];
  };
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createSettlementPreviewDiff(entities: LegacyEntitySummary, spawnCandidates: SpawnCandidateHint[], parameters: EffectiveProfileParameters = {}): AutoFixPreviewDiff {
  const burgsByState = new Map<number, number>();
  entities.burgs.forEach(burg => {
    if (burg.state === undefined) return;
    burgsByState.set(burg.state, (burgsByState.get(burg.state) || 0) + 1);
  });
  const currentDensity = Math.max(1, Math.round(entities.burgs.length / Math.max(1, entities.states.length)));
  const profileSettlementDensityTarget = Math.max(1, Math.round(parameters.settlementDensityTarget ?? currentDensity));
  const supportSettlementLimit = Math.max(2, Math.min(6, Math.ceil(profileSettlementDensityTarget / 2)));
  const candidateStates = spawnCandidates.map(item => item.state).filter((value): value is number => value !== undefined);
  const sparseStates = entities.states.filter(state => (burgsByState.get(state.id) || 0) < profileSettlementDensityTarget || candidateStates.includes(state.id)).slice(0, supportSettlementLimit);
  const targetStates = sparseStates.length ? sparseStates : entities.states.slice(0, supportSettlementLimit);

  return {
    mode: "dry-run",
    title: "Settlement density preview",
    changes: targetStates.map((state, index) => {
      const currentStateSettlementCount = burgsByState.get(state.id) || 0;
      return {
        id: `preview-burg-${state.id}`,
        operation: "create",
        entity: "burg",
        summary: `Draft a support settlement for ${state.name} using profile settlement density target ${profileSettlementDensityTarget}.`,
        refs: {states: [state.id]},
        fields: {
          provisionalName: `${state.name} Support ${index + 1}`,
          state: state.id,
          agmRole: "support-settlement",
          agmSupportState: state.id,
          priority: candidateStates.includes(state.id) ? "spawn-support" : "sparse-state-support",
          profileSettlementDensityTarget,
          currentStateSettlementCount,
          profileSettlementDensityGap: Math.max(0, profileSettlementDensityTarget - currentStateSettlementCount),
          supportSettlementLimit,
        },
      } satisfies AutoFixPreviewChange;
    }),
  };
}

function createRoutePreviewDiff(resources: LegacyWorldResourceSummary, spawnCandidates: SpawnCandidateHint[], parameters: EffectiveProfileParameters = {}): AutoFixPreviewDiff {
  const routeConnectivityScore = parameters.routeConnectivityScore ?? 50;
  const connectorLimit = Math.max(2, Math.min(6, Math.ceil(routeConnectivityScore / 20) + 1));
  const provincePairs = spawnCandidates.map(item => item.province).filter((value): value is number => value !== undefined).slice(0, connectorLimit);
  const connectorTargets = provincePairs.length >= 2 ? provincePairs.slice(0, connectorLimit) : resources.provinces.map(item => item.id).slice(0, connectorLimit);
  const changes: AutoFixPreviewChange[] = [];

  for (let index = 0; index < connectorTargets.length - 1; index += 1) {
    const from = connectorTargets[index];
    const to = connectorTargets[index + 1];
    const fromProvince = resources.provinces.find(item => item.id === from);
    const toProvince = resources.provinces.find(item => item.id === to);
    const provinceStructureScore = clampScore(routeConnectivityScore * 0.55 + (fromProvince?.burg !== undefined ? 15 : 5) + (toProvince?.burg !== undefined ? 15 : 5) - index * 3);
    changes.push({
      id: `preview-route-${from}-${to}`,
      operation: "link",
      entity: "route",
      summary: `Draft a connector route between province ${from} and province ${to} using profile connectivity score ${routeConnectivityScore} and province structure score ${provinceStructureScore}.`,
      refs: {provinces: [from, to], routes: resources.routes.map(item => item.id).slice(0, 3)},
      fields: {
        fromProvince: from,
        toProvince: to,
        connectorType: resources.routes.length ? "extend-existing-route-group" : "create-first-route-group",
        profileRouteConnectivityScore: routeConnectivityScore,
        provinceStructureScore,
        provinceStructurePriority: provinceStructureScore >= 75 ? "primary-connector" : provinceStructureScore >= 50 ? "secondary-connector" : "resource-frontier",
        connectorLimit,
      },
    });
  }

  return {
    mode: "dry-run",
    title: "Route connector preview",
    changes,
  };
}

function createSpawnPreviewDiff(spawnCandidates: SpawnCandidateHint[], entities: LegacyEntitySummary): AutoFixPreviewDiff {
  const uniqueCandidateStates = spawnCandidates.reduce<SpawnCandidateHint[]>((items, candidate) => {
    if (candidate.state === undefined || items.some(item => item.state === candidate.state)) return items;
    return [...items, candidate];
  }, []);
  const fallbackStates = entities.states.filter(state => !uniqueCandidateStates.some(candidate => candidate.state === state.id)).slice(0, Math.max(0, 4 - uniqueCandidateStates.length));
  const fallbackCandidates = fallbackStates.map((state, index): SpawnCandidateHint => ({id: `spawn-state-${state.id}`, state: state.id, score: clampScore(60 - index * 5), reasons: ["Fallback state selected for fair-start review"]}));
  const targets = [...uniqueCandidateStates, ...fallbackCandidates].slice(0, 4);

  return {
    mode: "dry-run",
    title: "Fair-start state preview",
    changes: targets.map(candidate => {
      const stateId = candidate.state!;
      return {
        id: `preview-state-fair-start-${stateId}`,
        operation: "update",
        entity: "state",
        summary: `Mark state ${stateId} as an AGM fair-start candidate with score ${candidate.score}.`,
        refs: {states: [stateId], provinces: candidate.province === undefined ? [] : [candidate.province], burgs: candidate.burg === undefined ? [] : [candidate.burg]},
        fields: {
          agmFairStart: true,
          agmFairStartScore: candidate.score,
          agmPriority: candidate.score >= 85 ? "primary-start" : "secondary-start",
        },
      } satisfies AutoFixPreviewChange;
    }),
  };
}

function createBiomePreviewDiff(resources: LegacyWorldResourceSummary, parameters: EffectiveProfileParameters = {}): AutoFixPreviewDiff {
  const profileBiomeFrictionWeight = Number((parameters.biomeFrictionWeight ?? 1).toFixed(2));
  const frictionLift = Math.max(4, Math.min(24, Math.round(profileBiomeFrictionWeight * 10)));
  const candidateBiomes = resources.biomes
    .filter(biome => typeof biome.habitability === "number")
    .sort((a, b) => (a.habitability || 0) - (b.habitability || 0))
    .slice(0, Math.max(2, Math.min(5, Math.ceil(profileBiomeFrictionWeight * 3))));
  const targetBiomes = candidateBiomes.length ? candidateBiomes : resources.biomes.slice(0, 3);

  return {
    mode: "dry-run",
    title: "Biome habitability preview",
    changes: targetBiomes.map(biome => {
      const currentHabitability = typeof biome.habitability === "number" ? biome.habitability : 50;
      const nextHabitability = clampScore(Math.max(currentHabitability, Math.min(85, currentHabitability + frictionLift)));
      return {
        id: `preview-biome-${biome.id}`,
        operation: "update",
        entity: "biome",
        summary: `Tune ${biome.name} habitability from ${currentHabitability} to ${nextHabitability} using profile biome friction weight ${profileBiomeFrictionWeight}.`,
        refs: {biomes: [biome.id]},
        fields: {
          habitability: nextHabitability,
          previousHabitability: currentHabitability,
          agmRuleWeight: Number(Math.max(1, profileBiomeFrictionWeight).toFixed(2)),
          agmResourceTag: currentHabitability <= 0 ? "challenge-biome" : "starter-biome",
          tuningReason: currentHabitability <= 0 ? "hostile-start-support" : "fair-start-smoothing",
          profileBiomeFrictionWeight,
          profileHabitabilityLift: nextHabitability - currentHabitability,
        },
      } satisfies AutoFixPreviewChange;
    }),
  };
}

function profileTargetForHintCategory(category: BalanceHint["category"]): WorldRulesDraft["profileRules"]["priorities"][number]["target"] {
  return category;
}

function getProfilePriority(profile: GameWorldProfile, target: WorldRulesDraft["profileRules"]["priorities"][number]["target"]) {
  return createProfilePriorities(profile).find(priority => priority.target === target);
}

function getProfilePriorityForHint(profile: GameWorldProfile, category: BalanceHint["category"]) {
  return getProfilePriority(profile, profileTargetForHintCategory(category));
}

type SpawnScoringProfileContext = {
  priorityId?: string;
  weight: number;
  parameters: EffectiveProfileParameters;
};

function createProfileDefaultParameters(priority: WorldRulesDraft["profileRules"]["priorities"][number], spawnCandidates: SpawnCandidateHint[], entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary): Omit<GeneratorParameterDraft, "overridden"> {
  const routePointCount = resources.routes.reduce((total, route) => total + (route.pointCount || 0), 0);
  const drafts: Record<GeneratorProfileSuggestion["target"], Omit<GeneratorParameterDraft, "overridden">> = {
    spawn: {key: "spawnFairnessWeight", label: "Spawn fairness weight", value: Number(priority.weight.toFixed(2)), unit: "profile-weight", source: priority.id},
    settlement: {key: "settlementDensityTarget", label: "Settlement density target", value: Math.max(1, Math.round(entities.burgs.length / Math.max(1, entities.states.length))), unit: "count", source: priority.id},
    connectivity: {key: "routeConnectivityScore", label: "Route connectivity score", value: clampScore(routePointCount), unit: "score", source: priority.id},
    habitability: {key: "biomeFrictionWeight", label: "Biome friction weight", value: Number(priority.weight.toFixed(2)), unit: "profile-weight", source: priority.id},
    resource: {key: "resourceCoverageTarget", label: "Resource coverage target", value: clampScore(resources.biomes.filter(item => item.agmResourceTag !== undefined).length * 10 + spawnCandidates.length * 5), unit: "percent", source: priority.id},
  };

  return drafts[priority.target];
}

function createEffectiveProfileParameters(profile: GameWorldProfile, spawnCandidates: SpawnCandidateHint[], entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary, overrides: StudioState["generationProfileOverrides"]): EffectiveProfileParameters {
  const defaults = Object.fromEntries(createProfilePriorities(profile).map(priority => {
    const draft = createProfileDefaultParameters(priority, spawnCandidates, entities, resources);
    return [draft.key, draft.value];
  })) as EffectiveProfileParameters;

  return {
    ...defaults,
    ...(overrides.profile === profile ? overrides.values : {}),
  };
}

function createSpawnScoringProfileContext(state: StudioState, entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary): SpawnScoringProfileContext {
  const spawnPriority = getProfilePriorityForHint(state.document.gameProfile, "spawn");
  const provisionalCandidates: SpawnCandidateHint[] = [];
  return {
    priorityId: spawnPriority?.id,
    weight: spawnPriority?.weight || 1,
    parameters: createEffectiveProfileParameters(state.document.gameProfile, provisionalCandidates, entities, resources, state.generationProfileOverrides),
  };
}

function applyProfileSpawnScore(baseScore: number, fairnessSignal: number, context: SpawnScoringProfileContext) {
  const fairnessWeight = context.parameters.spawnFairnessWeight ?? context.weight;
  const normalizedWeight = Math.max(0, Math.min(3, fairnessWeight));
  return clampScore(baseScore + fairnessSignal * normalizedWeight);
}

function createProfileSpawnReason(context: SpawnScoringProfileContext) {
  const fairnessWeight = context.parameters.spawnFairnessWeight ?? context.weight;
  return `Profile ${context.priorityId || "spawn"} applies spawn fairness weight ${Number(fairnessWeight.toFixed(2))}`;
}

function createGeneratorParameterDraft(profile: GameWorldProfile, priority: WorldRulesDraft["profileRules"]["priorities"][number], spawnCandidates: SpawnCandidateHint[], entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary, overrides: StudioState["generationProfileOverrides"]): GeneratorParameterDraft {
  const draft = createProfileDefaultParameters(priority, spawnCandidates, entities, resources);
  const overrideValue = overrides.profile === profile ? overrides.values[draft.key] : undefined;

  return {
    ...draft,
    value: overrideValue ?? draft.value,
    overridden: overrideValue !== undefined,
  };
}

function createProfileGeneratorSuggestions(profile: GameWorldProfile, spawnCandidates: SpawnCandidateHint[], entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary, overrides: StudioState["generationProfileOverrides"]): GeneratorProfileSuggestion[] {
  const refsByTarget: Record<GeneratorProfileSuggestion["target"], Record<string, number[]>> = {
    spawn: {states: spawnCandidates.map(item => item.state).filter((value): value is number => value !== undefined).slice(0, 6), provinces: spawnCandidates.map(item => item.province).filter((value): value is number => value !== undefined).slice(0, 6)},
    settlement: {states: entities.states.map(item => item.id).slice(0, 6), burgs: entities.burgs.map(item => item.id).slice(0, 6)},
    connectivity: {routes: resources.routes.map(item => item.id).slice(0, 6), provinces: resources.provinces.map(item => item.id).slice(0, 6)},
    habitability: {biomes: resources.biomes.map(item => item.id).slice(0, 6)},
    resource: {biomes: resources.biomes.filter(item => item.agmResourceTag !== undefined).map(item => item.id).slice(0, 6), provinces: resources.provinces.map(item => item.id).slice(0, 6)},
  };
  const recommendationByTarget: Record<GeneratorProfileSuggestion["target"], string> = {
    spawn: "Bias generation toward profile-weighted fair-start candidates before finalizing states and provinces.",
    settlement: "Tune settlement density and support hubs around the profile's intended play scale.",
    connectivity: "Preserve or create route connectors that support the profile's travel and expansion loop.",
    habitability: "Use biome habitability and movement cost as profile-specific terrain friction inputs.",
    resource: "Distribute biome-tag-derived resources according to the profile's starter, neutral and challenge roles.",
  };

  return createProfilePriorities(profile).map(priority => ({
    id: `generator-suggestion-${profile}-${priority.id}`,
    profile,
    priorityId: priority.id,
    target: priority.target,
    weight: priority.weight,
    recommendation: recommendationByTarget[priority.target],
    parameterDraft: createGeneratorParameterDraft(profile, priority, spawnCandidates, entities, resources, overrides),
    refs: refsByTarget[priority.target],
  }));
}

function createAutoFixDrafts(balanceHints: BalanceHint[], spawnCandidates: SpawnCandidateHint[], entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary, parameters: EffectiveProfileParameters): AutoFixDraft[] {
  const topSpawnRefs: Record<string, number[]> = {
    states: spawnCandidates.map(item => item.state).filter((value): value is number => value !== undefined).slice(0, 4),
    provinces: spawnCandidates.map(item => item.province).filter((value): value is number => value !== undefined).slice(0, 4),
    burgs: spawnCandidates.map(item => item.burg).filter((value): value is number => value !== undefined).slice(0, 4),
    biomes: spawnCandidates.map(item => item.biome).filter((value): value is number => value !== undefined).slice(0, 4),
  };

  return balanceHints.map((hint): AutoFixDraft => {
    if (hint.category === "spawn") {
      return {
        id: "auto-fix-spawn-candidate-coverage",
        hintId: hint.id,
        category: hint.category,
        action: "expand-spawn-candidate-set",
        status: "draft",
        summary: spawnCandidates.length >= 4 ? "Review the strongest spawn candidates and lock the first fair-start set." : "Add or tag more viable start regions before running fairness checks.",
        profileWeight: hint.profileWeight,
        profilePriority: hint.profilePriority,
        targetRefs: topSpawnRefs,
        steps: [
          "Promote the top scoring provinces or states into the initial fair-start pool.",
          "Tag missing neighboring settlement and biome metadata for weak candidates.",
          "Re-score candidates after route and settlement edits are applied.",
        ],
        risks: ["Over-constraining starts can make later asymmetric game modes less flexible.", "Candidate scores still depend on summarized legacy data until editable AGM rules land."],
        previewDiff: createSpawnPreviewDiff(spawnCandidates, entities),
      } satisfies AutoFixDraft;
    }

    if (hint.category === "settlement") {
      return {
        id: "auto-fix-settlement-distribution",
        hintId: hint.id,
        category: hint.category,
        action: "rebalance-settlement-density",
        status: "draft",
        summary: `Review ${entities.burgs.length} settlements across ${entities.states.length} states and mark sparse states for city-density adjustment.`,
        profileWeight: hint.profileWeight,
        profilePriority: hint.profilePriority,
        targetRefs: {
          states: entities.states.map(item => item.id).slice(0, 8),
          burgs: entities.burgs.map(item => item.id).slice(0, 8),
        },
        steps: [
          "Find states with no capital or very low settlement counts.",
          "Draft new burg placement targets near viable spawn regions.",
          "Re-check spawn support after settlement density changes.",
        ],
        risks: ["Adding settlements can shift political balance and label density.", "Sparse worlds may intentionally need low city counts for survival or exploration profiles."],
        previewDiff: createSettlementPreviewDiff(entities, spawnCandidates, parameters),
      } satisfies AutoFixDraft;
    }

    if (hint.category === "connectivity") {
      return {
        id: "auto-fix-route-connectivity",
        hintId: hint.id,
        category: hint.category,
        action: "draft-route-connectors",
        status: "draft",
        summary: resources.routes.length ? "Use sampled route groups to identify early-game connector gaps between spawn regions." : "Create first-pass route connector proposals so spawn fairness can account for movement.",
        profileWeight: hint.profileWeight,
        profilePriority: hint.profilePriority,
        targetRefs: {
          routes: resources.routes.map(item => item.id).slice(0, 8),
          provinces: resources.provinces.map(item => item.id).slice(0, 8),
        },
        steps: [
          "Compare top spawn regions against existing route groups.",
          "Draft connector routes between isolated candidates and nearby settlements.",
          "Flag risky connectors that cross hostile terrain or fragmented provinces.",
        ],
        risks: ["New routes may flatten meaningful terrain friction.", "Legacy route summaries expose sampled groups, not yet fully editable AGM route graphs."],
        previewDiff: createRoutePreviewDiff(resources, spawnCandidates, parameters),
      } satisfies AutoFixDraft;
    }

    return {
      id: "auto-fix-biome-habitability",
      hintId: hint.id,
      category: hint.category,
      action: "tune-habitable-biome-weights",
      status: "draft",
      summary: resources.biomes.length ? "Review habitable biome weights used by spawn scoring and flag hostile starts for adjustment." : "Add biome habitability metadata before spawn scoring is treated as reliable.",
      profileWeight: hint.profileWeight,
      profilePriority: hint.profilePriority,
      targetRefs: {
        biomes: resources.biomes.map(item => item.id).slice(0, 8),
      },
      steps: [
        "Prioritize biomes with positive habitability for fair-start scoring.",
        "Mark low-habitability starts for adjustment or intentional challenge labeling.",
        "Re-run candidate scoring after biome weight edits are available.",
      ],
      risks: ["Biome changes can alter both realism and game readability.", "Current weights are advisory until AGM Rules Pack overrides exist."],
      previewDiff: createBiomePreviewDiff(resources, parameters),
    } satisfies AutoFixDraft;
  }).sort((a, b) => b.profileWeight - a.profileWeight);
}

function createManualBiomeRuleAppliedChanges(state: StudioState, resources: LegacyWorldResourceSummary, appliedAtByDraft: Map<string, number>): AppliedAutoFixPreviewChange[] {
  return state.autoFixPreview.appliedDraftIds.flatMap(draftId => {
    const match = /^manual-biome-rule-(\d+)$/u.exec(draftId);
    if (!match) return [];
    const biomeId = Number(match[1]);
    const biome = resources.biomes.find(item => item.id === biomeId);
    if (!biome) return [];
    const currentHabitability = typeof biome.habitability === "number" ? biome.habitability : 50;
    return [
      {
        draftId,
        appliedAt: appliedAtByDraft.get(draftId) || 0,
        id: draftId,
        operation: "update",
        entity: "biome",
        summary: `Manual AGM rule metadata adjustment for ${biome.name}.`,
        refs: {biomes: [biomeId]},
        fields: {
          habitability: currentHabitability,
          previousHabitability: currentHabitability,
          agmRuleWeight: biome.agmRuleWeight ?? 1,
          agmResourceTag: biome.agmResourceTag ?? "starter-biome",
          tuningReason: "manual-biome-rule-adjustment",
        },
      } satisfies AppliedAutoFixPreviewChange,
    ];
  });
}

function createRulesPackImportAppliedChanges(
  state: StudioState,
  resources: LegacyWorldResourceSummary,
  appliedAtByDraft: Map<string, number>,
): AppliedAutoFixPreviewChange[] {
  return state.autoFixPreview.undoStack.flatMap(entry => {
    const rulesPackImportVersion = entry.rulesPackImportVersion;
    if (entry.action !== "apply" || !state.autoFixPreview.appliedDraftIds.includes(entry.draftId) || rulesPackImportVersion === undefined) return [];
    return entry.legacyWriteback?.updatedBiomes.flatMap(update => {
      const biome = resources.biomes.find(item => item.id === update.biomeId);
      if (!biome) return [];
      return [{
        draftId: entry.draftId,
        appliedAt: appliedAtByDraft.get(entry.draftId) || 0,
        id: `${entry.draftId}-biome-${update.biomeId}`,
        operation: "update",
        entity: "biome",
        summary: `Imported AGM Rules Pack v${rulesPackImportVersion} metadata for ${biome.name}.`,
        refs: {biomes: [update.biomeId]},
        fields: {
          habitability: update.nextHabitability,
          previousHabitability: update.previousHabitability,
          agmRuleWeight: update.nextAgmRuleWeight,
          agmResourceTag: update.nextAgmResourceTag,
          tuningReason: "rules-pack-import",
          rulesPackVersion: rulesPackImportVersion,
        },
      } satisfies AppliedAutoFixPreviewChange];
    }) || [];
  });
}

function createAppliedPreviewChanges(autoFixDrafts: AutoFixDraft[], state: StudioState, resources: LegacyWorldResourceSummary): AppliedAutoFixPreviewChange[] {
  const appliedAtByDraft = new Map<string, number>();
  state.autoFixPreview.undoStack.forEach((entry, index) => {
    if (entry.action === "apply" && state.autoFixPreview.appliedDraftIds.includes(entry.draftId)) appliedAtByDraft.set(entry.draftId, index + 1);
  });

  return [
    ...autoFixDrafts.flatMap(draft => {
      if (!state.autoFixPreview.appliedDraftIds.includes(draft.id) || !draft.previewDiff) return [];
      const appliedAt = appliedAtByDraft.get(draft.id) || 0;
      return draft.previewDiff.changes.map(change => ({...change, draftId: draft.id, appliedAt}));
    }),
    ...createManualBiomeRuleAppliedChanges(state, resources, appliedAtByDraft),
    ...createRulesPackImportAppliedChanges(state, resources, appliedAtByDraft),
  ];
}

function createWorldPlayabilityHints(entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary, state: StudioState): WorldPlayabilityHints {
  const habitableBiomes = resources.biomes
    .filter(item => typeof item.habitability === "number" && item.habitability > 0)
    .sort((a, b) => (b.habitability || 0) - (a.habitability || 0));
  const mostHabitableBiome = habitableBiomes[0];
  const routePointCount = resources.routes.reduce((total, route) => total + (route.pointCount || 0), 0);
  const routeBonus = routePointCount > 0 ? 10 : 0;
  const burgsByState = new Map<number, number>();
  entities.burgs.forEach(burg => {
    if (burg.state === undefined) return;
    burgsByState.set(burg.state, (burgsByState.get(burg.state) || 0) + 1);
  });

  const spawnScoringProfile = createSpawnScoringProfileContext(state, entities, resources);

  const provinceCandidates = resources.provinces
    .filter(province => province.state !== undefined)
    .slice(0, 8)
    .map((province, index): SpawnCandidateHint => {
      const stateBurgCount = province.state === undefined ? 0 : burgsByState.get(province.state) || 0;
      const burgBonus = province.burg !== undefined || stateBurgCount > 0 ? 12 : 0;
      const biomeScore = mostHabitableBiome?.habitability || 50;
      const baseScore = 35 + biomeScore * 0.35 + burgBonus + routeBonus - index * 2;
      const fairnessSignal = (province.burg !== undefined ? 4 : 0) + (stateBurgCount > 0 ? 3 : -2) + (routePointCount > 0 ? 2 : -1) - index * 0.5;
      const score = applyProfileSpawnScore(baseScore, fairnessSignal, spawnScoringProfile);
      const reasons = [
        province.name ? `Province ${province.name} provides a bounded start region` : "Province provides a bounded start region",
        province.burg !== undefined || stateBurgCount > 0 ? "Nearby settlement support is available" : "Settlement support should be reviewed",
        routePointCount > 0 ? "Existing route network can support early movement" : "Route connectivity should be reviewed",
        createProfileSpawnReason(spawnScoringProfile),
      ];
      if (mostHabitableBiome) reasons.push(`${mostHabitableBiome.name} is the strongest known habitability biome`);

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

  const fallbackCandidates = entities.states.slice(0, 6).map((state, index): SpawnCandidateHint => {
    const stateBurgCount = burgsByState.get(state.id) || 0;
    const baseScore = 42 + stateBurgCount * 4 + routeBonus - index * 2;
    const fairnessSignal = (stateBurgCount > 0 ? 4 : -2) + (routePointCount > 0 ? 2 : -1) - index * 0.5;
    return {
      id: `spawn-state-${state.id}`,
      state: state.id,
      biome: mostHabitableBiome?.id,
      score: applyProfileSpawnScore(baseScore, fairnessSignal, spawnScoringProfile),
      reasons: [
        `${state.name} provides a political start region`,
        stateBurgCount > 0 ? "State has known settlement support" : "State settlement support should be reviewed",
        routePointCount > 0 ? "Known routes can support expansion checks" : "Route connectivity should be reviewed",
        createProfileSpawnReason(spawnScoringProfile),
      ],
    };
  });

  const spawnCandidates = (provinceCandidates.length ? provinceCandidates : fallbackCandidates).sort((a, b) => b.score - a.score);
  const balanceHints: BalanceHint[] = [
    {
      id: "spawn-candidate-coverage",
      category: "spawn",
      severity: spawnCandidates.length >= 4 ? "info" : "warning",
      message: spawnCandidates.length >= 4 ? `${spawnCandidates.length} candidate spawn regions are available for first-pass balancing.` : "Fewer than four candidate spawn regions are available; generate or tag more states/provinces before fairness checks.",
      profileWeight: getProfilePriorityForHint(state.document.gameProfile, "spawn")?.weight || 1,
      profilePriority: getProfilePriorityForHint(state.document.gameProfile, "spawn")?.id,
      refs: {states: spawnCandidates.map(item => item.state).filter((value): value is number => value !== undefined), provinces: spawnCandidates.map(item => item.province).filter((value): value is number => value !== undefined)} as Record<string, number[]>,
    } satisfies BalanceHint,
    {
      id: "settlement-distribution",
      category: "settlement",
      severity: entities.burgs.length >= Math.max(4, entities.states.length) ? "info" : "warning",
      message: `${entities.burgs.length} settlements are indexed across ${entities.states.length} states; use this as the first city-density balance input.`,
      profileWeight: getProfilePriorityForHint(state.document.gameProfile, "settlement")?.weight || 1,
      profilePriority: getProfilePriorityForHint(state.document.gameProfile, "settlement")?.id,
      refs: {states: entities.states.map(item => item.id), burgs: entities.burgs.map(item => item.id)} as Record<string, number[]>,
    } satisfies BalanceHint,
    {
      id: "route-connectivity",
      category: "connectivity",
      severity: resources.routes.length ? "info" : "warning",
      message: resources.routes.length ? `${resources.routes.length} route groups with ${routePointCount} sampled points are available for connectivity checks.` : "No route summary is available; spawn fairness cannot yet account for overland or trade connectivity.",
      profileWeight: getProfilePriorityForHint(state.document.gameProfile, "connectivity")?.weight || 1,
      profilePriority: getProfilePriorityForHint(state.document.gameProfile, "connectivity")?.id,
      refs: {routes: resources.routes.map(item => item.id)} as Record<string, number[]>,
    } satisfies BalanceHint,
    {
      id: "biome-habitability",
      category: "habitability",
      severity: habitableBiomes.length ? "info" : "warning",
      message: habitableBiomes.length ? `${habitableBiomes.length} habitable biome profiles are available; top biome is ${mostHabitableBiome?.name}.` : "No habitable biome scores are available; spawn scoring needs biome metadata.",
      profileWeight: getProfilePriorityForHint(state.document.gameProfile, "habitability")?.weight || 1,
      profilePriority: getProfilePriorityForHint(state.document.gameProfile, "habitability")?.id,
      refs: {biomes: habitableBiomes.map(item => item.id)} as Record<string, number[]>,
    } satisfies BalanceHint,
  ].sort((a, b) => b.profileWeight - a.profileWeight);

  const effectiveProfileParameters = createEffectiveProfileParameters(state.document.gameProfile, spawnCandidates, entities, resources, state.generationProfileOverrides);
  const autoFixDrafts = createAutoFixDrafts(balanceHints, spawnCandidates, entities, resources, effectiveProfileParameters);
  const appliedPreviewChanges = createAppliedPreviewChanges(autoFixDrafts, state, resources);
  const generatorProfileSuggestions = createProfileGeneratorSuggestions(state.document.gameProfile, spawnCandidates, entities, resources, state.generationProfileOverrides);
  const generationProfileImpact = state.generationProfileImpact?.profile === state.document.gameProfile ? state.generationProfileImpact : null;

  return {spawnCandidates, balanceHints, autoFixDrafts, appliedPreviewChanges, generatorProfileSuggestions, generationProfileImpact};
}

function createProfilePriorities(profile: GameWorldProfile): WorldRulesDraft["profileRules"]["priorities"] {
  const priorities: Record<GameWorldProfile, WorldRulesDraft["profileRules"]["priorities"]> = {
    rpg: [
      {id: "quest-route-connectivity", label: "Quest route readability", weight: 1.3, target: "connectivity"},
      {id: "settlement-hubs", label: "Settlement hub support", weight: 1.2, target: "settlement"},
      {id: "biome-variety", label: "Adventure biome variety", weight: 1.1, target: "habitability"},
    ],
    strategy: [
      {id: "balanced-starts", label: "Balanced strategic starts", weight: 1.35, target: "spawn"},
      {id: "route-chokepoints", label: "Route and chokepoint control", weight: 1.25, target: "connectivity"},
      {id: "settlement-logistics", label: "Settlement logistics density", weight: 1.2, target: "settlement"},
      {id: "terrain-friction", label: "Strategic terrain friction", weight: 1.18, target: "habitability"},
      {id: "resource-contest", label: "Contestable resource coverage", weight: 1.15, target: "resource"},
    ],
    "4x": [
      {id: "fair-expansion", label: "Fair expansion regions", weight: 1.4, target: "spawn"},
      {id: "resource-progression", label: "Resource progression bands", weight: 1.3, target: "resource"},
      {id: "movement-friction", label: "Exploration movement friction", weight: 1.1, target: "habitability"},
    ],
    tabletop: [
      {id: "region-legibility", label: "Readable campaign regions", weight: 1.3, target: "settlement"},
      {id: "travel-links", label: "Travel link prompts", weight: 1.2, target: "connectivity"},
      {id: "danger-zones", label: "Memorable danger zones", weight: 1.1, target: "resource"},
    ],
    "open-world": [
      {id: "exploration-loops", label: "Exploration loop support", weight: 1.35, target: "connectivity"},
      {id: "landmark-biomes", label: "Landmark biome contrast", weight: 1.25, target: "habitability"},
      {id: "distributed-support", label: "Distributed settlement support", weight: 1.1, target: "settlement"},
    ],
    "city-kingdom-continent": [
      {id: "scale-fit", label: "City / kingdom / continent scale fit", weight: 1.35, target: "settlement"},
      {id: "political-starts", label: "Political start anchors", weight: 1.2, target: "spawn"},
      {id: "connector-coverage", label: "Connector coverage", weight: 1.15, target: "connectivity"},
    ],
  };

  return priorities[profile];
}

function createCoverageBand(delta: number): WorldRulesDraft["resourceRules"][number]["profileCoverageBand"] {
  if (delta < -10) return "under-target";
  if (delta > 10) return "over-target";
  return "on-target";
}

function createFrictionBand(frictionWeight: number): WorldRulesDraft["biomeRules"][number]["profileFrictionBand"] {
  if (frictionWeight < 0.9) return "low-friction";
  if (frictionWeight > 1.2) return "high-friction";
  return "balanced-friction";
}

function createWorldRulesDraft(resources: LegacyWorldResourceSummary, profile: GameWorldProfile, parameters: EffectiveProfileParameters = {}): WorldRulesDraft {
  const profileBiomeFrictionWeight = Number((parameters.biomeFrictionWeight ?? getProfilePriority(profile, "habitability")?.weight ?? 1).toFixed(2));
  const biomeRules = resources.biomes.map(biome => {
    const hasStudioMetadata = biome.agmRuleWeight !== undefined || biome.agmResourceTag !== undefined;
    const habitability = typeof biome.habitability === "number" ? biome.habitability : null;
    const movementCost = typeof biome.movementCost === "number" ? biome.movementCost : null;
    const frictionPenalty = Math.max(0, Math.round((profileBiomeFrictionWeight - 1) * 10 + (movementCost ?? 0) * 0.1));
    return {
      id: `biome-rule-${biome.id}`,
      biomeId: biome.id,
      biomeName: biome.name,
      habitability,
      movementCost,
      ruleWeight: Number(((biome.agmRuleWeight ?? 1) * Math.max(1, profileBiomeFrictionWeight)).toFixed(2)),
      resourceTag: biome.agmResourceTag ?? "neutral-biome",
      source: hasStudioMetadata ? "studio-metadata" : "legacy-biome-summary",
      profileBiomeFrictionWeight,
      profileAdjustedHabitability: habitability === null ? null : clampScore(habitability - frictionPenalty),
      profileFrictionBand: createFrictionBand(profileBiomeFrictionWeight),
    } satisfies WorldRulesDraft["biomeRules"][number];
  });
  const resourceTags = Array.from(new Set(biomeRules.map(rule => rule.resourceTag))).sort().map(tag => ({
    tag,
    biomeIds: biomeRules.filter(rule => rule.resourceTag === tag).map(rule => rule.biomeId),
    role: tag.startsWith("starter") ? "starter" : tag.startsWith("challenge") ? "challenge" : "neutral",
  } satisfies WorldRulesDraft["resourceTags"][number]));
  const routePointCount = resources.routes.reduce((total, route) => total + (route.pointCount || 0), 0);
  const sampledProvinceIds = resources.provinces.map(item => item.id).slice(0, 12);
  const sampledRouteIds = resources.routes.map(item => item.id).slice(0, 12);
  const profileRouteConnectivityScore = parameters.routeConnectivityScore ?? clampScore(routePointCount);
  const profileResourceCoverageTarget = parameters.resourceCoverageTarget ?? clampScore(resourceTags.length * 10 + Math.min(sampledProvinceIds.length, 8) * 4);
  const resourceRules = resourceTags.map(tag => {
    const baseCoverageScore = clampScore(tag.biomeIds.length * 12 + Math.min(sampledProvinceIds.length, 8) * 4 + Math.min(routePointCount, 30));
    const profileCoverageDelta = baseCoverageScore - profileResourceCoverageTarget;
    return {
      id: `resource-rule-${tag.tag}`,
      tag: tag.tag,
      role: tag.role,
      distribution: "biome-tag-derived",
      priority: tag.role === "starter" ? "start-support" : tag.role === "challenge" ? "challenge-zone" : "neutral-coverage",
      biomeIds: tag.biomeIds,
      provinceIds: sampledProvinceIds,
      routeIds: sampledRouteIds,
      routePointCount,
      coverageScore: clampScore(baseCoverageScore + (profileResourceCoverageTarget - baseCoverageScore) * 0.25),
      profileResourceCoverageTarget,
      profileCoverageDelta,
      profileCoverageBand: createCoverageBand(profileCoverageDelta),
    } satisfies WorldRulesDraft["resourceRules"][number];
  });
  const provinceStructure = sampledProvinceIds.map((provinceId, index) => {
    const province = resources.provinces.find(item => item.id === provinceId);
    const hasSettlementAnchor = province?.burg !== undefined;
    const routeAnchorIds = sampledRouteIds.slice(0, Math.max(1, Math.min(4, Math.ceil(profileRouteConnectivityScore / 30))));
    const linkedResourceRules = resourceRules.filter(rule => rule.provinceIds.includes(provinceId));
    const structureScore = clampScore((hasSettlementAnchor ? 18 : 6) + routeAnchorIds.length * 12 + linkedResourceRules.length * 8 + profileRouteConnectivityScore * 0.35 + profileResourceCoverageTarget * 0.15 - index);
    return {
      id: `province-structure-${provinceId}`,
      provinceId,
      stateId: province?.state ?? null,
      hasSettlementAnchor,
      profileRouteConnectivityScore,
      profileResourceCoverageTarget,
      structureScore,
      connectorPriority: structureScore >= 75 ? "primary-connector" : structureScore >= 50 ? "secondary-connector" : "resource-frontier",
      routeAnchorIds,
      resourceRuleIds: linkedResourceRules.map(rule => rule.id),
    } satisfies WorldRulesDraft["provinceStructure"][number];
  });

  return {
    schema: "agm.rules.v0",
    version: 1,
    source: "legacy-biome-summary",
    biomeRules,
    resourceTags,
    provinceStructure,
    resourceRules,
    profileRules: {
      profile,
      profileLabel: GAME_WORLD_PROFILE_LABELS[profile],
      priorities: createProfilePriorities(profile),
      sourceFields: ["document.gameProfile", "resources.provinces", "resources.routes", "resources.biomes.agmResourceTag"],
    },
    weights: {
      defaultRuleWeight: 1,
      ruleWeightRange: {min: 0, max: 5},
      sourceFields: ["resources.biomes.habitability", "resources.biomes.agmRuleWeight", "resources.biomes.agmResourceTag"],
    },
  };
}

function createGenerationProfileOverrides(state: StudioState) {
  return {
    profile: state.generationProfileOverrides.profile,
    values: {...state.generationProfileOverrides.values},
  };
}

function createResourceMapExport(rules: WorldRulesDraft) {
  const legend = rules.resourceRules.map(rule => ({
    tag: rule.tag,
    role: rule.role,
    priority: rule.priority,
    coverageScore: rule.coverageScore,
    profileCoverageBand: rule.profileCoverageBand,
  }));
  const tiles = rules.provinceStructure.map(structure => {
    const linkedRules = rules.resourceRules.filter(rule => structure.resourceRuleIds.includes(rule.id));
    const primaryRule = linkedRules.sort((a, b) => b.coverageScore - a.coverageScore)[0];
    return {
      id: `resource-tile-${structure.provinceId}`,
      provinceId: structure.provinceId,
      stateId: structure.stateId,
      resourceTag: primaryRule?.tag ?? "neutral-biome",
      role: primaryRule?.role ?? "neutral",
      coverageScore: primaryRule?.coverageScore ?? 0,
      structureScore: structure.structureScore,
      connectorPriority: structure.connectorPriority,
      routeAnchorIds: structure.routeAnchorIds,
      exportLayer: primaryRule?.role === "starter" ? "starter-resource" : primaryRule?.role === "challenge" ? "challenge-resource" : "neutral-resource",
    };
  });

  return {
    schema: "agm.resource-map.v0",
    profile: rules.profileRules.profile,
    profileLabel: rules.profileRules.profileLabel,
    sourceRules: rules.resourceRules.map(rule => rule.id),
    legend,
    tiles,
    coverageSummary: {
      tileCount: tiles.length,
      starterTiles: tiles.filter(tile => tile.role === "starter").length,
      challengeTiles: tiles.filter(tile => tile.role === "challenge").length,
      neutralTiles: tiles.filter(tile => tile.role === "neutral").length,
      averageCoverageScore: tiles.length ? Math.round(tiles.reduce((total, tile) => total + tile.coverageScore, 0) / tiles.length) : 0,
    },
  };
}

function createProvinceMapExport(resources: LegacyWorldResourceSummary, rules: WorldRulesDraft) {
  const tiles = rules.provinceStructure.map(structure => {
    const province = resources.provinces.find(item => item.id === structure.provinceId);
    return {
      id: `province-tile-${structure.provinceId}`,
      provinceId: structure.provinceId,
      provinceName: province?.name ?? `Province ${structure.provinceId}`,
      stateId: structure.stateId,
      hasSettlementAnchor: structure.hasSettlementAnchor,
      structureScore: structure.structureScore,
      connectorPriority: structure.connectorPriority,
      routeAnchorIds: structure.routeAnchorIds,
      resourceRuleIds: structure.resourceRuleIds,
      exportLayer: structure.connectorPriority,
    };
  });

  return {
    schema: "agm.province-map.v0",
    profile: rules.profileRules.profile,
    profileLabel: rules.profileRules.profileLabel,
    sourceRules: rules.provinceStructure.map(structure => structure.id),
    tiles,
    structureSummary: {
      tileCount: tiles.length,
      settlementAnchoredTiles: tiles.filter(tile => tile.hasSettlementAnchor).length,
      primaryConnectorTiles: tiles.filter(tile => tile.connectorPriority === "primary-connector").length,
      secondaryConnectorTiles: tiles.filter(tile => tile.connectorPriority === "secondary-connector").length,
      resourceFrontierTiles: tiles.filter(tile => tile.connectorPriority === "resource-frontier").length,
      averageStructureScore: tiles.length ? Math.round(tiles.reduce((total, tile) => total + tile.structureScore, 0) / tiles.length) : 0,
    },
  };
}

function createBiomeMapExport(resources: LegacyWorldResourceSummary, rules: WorldRulesDraft) {
  const biomes = resources.biomes.map(biome => {
    const rule = rules.biomeRules.find(item => item.biomeId === biome.id);
    return {
      id: `biome-tile-${biome.id}`,
      biomeId: biome.id,
      biomeName: biome.name,
      color: biome.color,
      habitability: typeof biome.habitability === "number" ? biome.habitability : null,
      movementCost: typeof biome.movementCost === "number" ? biome.movementCost : null,
      resourceTag: rule?.resourceTag ?? biome.agmResourceTag ?? "neutral-biome",
      ruleWeight: rule?.ruleWeight ?? biome.agmRuleWeight ?? 1,
      profileBiomeFrictionWeight: rule?.profileBiomeFrictionWeight ?? 1,
      profileAdjustedHabitability: rule?.profileAdjustedHabitability ?? null,
      profileFrictionBand: rule?.profileFrictionBand ?? "balanced-friction",
      exportLayer: rule?.profileFrictionBand ?? "balanced-friction",
    };
  });
  const adjustedHabitability = biomes.flatMap(biome => biome.profileAdjustedHabitability === null ? [] : [biome.profileAdjustedHabitability]);

  return {
    schema: "agm.biome-map.v0",
    profile: rules.profileRules.profile,
    profileLabel: rules.profileRules.profileLabel,
    sourceRules: rules.biomeRules.map(rule => rule.id),
    legend: rules.resourceTags.map(tag => ({tag: tag.tag, role: tag.role, biomeIds: tag.biomeIds})),
    biomes,
    habitabilitySummary: {
      biomeCount: biomes.length,
      lowFrictionBiomes: biomes.filter(biome => biome.profileFrictionBand === "low-friction").length,
      balancedFrictionBiomes: biomes.filter(biome => biome.profileFrictionBand === "balanced-friction").length,
      highFrictionBiomes: biomes.filter(biome => biome.profileFrictionBand === "high-friction").length,
      averageAdjustedHabitability: adjustedHabitability.length ? Math.round(adjustedHabitability.reduce((total, value) => total + value, 0) / adjustedHabitability.length) : 0,
    },
  };
}

function createTiledProperties(properties: Record<string, string | number | boolean>) {
  return Object.entries(properties).map(([name, value]) => ({
    name,
    type: typeof value === "number" ? "float" : typeof value === "boolean" ? "bool" : "string",
    value,
  }));
}

function createTiledLayerData<T>(items: T[], width: number, height: number, resolver: (item: T) => number) {
  const data = Array.from({length: width * height}, () => 0);
  items.slice(0, data.length).forEach((item, index) => {
    data[index] = resolver(item);
  });
  return data;
}

function createTiledMapExport(packageDraft: ReturnType<typeof createWorldPackageDraft>) {
  const {resourceMap, provinceMap, biomeMap} = packageDraft.maps;
  const tileCount = Math.max(resourceMap.tiles.length, provinceMap.tiles.length, biomeMap.biomes.length, 1);
  const width = Math.max(1, Math.ceil(Math.sqrt(tileCount)));
  const height = Math.max(1, Math.ceil(tileCount / width));

  return {
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    width,
    height,
    tilewidth: 1,
    tileheight: 1,
    infinite: false,
    properties: createTiledProperties({
      agmSchema: packageDraft.schema,
      manifestId: packageDraft.manifest.id,
      name: packageDraft.manifest.name,
      profile: packageDraft.manifest.profile,
      profileLabel: packageDraft.manifest.profileLabel,
      resourceMapSchema: resourceMap.schema,
      provinceMapSchema: provinceMap.schema,
      biomeMapSchema: biomeMap.schema,
    }),
    layers: [
      {
        id: 1,
        name: "Resources",
        type: "tilelayer",
        x: 0,
        y: 0,
        width,
        height,
        opacity: 1,
        visible: true,
        data: createTiledLayerData(resourceMap.tiles, width, height, tile => tile.role === "starter" ? 1 : tile.role === "challenge" ? 2 : 3),
        properties: createTiledProperties({schema: resourceMap.schema, profile: resourceMap.profile, coverageSummary: JSON.stringify(resourceMap.coverageSummary)}),
      },
      {
        id: 2,
        name: "Provinces",
        type: "tilelayer",
        x: 0,
        y: 0,
        width,
        height,
        opacity: 0.8,
        visible: true,
        data: createTiledLayerData(provinceMap.tiles, width, height, tile => tile.connectorPriority === "primary-connector" ? 4 : tile.connectorPriority === "secondary-connector" ? 5 : 6),
        properties: createTiledProperties({schema: provinceMap.schema, profile: provinceMap.profile, structureSummary: JSON.stringify(provinceMap.structureSummary)}),
      },
      {
        id: 3,
        name: "Biomes",
        type: "tilelayer",
        x: 0,
        y: 0,
        width,
        height,
        opacity: 0.65,
        visible: true,
        data: createTiledLayerData(biomeMap.biomes, width, height, biome => biome.profileFrictionBand === "low-friction" ? 7 : biome.profileFrictionBand === "high-friction" ? 9 : 8),
        properties: createTiledProperties({schema: biomeMap.schema, profile: biomeMap.profile, habitabilitySummary: JSON.stringify(biomeMap.habitabilitySummary)}),
      },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: "AGM semantic map layers",
        tilewidth: 1,
        tileheight: 1,
        tilecount: 9,
        columns: 9,
        tiles: [
          {id: 0, type: "starter-resource", properties: createTiledProperties({agmLayer: "resource", role: "starter"})},
          {id: 1, type: "challenge-resource", properties: createTiledProperties({agmLayer: "resource", role: "challenge"})},
          {id: 2, type: "neutral-resource", properties: createTiledProperties({agmLayer: "resource", role: "neutral"})},
          {id: 3, type: "primary-connector", properties: createTiledProperties({agmLayer: "province", priority: "primary-connector"})},
          {id: 4, type: "secondary-connector", properties: createTiledProperties({agmLayer: "province", priority: "secondary-connector"})},
          {id: 5, type: "resource-frontier", properties: createTiledProperties({agmLayer: "province", priority: "resource-frontier"})},
          {id: 6, type: "low-friction-biome", properties: createTiledProperties({agmLayer: "biome", frictionBand: "low-friction"})},
          {id: 7, type: "balanced-friction-biome", properties: createTiledProperties({agmLayer: "biome", frictionBand: "balanced-friction"})},
          {id: 8, type: "high-friction-biome", properties: createTiledProperties({agmLayer: "biome", frictionBand: "high-friction"})},
        ],
      },
    ],
  };
}

function createPointFeature(id: string, x: number, y: number, properties: Record<string, string | number | boolean | null>) {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "Point",
      coordinates: [x, y],
    },
    properties: {
      coordinateSystem: "agm-layer-grid",
      ...properties,
    },
  };
}

function getGridPoint(index: number, width: number) {
  return {x: index % width, y: Math.floor(index / width)};
}

function createGeoJsonMapLayerExport(packageDraft: ReturnType<typeof createWorldPackageDraft>) {
  const {resourceMap, provinceMap, biomeMap} = packageDraft.maps;
  const width = Math.max(1, Math.ceil(Math.sqrt(Math.max(resourceMap.tiles.length, provinceMap.tiles.length, biomeMap.biomes.length, 1))));
  const resourceFeatures = resourceMap.tiles.map((tile, index) => {
    const point = getGridPoint(index, width);
    return createPointFeature(tile.id, point.x, point.y, {
      layer: "resource",
      provinceId: tile.provinceId,
      stateId: tile.stateId,
      resourceTag: tile.resourceTag,
      role: tile.role,
      coverageScore: tile.coverageScore,
      structureScore: tile.structureScore,
      connectorPriority: tile.connectorPriority,
      exportLayer: tile.exportLayer,
    });
  });
  const provinceFeatures = provinceMap.tiles.map((tile, index) => {
    const point = getGridPoint(index, width);
    return createPointFeature(tile.id, point.x, point.y, {
      layer: "province",
      provinceId: tile.provinceId,
      provinceName: tile.provinceName,
      stateId: tile.stateId,
      hasSettlementAnchor: tile.hasSettlementAnchor,
      structureScore: tile.structureScore,
      connectorPriority: tile.connectorPriority,
      exportLayer: tile.exportLayer,
    });
  });
  const biomeFeatures = biomeMap.biomes.map((biome, index) => {
    const point = getGridPoint(index, width);
    return createPointFeature(biome.id, point.x, point.y, {
      layer: "biome",
      biomeId: biome.biomeId,
      biomeName: biome.biomeName,
      habitability: biome.habitability,
      movementCost: biome.movementCost,
      resourceTag: biome.resourceTag,
      profileFrictionBand: biome.profileFrictionBand,
      profileAdjustedHabitability: biome.profileAdjustedHabitability,
      exportLayer: biome.exportLayer,
    });
  });

  return {
    type: "FeatureCollection",
    schema: "agm.geojson-map-layers.v0",
    name: packageDraft.manifest.name,
    profile: packageDraft.manifest.profile,
    profileLabel: packageDraft.manifest.profileLabel,
    sourceSchemas: {
      package: packageDraft.schema,
      resourceMap: resourceMap.schema,
      provinceMap: provinceMap.schema,
      biomeMap: biomeMap.schema,
    },
    features: [...resourceFeatures, ...provinceFeatures, ...biomeFeatures],
  };
}

function createHeightmapMetadataExport(packageDraft: ReturnType<typeof createWorldPackageDraft>) {
  return {
    schema: "agm.heightmap-metadata.v0",
    manifest: packageDraft.manifest,
    map: {
      width: packageDraft.map.width,
      height: packageDraft.map.height,
      style: packageDraft.map.style,
      heightmapTemplate: packageDraft.map.heightmap,
    },
    sourceMaps: {
      resourceMap: packageDraft.maps.resourceMap.schema,
      provinceMap: packageDraft.maps.provinceMap.schema,
      biomeMap: packageDraft.maps.biomeMap.schema,
    },
    interpretation: {
      source: "legacy-template",
      coordinateSystem: "agm-layer-grid",
      heightScale: "designer-defined",
      rasterStatus: "metadata-only",
    },
  };
}

function clampHeight(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

type HeightfieldExport = ReturnType<typeof createHeightfieldExport>;

function createHeightfieldExport(packageDraft: ReturnType<typeof createWorldPackageDraft>) {
  const {resourceMap, provinceMap, biomeMap} = packageDraft.maps;
  const width = Math.max(1, Math.ceil(Math.sqrt(Math.max(resourceMap.tiles.length, provinceMap.tiles.length, biomeMap.biomes.length, 1))));
  const height = Math.max(1, Math.ceil(Math.max(resourceMap.tiles.length, provinceMap.tiles.length, biomeMap.biomes.length, 1) / width));
  const values = Array.from({length: width * height}, (_, index) => {
    const resourceTile = resourceMap.tiles[index % Math.max(resourceMap.tiles.length, 1)];
    const provinceTile = provinceMap.tiles[index % Math.max(provinceMap.tiles.length, 1)];
    const biome = biomeMap.biomes[index % Math.max(biomeMap.biomes.length, 1)];
    const biomeBase = biome ? (biome.profileFrictionBand === "high-friction" ? 58 : biome.profileFrictionBand === "low-friction" ? 34 : 46) : 42;
    const habitabilityOffset = typeof biome?.profileAdjustedHabitability === "number" ? (50 - biome.profileAdjustedHabitability) * 0.18 : 0;
    const provinceOffset = provinceTile ? provinceTile.structureScore * 0.12 + (provinceTile.connectorPriority === "primary-connector" ? -5 : provinceTile.connectorPriority === "secondary-connector" ? -2 : 4) : 0;
    const resourceOffset = resourceTile ? resourceTile.coverageScore * 0.08 + (resourceTile.role === "challenge" ? 5 : resourceTile.role === "starter" ? -3 : 0) : 0;
    const deterministicNoise = ((index * 37 + width * 11 + height * 7) % 17) - 8;
    return clampHeight(biomeBase + habitabilityOffset + provinceOffset + resourceOffset + deterministicNoise);
  });

  return {
    schema: "agm.heightfield.v0",
    manifest: packageDraft.manifest,
    map: {
      width: packageDraft.map.width,
      height: packageDraft.map.height,
      style: packageDraft.map.style,
      seed: packageDraft.map.seed,
      heightmapTemplate: packageDraft.map.heightmap,
    },
    grid: {
      width,
      height,
      coordinateSystem: "agm-layer-grid",
      sampleSpacing: 1,
    },
    normalization: {
      min: 0,
      max: 100,
      valueType: "normalized-height",
      units: "designer-scale",
    },
    source: {
      type: "reconstructable-layer-derived",
      baseTemplate: packageDraft.map.heightmap,
      sourceMaps: {
        resourceMap: resourceMap.schema,
        provinceMap: provinceMap.schema,
        biomeMap: biomeMap.schema,
      },
    },
    values,
  };
}

function createHeightmapPngBlob(heightfield: HeightfieldExport) {
  const canvas = document.createElement("canvas");
  canvas.width = heightfield.grid.width;
  canvas.height = heightfield.grid.height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Heightmap PNG canvas context is unavailable"));

  const imageData = context.createImageData(heightfield.grid.width, heightfield.grid.height);
  heightfield.values.forEach((value, index) => {
    const shade = Math.max(0, Math.min(255, Math.round((value / 100) * 255)));
    const offset = index * 4;
    imageData.data[offset] = shade;
    imageData.data[offset + 1] = shade;
    imageData.data[offset + 2] = shade;
    imageData.data[offset + 3] = 255;
  });
  context.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Heightmap PNG blob generation failed"));
    }, "image/png");
  });
}

function createEngineManifestExport(packageDraft: ReturnType<typeof createWorldPackageDraft>) {
  const baseName = packageDraft.manifest.id;
  const files = [
    {kind: "agm-world", path: `${baseName}.agm-world.json`, schema: packageDraft.schema},
    {kind: "resource-map", path: `${baseName}.agm-resource-map.json`, schema: packageDraft.maps.resourceMap.schema},
    {kind: "province-map", path: `${baseName}.agm-province-map.json`, schema: packageDraft.maps.provinceMap.schema},
    {kind: "biome-map", path: `${baseName}.agm-biome-map.json`, schema: packageDraft.maps.biomeMap.schema},
    {kind: "tiled-map", path: `${baseName}.agm-tiled-map.json`, schema: "tiled.map.v1"},
    {kind: "geojson-map-layers", path: `${baseName}.agm-map-layers.geojson`, schema: "agm.geojson-map-layers.v0"},
    {kind: "heightmap-metadata", path: `${baseName}.agm-heightmap.json`, schema: "agm.heightmap-metadata.v0"},
    {kind: "heightfield", path: `${baseName}.agm-heightfield.json`, schema: "agm.heightfield.v0"},
    {kind: "heightmap-png", path: `${baseName}.agm-heightmap.png`, schema: "png.grayscale-heightmap.v1"},
  ];
  const layers = [
    {id: "resource", source: packageDraft.maps.resourceMap.schema, semantics: ["resourceTag", "role", "coverageScore", "exportLayer"]},
    {id: "province", source: packageDraft.maps.provinceMap.schema, semantics: ["provinceId", "stateId", "structureScore", "connectorPriority"]},
    {id: "biome", source: packageDraft.maps.biomeMap.schema, semantics: ["biomeId", "resourceTag", "profileFrictionBand", "profileAdjustedHabitability"]},
  ];
  const requiredFileKinds = ["agm-world", "resource-map", "province-map", "biome-map"];
  const optionalFileKinds = ["tiled-map", "geojson-map-layers", "heightmap-metadata", "heightfield", "heightmap-png"];
  const layerBindings = [
    {layer: "resource", fileKind: "resource-map", role: "semantic resource coverage"},
    {layer: "province", fileKind: "province-map", role: "province structure and connector planning"},
    {layer: "biome", fileKind: "biome-map", role: "biome habitability and friction bands"},
    {layer: "tiled", fileKind: "tiled-map", role: "tilemap import reference"},
    {layer: "geojson", fileKind: "geojson-map-layers", role: "GIS-style layer interchange"},
    {layer: "heightmap", fileKind: "heightmap-metadata", role: "height interpretation metadata"},
    {layer: "heightfield", fileKind: "heightfield", role: "reconstructable normalized elevation grid"},
    {layer: "heightmap-raster", fileKind: "heightmap-png", role: "8-bit grayscale terrain raster"},
  ];

  return {
    schema: "agm.engine-manifest.v0",
    manifest: packageDraft.manifest,
    map: packageDraft.map,
    targets: ["unity", "godot", "unreal", "tiled", "geojson", "heightmap", "heightfield", "raster"],
    files,
    layers,
    importLayout: {
      root: `Assets/AGM/${baseName}`,
      dataDirectory: "Data",
      mapsDirectory: "Maps",
      metadataDirectory: "Metadata",
      recommendedFiles: files.map(file => ({
        ...file,
        recommendedPath: `${["agm-world", "resource-map", "province-map", "biome-map", "tiled-map", "geojson-map-layers"].includes(file.kind) ? "Maps" : "Metadata"}/${file.path}`,
      })),
    },
    engineProfiles: [
      {
        engine: "unity",
        assetRoot: `Assets/AGM/${baseName}`,
        loaderHint: "ScriptableObject importer or Editor JSON importer",
        requiredFiles: requiredFileKinds,
        optionalFiles: optionalFileKinds,
        layerBindings,
        coordinateSystem: "agm-layer-grid",
        heightmapStatus: "heightfield-json",
        heightDataStatus: "reconstructable-json",
        heightRasterStatus: "png-8bit-grayscale",
      },
      {
        engine: "godot",
        assetRoot: `res://agm/${baseName}`,
        loaderHint: "EditorImportPlugin or runtime JSON loader",
        requiredFiles: requiredFileKinds,
        optionalFiles: optionalFileKinds,
        layerBindings,
        coordinateSystem: "agm-layer-grid",
        heightmapStatus: "heightfield-json",
        heightDataStatus: "reconstructable-json",
        heightRasterStatus: "png-8bit-grayscale",
      },
      {
        engine: "unreal",
        assetRoot: `/Game/AGM/${baseName}`,
        loaderHint: "Editor Utility Widget or DataAsset importer",
        requiredFiles: requiredFileKinds,
        optionalFiles: optionalFileKinds,
        layerBindings,
        coordinateSystem: "agm-layer-grid",
        heightmapStatus: "heightfield-json",
        heightDataStatus: "reconstructable-json",
        heightRasterStatus: "png-8bit-grayscale",
      },
    ],
    validation: {
      requiredSchemas: files.map(file => file.schema),
      warnings: ["Heightmap PNG raster is 8-bit grayscale; RAW and 16-bit terrain export are still pending."],
    },
  };
}

function createWorldPackageDraft(state: StudioState, projectSummary: LegacyProjectSummary, entities: LegacyEntitySummary, resources: LegacyWorldResourceSummary, playability: WorldPlayabilityHints, rules: WorldRulesDraft, profileOverrides: ReturnType<typeof createGenerationProfileOverrides>) {
  return {
    schema: "agm.package.v0",
    manifest: {
      id: createSafeAgmFilename(state.document.name).replace(/\.agm$/u, ""),
      name: state.document.name,
      profile: state.document.gameProfile,
      profileLabel: GAME_WORLD_PROFILE_LABELS[state.document.gameProfile],
      sourceSchema: "agm.world.v0",
    },
    map: {
      seed: state.document.seed,
      width: state.document.documentWidth,
      height: state.document.documentHeight,
      style: state.document.stylePreset,
      heightmap: projectSummary.pendingTemplate,
    },
    maps: {
      resourceMap: createResourceMapExport(rules),
      provinceMap: createProvinceMapExport(resources, rules),
      biomeMap: createBiomeMapExport(resources, rules),
    },
    generation: {
      profileOverrides,
    },
    entities,
    resources,
    rules,
    playability,
    indexes: {
      ...createEntityIndex(entities),
      ...createResourceIndex(resources),
    },
    exportTargets: ["json", "unity", "godot", "unreal", "tiled", "geojson", "heightmap", "biome-map", "province-map", "resource-map"],
  };
}

export function createWorldDocumentDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const entities = getLegacyEntitySummary();
  const resources = getLegacyWorldResourceSummary();
  const playability = createWorldPlayabilityHints(entities, resources, state);
  const effectiveProfileParameters = createEffectiveProfileParameters(state.document.gameProfile, playability.spawnCandidates, entities, resources, state.generationProfileOverrides);
  const rules = createWorldRulesDraft(resources, state.document.gameProfile, effectiveProfileParameters);
  const profileOverrides = createGenerationProfileOverrides(state);

  return {
    schema: "agm.world.v0",
    project: {
      name: state.document.name,
      source: state.document.source,
    },
    game: {
      profile: state.document.gameProfile,
      profileLabel: GAME_WORLD_PROFILE_LABELS[state.document.gameProfile],
      designIntent: state.document.designIntent,
    },
    map: {
      seed: state.document.seed,
      width: state.document.documentWidth,
      height: state.document.documentHeight,
      style: state.document.stylePreset,
    },
    generation: {
      pendingSeed: projectSummary.pendingSeed,
      pointsDensity: numberOrNull(projectSummary.pendingPoints),
      cellsLabel: projectSummary.pendingCellsLabel,
      states: numberOrNull(projectSummary.pendingStates),
      provincesRatio: numberOrNull(projectSummary.pendingProvincesRatio),
      growthRate: numberOrNull(projectSummary.pendingGrowthRate),
      sizeVariety: numberOrNull(projectSummary.pendingSizeVariety),
      heightmap: {
        value: projectSummary.pendingTemplate,
        label: projectSummary.pendingTemplateLabel,
      },
      pendingCanvasSize: {
        width: numberOrNull(projectSummary.pendingWidth),
        height: numberOrNull(projectSummary.pendingHeight),
      },
      profileOverrides,
    },
    climate: {
      temperature: {
        equator: numberOrNull(projectSummary.pendingTemperatureEquator),
        northPole: numberOrNull(projectSummary.pendingTemperatureNorthPole),
        southPole: numberOrNull(projectSummary.pendingTemperatureSouthPole),
      },
      precipitation: numberOrNull(projectSummary.pendingPrecipitation),
      mapSize: numberOrNull(projectSummary.pendingMapSize),
      latitude: numberOrNull(projectSummary.pendingLatitude),
      longitude: numberOrNull(projectSummary.pendingLongitude),
      winds: [
        numberOrNull(projectSummary.pendingWindTier0),
        numberOrNull(projectSummary.pendingWindTier1),
        numberOrNull(projectSummary.pendingWindTier2),
        numberOrNull(projectSummary.pendingWindTier3),
        numberOrNull(projectSummary.pendingWindTier4),
        numberOrNull(projectSummary.pendingWindTier5),
      ],
    },
    population: {
      cultures: numberOrNull(projectSummary.pendingCultures),
      burgs: numberOrNull(projectSummary.pendingBurgs),
      burgsLabel: projectSummary.pendingBurgsLabel,
      religions: numberOrNull(projectSummary.pendingReligions),
      stateLabelsMode: projectSummary.pendingStateLabelsMode,
      stateLabelsModeLabel: projectSummary.pendingStateLabelsModeLabel,
      cultureSet: projectSummary.pendingCultureSet,
      cultureSetLabel: projectSummary.pendingCultureSetLabel,
    },
    layers: {
      preset: projectSummary.lastLayersPreset,
      visible: getLegacyLayerStates(),
      details: getLegacyLayerDetails(),
    },
    entities,
    resources,
    rules,
    playability,
    package: createWorldPackageDraft(state, projectSummary, entities, resources, playability, rules, profileOverrides),
    viewport: {
      presetId: state.viewport.presetId,
      orientation: state.viewport.orientation,
      fitMode: state.viewport.fitMode,
    },
    export: {
      format: state.export.format,
    },
  };
}

export type WorldDocumentDraft = ReturnType<typeof createWorldDocumentDraft>;

export type AgmDocumentDraft = {
  schema: "agm.document.v0";
  document: Pick<DocumentState, "name" | "gameProfile" | "designIntent">;
  world: WorldDocumentDraft;
};

export function createAgmDocumentDraft(state: StudioState, projectSummary: LegacyProjectSummary): AgmDocumentDraft {
  return {
    schema: "agm.document.v0",
    document: {
      name: state.document.name,
      gameProfile: state.document.gameProfile,
      designIntent: state.document.designIntent,
    },
    world: createWorldDocumentDraft(state, projectSummary),
  };
}

export function saveAgmDocumentDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = createAgmDocumentDraft(state, projectSummary);
  localStorage.setItem(AGM_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

export function exportAgmDocumentDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeAgmFilename(draft.document.name), draft);
  return draft;
}

export function exportWorldPackageDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-world.json"), draft.world.package);
  return draft.world.package;
}

export function exportResourceMapDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-resource-map.json"), draft.world.package.maps.resourceMap);
  return draft.world.package.maps.resourceMap;
}

export function exportProvinceMapDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-province-map.json"), draft.world.package.maps.provinceMap);
  return draft.world.package.maps.provinceMap;
}

export function exportBiomeMapDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-biome-map.json"), draft.world.package.maps.biomeMap);
  return draft.world.package.maps.biomeMap;
}

export function exportTiledMapDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const tiledMap = createTiledMapExport(draft.world.package);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-tiled-map.json"), tiledMap);
  return tiledMap;
}

export function exportGeoJsonMapLayersDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const geoJson = createGeoJsonMapLayerExport(draft.world.package);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-map-layers.geojson"), geoJson);
  return geoJson;
}

export function exportHeightmapMetadataDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const heightmapMetadata = createHeightmapMetadataExport(draft.world.package);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-heightmap.json"), heightmapMetadata);
  return heightmapMetadata;
}

export function exportHeightfieldDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const heightfield = createHeightfieldExport(draft.world.package);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-heightfield.json"), heightfield);
  return heightfield;
}

export async function exportHeightmapPngDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const heightfield = createHeightfieldExport(draft.world.package);
  const filename = createSafeFilename(draft.document.name, "agm-heightmap.png");
  const blob = await createHeightmapPngBlob(heightfield);
  downloadBlobDraft(filename, blob);
  return {filename, heightfield};
}

export function exportEngineManifestDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  const engineManifest = createEngineManifestExport(draft.world.package);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-engine-manifest.json"), engineManifest);
  return engineManifest;
}

export function exportAgmRulesPackDraft(state: StudioState, projectSummary: LegacyProjectSummary) {
  const draft = saveAgmDocumentDraft(state, projectSummary);
  downloadJsonDraft(createSafeFilename(draft.document.name, "agm-rules.json"), draft.world.rules);
  return draft.world.rules;
}

function isLayerStates(value: unknown): value is Partial<Record<LayerAction, boolean>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(item => typeof item === "boolean");
}

function isLayerDetails(value: unknown) {
  if (!Array.isArray(value)) return false;
  return value.every(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const detail = item as Record<string, unknown>;
    return (
      typeof detail.id === "string" &&
      typeof detail.label === "string" &&
      typeof detail.shortcut === "string" &&
      typeof detail.pinned === "boolean" &&
      typeof detail.active === "boolean"
    );
  });
}

function isEntitySummaryItem(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "number" || !Number.isFinite(item.id) || typeof item.name !== "string") return false;
  return [item.type, item.color].every(field => field === undefined || typeof field === "string") &&
    [item.state, item.culture, item.capital, item.population, item.cells].every(field => field === undefined || (typeof field === "number" && Number.isFinite(field)));
}

function isEntitySummaryList(value: unknown) {
  return Array.isArray(value) && value.every(isEntitySummaryItem);
}

function isEntitySummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const summary = value as Record<string, unknown>;
  return isEntitySummaryList(summary.states) && isEntitySummaryList(summary.burgs) && isEntitySummaryList(summary.cultures) && isEntitySummaryList(summary.religions);
}

function isEntityIndex(value: unknown) {
  return Array.isArray(value) && value.every(item => typeof item === "number" && Number.isFinite(item));
}

function isResourceSummaryItem(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "number" || !Number.isFinite(item.id)) return false;
  if (item.name !== undefined && typeof item.name !== "string") return false;
  if (item.fullName !== undefined && typeof item.fullName !== "string") return false;
  if (item.type !== undefined && typeof item.type !== "string") return false;
  if (item.group !== undefined && typeof item.group !== "string") return false;
  if (item.color !== undefined && typeof item.color !== "string") return false;
  return [item.habitability, item.movementCost, item.iconDensity, item.state, item.burg, item.center, item.feature, item.pointCount, item.agmRuleWeight].every(
    field => field === undefined || (typeof field === "number" && Number.isFinite(field))
  ) && (item.agmResourceTag === undefined || typeof item.agmResourceTag === "string");
}

function isResourceSummaryList(value: unknown) {
  return Array.isArray(value) && value.every(isResourceSummaryItem);
}

function isWorldResourceSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const summary = value as Record<string, unknown>;
  return isResourceSummaryList(summary.biomes) && isResourceSummaryList(summary.provinces) && isResourceSummaryList(summary.routes);
}

function isNumberList(value: unknown) {
  return Array.isArray(value) && value.every(item => typeof item === "number" && Number.isFinite(item));
}

function isSpawnCandidateHint(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.score !== "number" || !Number.isFinite(item.score)) return false;
  if (!Array.isArray(item.reasons) || !item.reasons.every(reason => typeof reason === "string")) return false;
  return [item.state, item.province, item.burg, item.biome].every(field => field === undefined || (typeof field === "number" && Number.isFinite(field)));
}

function isBalanceHint(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.message !== "string") return false;
  if (item.category !== "spawn" && item.category !== "settlement" && item.category !== "connectivity" && item.category !== "habitability") return false;
  if (item.severity !== "info" && item.severity !== "warning") return false;
  if (typeof item.profileWeight !== "number" || !Number.isFinite(item.profileWeight)) return false;
  if (item.profilePriority !== undefined && typeof item.profilePriority !== "string") return false;
  if (item.refs === undefined) return true;
  if (!item.refs || typeof item.refs !== "object" || Array.isArray(item.refs)) return false;
  return Object.values(item.refs).every(isNumberList);
}

function isAutoFixPreviewDiff(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const diff = value as Record<string, unknown>;
  if (diff.mode !== "dry-run" || typeof diff.title !== "string" || !Array.isArray(diff.changes)) return false;
  return diff.changes.every(change => {
    if (!change || typeof change !== "object" || Array.isArray(change)) return false;
    const item = change as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.summary !== "string") return false;
    if (item.operation !== "create" && item.operation !== "update" && item.operation !== "link") return false;
    if (item.entity !== "state" && item.entity !== "province" && item.entity !== "burg" && item.entity !== "route" && item.entity !== "biome") return false;
    if (!item.refs || typeof item.refs !== "object" || Array.isArray(item.refs) || !Object.values(item.refs).every(isNumberList)) return false;
    if (item.fields === undefined) return true;
    if (!item.fields || typeof item.fields !== "object" || Array.isArray(item.fields)) return false;
    return Object.values(item.fields).every(field => field === null || typeof field === "string" || typeof field === "number" || typeof field === "boolean");
  });
}

function isAutoFixDraft(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.hintId !== "string" || typeof item.action !== "string" || typeof item.summary !== "string") return false;
  if (item.category !== "spawn" && item.category !== "settlement" && item.category !== "connectivity" && item.category !== "habitability") return false;
  if (item.status !== "draft") return false;
  if (typeof item.profileWeight !== "number" || !Number.isFinite(item.profileWeight)) return false;
  if (item.profilePriority !== undefined && typeof item.profilePriority !== "string") return false;
  if (!item.targetRefs || typeof item.targetRefs !== "object" || Array.isArray(item.targetRefs)) return false;
  if (!Object.values(item.targetRefs).every(isNumberList)) return false;
  if (item.previewDiff !== undefined && !isAutoFixPreviewDiff(item.previewDiff)) return false;
  return Array.isArray(item.steps) && item.steps.every(step => typeof step === "string") && Array.isArray(item.risks) && item.risks.every(risk => typeof risk === "string");
}

function isAppliedAutoFixPreviewChange(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.draftId !== "string" || typeof item.appliedAt !== "number" || !Number.isFinite(item.appliedAt)) return false;
  return isAutoFixPreviewDiff({mode: "dry-run", title: "applied", changes: [item]});
}

function isGeneratorProfileSuggestion(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.priorityId !== "string" || typeof item.recommendation !== "string") return false;
  if (typeof item.profile !== "string" || !(item.profile in GAME_WORLD_PROFILE_LABELS)) return false;
  if (item.target !== "spawn" && item.target !== "settlement" && item.target !== "connectivity" && item.target !== "habitability" && item.target !== "resource") return false;
  if (typeof item.weight !== "number" || !Number.isFinite(item.weight)) return false;
  const parameterDraft = item.parameterDraft;
  if (!parameterDraft || typeof parameterDraft !== "object" || Array.isArray(parameterDraft)) return false;
  const parameterRecord = parameterDraft as Record<string, unknown>;
  if (typeof parameterRecord.key !== "string" || typeof parameterRecord.label !== "string" || typeof parameterRecord.source !== "string") return false;
  if (typeof parameterRecord.value !== "number" || !Number.isFinite(parameterRecord.value)) return false;
  if (parameterRecord.unit !== "profile-weight" && parameterRecord.unit !== "score" && parameterRecord.unit !== "count" && parameterRecord.unit !== "percent") return false;
  if (!item.refs || typeof item.refs !== "object" || Array.isArray(item.refs)) return false;
  return Object.values(item.refs).every(isNumberList);
}

function isGenerationProfileImpact(value: unknown) {
  if (value === null) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const impact = value as Record<string, unknown>;
  if (typeof impact.profile !== "string" || !(impact.profile in GAME_WORLD_PROFILE_LABELS)) return false;
  if (typeof impact.appliedAt !== "number" || !Number.isFinite(impact.appliedAt)) return false;
  if (!Array.isArray(impact.changes) || !Array.isArray(impact.resultMetrics)) return false;
  const changesValid = impact.changes.every(change => {
    if (!change || typeof change !== "object" || Array.isArray(change)) return false;
    const item = change as Record<string, unknown>;
    return (item.key === "spawnFairnessWeight" || item.key === "settlementDensityTarget" || item.key === "routeConnectivityScore" || item.key === "biomeFrictionWeight" || item.key === "resourceCoverageTarget") &&
      (item.target === "states" || item.target === "burgs" || item.target === "growthRate" || item.target === "sizeVariety" || item.target === "provincesRatio") &&
      (item.before === null || (typeof item.before === "number" && Number.isFinite(item.before))) &&
      typeof item.after === "number" &&
      Number.isFinite(item.after);
  });
  const resultMetricsValid = impact.resultMetrics.every(metric => {
    if (!metric || typeof metric !== "object" || Array.isArray(metric)) return false;
    const item = metric as Record<string, unknown>;
    return (item.key === "spawnCandidates" || item.key === "averageSpawnScore" || item.key === "states" || item.key === "burgs" || item.key === "provinces" || item.key === "routes" || item.key === "routePointCount" || item.key === "resourceTaggedBiomes") &&
      typeof item.before === "number" &&
      Number.isFinite(item.before) &&
      typeof item.after === "number" &&
      Number.isFinite(item.after) &&
      typeof item.delta === "number" &&
      Number.isFinite(item.delta);
  });
  return changesValid && resultMetricsValid;
}

function isWorldPlayabilityHints(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const hints = value as Record<string, unknown>;
  return Array.isArray(hints.spawnCandidates) && hints.spawnCandidates.every(isSpawnCandidateHint) && Array.isArray(hints.balanceHints) && hints.balanceHints.every(isBalanceHint) && Array.isArray(hints.autoFixDrafts) && hints.autoFixDrafts.every(isAutoFixDraft) && Array.isArray(hints.appliedPreviewChanges) && hints.appliedPreviewChanges.every(isAppliedAutoFixPreviewChange) && Array.isArray(hints.generatorProfileSuggestions) && hints.generatorProfileSuggestions.every(isGeneratorProfileSuggestion) && isGenerationProfileImpact(hints.generationProfileImpact);
}

function isRulesPriority(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.weight === "number" &&
    Number.isFinite(item.weight) &&
    (item.target === "spawn" || item.target === "settlement" || item.target === "connectivity" || item.target === "habitability" || item.target === "resource");
}

function isWorldRulesDraft(value: unknown): value is WorldRulesDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rules = value as Record<string, unknown>;
  if (rules.schema !== "agm.rules.v0" || rules.version !== 1 || rules.source !== "legacy-biome-summary") return false;
  if (!Array.isArray(rules.biomeRules) || !rules.biomeRules.every(rule => {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return false;
    const item = rule as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.biomeId !== "number" || !Number.isFinite(item.biomeId)) return false;
    if (typeof item.biomeName !== "string" || typeof item.ruleWeight !== "number" || !Number.isFinite(item.ruleWeight)) return false;
    if (typeof item.resourceTag !== "string") return false;
    if (item.source !== "legacy-biome-summary" && item.source !== "studio-metadata") return false;
    return (item.habitability === null || (typeof item.habitability === "number" && Number.isFinite(item.habitability))) && (item.movementCost === null || (typeof item.movementCost === "number" && Number.isFinite(item.movementCost)));
  })) return false;
  if (!Array.isArray(rules.resourceTags) || !rules.resourceTags.every(tag => {
    if (!tag || typeof tag !== "object" || Array.isArray(tag)) return false;
    const item = tag as Record<string, unknown>;
    return typeof item.tag === "string" && isNumberList(item.biomeIds) && (item.role === "starter" || item.role === "challenge" || item.role === "neutral");
  })) return false;
  if (!Array.isArray(rules.resourceRules) || !rules.resourceRules.every(rule => {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return false;
    const item = rule as Record<string, unknown>;
    return typeof item.id === "string" &&
      typeof item.tag === "string" &&
      (item.role === "starter" || item.role === "challenge" || item.role === "neutral") &&
      item.distribution === "biome-tag-derived" &&
      (item.priority === "start-support" || item.priority === "challenge-zone" || item.priority === "neutral-coverage") &&
      isNumberList(item.biomeIds) &&
      isNumberList(item.provinceIds) &&
      isNumberList(item.routeIds) &&
      typeof item.routePointCount === "number" &&
      Number.isFinite(item.routePointCount) &&
      typeof item.coverageScore === "number" &&
      Number.isFinite(item.coverageScore);
  })) return false;
  const profileRules = rules.profileRules;
  if (!profileRules || typeof profileRules !== "object" || Array.isArray(profileRules)) return false;
  const profileRecord = profileRules as Record<string, unknown>;
  if (typeof profileRecord.profile !== "string" || !(profileRecord.profile in GAME_WORLD_PROFILE_LABELS)) return false;
  if (typeof profileRecord.profileLabel !== "string") return false;
  if (!Array.isArray(profileRecord.priorities) || !profileRecord.priorities.every(isRulesPriority)) return false;
  if (!Array.isArray(profileRecord.sourceFields) || !profileRecord.sourceFields.every(field => typeof field === "string")) return false;
  const weights = rules.weights;
  if (!weights || typeof weights !== "object" || Array.isArray(weights)) return false;
  const weightRecord = weights as Record<string, unknown>;
  const ruleWeightRange = weightRecord.ruleWeightRange;
  if (typeof weightRecord.defaultRuleWeight !== "number" || !Number.isFinite(weightRecord.defaultRuleWeight)) return false;
  if (!ruleWeightRange || typeof ruleWeightRange !== "object" || Array.isArray(ruleWeightRange)) return false;
  const rangeRecord = ruleWeightRange as Record<string, unknown>;
  return typeof rangeRecord.min === "number" && Number.isFinite(rangeRecord.min) && typeof rangeRecord.max === "number" && Number.isFinite(rangeRecord.max) && Array.isArray(weightRecord.sourceFields) && weightRecord.sourceFields.every(field => typeof field === "string");
}

function isGenerationProfileOverrides(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const overrides = value as Record<string, unknown>;
  if (typeof overrides.profile !== "string" || !(overrides.profile in GAME_WORLD_PROFILE_LABELS)) return false;
  if (!overrides.values || typeof overrides.values !== "object" || Array.isArray(overrides.values)) return false;
  return Object.entries(overrides.values).every(([key, field]) =>
    (key === "spawnFairnessWeight" || key === "settlementDensityTarget" || key === "routeConnectivityScore" || key === "biomeFrictionWeight" || key === "resourceCoverageTarget") &&
    typeof field === "number" &&
    Number.isFinite(field),
  );
}

function isWorldPackageDraft(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const packageDraft = value as Record<string, unknown>;
  const manifest = packageDraft.manifest;
  const map = packageDraft.map;
  const indexes = packageDraft.indexes;
  const entities = packageDraft.entities;
  const resources = packageDraft.resources;
  const generation = packageDraft.generation;
  const rules = packageDraft.rules;
  const playability = packageDraft.playability;
  const exportTargets = packageDraft.exportTargets;
  if (packageDraft.schema !== "agm.package.v0") return false;
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return false;
  const manifestRecord = manifest as Record<string, unknown>;
  if (typeof manifestRecord.id !== "string" || typeof manifestRecord.name !== "string") return false;
  if (typeof manifestRecord.profile !== "string" || !(manifestRecord.profile in GAME_WORLD_PROFILE_LABELS)) return false;
  if (typeof manifestRecord.profileLabel !== "string" || manifestRecord.sourceSchema !== "agm.world.v0") return false;
  if (!map || typeof map !== "object" || Array.isArray(map)) return false;
  const mapRecord = map as Record<string, unknown>;
  if (typeof mapRecord.seed !== "string" || typeof mapRecord.style !== "string") return false;
  if (typeof mapRecord.width !== "number" || !Number.isFinite(mapRecord.width)) return false;
  if (typeof mapRecord.height !== "number" || !Number.isFinite(mapRecord.height)) return false;
  if (typeof mapRecord.heightmap !== "string") return false;
  if (!indexes || typeof indexes !== "object" || Array.isArray(indexes)) return false;
  const indexRecord = indexes as Record<string, unknown>;
  if (!isEntityIndex(indexRecord.states) || !isEntityIndex(indexRecord.burgs) || !isEntityIndex(indexRecord.cultures) || !isEntityIndex(indexRecord.religions)) return false;
  if (indexRecord.biomes && !isEntityIndex(indexRecord.biomes)) return false;
  if (indexRecord.provinces && !isEntityIndex(indexRecord.provinces)) return false;
  if (indexRecord.routes && !isEntityIndex(indexRecord.routes)) return false;
  if (entities && !isEntitySummary(entities)) return false;
  if (resources && !isWorldResourceSummary(resources)) return false;
  if (generation !== undefined) {
    if (!generation || typeof generation !== "object" || Array.isArray(generation)) return false;
    const generationRecord = generation as Record<string, unknown>;
    if (!isGenerationProfileOverrides(generationRecord.profileOverrides)) return false;
  }
  if (rules && !isWorldRulesDraft(rules)) return false;
  if (playability && !isWorldPlayabilityHints(playability)) return false;
  return Array.isArray(exportTargets) && exportTargets.every(item => typeof item === "string");
}

function parseAgmDocumentDraft(rawDraft: string) {
  try {
    const draft = JSON.parse(rawDraft) as Partial<AgmDocumentDraft>;
    const document = draft.document;
    if (draft.schema !== "agm.document.v0" || !document || !draft.world) return null;
    if (typeof document.name !== "string" || typeof document.designIntent !== "string") return null;
    if (typeof document.gameProfile !== "string" || !(document.gameProfile in GAME_WORLD_PROFILE_LABELS)) return null;
    if (draft.world.viewport) {
      if (typeof draft.world.viewport.presetId !== "string") return null;
      if (draft.world.viewport.orientation !== "landscape" && draft.world.viewport.orientation !== "portrait") return null;
      if (draft.world.viewport.fitMode !== "contain" && draft.world.viewport.fitMode !== "cover" && draft.world.viewport.fitMode !== "actual-size") return null;
    }
    if (draft.world.export && draft.world.export.format !== "svg" && draft.world.export.format !== "png" && draft.world.export.format !== "jpeg") return null;
    if (draft.world.layers) {
      if (typeof draft.world.layers.preset !== "string") return null;
      if (!isLayerStates(draft.world.layers.visible)) return null;
      if (!isLayerDetails(draft.world.layers.details)) return null;
    }
    if (draft.world.entities && !isEntitySummary(draft.world.entities)) return null;
    if (draft.world.generation?.profileOverrides && !isGenerationProfileOverrides(draft.world.generation.profileOverrides)) return null;
    if (draft.world.resources && !isWorldResourceSummary(draft.world.resources)) return null;
    if (draft.world.rules && !isWorldRulesDraft(draft.world.rules)) return null;
    if (draft.world.playability && !isWorldPlayabilityHints(draft.world.playability)) return null;
    if (draft.world.package && !isWorldPackageDraft(draft.world.package)) return null;
    return draft as AgmDocumentDraft;
  } catch {
    return null;
  }
}

export function loadAgmDocumentDraft() {
  const rawDraft = localStorage.getItem(AGM_DRAFT_STORAGE_KEY);
  return rawDraft ? parseAgmDocumentDraft(rawDraft) : null;
}

export function parseAgmRulesPackDraft(rawDraft: string) {
  try {
    const draft = JSON.parse(rawDraft) as unknown;
    return isWorldRulesDraft(draft) ? draft : null;
  } catch {
    return null;
  }
}

export async function importAgmRulesPackDraft(file: File) {
  return parseAgmRulesPackDraft(await file.text());
}

export async function importAgmDocumentDraft(file: File) {
  return parseAgmDocumentDraft(await file.text());
}
