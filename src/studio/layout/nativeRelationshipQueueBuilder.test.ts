import { describe, expect, it } from "vitest";
import {
  parseDirectRelationshipQueuePreview,
  parseNativeRelationshipQueuePreview,
} from "./nativeRelationshipQueueBuilder";

describe("nativeRelationshipQueueBuilder", () => {
  it("parses repair preview values across arrow formats", () => {
    expect(parseDirectRelationshipQueuePreview("#9 -> #0")).toEqual({
      source: "9",
      target: "0",
    });
    expect(parseDirectRelationshipQueuePreview("#12 => #4")).toEqual({
      source: "12",
      target: "4",
    });
    expect(parseDirectRelationshipQueuePreview("#7 → #3")).toEqual({
      source: "7",
      target: "3",
    });
  });

  it("keeps the native preview parser as a compatibility alias", () => {
    expect(parseNativeRelationshipQueuePreview("#9 -> #0")).toEqual({
      source: "9",
      target: "0",
    });
  });
});
