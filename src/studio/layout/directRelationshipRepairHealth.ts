import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import { createDirectWorkbenchDirectoryModel } from "./directWorkbenchDirectoryModel";
import { createDirectWorkbenchRelationshipIssues } from "./directWorkbenchRelationshipIssues";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";

export type RelationshipRepairExportGate = "blocked" | "ready";
export type RelationshipRepairDeliveryStatus = "needs-repair" | "ready";

export interface RelationshipRepairHealth {
  issueCount: number;
  blockingIssueCount: number;
  lastAppliedRepairId: number | null;
  exportGate: RelationshipRepairExportGate;
  deliveryStatus: RelationshipRepairDeliveryStatus;
}

export function createRelationshipRepairHealth(
  relationshipIssues: readonly RelationshipIssue[],
  lastAppliedRepairId: number | null = null,
): RelationshipRepairHealth {
  const issueCount = relationshipIssues.length;
  const exportGate: RelationshipRepairExportGate =
    issueCount === 0 ? "ready" : "blocked";

  return {
    issueCount,
    blockingIssueCount: issueCount,
    lastAppliedRepairId,
    exportGate,
    deliveryStatus: exportGate === "ready" ? "ready" : "needs-repair",
  };
}

export function createRelationshipIssuesFromSummaries({
  directEditor,
  entitySummary,
  language,
  worldResources,
}: {
  directEditor: StudioState["directEditor"];
  entitySummary: EngineEntitySummary;
  language: StudioLanguage;
  worldResources: EngineWorldResourceSummary;
}) {
  const { activeBurgs, activeCultures, activeProvinces, activeStates } =
    createDirectWorkbenchDirectoryModel(
      entitySummary,
      worldResources,
      directEditor,
      language,
    );

  return createDirectWorkbenchRelationshipIssues({
    activeStates,
    activeBurgs,
    activeCultures,
    activeProvinces,
    language,
  });
}

export function createRelationshipRepairHealthFromSummaries({
  directEditor,
  entitySummary,
  language,
  worldResources,
}: {
  directEditor: StudioState["directEditor"];
  entitySummary: EngineEntitySummary;
  language: StudioLanguage;
  worldResources: EngineWorldResourceSummary;
}) {
  return createRelationshipRepairHealth(
    createRelationshipIssuesFromSummaries({
      directEditor,
      entitySummary,
      language,
      worldResources,
    }),
    directEditor.relationshipQueueHistory?.id ?? null,
  );
}
