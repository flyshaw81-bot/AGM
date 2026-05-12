import type { StudioLanguage } from "../types";
import type { RelationshipRepairHealth } from "./directRelationshipRepairHealth";
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
  relationshipRepairHealth: RelationshipRepairHealth;
  relationshipIssues: RelationshipIssue[];
  renderHiddenRelationshipIssues: (
    group: DirectRelationshipVisibleIssueGroup,
  ) => string;
  renderRelationshipIssue: (issue: RelationshipIssue) => string;
  repairSummaryPanel: string;
  visibleRelationshipIssueGroups: DirectRelationshipVisibleIssueGroup[];
  workbenchGrid: string;
};

function renderNativeRepairStat(label: string, value: string | number) {
  return `<div class="studio-native-repair__stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function renderNativeRepairHero(
  health: RelationshipRepairHealth,
  language: StudioLanguage,
) {
  const ready = health.exportGate === "ready";
  return `
    <section class="studio-native-repair__hero">
      <div class="studio-native-repair__hero-copy">
        <p>${t(language, "验证工作流", "Validation workflow")}</p>
        <h3>${t(language, "关系修复中心", "Relationship Repair Center")}</h3>
        <span>${t(language, "检测关系问题、推荐修复、入队、应用写回、撤销恢复，并重新计算导出准备状态。", "Detect relationship issues, recommend repairs, queue, apply, undo, restore, and recalculate export readiness.")}</span>
      </div>
      <strong class="studio-native-repair__gate${ready ? " is-ready" : " is-blocked"}">${ready ? t(language, "Gate 通过", "Gate passed") : t(language, "Gate 阻塞", "Gate blocked")}</strong>
    </section>
  `;
}

function renderRelationshipRepairHealthPanel(
  health: RelationshipRepairHealth,
  language: StudioLanguage,
) {
  const ready = health.exportGate === "ready";
  const gateLabel = ready
    ? t(language, "关系修复已通过", "Relationship gate ready")
    : t(language, "关系修复阻塞", "Relationship gate blocked");
  const gateHint = ready
    ? t(
        language,
        "当前没有阻塞关系问题，可以继续导出交付。",
        "Relationship repair passed; export readiness can continue.",
      )
    : t(
        language,
        "仍有阻塞关系问题；修复前不要把当前世界视为可交付。",
        "Blocking relationship issues remain; repair before treating this world as export-ready.",
      );
  const deliveryStatusLabel =
    health.deliveryStatus === "ready"
      ? t(language, "可交付", "Ready to deliver")
      : t(language, "需要修复", "Needs repair");

  return `
    <section class="studio-native-repair__health${ready ? " is-ready" : " is-blocked"} studio-direct-workbench-directory__repair-health" data-relationship-repair-health="${health.exportGate}" data-relationship-repair-issue-count="${health.issueCount}" data-relationship-repair-blocking-count="${health.blockingIssueCount}" data-relationship-repair-export-gate="${health.exportGate}" data-relationship-delivery-status="${health.deliveryStatus}">
      <div class="studio-native-repair__health-copy">
        <p>${escapeHtml(gateLabel)}</p>
        <span>${escapeHtml(gateHint)}${health.lastAppliedRepairId ? ` ${t(language, "上次修复", "Last repair")}: #${health.lastAppliedRepairId}.` : ""}</span>
      </div>
      <div class="studio-native-repair__stats">
        ${renderNativeRepairStat(t(language, "关系问题", "Relationship issues"), health.issueCount)}
        ${renderNativeRepairStat(t(language, "阻塞问题", "Blocking issues"), health.blockingIssueCount)}
        <div class="studio-native-repair__stat"><span>${t(language, "交付状态", "Delivery status")}</span><strong data-relationship-repair-export-gate="true">${escapeHtml(deliveryStatusLabel)}</strong></div>
      </div>
      <span hidden data-relationship-repair-issue-count="true">${health.issueCount}</span>
      <span hidden data-relationship-repair-blocking-count="true">${health.blockingIssueCount}</span>
    </section>
  `;
}

function renderRelationshipIssueGroup(
  group: DirectRelationshipVisibleIssueGroup,
  language: StudioLanguage,
  renderRelationshipIssue: (issue: RelationshipIssue) => string,
  renderHiddenRelationshipIssues: (
    group: DirectRelationshipVisibleIssueGroup,
  ) => string,
) {
  return `
    <section class="studio-native-repair__issue-group studio-direct-workbench-directory__issue-group" data-direct-relationship-group="${group.key}">
      <div class="studio-native-repair__issue-group-head studio-direct-workbench-directory__issue-group-head">
        <button class="studio-native-repair__issue-group-main studio-direct-workbench-directory__issue-group-main" data-studio-action="direct-workbench-review-relationship" data-workbench-target="${group.target}">
          <span>${escapeHtml(group.label)}</span>
          <strong>${group.issues.length}</strong>
        </button>
        <span class="studio-direct-workbench-directory__issue-group-actions">
          ${group.issues.some((issue) => issue.replaceCandidates?.length) ? `<button class="studio-ghost studio-direct-workbench-directory__issue-batch" data-studio-action="direct-relationship-replace-visible-candidates" data-fix-group="${group.key}" data-workbench-target="${group.target}" data-visible-count="${group.visibleCandidateCount}" data-hidden-count="${group.hiddenCount}">${t(language, "替换可见候选", "Replace visible")}</button>` : ""}
          <button class="studio-ghost studio-direct-workbench-directory__issue-batch" data-studio-action="direct-relationship-fix-group" data-fix-group="${group.key}" data-workbench-target="${group.target}" data-visible-count="${group.visibleIssues.length}" data-total-count="${group.issues.length}" data-hidden-count="${group.hiddenCount}">${t(language, "批量清理", "Clear group")}</button>
          ${group.key.includes("clear") ? `<button class="studio-ghost studio-direct-workbench-directory__issue-batch" data-studio-action="direct-relationship-queue-group" data-fix-group="${group.key}" data-visible-count="${group.visibleIssues.length}" data-total-count="${group.issues.length}" data-hidden-count="${group.hiddenCount}">${t(language, "整组入队", "Queue group")}</button>` : ""}
        </span>
      </div>
      <div class="studio-native-repair__batch-guard studio-direct-workbench-directory__batch-guard" data-direct-relationship-batch-guard="true" data-visible-count="${group.visibleIssues.length}" data-hidden-count="${group.hiddenCount}"><strong>${t(language, "批量范围", "Batch scope")}</strong><span>${t(language, "可见", "Visible")}: ${group.visibleIssues.length} / ${group.issues.length}</span><span>${t(language, "隐藏", "Hidden")}: ${group.hiddenCount}</span><code>${group.hiddenCount ? t(language, "Clear group / Queue group 会处理本组全部问题；Replace visible 只处理当前可见候选。", "Clear group / Queue group affect the whole group; Replace visible only affects currently visible candidates.") : t(language, "当前组无隐藏问题；批量动作会覆盖这里显示的范围。", "No hidden issues in this group; batch actions cover the shown scope.")}</code></div>
      ${group.key.includes("clear") ? `<div class="studio-direct-workbench-directory__group-preview" data-direct-relationship-group-preview="true"><span>${t(language, "批量预览", "Batch preview")}</span><strong>${group.issues.length}</strong><code>${escapeHtml(group.label)} → #0</code></div>` : ""}
      ${group.issues.some((issue) => issue.replaceCandidates?.length) ? `<div class="studio-direct-workbench-directory__group-preview is-candidate" data-direct-relationship-candidate-group-preview="true"><span>${t(language, "候选批量", "Candidate batch")}</span><strong>${group.visibleCandidateCount}</strong><code>${t(language, "仅替换当前可见问题的首个有效候选", "Only replaces the first valid candidate for visible issues")}</code></div>` : ""}
      ${group.visibleIssues.map(renderRelationshipIssue).join("")}
      ${renderHiddenRelationshipIssues(group)}
    </section>
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
  "relationshipRepairHealth" | "repairSummaryPanel" | "workbenchGrid"
>) {
  if (!relationshipIssues.length) {
    return `
      <section class="studio-native-repair__issues studio-direct-workbench-directory__issues is-healthy" data-direct-relationship-issues="true">
        <div class="studio-native-repair__section-head studio-direct-workbench-directory__issues-head">
          <span>${t(language, "关联问题详情", "Relationship issue details")}</span>
          <strong>${t(language, "健康", "Healthy")}</strong>
        </div>
        <p>${t(language, "当前未发现国家、城镇、省份与文化之间的断链或不一致。", "No broken or mismatched state, burg, province, or culture references were found.")}</p>
      </section>
    `;
  }

  return `
    <section class="studio-native-repair__issues studio-direct-workbench-directory__issues" data-direct-relationship-issues="true">
      <div class="studio-native-repair__section-head studio-direct-workbench-directory__issues-head">
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
    </section>
  `;
}

export function renderDirectWorkbenchRepairCenter({
  hiddenRelationshipIssueCount,
  language,
  queueHistoryView,
  relationshipRepairHealth,
  relationshipIssues,
  renderHiddenRelationshipIssues,
  renderRelationshipIssue,
  repairSummaryPanel,
  visibleRelationshipIssueGroups,
  workbenchGrid,
}: DirectWorkbenchRepairCenterOptions) {
  return `
    <section class="studio-native-repair studio-direct-workbench-directory studio-repair-center" data-native-repair-center="true" aria-label="${t(language, "修复器", "Repair Center")}">
      ${renderNativeRepairHero(relationshipRepairHealth, language)}
      ${renderRelationshipRepairHealthPanel(relationshipRepairHealth, language)}
      ${renderRelationshipIssuesPanel({
        hiddenRelationshipIssueCount,
        language,
        queueHistoryView,
        relationshipIssues,
        renderHiddenRelationshipIssues,
        renderRelationshipIssue,
        visibleRelationshipIssueGroups,
      })}
      <section class="studio-native-repair__context" data-native-repair-source-context="true">
        <div class="studio-native-repair__section-head">
          <span>${t(language, "原始工作台上下文", "Source workbench context")}</span>
          <strong>${t(language, "默认展开", "Visible")}</strong>
        </div>
        ${repairSummaryPanel}
        ${workbenchGrid}
      </section>
    </section>
  `;
}
