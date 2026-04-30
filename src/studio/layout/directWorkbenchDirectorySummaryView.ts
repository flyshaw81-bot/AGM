import type { StudioLanguage } from "../types";
import type { DirectWorkbenchDirectoryItem } from "./directWorkbenchDirectoryModel";
import { escapeHtml, t } from "./shellShared";

type DirectorySummaryOptions = {
  language: StudioLanguage;
  totalActiveFilters: number;
  appliedSummary: string;
  relationshipSummary: string;
  firstAppliedWorkbench?: DirectWorkbenchDirectoryItem;
  firstRelationshipTarget?: string;
  relationshipAction?: string;
  relationshipLabel?: string;
};

export function renderDirectWorkbenchDirectoryGrid(
  workbenches: readonly DirectWorkbenchDirectoryItem[],
  language: StudioLanguage,
) {
  return `
    <div class="studio-chip-grid studio-direct-workbench-directory__grid">
      ${workbenches
        .map(
          (workbench) =>
            `<button class="studio-chip studio-direct-workbench-directory__item" data-studio-action="direct-workbench-jump" data-workbench-key="${workbench.key}" data-workbench-target="${workbench.target}" data-workbench-count="${workbench.count}" data-workbench-selected="${escapeHtml(workbench.selected)}" data-workbench-applied="${escapeHtml(workbench.applied)}" data-workbench-filters="${workbench.filters}"><span class="studio-direct-workbench-directory__label">${language === "zh-CN" ? workbench.zh : workbench.en}</span><span class="studio-direct-workbench-directory__meta"><span>${t(language, "记录", "Records")} ${workbench.count}</span><span>${t(language, "选中", "Selected")} ${escapeHtml(workbench.selected)}</span><span>${t(language, "已应用", "Applied")} ${escapeHtml(workbench.applied)}</span><span>${t(language, "筛选", "Filters")} ${workbench.filters}</span></span></button>`,
        )
        .join("")}
    </div>
  `;
}

export function renderDirectWorkbenchDirectorySummary({
  language,
  totalActiveFilters,
  appliedSummary,
  relationshipSummary,
  firstAppliedWorkbench,
  firstRelationshipTarget = "",
  relationshipAction = "direct-workbench-open-repair",
  relationshipLabel = t(language, "打开修复器", "Open Repair"),
}: DirectorySummaryOptions) {
  return `
    <div class="studio-direct-workbench-directory__summary">
      <div><span>${t(language, "活动筛选", "Active filters")}</span><strong>${totalActiveFilters}</strong></div>
      <div><span>${t(language, "最近应用", "Recent applies")}</span><strong data-direct-applied-summary="true">${escapeHtml(appliedSummary)}</strong></div>
      <div><span>${t(language, "关系检查", "Relationship checks")}</span><strong data-direct-relationship-summary="true">${escapeHtml(relationshipSummary)}</strong></div>
      <button class="studio-ghost" data-studio-action="direct-workbench-review-applied" data-workbench-target="${firstAppliedWorkbench?.target || ""}"${firstAppliedWorkbench ? "" : " disabled"}>${t(language, "复查最近应用", "Review recent apply")}</button>
      <button class="studio-ghost" data-studio-action="${relationshipAction}" data-workbench-target="${firstRelationshipTarget}"${firstRelationshipTarget ? "" : " disabled"}>${relationshipLabel}</button>
      <button class="studio-ghost" data-studio-action="direct-workbench-clear-filters"${totalActiveFilters ? "" : " disabled"}>${t(language, "清空全部筛选", "Clear all filters")}</button>
    </div>
  `;
}
