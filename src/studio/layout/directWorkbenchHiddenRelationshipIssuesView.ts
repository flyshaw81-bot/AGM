import type { StudioLanguage } from "../types";
import {
  chunkRelationshipIssues,
  DIRECT_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE,
  type DirectRelationshipVisibleIssueGroup,
} from "./directWorkbenchDirectoryIssueModel";
import {
  getRelationshipIssueFieldLabel,
  getRelationshipIssueWorkbenchLabel,
  renderRelationshipIssue,
} from "./directWorkbenchRelationshipIssueRenderers";
import { escapeHtml, t } from "./shellShared";

export function renderHiddenRelationshipIssues(
  group: DirectRelationshipVisibleIssueGroup,
  language: StudioLanguage,
) {
  if (!group.hiddenIssues.length) return "";

  const hiddenRelationshipIssuePageSize =
    DIRECT_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE;
  const pages = chunkRelationshipIssues(
    group.hiddenIssues,
    hiddenRelationshipIssuePageSize,
  );
  const pagination =
    pages.length > 1
      ? `<div class="studio-direct-workbench-directory__hidden-pagination" data-direct-relationship-hidden-pagination="true" data-active-page="0">${pages.map((pageIssues, pageIndex) => `<button class="studio-ghost${pageIndex === 0 ? " is-active" : ""}" data-studio-action="direct-relationship-hidden-page" data-hidden-page="${pageIndex}" data-page-count="${pageIssues.length}">${t(language, "第", "Page")} ${pageIndex + 1}</button>`).join("")}</div>`
      : "";
  const pagePanels = pages
    .map((pageIssues, pageIndex) => {
      const start =
        group.visibleIssues.length +
        pageIndex * hiddenRelationshipIssuePageSize +
        1;
      const end = start + pageIssues.length - 1;
      const firstIssue = pageIssues[0];
      const reviewTarget = firstIssue
        ? `${getRelationshipIssueWorkbenchLabel(firstIssue, language)} · ${getRelationshipIssueFieldLabel(firstIssue, language)} ${t(language, "字段", "field")}`
        : "";
      const recoveryPath = `${t(language, "页面恢复路径", "Page recovery path")}: ${t(language, "本页入队 → 应用队列 → 历史明细 → 恢复到 After / 撤销", "Queue page → Apply queue → History details → Restore to After / Undo")}`;

      return `<div class="studio-direct-workbench-directory__hidden-page" data-direct-relationship-hidden-page="true" data-hidden-page="${pageIndex}" data-page-count="${pageIssues.length}"${pageIndex === 0 ? "" : " hidden"}><div class="studio-direct-workbench-directory__hidden-page-scope" data-direct-relationship-hidden-page-scope="true" data-page-start="${start}" data-page-end="${end}" data-page-count="${pageIssues.length}" data-review-target="${escapeHtml(reviewTarget)}" data-recovery-path="${escapeHtml(recoveryPath)}"><span>${t(language, "当前页", "Current page")}: ${start}-${end} / ${group.issues.length}</span><code>${t(language, "仅影响本页隐藏问题；整组入队仍覆盖全部问题。", "Only affects hidden issues on this page; Queue group still covers every issue.")}</code><small data-direct-relationship-hidden-page-recovery-path="true">${escapeHtml(recoveryPath)}</small>${firstIssue?.editEntity && firstIssue.editId && firstIssue.editField ? `<small data-direct-relationship-hidden-page-review-target="true">${t(language, "复查目标", "Review target")}: ${escapeHtml(reviewTarget)}</small><button class="studio-ghost" data-studio-action="direct-relationship-review-page" data-edit-entity="${firstIssue.editEntity}" data-edit-id="${firstIssue.editId}" data-edit-field="${firstIssue.editField}" data-workbench-target="${firstIssue.target}" data-page-count="${pageIssues.length}">${t(language, "复查本页", "Review page")}</button>` : ""}${group.key.includes("clear") ? `<button class="studio-ghost" data-studio-action="direct-relationship-queue-page" data-page-count="${pageIssues.length}">${t(language, "本页入队", "Queue page")}</button>` : ""}</div>${pageIssues.map((issue) => renderRelationshipIssue(issue, language)).join("")}</div>`;
    })
    .join("");

  return `<details class="studio-direct-workbench-directory__hidden-issues" data-direct-relationship-hidden-issues="true" data-hidden-count="${group.hiddenCount}" data-page-size="${hiddenRelationshipIssuePageSize}"><summary><span>${t(language, "展开隐藏问题", "Expand hidden issues")}</span><strong>${group.hiddenCount}</strong><code>${t(language, "隐藏问题会按页分段显示；Replace visible 不会处理这里。", "Hidden issues are paged in segments; Replace visible does not affect this list.")}</code></summary>${pagination}<div class="studio-direct-workbench-directory__hidden-issue-list">${pagePanels}</div></details>`;
}
