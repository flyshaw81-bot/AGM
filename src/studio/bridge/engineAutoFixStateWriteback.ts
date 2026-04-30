import type {
  EngineAutoFixPreviewChange,
  EngineAutoFixWritebackResult,
} from "./engineActionTypes";
import {
  createGlobalStateWritebackTargets,
  type EngineStateWritebackTargets,
} from "./engineAutoFixStateTargets";
import { createEmptyEngineAutoFixWritebackResult } from "./engineAutoFixWritebackResult";

export function applyEngineStatePreviewChanges(
  changes: EngineAutoFixPreviewChange[],
  targets: EngineStateWritebackTargets = createGlobalStateWritebackTargets(),
): EngineAutoFixWritebackResult {
  const result = createEmptyEngineAutoFixWritebackResult();
  const { updatedStates } = result;

  changes.forEach((change) => {
    if (change.operation !== "update" || change.entity !== "state") return;
    const stateId = change.refs.states?.[0];
    const nextAgmFairStart = change.fields?.agmFairStart;
    const nextAgmFairStartScore = change.fields?.agmFairStartScore;
    const nextAgmPriority = change.fields?.agmPriority;
    if (
      typeof stateId !== "number" ||
      !Number.isFinite(stateId) ||
      typeof nextAgmFairStart !== "boolean" ||
      typeof nextAgmFairStartScore !== "number" ||
      !Number.isFinite(nextAgmFairStartScore) ||
      typeof nextAgmPriority !== "string"
    )
      return;
    const state = targets.getWritableState(stateId);
    if (!state) return;
    const previousAgmFairStart =
      typeof state.agmFairStart === "boolean" ? state.agmFairStart : null;
    const previousAgmFairStartScore =
      typeof state.agmFairStartScore === "number" &&
      Number.isFinite(state.agmFairStartScore)
        ? state.agmFairStartScore
        : null;
    const previousAgmPriority =
      typeof state.agmPriority === "string" ? state.agmPriority : null;
    state.agmFairStart = nextAgmFairStart;
    state.agmFairStartScore = nextAgmFairStartScore;
    state.agmPriority = nextAgmPriority;
    updatedStates.push({
      stateId,
      previousAgmFairStart,
      nextAgmFairStart,
      previousAgmFairStartScore,
      nextAgmFairStartScore,
      previousAgmPriority,
      nextAgmPriority,
    });
  });

  return result;
}
