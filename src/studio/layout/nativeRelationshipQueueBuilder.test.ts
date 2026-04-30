import { describe, expect, it } from "vitest";
import { parseNativeRelationshipQueuePreview } from "./nativeRelationshipQueueBuilder";

describe("nativeRelationshipQueueBuilder", () => {
  it("parses repair preview values across arrow formats", () => {
    expect(parseNativeRelationshipQueuePreview("#9 -> #0")).toEqual({
      source: "9",
      target: "0",
    });
    expect(parseNativeRelationshipQueuePreview("#12 => #4")).toEqual({
      source: "12",
      target: "4",
    });
    expect(parseNativeRelationshipQueuePreview("#7 → #3")).toEqual({
      source: "7",
      target: "3",
    });
  });
});
