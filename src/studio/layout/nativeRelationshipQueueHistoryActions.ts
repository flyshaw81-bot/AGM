import type { StudioState } from "../types";
import {
  createNativeRelationshipUndoButton,
  getNativeRelationshipCurrentFieldValue,
  type NativeRelationshipQueueUndoChange,
} from "./nativeRelationshipQueue";

type NativeRelationshipQueueHistory = NonNullable<
  StudioState["directEditor"]["relationshipQueueHistory"]
>;

type ApplyNativeRelationshipButtonPayload = (
  button: HTMLElement,
  entity: string,
  id: number,
) => void;

function createUndoBlockedReason(change: NativeRelationshipQueueUndoChange) {
  return `Undo blocked: ${change.entity} #${change.id} ${change.field} changed after apply`;
}

export function getNativeRelationshipHistoryStaleChanges(
  history: NativeRelationshipQueueHistory,
) {
  return history.undoChanges.filter(
    (change) =>
      getNativeRelationshipCurrentFieldValue(
        change.entity,
        change.id,
        change.field,
      ) !== change.afterValue,
  );
}

export function restoreNativeRelationshipHistoryChangeToAfter(
  change: NativeRelationshipQueueUndoChange,
  applyNativeRelationshipButtonPayload: ApplyNativeRelationshipButtonPayload,
) {
  const restoreButton = createNativeRelationshipUndoButton(change);
  const dataKey = `${change.entity}${change.field.charAt(0).toUpperCase()}${change.field.slice(1)}`;
  restoreButton.dataset[dataKey] = change.afterValue;
  applyNativeRelationshipButtonPayload(restoreButton, change.entity, change.id);
}

export function createNativeRelationshipHistoryRestoreResult(
  history: NativeRelationshipQueueHistory,
  restoredCount: number,
) {
  const stillBlockedChange =
    getNativeRelationshipHistoryStaleChanges(history)[0];
  const resultText = stillBlockedChange
    ? history.resultText
    : restoredCount > 1
      ? `Restored ${restoredCount} fields to After · ${history.summary}`
      : `Restored Current to After · ${history.summary}`;
  return {
    ...history,
    resultText,
    undoBlockedReason: stillBlockedChange
      ? createUndoBlockedReason(stillBlockedChange)
      : null,
  };
}

export function createNativeRelationshipHistoryUndoResult(
  history: NativeRelationshipQueueHistory,
  applyNativeRelationshipButtonPayload: ApplyNativeRelationshipButtonPayload,
) {
  const blockedChange = getNativeRelationshipHistoryStaleChanges(history)[0];
  if (blockedChange) {
    return {
      ...history,
      undoBlockedReason: createUndoBlockedReason(blockedChange),
    };
  }

  history.undoChanges.forEach((change) => {
    applyNativeRelationshipButtonPayload(
      createNativeRelationshipUndoButton(change),
      change.entity,
      change.id,
    );
  });
  return {
    ...history,
    resultText: `Undid ${history.count} queued repairs · ${history.summary}`,
    undone: true,
    undoBlockedReason: null,
  };
}
