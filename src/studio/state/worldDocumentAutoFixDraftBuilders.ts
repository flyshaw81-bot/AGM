import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import {
  createBiomePreviewDiff,
  createRoutePreviewDiff,
  createSettlementPreviewDiff,
  createSpawnPreviewDiff,
} from "./worldDocumentAutoFixPreviews";
import type {
  AutoFixDraft,
  BalanceHint,
  EffectiveProfileParameters,
  SpawnCandidateHint,
} from "./worldDocumentDraftTypes";

function createTopSpawnRefs(spawnCandidates: SpawnCandidateHint[]) {
  return {
    states: spawnCandidates
      .map((item) => item.state)
      .filter((value): value is number => value !== undefined)
      .slice(0, 4),
    provinces: spawnCandidates
      .map((item) => item.province)
      .filter((value): value is number => value !== undefined)
      .slice(0, 4),
    burgs: spawnCandidates
      .map((item) => item.burg)
      .filter((value): value is number => value !== undefined)
      .slice(0, 4),
    biomes: spawnCandidates
      .map((item) => item.biome)
      .filter((value): value is number => value !== undefined)
      .slice(0, 4),
  };
}

function createSpawnAutoFixDraft(
  hint: BalanceHint,
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
): AutoFixDraft {
  return {
    id: "auto-fix-spawn-candidate-coverage",
    hintId: hint.id,
    category: hint.category,
    action: "expand-spawn-candidate-set",
    status: "draft",
    summary:
      spawnCandidates.length >= 4
        ? "Review the strongest spawn candidates and lock the first fair-start set."
        : "Add or tag more viable start regions before running fairness checks.",
    profileWeight: hint.profileWeight,
    profilePriority: hint.profilePriority,
    targetRefs: createTopSpawnRefs(spawnCandidates),
    steps: [
      "Promote the top scoring provinces or states into the initial fair-start pool.",
      "Tag missing neighboring settlement and biome metadata for weak candidates.",
      "Re-score candidates after route and settlement edits are applied.",
    ],
    risks: [
      "Over-constraining starts can make later asymmetric game modes less flexible.",
      "Candidate scores still depend on summarized AGM Core data until editable AGM rules land.",
    ],
    previewDiff: createSpawnPreviewDiff(spawnCandidates, entities),
  };
}

function createSettlementAutoFixDraft(
  hint: BalanceHint,
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
  parameters: EffectiveProfileParameters,
): AutoFixDraft {
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
      states: entities.states.map((item) => item.id).slice(0, 8),
      burgs: entities.burgs.map((item) => item.id).slice(0, 8),
    },
    steps: [
      "Find states with no capital or very low settlement counts.",
      "Draft new burg placement targets near viable spawn regions.",
      "Re-check spawn support after settlement density changes.",
    ],
    risks: [
      "Adding settlements can shift political balance and label density.",
      "Sparse worlds may intentionally need low city counts for survival or exploration profiles.",
    ],
    previewDiff: createSettlementPreviewDiff(
      entities,
      spawnCandidates,
      parameters,
    ),
  };
}

function createRouteAutoFixDraft(
  hint: BalanceHint,
  resources: EngineWorldResourceSummary,
  spawnCandidates: SpawnCandidateHint[],
  parameters: EffectiveProfileParameters,
): AutoFixDraft {
  return {
    id: "auto-fix-route-connectivity",
    hintId: hint.id,
    category: hint.category,
    action: "draft-route-connectors",
    status: "draft",
    summary: resources.routes.length
      ? "Use sampled route groups to identify early-game connector gaps between spawn regions."
      : "Create first-pass route connector proposals so spawn fairness can account for movement.",
    profileWeight: hint.profileWeight,
    profilePriority: hint.profilePriority,
    targetRefs: {
      routes: resources.routes.map((item) => item.id).slice(0, 8),
      provinces: resources.provinces.map((item) => item.id).slice(0, 8),
    },
    steps: [
      "Compare top spawn regions against existing route groups.",
      "Draft connector routes between isolated candidates and nearby settlements.",
      "Flag risky connectors that cross hostile terrain or fragmented provinces.",
    ],
    risks: [
      "New routes may flatten meaningful terrain friction.",
      "AGM Core route summaries expose sampled groups, not yet fully editable AGM route graphs.",
    ],
    previewDiff: createRoutePreviewDiff(resources, spawnCandidates, parameters),
  };
}

function createBiomeAutoFixDraft(
  hint: BalanceHint,
  resources: EngineWorldResourceSummary,
  parameters: EffectiveProfileParameters,
): AutoFixDraft {
  return {
    id: "auto-fix-biome-habitability",
    hintId: hint.id,
    category: hint.category,
    action: "tune-habitable-biome-weights",
    status: "draft",
    summary: resources.biomes.length
      ? "Review habitable biome weights used by spawn scoring and flag hostile starts for adjustment."
      : "Add biome habitability metadata before spawn scoring is treated as reliable.",
    profileWeight: hint.profileWeight,
    profilePriority: hint.profilePriority,
    targetRefs: {
      biomes: resources.biomes.map((item) => item.id).slice(0, 8),
    },
    steps: [
      "Prioritize biomes with positive habitability for fair-start scoring.",
      "Mark low-habitability starts for adjustment or intentional challenge labeling.",
      "Re-run candidate scoring after biome weight edits are available.",
    ],
    risks: [
      "Biome changes can alter both realism and game readability.",
      "Current weights are advisory until AGM Rules Pack overrides exist.",
    ],
    previewDiff: createBiomePreviewDiff(resources, parameters),
  };
}

export function createAutoFixDrafts(
  balanceHints: BalanceHint[],
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  parameters: EffectiveProfileParameters,
): AutoFixDraft[] {
  return balanceHints
    .map((hint): AutoFixDraft => {
      if (hint.category === "spawn")
        return createSpawnAutoFixDraft(hint, spawnCandidates, entities);
      if (hint.category === "settlement")
        return createSettlementAutoFixDraft(
          hint,
          spawnCandidates,
          entities,
          parameters,
        );
      if (hint.category === "connectivity")
        return createRouteAutoFixDraft(
          hint,
          resources,
          spawnCandidates,
          parameters,
        );
      return createBiomeAutoFixDraft(hint, resources, parameters);
    })
    .sort((a, b) => b.profileWeight - a.profileWeight);
}
