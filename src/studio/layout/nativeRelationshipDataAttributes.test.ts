import { describe, expect, it } from "vitest";
import {
  renderDirectRelationshipDataAttributes,
  renderDirectRelationshipIssueFixAttributes,
  renderDirectRelationshipReplacementCandidateAttributes,
  renderNativeRelationshipDataAttributes,
} from "./nativeRelationshipDataAttributes";
import type {
  RelationshipIssue,
  RelationshipReplacementCandidate,
} from "./nativeRelationshipIssueTypes";

describe("direct relationship data attributes", () => {
  it("renders escaped data attributes while preserving empty optional values", () => {
    expect(
      renderDirectRelationshipDataAttributes({
        "state-id": 12,
        "state-name": 'North <Watch> "Prime"',
        "state-color": undefined,
      }),
    ).toBe(
      'data-state-id="12" data-state-name="North &lt;Watch&gt; &quot;Prime&quot;" data-state-color=""',
    );
  });

  it("renders the full relationship issue fix payload", () => {
    const issue = {
      fixKind: "province-sync-burg-state",
      target: "studioDirectProvincesWorkbench",
      fixProvinceId: 7,
      fixProvinceName: "North Coast",
      fixProvinceState: 3,
      fixProvinceBurg: 42,
    } as RelationshipIssue;

    expect(renderDirectRelationshipIssueFixAttributes(issue)).toContain(
      'data-studio-action="direct-relationship-fix"',
    );
    expect(renderDirectRelationshipIssueFixAttributes(issue)).toContain(
      'data-province-state="3"',
    );
    expect(renderDirectRelationshipIssueFixAttributes(issue)).toContain(
      'data-workbench-target="studioDirectProvincesWorkbench"',
    );
  });

  it("renders replacement candidate payload attributes", () => {
    const candidate = {
      replaceEntity: "state",
      replaceField: "culture",
      replaceId: 2,
      replaceValue: 8,
      rank: 1,
      recommended: true,
      target: "studioDirectStatesWorkbench",
      stateName: "Northwatch",
      stateCulture: 8,
    } as RelationshipReplacementCandidate;

    expect(
      renderDirectRelationshipReplacementCandidateAttributes(candidate),
    ).toContain('data-replace-value="8"');
    expect(
      renderDirectRelationshipReplacementCandidateAttributes(candidate),
    ).toContain('data-candidate-recommended="true"');
    expect(
      renderDirectRelationshipReplacementCandidateAttributes(candidate),
    ).toContain('data-state-culture="8"');
  });

  it("keeps the previous data attribute helper as a compatibility alias", () => {
    expect(renderNativeRelationshipDataAttributes({ "state-id": 7 })).toBe(
      'data-state-id="7"',
    );
  });
});
