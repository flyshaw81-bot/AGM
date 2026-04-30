import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import type {
  BalanceHint,
  SpawnCandidateHint,
} from "./worldDocumentDraftTypes";
import { getProfilePriorityForHint } from "./worldDocumentPlayabilityPriorities";

type BalanceHintContext = {
  entities: EngineEntitySummary;
  habitableBiomes: EngineWorldResourceSummary["biomes"];
  mostHabitableBiome: EngineWorldResourceSummary["biomes"][number] | undefined;
  resources: EngineWorldResourceSummary;
  routePointCount: number;
  spawnCandidates: SpawnCandidateHint[];
  state: StudioState;
};

export function createBalanceHints({
  entities,
  habitableBiomes,
  mostHabitableBiome,
  resources,
  routePointCount,
  spawnCandidates,
  state,
}: BalanceHintContext): BalanceHint[] {
  return [
    {
      id: "spawn-candidate-coverage",
      category: "spawn",
      severity: spawnCandidates.length >= 4 ? "info" : "warning",
      message:
        spawnCandidates.length >= 4
          ? `${spawnCandidates.length} candidate spawn regions are available for first-pass balancing.`
          : "Fewer than four candidate spawn regions are available; generate or tag more states/provinces before fairness checks.",
      profileWeight:
        getProfilePriorityForHint(state.document.gameProfile, "spawn")
          ?.weight || 1,
      profilePriority: getProfilePriorityForHint(
        state.document.gameProfile,
        "spawn",
      )?.id,
      refs: {
        states: spawnCandidates
          .map((item) => item.state)
          .filter((value): value is number => value !== undefined),
        provinces: spawnCandidates
          .map((item) => item.province)
          .filter((value): value is number => value !== undefined),
      } as Record<string, number[]>,
    } satisfies BalanceHint,
    {
      id: "settlement-distribution",
      category: "settlement",
      severity:
        entities.burgs.length >= Math.max(4, entities.states.length)
          ? "info"
          : "warning",
      message: `${entities.burgs.length} settlements are indexed across ${entities.states.length} states; use this as the first city-density balance input.`,
      profileWeight:
        getProfilePriorityForHint(state.document.gameProfile, "settlement")
          ?.weight || 1,
      profilePriority: getProfilePriorityForHint(
        state.document.gameProfile,
        "settlement",
      )?.id,
      refs: {
        states: entities.states.map((item) => item.id),
        burgs: entities.burgs.map((item) => item.id),
      } as Record<string, number[]>,
    } satisfies BalanceHint,
    {
      id: "route-connectivity",
      category: "connectivity",
      severity: resources.routes.length ? "info" : "warning",
      message: resources.routes.length
        ? `${resources.routes.length} route groups with ${routePointCount} sampled points are available for connectivity checks.`
        : "No route summary is available; spawn fairness cannot yet account for overland or trade connectivity.",
      profileWeight:
        getProfilePriorityForHint(state.document.gameProfile, "connectivity")
          ?.weight || 1,
      profilePriority: getProfilePriorityForHint(
        state.document.gameProfile,
        "connectivity",
      )?.id,
      refs: { routes: resources.routes.map((item) => item.id) } as Record<
        string,
        number[]
      >,
    } satisfies BalanceHint,
    {
      id: "biome-habitability",
      category: "habitability",
      severity: habitableBiomes.length ? "info" : "warning",
      message: habitableBiomes.length
        ? `${habitableBiomes.length} habitable biome profiles are available; top biome is ${mostHabitableBiome?.name}.`
        : "No habitable biome scores are available; spawn scoring needs biome metadata.",
      profileWeight:
        getProfilePriorityForHint(state.document.gameProfile, "habitability")
          ?.weight || 1,
      profilePriority: getProfilePriorityForHint(
        state.document.gameProfile,
        "habitability",
      )?.id,
      refs: { biomes: habitableBiomes.map((item) => item.id) } as Record<
        string,
        number[]
      >,
    } satisfies BalanceHint,
  ].sort((a, b) => b.profileWeight - a.profileWeight);
}
