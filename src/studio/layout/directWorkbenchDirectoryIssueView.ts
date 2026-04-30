import {
  countHiddenRelationshipIssues,
  createVisibleDirectRelationshipIssueGroups,
  type DirectRelationshipVisibleIssueGroup,
} from "./directWorkbenchDirectoryIssueModel";
import { renderHiddenRelationshipIssues as renderHiddenRelationshipIssuesView } from "./directWorkbenchHiddenRelationshipIssuesView";
import { renderRelationshipIssue as renderRelationshipIssueView } from "./directWorkbenchRelationshipIssueRenderers";
import { createDirectWorkbenchRelationshipIssues } from "./directWorkbenchRelationshipIssues";
import type {
  CreateDirectWorkbenchRelationshipIssuesOptions,
  RelationshipIssue,
} from "./nativeRelationshipIssueTypes";
import { t } from "./shellShared";

export function createDirectWorkbenchRelationshipIssueView(
  options: CreateDirectWorkbenchRelationshipIssuesOptions,
) {
  const {
    activeStates,
    activeBurgs,
    activeCultures,
    activeProvinces,
    language,
  } = options;
  const relationshipIssues = createDirectWorkbenchRelationshipIssues({
    activeStates,
    activeBurgs,
    activeCultures,
    activeProvinces,
    language,
  });
  const firstRelationshipIssue = relationshipIssues[0];
  const visibleRelationshipIssueGroups =
    createVisibleDirectRelationshipIssueGroups(relationshipIssues);
  const hiddenRelationshipIssueCount = countHiddenRelationshipIssues(
    relationshipIssues,
    visibleRelationshipIssueGroups,
  );
  const relationshipSummary = relationshipIssues.length
    ? `${relationshipIssues.length} · ${firstRelationshipIssue.label}`
    : t(language, "0 · 关联正常", "0 · Healthy");

  return {
    firstRelationshipIssue,
    hiddenRelationshipIssueCount,
    relationshipIssues,
    relationshipSummary,
    renderHiddenRelationshipIssues: (
      group: DirectRelationshipVisibleIssueGroup,
    ) => renderHiddenRelationshipIssuesView(group, language),
    renderRelationshipIssue: (issue: RelationshipIssue) =>
      renderRelationshipIssueView(issue, language),
    visibleRelationshipIssueGroups,
  };
}
