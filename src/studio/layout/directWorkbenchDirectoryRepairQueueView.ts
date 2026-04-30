import type { StudioLanguage } from "../types";
import type { createDirectWorkbenchQueueHistoryView } from "./directWorkbenchDirectoryHistoryView";
import { escapeHtml, t } from "./shellShared";

type QueueHistoryView = ReturnType<
  typeof createDirectWorkbenchQueueHistoryView
>;

export function renderDirectWorkbenchRepairQueue(
  queueHistoryView: QueueHistoryView,
  language: StudioLanguage,
) {
  const {
    queueActionScopeDefault,
    queueActionScopeState,
    queueActionScopeText,
    queueHistory,
    queueHistoryFilterCounts,
    queueHistoryFilterSummary,
    queueHistoryLog,
    queueHistoryLogRows,
    queueHistoryText,
  } = queueHistoryView;

  return `
          <div class="studio-direct-workbench-directory__queue" data-direct-relationship-queue="true" data-empty-label="${t(language, "队列为空", "Queue is empty")}" data-ready-label="${t(language, "队列已准备应用。", "Queue is ready to apply.")}" data-conflict-label="${t(language, "队列需要复查：存在重复字段或排队后值已变化。", "Queue needs review: duplicate fields or stale source values were detected.")}">
            <div class="studio-direct-workbench-directory__queue-head">
              <span>${t(language, "修复队列", "Repair queue")}</span>
              <strong data-direct-relationship-queue-count="true">0</strong>
              <button class="studio-ghost studio-direct-workbench-directory__queue-toggle" data-studio-action="direct-relationship-queue-toggle" type="button">${t(language, "展开", "Details")}</button>
            </div>
            <div class="studio-direct-workbench-directory__queue-review" data-direct-relationship-queue-review="true">${t(language, "先将单条修复或安全清理组加入队列。", "Add individual repairs or safe cleanup groups first.")}</div>
            <div class="studio-direct-workbench-directory__queue-action-scope" data-direct-relationship-queue-action-scope="true" data-action-state="${queueActionScopeState}" data-default-label="${escapeHtml(queueActionScopeDefault)}">${escapeHtml(queueActionScopeText)}</div>
            <div class="studio-direct-workbench-directory__queue-summary" data-direct-relationship-queue-summary="true" hidden></div>
            <div class="studio-direct-workbench-directory__queue-result" data-direct-relationship-queue-result="true"${queueHistory?.resultText || queueHistory?.undoBlockedReason ? "" : " hidden"}>${queueHistory?.undoBlockedReason ? escapeHtml(queueHistory.undoBlockedReason) : queueHistory?.resultText ? escapeHtml(queueHistory.resultText) : ""}</div>
            <details class="studio-direct-workbench-directory__queue-history" data-direct-relationship-queue-history="true"${queueHistory ? "" : " hidden"}>
              <summary><span data-direct-relationship-queue-history-text="true">${escapeHtml(queueHistoryText || t(language, "暂无历史", "No history yet"))}</span><strong>${queueHistoryLog.length}</strong></summary>
              <div class="studio-direct-workbench-directory__queue-history-actions">
                <button class="studio-ghost studio-direct-workbench-directory__queue-history-action" data-studio-action="direct-relationship-history-review"${queueHistory?.target ? "" : " disabled"}>${t(language, "复查最近队列", "Review last queue")}</button>
                <button class="studio-ghost studio-direct-workbench-directory__queue-history-action" data-studio-action="direct-relationship-history-undo"${queueHistory?.undoChanges.length && !queueHistory.undone ? "" : " disabled"}>${t(language, "撤销最近队列", "Undo last queue")}</button>
              </div>
              <small class="studio-direct-workbench-directory__queue-history-scope" data-direct-relationship-history-action-scope="true">${t(language, "展开后查看历史筛选、字段审计和恢复路径。", "Expand to inspect history filters, field audits, and recovery paths.")}</small>
              <div class="studio-direct-workbench-directory__queue-history-filters" data-direct-relationship-history-filters="true" data-history-filter="all" data-history-total="${queueHistoryLog.length}" data-history-visible="${queueHistoryLog.length}">
                <small data-direct-relationship-history-filter-summary="true">${escapeHtml(queueHistoryFilterSummary)}</small>
                <button class="studio-ghost is-active" data-studio-action="direct-relationship-history-filter" data-history-filter="all">${t(language, "全部", "All")} <strong>${queueHistoryLog.length}</strong></button>
                <button class="studio-ghost" data-studio-action="direct-relationship-history-filter" data-history-filter="blocked">${t(language, "受阻", "Blocked")} <strong>${queueHistoryFilterCounts.blocked}</strong></button>
                <button class="studio-ghost" data-studio-action="direct-relationship-history-filter" data-history-filter="undoable">${t(language, "可撤销", "Undoable")} <strong>${queueHistoryFilterCounts.undoable}</strong></button>
                <button class="studio-ghost" data-studio-action="direct-relationship-history-filter" data-history-filter="undone">${t(language, "已撤销", "Undone")} <strong>${queueHistoryFilterCounts.undone}</strong></button>
                <button class="studio-ghost" data-studio-action="direct-relationship-history-filter" data-history-filter="readonly">${t(language, "只读", "Read-only")} <strong>${queueHistoryFilterCounts.readonly}</strong></button>
              </div>
              <div class="studio-direct-workbench-directory__queue-history-filter-empty" data-direct-relationship-history-filter-empty="true" hidden>${t(language, "当前筛选没有历史项。", "No history items match the current filter.")}</div>
              <div class="studio-direct-workbench-directory__queue-history-list" data-direct-relationship-history-list="true">${queueHistoryLogRows}</div>
            </details>
            <div class="studio-direct-workbench-directory__queue-details" data-direct-relationship-queue-details="true" hidden>
              <div class="studio-direct-workbench-directory__queue-list" data-direct-relationship-queue-list="true">
                <span class="studio-direct-workbench-directory__queue-empty">${t(language, "先将单条修复或安全清理组加入队列。", "Add individual repairs or safe cleanup groups first.")}</span>
              </div>
            </div>
            <button class="studio-primary-action studio-direct-workbench-directory__queue-apply" data-studio-action="direct-relationship-queue-apply" disabled>${t(language, "应用队列修复", "Apply queued repairs")}</button>
          </div>`;
}
