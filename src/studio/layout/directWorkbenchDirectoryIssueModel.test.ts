import { describe, expect, it } from "vitest";
import {
  chunkRelationshipIssues,
  countHiddenRelationshipIssues,
  countVisibleRelationshipIssues,
  createVisibleDirectRelationshipIssueGroups,
  DIRECT_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE,
  groupDirectRelationshipIssues,
  NATIVE_RELATIONSHIP_ISSUE_GROUP_LIMIT,
} from "./directWorkbenchDirectoryIssueModel";
import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";

const createIssue = (
  groupKey: string,
  index: number,
  hasCandidates = false,
): RelationshipIssue => ({
  groupKey,
  groupLabel: `Group ${groupKey}`,
  target: "studioDirectStatesWorkbench",
  label: `Issue ${index}`,
  source: `State #${index}`,
  sourceEntity: "state",
  sourceId: index,
  reference: `Culture #${index}`,
  detail: "Broken relationship",
  replaceCandidates: hasCandidates
    ? [
        {
          label: "Culture #1",
          previewField: "Culture",
          previewCurrent: "#0",
          previewTarget: "#1",
          rank: 1,
          recommended: true,
          reason: "Valid candidate",
          replaceEntity: "state",
          replaceField: "culture",
          replaceId: index,
          replaceValue: 1,
          target: "studioDirectStatesWorkbench",
        },
      ]
    : undefined,
});

describe("directWorkbenchDirectoryIssueModel", () => {
  it("groups relationship issues and keeps visible/hidden counts aligned", () => {
    const issues = [
      createIssue("state-clear-culture", 1, true),
      createIssue("state-clear-culture", 2),
      createIssue("state-clear-culture", 3, true),
      createIssue("state-clear-culture", 4),
      createIssue("burg-clear-state", 5),
    ];
    const groups = createVisibleDirectRelationshipIssueGroups(issues);

    expect(groupDirectRelationshipIssues(issues)).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      key: "state-clear-culture",
      hiddenCount: 1,
      visibleCandidateCount: 2,
    });
    expect(countVisibleRelationshipIssues(groups)).toBe(4);
    expect(countHiddenRelationshipIssues(issues, groups)).toBe(1);
  });

  it("chunks hidden issues using the shared hidden page size", () => {
    expect(
      chunkRelationshipIssues(
        [
          createIssue("state-clear-culture", 1),
          createIssue("state-clear-culture", 2),
          createIssue("state-clear-culture", 3),
        ],
        DIRECT_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE,
      ).map((page) => page.length),
    ).toEqual([2, 1]);
  });

  it("keeps native model constants as compatibility aliases", () => {
    expect(NATIVE_RELATIONSHIP_ISSUE_GROUP_LIMIT).toBe(4);
  });
});
