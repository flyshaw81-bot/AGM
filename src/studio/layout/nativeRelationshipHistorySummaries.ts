import type { StudioLanguage } from "../types";
import type { createDirectRelationshipHistoryLabels } from "./nativeRelationshipHistoryLabels";
import type {
  NativeRelationshipQueueHistory,
  NativeRelationshipQueueUndoChange,
} from "./nativeRelationshipQueue";
import { t } from "./shellShared";

type DirectRelationshipHistoryLabels = ReturnType<
  typeof createDirectRelationshipHistoryLabels
>;

export function createDirectRelationshipHistorySummaries(
  language: StudioLanguage,
  labels: DirectRelationshipHistoryLabels,
) {
  const {
    getNativeRelationshipHistoryCurrentState,
    getNativeRelationshipHistoryEntityLabel,
    getNativeRelationshipHistoryFieldLabel,
    getNativeRelationshipHistoryValueLabel,
  } = labels;

  const getNativeRelationshipHistoryGuidance = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    const current = getNativeRelationshipHistoryCurrentState(change);
    return current.matchesAfter
      ? t(
          language,
          "已就绪：点击撤销最近队列。",
          "Ready: click Undo last queue.",
        )
      : `${t(language, "先恢复到 After", "Restore to After first")} (${getNativeRelationshipHistoryValueLabel(change, change.afterValue)})${t(language, "，再撤销。", ", then undo.")}`;
  };
  const getNativeRelationshipHistoryFieldAudit = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    const current = getNativeRelationshipHistoryCurrentState(change);
    const status = current.matchesAfter
      ? t(
          language,
          "当前值匹配 After，可直接撤销",
          "Current matches After, ready to undo",
        )
      : t(
          language,
          "当前值偏离 After，需要先恢复",
          "Current differs from After, restore first",
        );
    return `${t(language, "字段审计", "Field audit")}: ${getNativeRelationshipHistoryEntityLabel(change)} · ${getNativeRelationshipHistoryFieldLabel(change.field)} · ${t(language, "Before", "Before")} ${getNativeRelationshipHistoryValueLabel(change, change.beforeValue)} → ${t(language, "After", "After")} ${getNativeRelationshipHistoryValueLabel(change, change.afterValue)} · ${t(language, "当前", "Current")} ${getNativeRelationshipHistoryValueLabel(change, current.currentValue)} · ${status}`;
  };
  const getNativeRelationshipHistoryReviewTarget = (
    change: NativeRelationshipQueueUndoChange,
  ) => {
    const workbench =
      change.entity === "state"
        ? t(language, "国家工作台", "States workbench")
        : change.entity === "burg"
          ? t(language, "城镇工作台", "Burgs workbench")
          : t(language, "省份工作台", "Provinces workbench");
    return `${workbench} · ${getNativeRelationshipHistoryFieldLabel(change.field)} ${t(language, "字段", "field")}`;
  };
  const getNativeRelationshipHistoryRecoveryReadyText = (
    item: NativeRelationshipQueueHistory,
  ) =>
    item.resultText.startsWith("Restored ")
      ? t(
          language,
          "已恢复到 After：现在可撤销。下一步点击 Undo last queue。",
          "Restored to After: undo is ready. Next, click Undo last queue.",
        )
      : t(
          language,
          "已就绪：点击撤销最近队列。",
          "Ready: click Undo last queue.",
        );
  const getNativeRelationshipHistoryBatchSummary = (
    item: NativeRelationshipQueueHistory,
  ) => {
    const entityLabels = {
      state: t(language, "国家", "State"),
      burg: t(language, "城镇", "Burg"),
      province: t(language, "省份", "Province"),
    };
    const entities = [
      ...new Set(item.undoChanges.map((change) => entityLabels[change.entity])),
    ].join(", ");
    const fields = [
      ...new Set(
        item.undoChanges.map((change) =>
          getNativeRelationshipHistoryFieldLabel(change.field),
        ),
      ),
    ].join(", ");
    return `${t(language, "批量复查", "Batch review")}: ${item.undoChanges.length} ${t(language, "项变更", "changes")} · ${t(language, "实体", "Entities")}: ${entities} · ${t(language, "字段", "Fields")}: ${fields}`;
  };
  const getNativeRelationshipHistoryAuditSummary = (
    item: NativeRelationshipQueueHistory,
    index: number,
  ) => {
    const operation = item.undone
      ? t(language, "操作", "Operation") +
        ": " +
        t(language, "Undo completed", "Undo completed")
      : item.undoBlockedReason
        ? t(language, "操作", "Operation") +
          ": " +
          t(language, "Undo blocked", "Undo blocked")
        : index === 0
          ? t(language, "操作", "Operation") +
            ": " +
            t(language, "Apply / ready for undo", "Apply / ready for undo")
          : t(language, "操作", "Operation") +
            ": " +
            t(language, "Historical apply", "Historical apply");
    const scope = `${t(language, "范围", "Scope")}: ${item.count} ${t(language, "项", "items")} · ${item.summary}`;
    const result = `${t(language, "结果", "Result")}: ${item.undoBlockedReason || item.resultText}`;
    return `${operation} · ${scope} · ${result}`;
  };
  const getNativeRelationshipHistoryStatus = (
    item: NativeRelationshipQueueHistory,
    index: number,
  ) =>
    item.undoBlockedReason ||
    (item.undone
      ? t(
          language,
          "已撤销：此队列已恢复。",
          "Undone: this queue was restored.",
        )
      : index === 0
        ? t(
            language,
            "可撤销：这是最新队列。",
            "Undoable: this is the latest queue.",
          )
        : t(
            language,
            "只读：只有最新队列可撤销。",
            "Read-only: only the latest queue can be undone.",
          ));

  return {
    getNativeRelationshipHistoryAuditSummary,
    getNativeRelationshipHistoryBatchSummary,
    getNativeRelationshipHistoryFieldAudit,
    getNativeRelationshipHistoryGuidance,
    getNativeRelationshipHistoryRecoveryReadyText,
    getNativeRelationshipHistoryReviewTarget,
    getNativeRelationshipHistoryStatus,
  };
}

export type NativeRelationshipHistoryLabels = DirectRelationshipHistoryLabels;

export const createNativeRelationshipHistorySummaries =
  createDirectRelationshipHistorySummaries;
