import type { StudioLanguage, StudioState } from "../types";
import type { createNativeRelationshipHistoryPresenter } from "./nativeRelationshipHistoryPresenter";
import {
  getDirectRelationshipHistoryRecoveryState,
  getDirectRelationshipHistoryRowStatus,
  getDirectRelationshipHistoryStatusSuffix,
} from "./nativeRelationshipHistoryStatus";
import { escapeHtml, t } from "./shellShared";

type NativeRelationshipHistoryPresenter = ReturnType<
  typeof createNativeRelationshipHistoryPresenter
>;
type NativeRelationshipHistoryLog =
  StudioState["directEditor"]["relationshipQueueHistoryLog"];
type NativeRelationshipHistoryItem = NativeRelationshipHistoryLog[number];

type RenderDirectWorkbenchQueueHistoryRowsOptions = {
  language: StudioLanguage;
  presenter: NativeRelationshipHistoryPresenter;
  queueHistoryLog: NativeRelationshipHistoryLog;
};

function renderQueueHistoryChangeRows(
  item: NativeRelationshipHistoryItem,
  index: number,
  language: StudioLanguage,
  presenter: NativeRelationshipHistoryPresenter,
) {
  return item.undoChanges
    .map((change, changeIndex) => {
      const current =
        presenter.getNativeRelationshipHistoryCurrentState(change);
      const canRestoreAfter =
        index === 0 &&
        Boolean(item.undoBlockedReason) &&
        !item.undone &&
        current.currentValue !== change.afterValue;
      return `<div class="studio-direct-workbench-directory__queue-history-change" data-direct-relationship-history-change="true" data-history-field="${escapeHtml(change.field)}" data-history-before="${escapeHtml(change.beforeValue)}" data-history-after="${escapeHtml(change.afterValue)}" data-history-current="${escapeHtml(current.currentValue)}" data-history-current-state="${current.currentValue === change.afterValue ? "match" : "stale"}" data-history-field-audit="${escapeHtml(presenter.getNativeRelationshipHistoryFieldAudit(change))}"><strong>${escapeHtml(presenter.getNativeRelationshipHistoryEntityLabel(change))}</strong><code>${escapeHtml(presenter.getNativeRelationshipHistoryFieldLabel(change.field))}</code><span><b>${t(language, "之前", "Before")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryValueLabel(change, change.beforeValue))}</span><span><b>${t(language, "之后", "After")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryValueLabel(change, change.afterValue))}</span><span class="studio-direct-workbench-directory__queue-history-current" data-direct-relationship-history-current="true"><b>${t(language, "当前", "Current")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryValueLabel(change, current.currentValue))} · ${escapeHtml(presenter.getNativeRelationshipHistoryCurrentStatus(change))}</span><small class="studio-direct-workbench-directory__queue-history-field-audit" data-direct-relationship-history-field-audit="true">${escapeHtml(presenter.getNativeRelationshipHistoryFieldAudit(change))}</small><small data-direct-relationship-history-guidance="true">${escapeHtml(presenter.getNativeRelationshipHistoryGuidance(change))}</small><small class="studio-direct-workbench-directory__queue-history-target" data-direct-relationship-history-target="true"><b>${t(language, "复查目标", "Review target")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryReviewTarget(change))}</small><span class="studio-direct-workbench-directory__queue-history-change-actions"><button class="studio-ghost studio-direct-workbench-directory__queue-history-review-field" data-studio-action="direct-relationship-history-review-field" data-history-index="${index}" data-history-change-index="${changeIndex}">${t(language, "复查字段", "Review field")}</button><button class="studio-ghost studio-direct-workbench-directory__queue-history-restore" data-studio-action="direct-relationship-history-restore-after" data-history-index="${index}" data-history-change-index="${changeIndex}"${canRestoreAfter ? "" : " hidden disabled"}>${t(language, "恢复到 After", "Restore to After")}</button></span></div>`;
    })
    .join("");
}

function getQueueHistoryDetailStatus(
  item: NativeRelationshipHistoryItem,
  index: number,
  language: StudioLanguage,
) {
  return (
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
          ))
  );
}

function getQueueHistoryStatusBadge(
  item: NativeRelationshipHistoryItem,
  index: number,
  language: StudioLanguage,
) {
  if (item.undoBlockedReason) return t(language, "撤销受阻", "Undo blocked");
  if (item.undone) return t(language, "已撤销", "Undone");
  return index === 0
    ? t(language, "可撤销", "Undoable")
    : t(language, "只读", "Read-only");
}

function renderQueueHistoryRecoveryPath(
  item: NativeRelationshipHistoryItem,
  index: number,
  language: StudioLanguage,
  presenter: NativeRelationshipHistoryPresenter,
) {
  const recoveryState = getDirectRelationshipHistoryRecoveryState(item, index);
  if (recoveryState === "hidden") return "";

  const recoveryText =
    recoveryState === "blocked"
      ? `${t(language, "下一步", "Next")}: ${t(language, "复查字段 → 恢复到 After → 撤销", "Review field → Restore to After → Undo")}`
      : presenter.getNativeRelationshipHistoryRecoveryReadyText(item);
  const recoveryScope = `${t(language, "恢复范围", "Recovery scope")}: ${item.count} ${t(language, "项", "items")} · ${item.summary} · ${t(language, "只处理最新队列；历史项只读。", "Only the latest queue is recoverable; older history is read-only.")}`;
  return `<div class="studio-direct-workbench-directory__queue-history-recovery" data-direct-relationship-history-recovery="true" data-recovery-state="${recoveryState}" data-recovery-scope="${escapeHtml(recoveryScope)}"><span>${escapeHtml(recoveryText)}</span><small data-direct-relationship-history-recovery-scope="true">${escapeHtml(recoveryScope)}</small>${recoveryState === "blocked" ? `<button class="studio-ghost studio-direct-workbench-directory__queue-history-restore-all" data-studio-action="direct-relationship-history-restore-all-after">${t(language, "全部恢复到 After", "Restore all to After")}</button>` : ""}</div>`;
}

export function renderDirectWorkbenchQueueHistoryRows({
  language,
  presenter,
  queueHistoryLog,
}: RenderDirectWorkbenchQueueHistoryRowsOptions) {
  return queueHistoryLog
    .map((item, index) => {
      const status = getDirectRelationshipHistoryStatusSuffix(item);
      const historyStatus = getDirectRelationshipHistoryRowStatus(item, index);
      const firstChange = item.undoChanges[0];
      const firstTarget = firstChange
        ? presenter.getNativeRelationshipHistoryReviewTarget(firstChange)
        : "";
      const firstLocator = firstChange
        ? `${presenter.getNativeRelationshipHistoryEntityLabel(firstChange)} · ${presenter.getNativeRelationshipHistoryFieldLabel(firstChange.field)}`
        : "";
      return `<div class="studio-direct-workbench-directory__queue-history-row" data-direct-relationship-history-row="true" data-history-index="${index}" data-history-row-status="${historyStatus}" data-history-first-target="${escapeHtml(firstTarget)}" data-history-first-change="${escapeHtml(firstLocator)}"><span>${index === 0 ? t(language, "最近", "Latest") : t(language, "历史", "History")} · ${escapeHtml(`${item.count} repairs · ${item.summary}${status}`)}</span><button class="studio-ghost studio-direct-workbench-directory__queue-history-action" data-studio-action="direct-relationship-history-review-item" data-history-index="${index}"${item.target ? "" : " disabled"}>${t(language, "复查首项", "Review first")}</button><button class="studio-ghost studio-direct-workbench-directory__queue-history-action" data-studio-action="direct-relationship-history-detail-item" data-history-index="${index}">${t(language, "明细", "Details")}</button><em data-history-status="${historyStatus}">${getQueueHistoryStatusBadge(item, index, language)}</em><small class="studio-direct-workbench-directory__queue-history-row-target" data-direct-relationship-history-row-target="true">${t(language, "首项定位", "First locator")}: ${escapeHtml(firstTarget || "-")}</small><div class="studio-direct-workbench-directory__queue-history-detail is-compact" data-direct-relationship-history-detail="true" data-direct-relationship-history-mobile-wrap="true" data-history-index="${index}" hidden><p>${escapeHtml(getQueueHistoryDetailStatus(item, index, language))}</p><div class="studio-direct-workbench-directory__queue-history-batch" data-direct-relationship-history-batch="true">${escapeHtml(presenter.getNativeRelationshipHistoryBatchSummary(item))}</div><div class="studio-direct-workbench-directory__queue-history-audit" data-direct-relationship-history-audit="true">${escapeHtml(presenter.getNativeRelationshipHistoryAuditSummary(item, index))}</div>${renderQueueHistoryRecoveryPath(item, index, language, presenter)}${renderQueueHistoryChangeRows(item, index, language, presenter)}</div></div>`;
    })
    .join("");
}
