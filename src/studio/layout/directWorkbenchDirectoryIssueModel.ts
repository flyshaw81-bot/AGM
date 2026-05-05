import type { RelationshipIssue } from "./nativeRelationshipIssueTypes";

export const DIRECT_RELATIONSHIP_ISSUE_GROUP_LIMIT = 4;
export const DIRECT_RELATIONSHIP_VISIBLE_ISSUES_PER_GROUP = 3;
export const DIRECT_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE = 2;

export type DirectRelationshipIssueGroup = {
  key: string;
  label: string;
  target: string;
  issues: RelationshipIssue[];
};

export type DirectRelationshipVisibleIssueGroup =
  DirectRelationshipIssueGroup & {
    visibleIssues: RelationshipIssue[];
    hiddenIssues: RelationshipIssue[];
    hiddenCount: number;
    visibleCandidateCount: number;
  };

export function chunkRelationshipIssues<T>(issues: T[], pageSize: number) {
  return Array.from(
    { length: Math.ceil(issues.length / pageSize) },
    (_, index) => issues.slice(index * pageSize, index * pageSize + pageSize),
  );
}

export function groupDirectRelationshipIssues(
  issues: RelationshipIssue[],
): DirectRelationshipIssueGroup[] {
  return Array.from(
    issues
      .reduce((groups, issue) => {
        const group = groups.get(issue.groupKey) || {
          key: issue.groupKey,
          label: issue.groupLabel,
          target: issue.target,
          issues: [],
        };
        group.issues.push(issue);
        groups.set(issue.groupKey, group);
        return groups;
      }, new Map<string, DirectRelationshipIssueGroup>())
      .values(),
  );
}

export function createVisibleDirectRelationshipIssueGroups(
  issues: RelationshipIssue[],
  groupLimit = DIRECT_RELATIONSHIP_ISSUE_GROUP_LIMIT,
  visibleIssueLimit = DIRECT_RELATIONSHIP_VISIBLE_ISSUES_PER_GROUP,
): DirectRelationshipVisibleIssueGroup[] {
  return groupDirectRelationshipIssues(issues)
    .slice(0, groupLimit)
    .map((group) => {
      const visibleIssues = group.issues.slice(0, visibleIssueLimit);
      const hiddenIssues = group.issues.slice(visibleIssues.length);
      return {
        ...group,
        visibleIssues,
        hiddenIssues,
        hiddenCount: hiddenIssues.length,
        visibleCandidateCount: visibleIssues.filter(
          (issue) => issue.replaceCandidates?.length,
        ).length,
      };
    });
}

export function countVisibleRelationshipIssues(
  groups: readonly DirectRelationshipVisibleIssueGroup[],
) {
  return groups.reduce((total, group) => total + group.visibleIssues.length, 0);
}

export function countHiddenRelationshipIssues(
  issues: readonly RelationshipIssue[],
  groups: readonly DirectRelationshipVisibleIssueGroup[],
) {
  return Math.max(0, issues.length - countVisibleRelationshipIssues(groups));
}

export const NATIVE_RELATIONSHIP_ISSUE_GROUP_LIMIT =
  DIRECT_RELATIONSHIP_ISSUE_GROUP_LIMIT;
export const NATIVE_RELATIONSHIP_VISIBLE_ISSUES_PER_GROUP =
  DIRECT_RELATIONSHIP_VISIBLE_ISSUES_PER_GROUP;
export const NATIVE_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE =
  DIRECT_RELATIONSHIP_HIDDEN_ISSUE_PAGE_SIZE;

export type NativeRelationshipIssueGroup = DirectRelationshipIssueGroup;
