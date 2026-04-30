import { describe, expect, it } from "vitest";
import { getNativeRelationshipFieldInputId } from "./nativeRelationshipFocus";

describe("native relationship focus helpers", () => {
  it("maps relationship entities and fields to editor inputs", () => {
    expect(getNativeRelationshipFieldInputId("state", "capital")).toBe(
      "studioStateCapitalInput",
    );
    expect(getNativeRelationshipFieldInputId("state", "culture")).toBe(
      "studioStateCultureInput",
    );
    expect(getNativeRelationshipFieldInputId("burg", "state")).toBe(
      "studioBurgStateInput",
    );
    expect(getNativeRelationshipFieldInputId("burg", "culture")).toBe(
      "studioBurgCultureInput",
    );
    expect(getNativeRelationshipFieldInputId("province", "burg")).toBe(
      "studioProvinceBurgInput",
    );
    expect(getNativeRelationshipFieldInputId("province", "state")).toBe(
      "studioProvinceStateInput",
    );
  });

  it("returns null for unsupported relationship focus targets", () => {
    expect(getNativeRelationshipFieldInputId("route", "state")).toBeNull();
    expect(getNativeRelationshipFieldInputId("state", "neighbors")).toBeNull();
  });
});
