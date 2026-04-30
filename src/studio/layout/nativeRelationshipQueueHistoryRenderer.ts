import type { StudioState } from "../types";
import { createNativeRelationshipHistoryPresenter } from "./nativeRelationshipHistoryPresenter";
import { getNativeRelationshipHistoryStatusSuffix } from "./nativeRelationshipHistoryStatus";
import type { queryNativeRelationshipQueueDom } from "./nativeRelationshipQueueDom";
import { queryNativeRelationshipQueueHistoryDetails } from "./nativeRelationshipQueueDom";
import { renderNativeRelationshipQueueHistoryRows } from "./nativeRelationshipQueueHistoryRowsRenderer";

type NativeRelationshipQueueDom = ReturnType<
  typeof queryNativeRelationshipQueueDom
>;

type NativeRelationshipQueueHistoryDom = Pick<
  NativeRelationshipQueueDom,
  | "nativeRelationshipQueueHistory"
  | "nativeRelationshipQueueHistoryFilters"
  | "nativeRelationshipQueueHistoryList"
  | "nativeRelationshipQueueHistoryReview"
  | "nativeRelationshipQueueHistoryText"
  | "nativeRelationshipQueueHistoryUndo"
>;

type RenderNativeRelationshipQueueHistoryOptions = {
  state: StudioState;
  dom: NativeRelationshipQueueHistoryDom;
  applyCurrentNativeRelationshipHistoryFilter: (filter: string) => void;
};

export function renderNativeRelationshipQueueHistory({
  state,
  dom,
  applyCurrentNativeRelationshipHistoryFilter,
}: RenderNativeRelationshipQueueHistoryOptions) {
  const {
    nativeRelationshipQueueHistory,
    nativeRelationshipQueueHistoryFilters,
    nativeRelationshipQueueHistoryList,
    nativeRelationshipQueueHistoryReview,
    nativeRelationshipQueueHistoryText,
    nativeRelationshipQueueHistoryUndo,
  } = dom;
  if (
    !nativeRelationshipQueueHistory ||
    !nativeRelationshipQueueHistoryText ||
    !nativeRelationshipQueueHistoryReview ||
    !nativeRelationshipQueueHistoryUndo ||
    !nativeRelationshipQueueHistoryList
  ) {
    return;
  }

  const history = state.directEditor.relationshipQueueHistory;
  nativeRelationshipQueueHistory.hidden = !history;
  nativeRelationshipQueueHistoryReview.disabled = !history?.target;
  nativeRelationshipQueueHistoryUndo.disabled =
    !history?.undoChanges.length || Boolean(history.undone);
  nativeRelationshipQueueHistoryText.textContent = history
    ? `Last queue: ${history.count} repairs · ${history.summary}${getNativeRelationshipHistoryStatusSuffix(history)}`
    : "";

  renderNativeRelationshipQueueHistoryRows({
    language: state.language,
    rows: nativeRelationshipQueueHistoryList.querySelectorAll<HTMLElement>(
      "[data-direct-relationship-history-row='true']",
    ),
    historyLog: state.directEditor.relationshipQueueHistoryLog,
    presenter: createNativeRelationshipHistoryPresenter(state.language),
  });

  queryNativeRelationshipQueueHistoryDetails().forEach((detail) => {
    if (
      Number(detail.dataset.historyIndex) >=
      state.directEditor.relationshipQueueHistoryLog.length
    ) {
      detail.hidden = true;
    }
  });
  applyCurrentNativeRelationshipHistoryFilter(
    nativeRelationshipQueueHistoryFilters?.dataset.historyFilter || "all",
  );
}
