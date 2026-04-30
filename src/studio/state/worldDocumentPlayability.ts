import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  createAppliedPreviewChanges,
  createAutoFixDrafts,
} from "./worldDocumentAutoFixDrafts";
import { createBalanceHints } from "./worldDocumentBalanceHints";
import type { WorldPlayabilityHints } from "./worldDocumentDraftTypes";
import {
  createEffectiveProfileParameters,
  createProfileGeneratorSuggestions,
} from "./worldDocumentGeneratorProfiles";
import { createSpawnCandidates } from "./worldDocumentSpawnCandidates";

export function createWorldPlayabilityHints(
  entities: EngineEntitySummary,
  resources: EngineWorldResourceSummary,
  state: StudioState,
): WorldPlayabilityHints {
  const habitableBiomes = resources.biomes
    .filter(
      (item) => typeof item.habitability === "number" && item.habitability > 0,
    )
    .sort((a, b) => (b.habitability || 0) - (a.habitability || 0));
  const mostHabitableBiome = habitableBiomes[0];
  const routePointCount = resources.routes.reduce(
    (total, route) => total + (route.pointCount || 0),
    0,
  );
  const spawnCandidates = createSpawnCandidates(
    entities,
    resources,
    state,
    habitableBiomes,
    routePointCount,
  );
  const balanceHints = createBalanceHints({
    entities,
    habitableBiomes,
    mostHabitableBiome,
    resources,
    routePointCount,
    spawnCandidates,
    state,
  });

  const effectiveProfileParameters = createEffectiveProfileParameters(
    state.document.gameProfile,
    spawnCandidates,
    entities,
    resources,
    state.generationProfileOverrides,
  );
  const autoFixDrafts = createAutoFixDrafts(
    balanceHints,
    spawnCandidates,
    entities,
    resources,
    effectiveProfileParameters,
  );
  const appliedPreviewChanges = createAppliedPreviewChanges(
    autoFixDrafts,
    state,
    resources,
  );
  const generatorProfileSuggestions = createProfileGeneratorSuggestions(
    state.document.gameProfile,
    spawnCandidates,
    entities,
    resources,
    state.generationProfileOverrides,
  );
  const generationProfileImpact =
    state.generationProfileImpact?.profile === state.document.gameProfile
      ? state.generationProfileImpact
      : null;

  return {
    spawnCandidates,
    balanceHints,
    autoFixDrafts,
    appliedPreviewChanges,
    generatorProfileSuggestions,
    generationProfileImpact,
  };
}

export { createEffectiveProfileParameters } from "./worldDocumentGeneratorProfiles";
export { createWorldRulesDraft } from "./worldDocumentRulesDraft";
