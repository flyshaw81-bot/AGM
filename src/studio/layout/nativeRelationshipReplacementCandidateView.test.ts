import { describe, expect, it } from "vitest";
import {
  renderDirectRelationshipReplacementCandidate,
  renderNativeRelationshipReplacementCandidate,
} from "./nativeRelationshipReplacementCandidateView";

const createCandidate = () => ({
  label: "Shwazen #1",
  previewField: "Culture",
  previewCurrent: "#999999",
  previewTarget: "Shwazen #1",
  rank: 1,
  recommended: true,
  reason: "First valid candidate",
  replaceEntity: "state" as const,
  replaceField: "culture" as const,
  replaceId: 2,
  replaceValue: 1,
  target: "studioDirectStatesWorkbench",
});

describe("nativeRelationshipReplacementCandidateView", () => {
  it("renders normal arrows and rank separators for candidate previews", () => {
    expect(
      renderDirectRelationshipReplacementCandidate(createCandidate(), "en"),
    ).toContain("#999999 → Shwazen #1");
    expect(
      renderDirectRelationshipReplacementCandidate(createCandidate(), "en"),
    ).toContain("#1 · First valid candidate");
  });

  it("keeps the native candidate renderer as a compatibility alias", () => {
    expect(
      renderNativeRelationshipReplacementCandidate(createCandidate(), "en"),
    ).toContain("Shwazen #1");
  });
});
