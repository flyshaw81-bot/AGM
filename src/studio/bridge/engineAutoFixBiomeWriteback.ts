import type {
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
} from "./engineActionTypes";
import {
  createGlobalBiomeWritebackTargets,
  type EngineBiomeWritebackTargets,
} from "./engineAutoFixBiomeTargets";
import { createEmptyEngineAutoFixWritebackResult } from "./engineAutoFixWritebackResult";

export function updateEngineBiomeResource(
  biomeId: number,
  next: {
    habitability?: number;
    agmRuleWeight?: number;
    agmResourceTag?: string;
  },
  targets: EngineBiomeWritebackTargets = createGlobalBiomeWritebackTargets(),
) {
  const biomeData = targets.getWritableBiomeData();
  if (!biomeData || typeof biomeId !== "number" || !Number.isFinite(biomeId))
    return false;

  biomeData.agmRuleWeight ||= {};
  biomeData.agmResourceTag ||= {};
  const previous = JSON.stringify({
    habitability: biomeData.habitability[biomeId],
    agmRuleWeight: biomeData.agmRuleWeight[biomeId],
    agmResourceTag: biomeData.agmResourceTag[biomeId],
  });

  if (
    typeof next.habitability === "number" &&
    Number.isFinite(next.habitability)
  )
    biomeData.habitability[biomeId] = next.habitability;
  if (
    typeof next.agmRuleWeight === "number" &&
    Number.isFinite(next.agmRuleWeight)
  )
    biomeData.agmRuleWeight[biomeId] = next.agmRuleWeight;
  if (typeof next.agmResourceTag === "string")
    biomeData.agmResourceTag[biomeId] = next.agmResourceTag.trim();

  const changed =
    previous !==
    JSON.stringify({
      habitability: biomeData.habitability[biomeId],
      agmRuleWeight: biomeData.agmRuleWeight[biomeId],
      agmResourceTag: biomeData.agmResourceTag[biomeId],
    });

  if (changed) targets.redrawBiomes();
  return changed;
}

export function applyEngineBiomePreviewChanges(
  changes: EngineAutoFixPreviewChange[],
  targets: EngineBiomeWritebackTargets = createGlobalBiomeWritebackTargets(),
): EngineAutoFixWritebackResult {
  const result = createEmptyEngineAutoFixWritebackResult();
  const { updatedBiomes } = result;
  const biomeData = targets.getWritableBiomeData();
  if (!biomeData) return result;
  biomeData.agmRuleWeight ||= {};
  biomeData.agmResourceTag ||= {};
  const agmRuleWeight = biomeData.agmRuleWeight;
  const agmResourceTag = biomeData.agmResourceTag;

  changes.forEach((change) => {
    if (change.operation !== "update" || change.entity !== "biome") return;
    const biomeId = change.refs.biomes?.[0];
    const nextHabitability = change.fields?.habitability;
    const nextAgmRuleWeight = change.fields?.agmRuleWeight;
    const nextAgmResourceTag = change.fields?.agmResourceTag;
    if (
      typeof biomeId !== "number" ||
      !Number.isFinite(biomeId) ||
      typeof nextHabitability !== "number" ||
      !Number.isFinite(nextHabitability) ||
      typeof nextAgmRuleWeight !== "number" ||
      !Number.isFinite(nextAgmRuleWeight) ||
      typeof nextAgmResourceTag !== "string"
    )
      return;
    const previousHabitability = biomeData.habitability[biomeId];
    const previousAgmRuleWeight = agmRuleWeight[biomeId];
    const previousAgmResourceTag = agmResourceTag[biomeId];
    biomeData.habitability[biomeId] = nextHabitability;
    agmRuleWeight[biomeId] = nextAgmRuleWeight;
    agmResourceTag[biomeId] = nextAgmResourceTag;
    updatedBiomes.push({
      biomeId,
      previousHabitability:
        typeof previousHabitability === "number" &&
        Number.isFinite(previousHabitability)
          ? previousHabitability
          : null,
      nextHabitability,
      previousAgmRuleWeight:
        typeof previousAgmRuleWeight === "number" &&
        Number.isFinite(previousAgmRuleWeight)
          ? previousAgmRuleWeight
          : null,
      nextAgmRuleWeight,
      previousAgmResourceTag:
        typeof previousAgmResourceTag === "string"
          ? previousAgmResourceTag
          : null,
      nextAgmResourceTag,
    });
  });

  return result;
}
