import type {
  EngineEntitySummary,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import { createRelationshipRepairHealth } from "./directRelationshipRepairHealth";
import { createDirectWorkbenchQueueHistoryView } from "./directWorkbenchDirectoryHistoryView";
import { createDirectWorkbenchRelationshipIssueView } from "./directWorkbenchDirectoryIssueView";
import { createDirectWorkbenchDirectoryModel } from "./directWorkbenchDirectoryModel";
import { renderDirectWorkbenchDirectoryPage } from "./directWorkbenchDirectoryPageView";
import {
  renderDirectWorkbenchDirectoryGrid,
  renderDirectWorkbenchDirectorySummary,
} from "./directWorkbenchDirectorySummaryView";
import { renderDirectWorkbenchRepairCenter } from "./directWorkbenchRepairCenterView";
import { t } from "./shellShared";

export function renderDirectWorkbenchDirectory(
  entitySummary: EngineEntitySummary,
  worldResources: ReturnType<typeof getEngineWorldResourceSummary>,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
  mode: "directory" | "repair" = "directory",
) {
  const {
    activeBurgs,
    activeCultures,
    activeProvinces,
    activeStates,
    appliedSummary,
    firstAppliedWorkbench,
    totalActiveFilters,
    workbenches,
  } = createDirectWorkbenchDirectoryModel(
    entitySummary,
    worldResources,
    directEditor,
    language,
  );
  const {
    firstRelationshipIssue,
    hiddenRelationshipIssueCount,
    relationshipIssues,
    relationshipSummary,
    renderHiddenRelationshipIssues,
    renderRelationshipIssue,
    visibleRelationshipIssueGroups,
  } = createDirectWorkbenchRelationshipIssueView({
    activeStates,
    activeBurgs,
    activeCultures,
    activeProvinces,
    language,
  });
  const relationshipRepairHealth = createRelationshipRepairHealth(
    relationshipIssues,
    directEditor.relationshipQueueHistory?.id ?? null,
  );
  const queueHistoryView = createDirectWorkbenchQueueHistoryView(
    directEditor,
    language,
  );

  const workbenchGrid = renderDirectWorkbenchDirectoryGrid(
    workbenches,
    language,
  );
  const summaryPanel = renderDirectWorkbenchDirectorySummary({
    language,
    totalActiveFilters,
    appliedSummary,
    relationshipSummary,
    firstAppliedWorkbench,
    firstRelationshipTarget: firstRelationshipIssue?.target,
  });
  const repairSummaryPanel = renderDirectWorkbenchDirectorySummary({
    language,
    totalActiveFilters,
    appliedSummary,
    relationshipSummary,
    firstAppliedWorkbench,
    firstRelationshipTarget: firstRelationshipIssue?.target,
    relationshipAction: "direct-workbench-review-relationship",
    relationshipLabel: t(language, "复查关系", "Review relationship"),
  });

  if (mode === "directory") {
    return renderDirectWorkbenchDirectoryPage({
      language,
      summaryPanel,
      workbenchGrid,
    });
  }

  return renderDirectWorkbenchRepairCenter({
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
  });
}
