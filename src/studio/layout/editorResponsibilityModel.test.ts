import { describe, expect, it } from "vitest";
import {
  getDirectEditorFieldsByScope,
  getDirectEditorResponsibility,
} from "./editorResponsibilityModel";

describe("editor responsibility model", () => {
  it("keeps state ownership separate from related and advanced fields", () => {
    const states = getDirectEditorResponsibility("states");

    expect(states.ownerSummary).toContain("Owns state identity");
    expect(
      getDirectEditorFieldsByScope("states", "owned").map((field) => field.id),
    ).toEqual([
      "name",
      "fullName",
      "form",
      "formName",
      "color",
      "population",
      "rural",
      "urban",
    ]);
    expect(
      getDirectEditorFieldsByScope("states", "related").map(
        (field) => field.id,
      ),
    ).toContain("capital");
    expect(
      getDirectEditorFieldsByScope("states", "related").map(
        (field) => field.id,
      ),
    ).toContain("neighbors");
    expect(
      getDirectEditorFieldsByScope("states", "readonly").map(
        (field) => field.id,
      ),
    ).toContain("diplomacyRecords");
  });

  it("defines the relationship-repair source editors explicitly", () => {
    expect(
      getDirectEditorFieldsByScope("burgs", "related").map((field) => field.id),
    ).toEqual(["state", "culture"]);
    expect(
      getDirectEditorFieldsByScope("provinces", "related").map(
        (field) => field.id,
      ),
    ).toEqual(["state", "burg"]);
  });

  it("defines identity and diplomacy ownership without cross-domain edits", () => {
    expect(
      getDirectEditorFieldsByScope("cultures", "owned").map(
        (field) => field.id,
      ),
    ).toEqual(["name", "form", "color"]);
    expect(
      getDirectEditorFieldsByScope("religions", "owned").map(
        (field) => field.id,
      ),
    ).toEqual(["name", "form", "color"]);
    expect(
      getDirectEditorFieldsByScope("diplomacy", "owned").map(
        (field) => field.id,
      ),
    ).toEqual(["relation"]);
    expect(
      getDirectEditorFieldsByScope("diplomacy", "related").map(
        (field) => field.id,
      ),
    ).toEqual(["subject", "object"]);
  });

  it("defines map overlay editors as scoped AGM workbenches", () => {
    expect(
      getDirectEditorFieldsByScope("routes", "owned").map((field) => field.id),
    ).toEqual(["group", "feature"]);
    expect(
      getDirectEditorFieldsByScope("zones", "owned").map((field) => field.id),
    ).toEqual(["name", "type", "color", "hidden"]);
    expect(
      getDirectEditorFieldsByScope("markers", "readonly").map(
        (field) => field.id,
      ),
    ).toEqual(["id", "cell", "coordinates", "iconPx"]);
    expect(
      getDirectEditorFieldsByScope("biomes", "owned").map((field) => field.id),
    ).toEqual(["habitability", "agmRuleWeight", "agmResourceTag"]);
  });
});
