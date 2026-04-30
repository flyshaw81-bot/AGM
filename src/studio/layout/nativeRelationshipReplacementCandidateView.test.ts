import { describe, expect, it } from "vitest";
import { renderNativeRelationshipReplacementCandidate } from "./nativeRelationshipReplacementCandidateView";

describe("nativeRelationshipReplacementCandidateView", () => {
  it("renders normal arrows and rank separators for candidate previews", () => {
    expect(
      renderNativeRelationshipReplacementCandidate(
        {
          label: "Shwazen #1",
          previewField: "Culture",
          previewCurrent: "#999999",
          previewTarget: "Shwazen #1",
          rank: 1,
          recommended: true,
          reason: "First valid candidate",
          replaceEntity: "state",
          replaceField: "culture",
          replaceId: 2,
          replaceValue: 1,
          target: "studioDirectStatesWorkbench",
        },
        "en",
      ),
    ).toContain("#999999 → Shwazen #1");
    expect(
      renderNativeRelationshipReplacementCandidate(
        {
          label: "Shwazen #1",
          previewField: "Culture",
          previewCurrent: "#999999",
          previewTarget: "Shwazen #1",
          rank: 1,
          recommended: true,
          reason: "First valid candidate",
          replaceEntity: "state",
          replaceField: "culture",
          replaceId: 2,
          replaceValue: 1,
          target: "studioDirectStatesWorkbench",
        },
        "en",
      ),
    ).toContain("#1 · First valid candidate");
  });
});
