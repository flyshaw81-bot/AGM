import type { StudioLanguage } from "../types";
import { renderDirectRelationshipIssueFixAttributes } from "./nativeRelationshipDataAttributes";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";
import { renderDirectRelationshipReplacementCandidate } from "./nativeRelationshipReplacementCandidateView";
import { escapeHtml, t } from "./shellShared";

export function getRelationshipIssueFieldLabel(
  issue: RelationshipIssue,
  language: StudioLanguage,
) {
  const fieldLabels: Record<
    NonNullable<RelationshipIssue["editField"]>,
    string
  > = {
    burg: t(language, "城镇", "Burg"),
    capital: t(language, "首都", "Capital"),
    culture: t(language, "文化", "Culture"),
    state: t(language, "国家", "State"),
  };
  return issue.editField
    ? fieldLabels[issue.editField]
    : issue.repairField || "";
}

export function getRelationshipIssueWorkbenchLabel(
  issue: RelationshipIssue,
  language: StudioLanguage,
) {
  if (issue.editEntity === "state") {
    return t(language, "国家工作台", "States workbench");
  }
  if (issue.editEntity === "burg") {
    return t(language, "城镇工作台", "Burgs workbench");
  }
  if (issue.editEntity === "province") {
    return t(language, "省份工作台", "Provinces workbench");
  }
  return "";
}

export function renderRelationshipIssueNavigation(
  issue: RelationshipIssue,
  language: StudioLanguage,
) {
  if (
    !issue.editLabel ||
    !issue.editEntity ||
    !issue.editId ||
    !issue.editField
  ) {
    return "";
  }

  return `<div class="studio-direct-workbench-directory__issue-navigation" data-direct-relationship-issue-navigation="true" data-workbench-target="${issue.target}" data-review-field="${issue.editField}"><span>${t(language, "导航路径", "Navigation path")}</span><strong>${escapeHtml(getRelationshipIssueWorkbenchLabel(issue, language))} · ${escapeHtml(getRelationshipIssueFieldLabel(issue, language))} ${t(language, "字段", "field")}</strong><code>${escapeHtml(issue.source)} → ${escapeHtml(issue.reference)}</code><button class="studio-ghost studio-direct-workbench-directory__issue-context-button" data-studio-action="direct-relationship-review-field" data-edit-entity="${issue.editEntity}" data-edit-id="${issue.editId}" data-edit-field="${issue.editField}" data-workbench-target="${issue.target}">${t(language, "复查字段", "Review field")}</button></div>`;
}

export function renderRelationshipIssue(
  issue: RelationshipIssue,
  language: StudioLanguage,
) {
  return `
    <div class="studio-direct-workbench-directory__issue">
      <button class="studio-direct-workbench-directory__issue-main" data-studio-action="direct-workbench-review-relationship" data-workbench-target="${issue.target}">
        <span class="studio-direct-workbench-directory__issue-title">${escapeHtml(issue.label)}</span>
        <span class="studio-direct-workbench-directory__issue-meta">${escapeHtml(issue.source)} · ${escapeHtml(issue.reference)}</span>
        <span class="studio-direct-workbench-directory__issue-detail">${escapeHtml(issue.detail)}</span>
      </button>
      <span class="studio-direct-workbench-directory__issue-context">
        <button class="studio-ghost studio-direct-workbench-directory__issue-context-button" data-studio-action="direct-relationship-select-source" data-source-entity="${issue.sourceEntity}" data-source-id="${issue.sourceId}" data-workbench-target="${issue.target}">${t(language, "选中源实体", "Select source")}</button>
        ${issue.candidateTotal !== undefined ? `<span>${t(language, "显示", "Showing")} ${Math.min(issue.replaceCandidates?.length || 0, issue.candidateTotal)} / ${issue.candidateTotal} ${t(language, "个候选", "candidates")}</span>` : ""}
      </span>
      ${issue.repairField && issue.repairCurrent && issue.repairTarget ? `<div class="studio-direct-workbench-directory__issue-preview" data-direct-relationship-preview="true"><span>${t(language, "修复预览", "Repair preview")}</span><strong>${escapeHtml(issue.repairField)}</strong><code>${escapeHtml(issue.repairCurrent)} → ${escapeHtml(issue.repairTarget)}</code></div>` : ""}
      ${renderRelationshipIssueNavigation(issue, language)}
      <span class="studio-direct-workbench-directory__issue-actions">
        ${issue.editLabel && issue.editEntity && issue.editId && issue.editField ? `<button class="studio-ghost studio-direct-workbench-directory__issue-fix" data-studio-action="direct-relationship-edit-reference" data-edit-entity="${issue.editEntity}" data-edit-id="${issue.editId}" data-edit-field="${issue.editField}" data-workbench-target="${issue.target}">${escapeHtml(issue.editLabel)}</button>` : ""}
        ${issue.fixLabel && issue.fixKind ? `<button class="studio-ghost studio-direct-workbench-directory__issue-fix" ${renderDirectRelationshipIssueFixAttributes(issue)}>${escapeHtml(issue.fixLabel)}</button>` : ""}
        ${issue.fixLabel && issue.fixKind ? `<button class="studio-ghost studio-direct-workbench-directory__issue-fix" data-studio-action="direct-relationship-queue-add">${t(language, "加入队列", "Add to queue")}</button>` : ""}
      </span>
      ${issue.replaceCandidates?.length ? `<div class="studio-direct-workbench-directory__issue-candidates"><span>${t(language, "候选替换", "Replacement candidates")}</span><small data-direct-relationship-suggestion-hint="true">${t(language, "优先替换为仍存在的有效实体；只有确实缺失时再清空为 #0。", "Prefer replacing with an existing valid entity; clear to #0 only when the reference should stay missing.")}</small>${issue.replaceCandidates.map((candidate) => renderDirectRelationshipReplacementCandidate(candidate, language)).join("")}${issue.editLabel && issue.editEntity && issue.editId && issue.editField ? `<button class="studio-ghost studio-direct-workbench-directory__issue-candidate" data-studio-action="direct-relationship-edit-reference" data-edit-entity="${issue.editEntity}" data-edit-id="${issue.editId}" data-edit-field="${issue.editField}" data-workbench-target="${issue.target}">${t(language, "打开完整选择器", "Open full picker")}</button>` : ""}</div>` : ""}
    </div>
  `;
}
