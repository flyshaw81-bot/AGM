import type { NativeRelationshipQueueHistory } from "./nativeRelationshipQueue";

export type NativeRelationshipHistoryRowStatus =
  | "blocked"
  | "undoable"
  | "undone"
  | "readonly";

export type NativeRelationshipHistoryRecoveryState =
  | "blocked"
  | "hidden"
  | "ready";

export function getNativeRelationshipHistoryRowStatus(
  item: NativeRelationshipQueueHistory,
  index: number,
): NativeRelationshipHistoryRowStatus {
  if (item.undoBlockedReason) return "blocked";
  if (item.undone) return "undone";
  return index === 0 ? "undoable" : "readonly";
}

export function getNativeRelationshipHistoryStatusSuffix(
  item: NativeRelationshipQueueHistory | null | undefined,
) {
  if (!item) return "";
  if (item.undone) return " · undone";
  if (item.undoBlockedReason) return " · undo blocked";
  return "";
}

export function getNativeRelationshipHistoryRecoveryState(
  item: NativeRelationshipQueueHistory,
  index: number,
): NativeRelationshipHistoryRecoveryState {
  if (index !== 0 || item.undone) return "hidden";
  return item.undoBlockedReason ? "blocked" : "ready";
}

export function countNativeRelationshipHistoryRowStatuses(
  historyLog: readonly NativeRelationshipQueueHistory[],
) {
  return historyLog.reduce(
    (counts, item, index) => {
      counts[getNativeRelationshipHistoryRowStatus(item, index)] += 1;
      return counts;
    },
    { blocked: 0, undoable: 0, undone: 0, readonly: 0 },
  );
}
