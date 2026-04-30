import type {
  GameWorldProfile,
  GenerationProfileOverrideKey,
  StudioState,
} from "../types";

export type SpawnCandidateHint = {
  id: string;
  state?: number;
  province?: number;
  burg?: number;
  biome?: number;
  score: number;
  reasons: string[];
};

export type BalanceHint = {
  id: string;
  category: "spawn" | "settlement" | "connectivity" | "habitability";
  severity: "info" | "warning";
  message: string;
  profileWeight: number;
  profilePriority?: string;
  refs?: Record<string, number[]>;
};

export type EffectiveProfileParameters = Partial<
  Record<GenerationProfileOverrideKey, number>
>;

export type AutoFixPreviewChange = {
  id: string;
  operation: "create" | "update" | "link";
  entity: "state" | "province" | "burg" | "route" | "biome";
  summary: string;
  refs: Record<string, number[]>;
  fields?: Record<string, string | number | boolean | null>;
};

export type AutoFixPreviewDiff = {
  mode: "dry-run";
  title: string;
  changes: AutoFixPreviewChange[];
};

export type AutoFixDraft = {
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

export type AppliedAutoFixPreviewChange = AutoFixPreviewChange & {
  draftId: string;
  appliedAt: number;
};

export type GeneratorParameterDraft = {
  key: GenerationProfileOverrideKey;
  label: string;
  value: number;
  unit: "profile-weight" | "score" | "count" | "percent";
  source: string;
  overridden: boolean;
};

export type GeneratorProfileSuggestion = {
  id: string;
  profile: GameWorldProfile;
  priorityId: string;
  target: "spawn" | "settlement" | "connectivity" | "habitability" | "resource";
  weight: number;
  recommendation: string;
  parameterDraft: GeneratorParameterDraft;
  refs: Record<string, number[]>;
};

export type WorldPlayabilityHints = {
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
  source: "agm-biome-summary";
  biomeRules: {
    id: string;
    biomeId: number;
    biomeName: string;
    habitability: number | null;
    movementCost: number | null;
    ruleWeight: number;
    resourceTag: string;
    source: "agm-biome-summary" | "studio-metadata";
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
    connectorPriority:
      | "primary-connector"
      | "secondary-connector"
      | "resource-frontier";
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
      target:
        | "spawn"
        | "settlement"
        | "connectivity"
        | "habitability"
        | "resource";
    }[];
    sourceFields: string[];
  };
  weights: {
    defaultRuleWeight: number;
    ruleWeightRange: { min: number; max: number };
    sourceFields: string[];
  };
};
