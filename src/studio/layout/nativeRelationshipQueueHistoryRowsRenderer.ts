import type { StudioState } from "../types";
import type { createNativeRelationshipHistoryPresenter } from "./nativeRelationshipHistoryPresenter";
import {
  getNativeRelationshipHistoryRecoveryState,
  getNativeRelationshipHistoryRowStatus,
  getNativeRelationshipHistoryStatusSuffix,
} from "./nativeRelationshipHistoryStatus";
import { escapeHtml, t } from "./shellShared";

type NativeRelationshipHistoryPresenter = ReturnType<
  typeof createNativeRelationshipHistoryPresenter
>;

type NativeRelationshipHistoryItem =
  StudioState["directEditor"]["relationshipQueueHistoryLog"][number];

type RenderNativeRelationshipQueueHistoryRowsOptions = {
  language: StudioState["language"];
  rows: NodeListOf<HTMLElement>;
  historyLog: StudioState["directEditor"]["relationshipQueueHistoryLog"];
  presenter: NativeRelationshipHistoryPresenter;
};

function updateNativeRelationshipHistoryRecoveryPath(
  recoveryPath: HTMLElement,
  item: NativeRelationshipHistoryItem,
  index: number,
  language: StudioState["language"],
  presenter: NativeRelationshipHistoryPresenter,
) {
  const recoveryState = getNativeRelationshipHistoryRecoveryState(item, index);
  recoveryPath.hidden = recoveryState === "hidden";
  recoveryPath.dataset.recoveryState = recoveryState;
  const recoveryText =
    recoveryState === "blocked"
      ? `${t(language, "下一步", "Next")}: ${t(language, "复查字段 → 恢复到 After → 撤销", "Review field → Restore to After → Undo")}`
      : presenter.getNativeRelationshipHistoryRecoveryReadyText(item);
  const recoveryLabel = recoveryPath.querySelector<HTMLElement>("span");
  if (recoveryLabel) recoveryLabel.textContent = recoveryText;
  else recoveryPath.textContent = recoveryText;

  const recoveryScope = `${t(language, "恢复范围", "Recovery scope")}: ${item.count} ${t(language, "项", "items")} · ${item.summary} · ${t(language, "只处理最近队列；历史项只读。", "Only the latest queue is recoverable; older history is read-only.")}`;
  recoveryPath.dataset.recoveryScope = recoveryScope;
  const recoveryScopeLabel = recoveryPath.querySelector<HTMLElement>(
    "[data-direct-relationship-history-recovery-scope='true']",
  );
  if (recoveryScopeLabel) recoveryScopeLabel.textContent = recoveryScope;

  const restoreAllButton = recoveryPath.querySelector<HTMLButtonElement>(
    "[data-studio-action='direct-relationship-history-restore-all-after']",
  );
  if (restoreAllButton) restoreAllButton.hidden = recoveryState !== "blocked";
}

function updateNativeRelationshipHistoryChangeRow(
  changeRow: HTMLElement,
  change: NativeRelationshipHistoryItem["undoChanges"][number],
  index: number,
  item: NativeRelationshipHistoryItem,
  language: StudioState["language"],
  presenter: NativeRelationshipHistoryPresenter,
) {
  const current = presenter.getNativeRelationshipHistoryCurrentState(change);
  changeRow.dataset.historyField = change.field;
  changeRow.dataset.historyBefore = change.beforeValue;
  changeRow.dataset.historyAfter = change.afterValue;
  changeRow.dataset.historyCurrent = current.currentValue;
  changeRow.dataset.historyCurrentState = current.matchesAfter
    ? "match"
    : "stale";
  changeRow.dataset.historyFieldAudit =
    presenter.getNativeRelationshipHistoryFieldAudit(change);
  changeRow.querySelector("strong")!.textContent =
    presenter.getNativeRelationshipHistoryEntityLabel(change);
  changeRow.querySelector("code")!.textContent =
    presenter.getNativeRelationshipHistoryFieldLabel(change.field);

  const valueLabels = changeRow.querySelectorAll("span");
  valueLabels[0]!.innerHTML = `<b>${t(language, "之前", "Before")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryValueLabel(change, change.beforeValue))}`;
  valueLabels[1]!.innerHTML = `<b>${t(language, "之后", "After")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryValueLabel(change, change.afterValue))}`;
  const currentText = presenter.getNativeRelationshipHistoryCurrentText(change);
  valueLabels[2]!.innerHTML = `<b>${escapeHtml(currentText.split(": ")[0])}:</b> ${escapeHtml(currentText.split(": ").slice(1).join(": "))}`;

  const fieldAudit = changeRow.querySelector<HTMLElement>(
    "[data-direct-relationship-history-field-audit='true']",
  );
  if (fieldAudit) {
    fieldAudit.textContent =
      presenter.getNativeRelationshipHistoryFieldAudit(change);
  }
  changeRow.querySelector(
    "small:not([data-direct-relationship-history-field-audit='true'])",
  )!.textContent = presenter.getNativeRelationshipHistoryGuidance(change);
  const targetHint = changeRow.querySelector<HTMLElement>(
    "[data-direct-relationship-history-target='true']",
  );
  if (targetHint) {
    targetHint.innerHTML = `<b>${t(language, "复查目标", "Review target")}:</b> ${escapeHtml(presenter.getNativeRelationshipHistoryReviewTarget(change))}`;
  }

  const restoreButton = changeRow.querySelector<HTMLButtonElement>(
    "[data-studio-action='direct-relationship-history-restore-after']",
  );
  if (!restoreButton) return;
  const canRestoreAfter =
    index === 0 &&
    Boolean(item.undoBlockedReason) &&
    !item.undone &&
    !current.matchesAfter;
  restoreButton.hidden = !canRestoreAfter;
  restoreButton.disabled = !canRestoreAfter;
}

function updateNativeRelationshipHistoryDetail(
  detail: HTMLElement,
  item: NativeRelationshipHistoryItem,
  index: number,
  language: StudioState["language"],
  presenter: NativeRelationshipHistoryPresenter,
) {
  detail.querySelector("p")!.textContent =
    presenter.getNativeRelationshipHistoryStatus(item, index);
  const batchSummary = detail.querySelector<HTMLElement>(
    "[data-direct-relationship-history-batch='true']",
  );
  if (batchSummary) {
    batchSummary.textContent =
      presenter.getNativeRelationshipHistoryBatchSummary(item);
  }
  const auditSummary = detail.querySelector<HTMLElement>(
    "[data-direct-relationship-history-audit='true']",
  );
  if (auditSummary) {
    auditSummary.textContent =
      presenter.getNativeRelationshipHistoryAuditSummary(item, index);
  }
  const recoveryPath = detail.querySelector<HTMLElement>(
    "[data-direct-relationship-history-recovery='true']",
  );
  if (recoveryPath) {
    updateNativeRelationshipHistoryRecoveryPath(
      recoveryPath,
      item,
      index,
      language,
      presenter,
    );
  }
  detail
    .querySelectorAll<HTMLElement>(
      "[data-direct-relationship-history-change='true']",
    )
    .forEach((changeRow, changeIndex) => {
      const change = item.undoChanges[changeIndex];
      if (!change) return;
      updateNativeRelationshipHistoryChangeRow(
        changeRow,
        change,
        index,
        item,
        language,
        presenter,
      );
    });
}

export function renderNativeRelationshipQueueHistoryRows({
  language,
  rows,
  historyLog,
  presenter,
}: RenderNativeRelationshipQueueHistoryRowsOptions) {
  rows.forEach((row, index) => {
    const item = historyLog[index];
    row.querySelector("span")!.textContent = item
      ? `${index === 0 ? "Latest" : "History"} · ${item.count} repairs · ${item.summary}${getNativeRelationshipHistoryStatusSuffix(item)}`
      : "";
    const rowStatus = item
      ? getNativeRelationshipHistoryRowStatus(item, index)
      : "readonly";
    row.dataset.historyRowStatus = rowStatus;
    const badge = row.querySelector<HTMLElement>("[data-history-status]");
    if (badge && item) {
      badge.dataset.historyStatus = rowStatus;
      badge.textContent = item.undoBlockedReason
        ? t(language, "撤销受阻", "Undo blocked")
        : item.undone
          ? t(language, "已撤销", "Undone")
          : index === 0
            ? t(language, "可撤销", "Undoable")
            : t(language, "只读", "Read-only");
    }

    const firstChange = item?.undoChanges[0];
    const rowTarget = row.querySelector<HTMLElement>(
      "[data-direct-relationship-history-row-target='true']",
    );
    if (firstChange) {
      const firstTarget =
        presenter.getNativeRelationshipHistoryReviewTarget(firstChange);
      row.dataset.historyFirstTarget = firstTarget;
      row.dataset.historyFirstChange = `${presenter.getNativeRelationshipHistoryEntityLabel(firstChange)} · ${presenter.getNativeRelationshipHistoryFieldLabel(firstChange.field)}`;
      if (rowTarget) {
        rowTarget.textContent = `${t(language, "首项定位", "First locator")}: ${firstTarget}`;
      }
    } else if (rowTarget) {
      rowTarget.textContent = `${t(language, "首项定位", "First locator")}: -`;
    }

    const detail = row.querySelector<HTMLElement>(
      "[data-direct-relationship-history-detail='true']",
    );
    if (detail && item) {
      updateNativeRelationshipHistoryDetail(
        detail,
        item,
        index,
        language,
        presenter,
      );
    }
  });
}
