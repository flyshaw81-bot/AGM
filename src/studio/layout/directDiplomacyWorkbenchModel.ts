import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { DirectDiplomacyFilterMode } from "../types";
import { matchesWorkbenchQuery } from "./directWorkbenchFiltering";

export const DIPLOMACY_RELATION_OPTIONS = [
  "Ally",
  "Friendly",
  "Neutral",
  "Suspicion",
  "Enemy",
  "Unknown",
  "Rival",
  "Vassal",
  "Suzerain",
] as const;

const CONFLICT_RELATIONS = new Set(["Enemy", "Rival", "Suspicion"]);
const POSITIVE_RELATIONS = new Set(["Ally", "Friendly", "Vassal", "Suzerain"]);

export function getActiveDirectDiplomacyStates(
  states: readonly EngineEntitySummaryItem[],
) {
  return states.filter(
    (state) => state.id > 0 && state.name && state.name !== "Neutrals",
  );
}

export function selectDirectDiplomacySubject(
  states: readonly EngineEntitySummaryItem[],
  selectedSubjectId: number | null,
) {
  return states.find((state) => state.id === selectedSubjectId) || states[0];
}

export function selectDirectDiplomacyObject(
  states: readonly EngineEntitySummaryItem[],
  subject: EngineEntitySummaryItem | undefined,
  selectedObjectId: number | null,
) {
  return (
    states.find(
      (state) => state.id === selectedObjectId && state.id !== subject?.id,
    ) || states.find((state) => state.id !== subject?.id)
  );
}

export function getDirectDiplomacyRelation(
  subject: EngineEntitySummaryItem | undefined,
  object: EngineEntitySummaryItem | undefined,
) {
  if (!object) return "Neutral";
  return subject?.diplomacy?.[object.id] || "Neutral";
}

export function getDirectDiplomacyPairKey(
  subject: EngineEntitySummaryItem | undefined,
  object: EngineEntitySummaryItem | undefined,
) {
  return subject && object ? `${subject.id}:${object.id}` : null;
}

export function filterDirectDiplomacyRelations(
  states: readonly EngineEntitySummaryItem[],
  subject: EngineEntitySummaryItem | undefined,
  filterMode: DirectDiplomacyFilterMode,
  query: string,
) {
  return states
    .filter((state) => state.id !== subject?.id)
    .filter((state) => {
      const relation = getDirectDiplomacyRelation(subject, state);
      if (filterMode === "conflict" && !CONFLICT_RELATIONS.has(relation)) {
        return false;
      }
      if (filterMode === "positive" && !POSITIVE_RELATIONS.has(relation)) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        state.name,
        state.fullName,
        relation,
        String(state.id),
      ]);
    });
}
