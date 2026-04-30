import type { StudioState } from "../types";
import {
  focusNativeRelationshipField,
  getNativeRelationshipFieldInputId,
} from "./nativeRelationshipFocus";
import { applyNativeRelationshipHistoryFilter } from "./nativeRelationshipHistoryFilter";
import type { NativeRelationshipQueueUndoChange } from "./nativeRelationshipQueue";
import type { queryNativeRelationshipQueueDom } from "./nativeRelationshipQueueDom";
import { queryNativeRelationshipQueueHistoryDetails } from "./nativeRelationshipQueueDom";
import {
  createNativeRelationshipHistoryRestoreResult,
  createNativeRelationshipHistoryUndoResult,
  getNativeRelationshipHistoryStaleChanges,
  restoreNativeRelationshipHistoryChangeToAfter,
} from "./nativeRelationshipQueueHistoryActions";
import { renderNativeRelationshipQueueHistory } from "./nativeRelationshipQueueHistoryRenderer";
import { bindActionClick } from "./studioEventBinding";

type NativeRelationshipQueueDom = ReturnType<
  typeof queryNativeRelationshipQueueDom
>;

type BindNativeRelationshipQueueHistoryEventsOptions = {
  state: StudioState;
  queueDom: NativeRelationshipQueueDom;
  openDirectWorkbench: (targetId: string) => void;
  selectNativeRelationshipSource: (entity: string, id: number) => void;
  applyNativeRelationshipButtonPayload: (
    button: HTMLElement,
    entity: string,
    id: number,
  ) => void;
  onDirectRelationshipQueueHistoryChange: (
    history: StudioState["directEditor"]["relationshipQueueHistory"],
  ) => void;
  renderNativeRelationshipQueue: () => boolean;
};

export function bindNativeRelationshipQueueHistoryEvents({
  state,
  queueDom,
  openDirectWorkbench,
  selectNativeRelationshipSource,
  applyNativeRelationshipButtonPayload,
  onDirectRelationshipQueueHistoryChange,
  renderNativeRelationshipQueue,
}: BindNativeRelationshipQueueHistoryEventsOptions) {
  const applyCurrentNativeRelationshipHistoryFilter = (filter: string) =>
    applyNativeRelationshipHistoryFilter({
      filter,
      language: state.language,
      filters: queueDom.nativeRelationshipQueueHistoryFilters,
      summary: queueDom.nativeRelationshipQueueHistoryFilterSummary,
      emptyState: queueDom.nativeRelationshipQueueHistoryFilterEmpty,
    });

  const reviewNativeRelationshipHistoryField = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    selectNativeRelationshipSource(change.entity, change.id);
    const fieldId = getNativeRelationshipFieldInputId(
      change.entity,
      change.field,
    );
    if (fieldId) focusNativeRelationshipField(fieldId);
  };

  const renderNativeRelationshipHistory = () =>
    renderNativeRelationshipQueueHistory({
      state,
      dom: queueDom,
      applyCurrentNativeRelationshipHistoryFilter,
    });

  const updateNativeRelationshipHistoryRestoreState = (
    history: NonNullable<
      StudioState["directEditor"]["relationshipQueueHistory"]
    >,
    restoredCount: number,
  ) => {
    onDirectRelationshipQueueHistoryChange(
      createNativeRelationshipHistoryRestoreResult(history, restoredCount),
    );
    renderNativeRelationshipQueue();
  };

  bindActionClick("direct-relationship-history-review", () => {
    const target = state.directEditor.relationshipQueueHistory?.target;
    if (!target) return;
    openDirectWorkbench(target);
  });

  bindActionClick("direct-relationship-history-review-item", (button) => {
    const index = Number(button.dataset.historyIndex);
    const item = state.directEditor.relationshipQueueHistoryLog[index];
    const firstChange = item?.undoChanges[0];
    if (firstChange) {
      reviewNativeRelationshipHistoryField(firstChange);
      return;
    }
    if (item?.target) openDirectWorkbench(item.target);
  });

  bindActionClick("direct-relationship-history-detail-item", (button) => {
    const index = Number(button.dataset.historyIndex);
    queryNativeRelationshipQueueHistoryDetails().forEach((detail) => {
      detail.hidden =
        Number(detail.dataset.historyIndex) !== index || !detail.hidden;
    });
  });

  bindActionClick("direct-relationship-history-filter", (button) =>
    applyCurrentNativeRelationshipHistoryFilter(
      button.dataset.historyFilter || "all",
    ),
  );

  bindActionClick("direct-relationship-history-review-field", (button) => {
    const historyIndex = Number(button.dataset.historyIndex);
    const changeIndex = Number(button.dataset.historyChangeIndex);
    const change =
      state.directEditor.relationshipQueueHistoryLog[historyIndex]?.undoChanges[
        changeIndex
      ];
    if (change) reviewNativeRelationshipHistoryField(change);
  });

  bindActionClick("direct-relationship-history-restore-after", (button) => {
    const history = state.directEditor.relationshipQueueHistory;
    const historyIndex = Number(button.dataset.historyIndex);
    const changeIndex = Number(button.dataset.historyChangeIndex);
    const change =
      historyIndex === 0 ? history?.undoChanges[changeIndex] : undefined;
    if (!history || history.undone || !history.undoBlockedReason || !change)
      return;
    restoreNativeRelationshipHistoryChangeToAfter(
      change,
      applyNativeRelationshipButtonPayload,
    );
    updateNativeRelationshipHistoryRestoreState(history, 1);
  });

  bindActionClick("direct-relationship-history-restore-all-after", () => {
    const history = state.directEditor.relationshipQueueHistory;
    if (!history || history.undone || !history.undoBlockedReason) return;
    const staleChanges = getNativeRelationshipHistoryStaleChanges(history);
    staleChanges.forEach((change) => {
      restoreNativeRelationshipHistoryChangeToAfter(
        change,
        applyNativeRelationshipButtonPayload,
      );
    });
    updateNativeRelationshipHistoryRestoreState(history, staleChanges.length);
  });

  bindActionClick("direct-relationship-history-undo", () => {
    const history = state.directEditor.relationshipQueueHistory;
    if (!history || history.undone || !history.undoChanges.length) return;
    const nextHistory = createNativeRelationshipHistoryUndoResult(
      history,
      applyNativeRelationshipButtonPayload,
    );
    onDirectRelationshipQueueHistoryChange(nextHistory);
    if (!nextHistory.undoBlockedReason && state.section !== "repair") {
      openDirectWorkbench(history.target);
    }
  });

  return {
    renderNativeRelationshipHistory,
  };
}
