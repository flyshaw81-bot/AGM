import type { StudioLanguage, StudioState } from "../types";
import { renderDirectWorkbenchQueueHistoryRows } from "./directWorkbenchDirectoryHistoryRowsView";
import { createDirectRelationshipHistoryPresenter } from "./nativeRelationshipHistoryPresenter";
import {
  countDirectRelationshipHistoryRowStatuses,
  getDirectRelationshipHistoryStatusSuffix,
} from "./nativeRelationshipHistoryStatus";
import { t } from "./shellShared";

export function createDirectWorkbenchQueueHistoryView(
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const queueHistory = directEditor.relationshipQueueHistory;
  const queueHistoryLog = directEditor.relationshipQueueHistoryLog;
  const queueHistoryStatus =
    getDirectRelationshipHistoryStatusSuffix(queueHistory);
  const queueHistoryText = queueHistory
    ? `Last queue: ${queueHistory.count} repairs · ${queueHistory.summary}${queueHistoryStatus}`
    : "";
  const queueActionScopeDefault = t(
    language,
    "应用会批量写入当前队列；复查只跳转查看，不会修改。",
    "Apply writes the whole queue; Review only navigates and does not edit.",
  );
  const queueActionScopeState = queueHistory?.resultText.startsWith("Applied ")
    ? "applied"
    : "idle";
  const queueActionScopeText =
    queueActionScopeState === "applied"
      ? queueHistory?.resultText || queueActionScopeDefault
      : queueActionScopeDefault;
  const queueHistoryFilterCounts =
    countDirectRelationshipHistoryRowStatuses(queueHistoryLog);
  const queueHistoryFilterSummary = `${t(language, "当前筛选", "Current filter")}: ${t(language, "全部", "All")} · ${t(language, "可见", "Visible")}: ${queueHistoryLog.length} / ${queueHistoryLog.length}`;
  const queueHistoryLogRows = renderDirectWorkbenchQueueHistoryRows({
    language,
    presenter: createDirectRelationshipHistoryPresenter(language),
    queueHistoryLog,
  });

  return {
    queueActionScopeDefault,
    queueActionScopeState,
    queueActionScopeText,
    queueHistory,
    queueHistoryFilterCounts,
    queueHistoryFilterSummary,
    queueHistoryLog,
    queueHistoryLogRows,
    queueHistoryText,
  };
}
