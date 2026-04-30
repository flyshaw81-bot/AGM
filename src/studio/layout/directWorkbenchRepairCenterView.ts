import type { StudioLanguage } from "../types";
import type { createDirectWorkbenchQueueHistoryView } from "./directWorkbenchDirectoryHistoryView";
import type { DirectRelationshipVisibleIssueGroup } from "./directWorkbenchDirectoryIssueModel";
import { renderDirectWorkbenchRepairQueue } from "./directWorkbenchDirectoryRepairQueueView";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";
import { escapeHtml, t } from "./shellShared";

type QueueHistoryView = ReturnType<
  typeof createDirectWorkbenchQueueHistoryView
>;

type DirectWorkbenchRepairCenterOptions = {
  hiddenRelationshipIssueCount: number;
  language: StudioLanguage;
  queueHistoryView: QueueHistoryView;
  relationshipIssues: RelationshipIssue[];
  renderHiddenRelationshipIssues: (
    group: DirectRelationshipVisibleIssueGroup,
  ) => string;
  renderRelationshipIssue: (issue: RelationshipIssue) => string;
  repairSummaryPanel: string;
  visibleRelationshipIssueGroups: DirectRelationshipVisibleIssueGroup[];
  workbenchGrid: string;
};

function renderRelationshipIssueGroup(
  group: DirectRelationshipVisibleIssueGroup,
  language: StudioLanguage,
  renderRelationshipIssue: (issue: RelationshipIssue) => string,
  renderHiddenRelationshipIssues: (
    group: DirectRelationshipVisibleIssueGroup,
  ) => string,
) {
  return `
    <div class="studio-direct-workbench-directory__issue-group" data-direct-relationship-group="${group.key}">
      <div class="studio-direct-workbench-directory__issue-group-head">
        <button class="studio-direct-workbench-directory__issue-group-main" data-studio-action="direct-workbench-review-relationship" data-workbench-target="${group.target}">
          <span>${escapeHtml(group.label)}</span>
          <strong>${group.issues.length}</strong>
        </button>
        <span class="studio-direct-workbench-directory__issue-group-actions">
          ${group.issues.some((issue) => issue.replaceCandidates?.length) ? `<button class="studio-ghost studio-direct-workbench-directory__issue-batch" data-studio-action="direct-relationship-replace-visible-candidates" data-fix-group="${group.key}" data-workbench-target="${group.target}" data-visible-count="${group.visibleCandidateCount}" data-hidden-count="${group.hiddenCount}">${t(language, "替换可见候选", "Replace visible")}</button>` : ""}
          <button class="studio-ghost studio-direct-workbench-directory__issue-batch" data-studio-action="direct-relationship-fix-group" data-fix-group="${group.key}" data-workbench-target="${group.target}" data-visible-count="${group.visibleIssues.length}" data-total-count="${group.issues.length}" data-hidden-count="${group.hiddenCount}">${t(language, "批量清理", "Clear group")}</button>
          ${group.key.includes("clear") ? `<button class="studio-ghost studio-direct-workbench-directory__issue-batch" data-studio-action="direct-relationship-queue-group" data-fix-group="${group.key}" data-visible-count="${group.visibleIssues.length}" data-total-count="${group.issues.length}" data-hidden-count="${group.hiddenCount}">${t(language, "整组入队", "Queue group")}</button>` : ""}
        </span>
      </div>
      <div class="studio-direct-workbench-directory__batch-guard" data-direct-relationship-batch-guard="true" data-visible-count="${group.visibleIssues.length}" data-hidden-count="${group.hiddenCount}"><strong>${t(language, "批量范围", "Batch scope")}</strong><span>${t(language, "可见", "Visible")}: ${group.visibleIssues.length} / ${group.issues.length}</span><span>${t(language, "隐藏", "Hidden")}: ${group.hiddenCount}</span><code>${group.hiddenCount ? t(language, "Clear group / Queue group 会处理本组全部问题；Replace visible 只处理当前可见候选。", "Clear group / Queue group affect the whole group; Replace visible only affects currently visible candidates.") : t(language, "当前组无隐藏问题；批量动作会覆盖这里显示的范围。", "No hidden issues in this group; batch actions cover the shown scope.")}</code></div>
      ${group.key.includes("clear") ? `<div class="studio-direct-workbench-directory__group-preview" data-direct-relationship-group-preview="true"><span>${t(language, "批量预览", "Batch preview")}</span><strong>${group.issues.length}</strong><code>${escapeHtml(group.label)} → #0</code></div>` : ""}
      ${group.issues.some((issue) => issue.replaceCandidates?.length) ? `<div class="studio-direct-workbench-directory__group-preview is-candidate" data-direct-relationship-candidate-group-preview="true"><span>${t(language, "候选批量", "Candidate batch")}</span><strong>${group.visibleCandidateCount}</strong><code>${t(language, "仅替换当前可见问题的首个有效候选", "Only replaces the first valid candidate for visible issues")}</code></div>` : ""}
      ${group.visibleIssues.map(renderRelationshipIssue).join("")}
      ${renderHiddenRelationshipIssues(group)}
    </div>
  `;
}

function renderRelationshipIssuesPanel({
  hiddenRelationshipIssueCount,
  language,
  queueHistoryView,
  relationshipIssues,
  renderHiddenRelationshipIssues,
  renderRelationshipIssue,
  visibleRelationshipIssueGroups,
}: Omit<
  DirectWorkbenchRepairCenterOptions,
  "repairSummaryPanel" | "workbenchGrid"
>) {
  if (!relationshipIssues.length) {
    return `
      <div class="studio-direct-workbench-directory__issues is-healthy" data-direct-relationship-issues="true">
        <div class="studio-direct-workbench-directory__issues-head">
          <span>${t(language, "关联问题详情", "Relationship issue details")}</span>
          <strong>${t(language, "健康", "Healthy")}</strong>
        </div>
        <p>${t(language, "当前未发现国家、城镇、省份与文化之间的断链或不一致。", "No broken or mismatched state, burg, province, or culture references were found.")}</p>
      </div>
    `;
  }

  return `
    <div class="studio-direct-workbench-directory__issues" data-direct-relationship-issues="true">
      <div class="studio-direct-workbench-directory__issues-head">
        <span>${t(language, "关联问题详情", "Relationship issue details")}</span>
        <strong>${relationshipIssues.length}</strong>
      </div>
      ${renderDirectWorkbenchRepairQueue(queueHistoryView, language)}
      ${visibleRelationshipIssueGroups
        .map((group) =>
          renderRelationshipIssueGroup(
            group,
            language,
            renderRelationshipIssue,
            renderHiddenRelationshipIssues,
          ),
        )
        .join("")}
      ${hiddenRelationshipIssueCount ? `<div class="studio-direct-workbench-directory__issue-more">${t(language, "还有", "And")} ${hiddenRelationshipIssueCount} ${t(language, "个问题未显示", "more issues not shown")}</div>` : ""}
    </div>
  `;
}

export function renderDirectWorkbenchRepairCenter({
  hiddenRelationshipIssueCount,
  language,
  queueHistoryView,
  relationshipIssues,
  renderHiddenRelationshipIssues,
  renderRelationshipIssue,
  repairSummaryPanel,
  visibleRelationshipIssueGroups,
  workbenchGrid,
}: DirectWorkbenchRepairCenterOptions) {
  return `
    <section class="studio-panel studio-direct-workbench-directory studio-repair-center" aria-label="${t(language, "修复器", "Repair Center")}">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "修复器", "Repair Center")}</div>
          <h2 class="studio-panel__title">${t(language, "关联检查与修复队列", "Relationship checks and repair queue")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "安全修复", "Safe repair")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "修复器会检查断链引用、跨实体不一致和可安全清理项；应用前可查看预览，应用后可在历史中撤销。", "Repair Center checks broken references, cross-entity mismatches, and safe cleanups; preview before applying and undo from history after applying.")}</p>
      ${repairSummaryPanel}
      ${renderRelationshipIssuesPanel({
        hiddenRelationshipIssueCount,
        language,
        queueHistoryView,
        relationshipIssues,
        renderHiddenRelationshipIssues,
        renderRelationshipIssue,
        visibleRelationshipIssueGroups,
      })}
      ${workbenchGrid}
    </section>
  `;
}
