import { describe, expect, it } from "vitest";
import { renderDirectWorkbenchRepairCenter } from "./directWorkbenchRepairCenterView";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";

type RepairCenterOptions = Parameters<
  typeof renderDirectWorkbenchRepairCenter
>[0];

const queueHistoryView: RepairCenterOptions["queueHistoryView"] = {
  queueActionScopeDefault: "Queue is empty",
  queueActionScopeState: "idle",
  queueActionScopeText: "Queue is empty",
  queueHistory: null,
  queueHistoryFilterCounts: {
    blocked: 0,
    undoable: 0,
    undone: 0,
    readonly: 0,
  },
  queueHistoryFilterSummary: "No history yet",
  queueHistoryLog: [],
  queueHistoryLogRows: "",
  queueHistoryText: "No history yet",
};

describe("directWorkbenchRepairCenterView", () => {
  it("renders relationship repair health in the native repair center", () => {
    const html = renderDirectWorkbenchRepairCenter({
      hiddenRelationshipIssueCount: 0,
      language: "en",
      queueHistoryView,
      relationshipRepairHealth: {
        issueCount: 2,
        blockingIssueCount: 2,
        lastAppliedRepairId: 99,
        exportGate: "blocked",
        deliveryStatus: "needs-repair",
      },
      relationshipIssues: [],
      renderHiddenRelationshipIssues: () => "",
      renderRelationshipIssue: () => "",
      repairSummaryPanel: "",
      visibleRelationshipIssueGroups: [],
      workbenchGrid: "",
    });

    expect(html).toContain('data-relationship-repair-health="blocked"');
    expect(html).toContain('data-relationship-repair-issue-count="2"');
    expect(html).toContain('data-relationship-repair-blocking-count="2"');
    expect(html).toContain('data-relationship-repair-export-gate="blocked"');
    expect(html).toContain('data-relationship-delivery-status="needs-repair"');
    expect(html).toContain("Last repair: #99");
    expect(html).toContain("Needs repair");
    expect(html).toContain('data-native-repair-center="true"');
    expect(html).toContain("studio-native-repair__hero");
    expect(html).toContain('data-native-repair-source-context="true"');
    expect(html).toContain("Source workbench context");
    expect(html).not.toContain(
      '<details class="studio-native-repair__context"',
    );
    expect(html).not.toContain("Show source workbench context");
    expect(html).not.toContain("studio-direct-editor__header");
  });

  it("keeps queue and issue group hooks inside the native issue flow", () => {
    const issue: RelationshipIssue = {
      groupKey: "state-clear-culture",
      groupLabel: "State culture",
      target: "states:1",
      label: "Broken state culture",
      source: "State #1",
      sourceEntity: "state",
      sourceId: 1,
      reference: "Culture #404",
      detail: "Culture reference is missing",
      fixLabel: "Clear culture",
      fixKind: "state-clear-culture",
      fixStateId: 1,
    };
    const html = renderDirectWorkbenchRepairCenter({
      hiddenRelationshipIssueCount: 0,
      language: "en",
      queueHistoryView,
      relationshipRepairHealth: {
        issueCount: 1,
        blockingIssueCount: 1,
        lastAppliedRepairId: null,
        exportGate: "blocked",
        deliveryStatus: "needs-repair",
      },
      relationshipIssues: [issue],
      renderHiddenRelationshipIssues: () => "",
      renderRelationshipIssue: () =>
        '<div class="studio-native-repair__issue studio-direct-workbench-directory__issue"></div>',
      repairSummaryPanel: "",
      visibleRelationshipIssueGroups: [
        {
          key: issue.groupKey,
          label: issue.groupLabel,
          target: issue.target,
          issues: [issue],
          visibleIssues: [issue],
          hiddenIssues: [],
          hiddenCount: 0,
          visibleCandidateCount: 0,
        },
      ],
      workbenchGrid: "",
    });

    expect(html).toContain("studio-native-repair__issues");
    expect(html).toContain("studio-native-repair__queue");
    expect(html).toContain('data-direct-relationship-queue="true"');
    expect(html).toContain(
      'data-direct-relationship-group="state-clear-culture"',
    );
    expect(html).toContain(
      'data-studio-action="direct-relationship-queue-apply"',
    );
  });
});
