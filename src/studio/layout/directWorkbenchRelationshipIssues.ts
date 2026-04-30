import { createBurgRelationshipIssues } from "./directWorkbenchBurgRelationshipIssues";
import { createProvinceRelationshipIssues } from "./directWorkbenchProvinceRelationshipIssues";
import { createStateRelationshipIssues } from "./directWorkbenchStateRelationshipIssues";
import type {
  CreateDirectWorkbenchRelationshipIssuesOptions,
  RelationshipIssue,
} from "./nativeRelationshipIssueTypes";

export type {
  RelationshipIssue,
  RelationshipReplacementCandidate,
} from "./nativeRelationshipIssueTypes";

export function createDirectWorkbenchRelationshipIssues({
  activeStates,
  activeBurgs,
  activeCultures,
  activeProvinces,
  language,
}: CreateDirectWorkbenchRelationshipIssuesOptions): RelationshipIssue[] {
  const stateIds = new Set(activeStates.map((state) => state.id));
  const burgIds = new Set(activeBurgs.map((burg) => burg.id));
  const cultureIds = new Set(activeCultures.map((culture) => culture.id));
  const burgStateById = new Map(
    activeBurgs.map((burg) => [burg.id, burg.state]),
  );

  return [
    ...createStateRelationshipIssues({
      activeBurgs,
      activeCultures,
      activeStates,
      burgIds,
      cultureIds,
      language,
    }),
    ...createBurgRelationshipIssues({
      activeBurgs,
      activeCultures,
      activeStates,
      cultureIds,
      language,
      stateIds,
    }),
    ...createProvinceRelationshipIssues({
      activeBurgs,
      activeProvinces,
      activeStates,
      burgIds,
      burgStateById,
      language,
      stateIds,
    }),
  ];
}
