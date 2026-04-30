import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActionTypes";
import type {
  AutoFixPreviewChange,
  AutoFixPreviewDiff,
  EffectiveProfileParameters,
  SpawnCandidateHint,
} from "./worldDocumentDraftTypes";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function createSettlementPreviewDiff(
  entities: EngineEntitySummary,
  spawnCandidates: SpawnCandidateHint[],
  parameters: EffectiveProfileParameters = {},
): AutoFixPreviewDiff {
  const burgsByState = new Map<number, number>();
  entities.burgs.forEach((burg) => {
    if (burg.state === undefined) return;
    burgsByState.set(burg.state, (burgsByState.get(burg.state) || 0) + 1);
  });
  const currentDensity = Math.max(
    1,
    Math.round(entities.burgs.length / Math.max(1, entities.states.length)),
  );
  const profileSettlementDensityTarget = Math.max(
    1,
    Math.round(parameters.settlementDensityTarget ?? currentDensity),
  );
  const supportSettlementLimit = Math.max(
    2,
    Math.min(6, Math.ceil(profileSettlementDensityTarget / 2)),
  );
  const candidateStates = spawnCandidates
    .map((item) => item.state)
    .filter((value): value is number => value !== undefined);
  const sparseStates = entities.states
    .filter(
      (state) =>
        (burgsByState.get(state.id) || 0) < profileSettlementDensityTarget ||
        candidateStates.includes(state.id),
    )
    .slice(0, supportSettlementLimit);
  const targetStates = sparseStates.length
    ? sparseStates
    : entities.states.slice(0, supportSettlementLimit);

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
        refs: { states: [state.id] },
        fields: {
          provisionalName: `${state.name} Support ${index + 1}`,
          state: state.id,
          agmRole: "support-settlement",
          agmSupportState: state.id,
          priority: candidateStates.includes(state.id)
            ? "spawn-support"
            : "sparse-state-support",
          profileSettlementDensityTarget,
          currentStateSettlementCount,
          profileSettlementDensityGap: Math.max(
            0,
            profileSettlementDensityTarget - currentStateSettlementCount,
          ),
          supportSettlementLimit,
        },
      } satisfies AutoFixPreviewChange;
    }),
  };
}

export function createRoutePreviewDiff(
  resources: EngineWorldResourceSummary,
  spawnCandidates: SpawnCandidateHint[],
  parameters: EffectiveProfileParameters = {},
): AutoFixPreviewDiff {
  const routeConnectivityScore = parameters.routeConnectivityScore ?? 50;
  const connectorLimit = Math.max(
    2,
    Math.min(6, Math.ceil(routeConnectivityScore / 20) + 1),
  );
  const provincePairs = spawnCandidates
    .map((item) => item.province)
    .filter((value): value is number => value !== undefined)
    .slice(0, connectorLimit);
  const connectorTargets =
    provincePairs.length >= 2
      ? provincePairs.slice(0, connectorLimit)
      : resources.provinces.map((item) => item.id).slice(0, connectorLimit);
  const changes: AutoFixPreviewChange[] = [];

  for (let index = 0; index < connectorTargets.length - 1; index += 1) {
    const from = connectorTargets[index];
    const to = connectorTargets[index + 1];
    const fromProvince = resources.provinces.find((item) => item.id === from);
    const toProvince = resources.provinces.find((item) => item.id === to);
    const provinceStructureScore = clampScore(
      routeConnectivityScore * 0.55 +
        (fromProvince?.burg !== undefined ? 15 : 5) +
        (toProvince?.burg !== undefined ? 15 : 5) -
        index * 3,
    );
    changes.push({
      id: `preview-route-${from}-${to}`,
      operation: "link",
      entity: "route",
      summary: `Draft a connector route between province ${from} and province ${to} using profile connectivity score ${routeConnectivityScore} and province structure score ${provinceStructureScore}.`,
      refs: {
        provinces: [from, to],
        routes: resources.routes.map((item) => item.id).slice(0, 3),
      },
      fields: {
        fromProvince: from,
        toProvince: to,
        connectorType: resources.routes.length
          ? "extend-existing-route-group"
          : "create-first-route-group",
        profileRouteConnectivityScore: routeConnectivityScore,
        provinceStructureScore,
        provinceStructurePriority:
          provinceStructureScore >= 75
            ? "primary-connector"
            : provinceStructureScore >= 50
              ? "secondary-connector"
              : "resource-frontier",
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

export function createSpawnPreviewDiff(
  spawnCandidates: SpawnCandidateHint[],
  entities: EngineEntitySummary,
): AutoFixPreviewDiff {
  const seenCandidateStateIds = new Set<number>();
  const uniqueCandidateStates = spawnCandidates.filter((candidate) => {
    if (
      candidate.state === undefined ||
      seenCandidateStateIds.has(candidate.state)
    )
      return false;
    seenCandidateStateIds.add(candidate.state);
    return true;
  });
  const fallbackStates = entities.states
    .filter(
      (state) =>
        !uniqueCandidateStates.some(
          (candidate) => candidate.state === state.id,
        ),
    )
    .slice(0, Math.max(0, 4 - uniqueCandidateStates.length));
  const fallbackCandidates = fallbackStates.map(
    (state, index): SpawnCandidateHint => ({
      id: `spawn-state-${state.id}`,
      state: state.id,
      score: clampScore(60 - index * 5),
      reasons: ["Fallback state selected for fair-start review"],
    }),
  );
  const targets = [...uniqueCandidateStates, ...fallbackCandidates].slice(0, 4);

  return {
    mode: "dry-run",
    title: "Fair-start state preview",
    changes: targets.map((candidate) => {
      const stateId = candidate.state!;
      return {
        id: `preview-state-fair-start-${stateId}`,
        operation: "update",
        entity: "state",
        summary: `Mark state ${stateId} as an AGM fair-start candidate with score ${candidate.score}.`,
        refs: {
          states: [stateId],
          provinces:
            candidate.province === undefined ? [] : [candidate.province],
          burgs: candidate.burg === undefined ? [] : [candidate.burg],
        },
        fields: {
          agmFairStart: true,
          agmFairStartScore: candidate.score,
          agmPriority:
            candidate.score >= 85 ? "primary-start" : "secondary-start",
        },
      } satisfies AutoFixPreviewChange;
    }),
  };
}

export function createBiomePreviewDiff(
  resources: EngineWorldResourceSummary,
  parameters: EffectiveProfileParameters = {},
): AutoFixPreviewDiff {
  const profileBiomeFrictionWeight = Number(
    (parameters.biomeFrictionWeight ?? 1).toFixed(2),
  );
  const frictionLift = Math.max(
    4,
    Math.min(24, Math.round(profileBiomeFrictionWeight * 10)),
  );
  const candidateBiomes = resources.biomes
    .filter((biome) => typeof biome.habitability === "number")
    .sort((a, b) => (a.habitability || 0) - (b.habitability || 0))
    .slice(
      0,
      Math.max(2, Math.min(5, Math.ceil(profileBiomeFrictionWeight * 3))),
    );
  const targetBiomes = candidateBiomes.length
    ? candidateBiomes
    : resources.biomes.slice(0, 3);

  return {
    mode: "dry-run",
    title: "Biome habitability preview",
    changes: targetBiomes.map((biome) => {
      const currentHabitability =
        typeof biome.habitability === "number" ? biome.habitability : 50;
      const nextHabitability = clampScore(
        Math.max(
          currentHabitability,
          Math.min(85, currentHabitability + frictionLift),
        ),
      );
      return {
        id: `preview-biome-${biome.id}`,
        operation: "update",
        entity: "biome",
        summary: `Tune ${biome.name} habitability from ${currentHabitability} to ${nextHabitability} using profile biome friction weight ${profileBiomeFrictionWeight}.`,
        refs: { biomes: [biome.id] },
        fields: {
          habitability: nextHabitability,
          previousHabitability: currentHabitability,
          agmRuleWeight: Number(
            Math.max(1, profileBiomeFrictionWeight).toFixed(2),
          ),
          agmResourceTag:
            currentHabitability <= 0 ? "challenge-biome" : "starter-biome",
          tuningReason:
            currentHabitability <= 0
              ? "hostile-start-support"
              : "fair-start-smoothing",
          profileBiomeFrictionWeight,
          profileHabitabilityLift: nextHabitability - currentHabitability,
        },
      } satisfies AutoFixPreviewChange;
    }),
  };
}
