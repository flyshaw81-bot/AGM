import type { NativeRelationshipQueueHistory } from "./nativeRelationshipQueue";

export type DirectRelationshipHistoryRowStatus =
  | "blocked"
  | "undoable"
  | "undone"
  | "readonly";

export type DirectRelationshipHistoryRecoveryState =
  | "blocked"
  | "hidden"
  | "ready";

export function getDirectRelationshipHistoryRowStatus(
  item: NativeRelationshipQueueHistory,
  index: number,
): DirectRelationshipHistoryRowStatus {
  if (item.undoBlockedReason) return "blocked";
  if (item.undone) return "undone";
  return index === 0 ? "undoable" : "readonly";
}

export function getDirectRelationshipHistoryStatusSuffix(
  item: NativeRelationshipQueueHistory | null | undefined,
) {
  if (!item) return "";
  if (item.undone) return " · undone";
  if (item.undoBlockedReason) return " · undo blocked";
  return "";
}

export function getDirectRelationshipHistoryRecoveryState(
  item: NativeRelationshipQueueHistory,
  index: number,
): DirectRelationshipHistoryRecoveryState {
  if (index !== 0 || item.undone) return "hidden";
  return item.undoBlockedReason ? "blocked" : "ready";
}

export function countDirectRelationshipHistoryRowStatuses(
  historyLog: readonly NativeRelationshipQueueHistory[],
) {
  return historyLog.reduce(
    (counts, item, index) => {
      counts[getDirectRelationshipHistoryRowStatus(item, index)] += 1;
      return counts;
    },
    { blocked: 0, undoable: 0, undone: 0, readonly: 0 },
  );
}

export type NativeRelationshipHistoryRowStatus =
  DirectRelationshipHistoryRowStatus;
export type NativeRelationshipHistoryRecoveryState =
  DirectRelationshipHistoryRecoveryState;

export const getNativeRelationshipHistoryRowStatus =
  getDirectRelationshipHistoryRowStatus;
export const getNativeRelationshipHistoryStatusSuffix =
  getDirectRelationshipHistoryStatusSuffix;
export const getNativeRelationshipHistoryRecoveryState =
  getDirectRelationshipHistoryRecoveryState;
export const countNativeRelationshipHistoryRowStatuses =
  countDirectRelationshipHistoryRowStatuses;
