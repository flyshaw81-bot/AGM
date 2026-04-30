import { describe, expect, it, vi } from "vitest";
import { parseAgmRulesPackDraft } from "./worldDocumentDraft";

describe("world document draft imports", () => {
  it("accepts a valid AGM rules pack", () => {
    const rulesPack = {
      schema: "agm.rules.v0",
      version: 1,
      source: "agm-biome-summary",
      biomeRules: [],
      resourceTags: [],
      provinceStructure: [],
      resourceRules: [],
      profileRules: {
        profile: "rpg",
        profileLabel: "RPG world",
        priorities: [],
        sourceFields: [],
      },
      weights: {
        defaultRuleWeight: 1,
        ruleWeightRange: { min: 0, max: 5 },
        sourceFields: [],
      },
    };

    expect(parseAgmRulesPackDraft(JSON.stringify(rulesPack))).toEqual(
      rulesPack,
    );
  });

  it("rejects malformed rules packs", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(parseAgmRulesPackDraft("{")).toBeNull();
      expect(
        parseAgmRulesPackDraft(
          JSON.stringify({
            schema: "agm.rules.v0",
            version: 2,
            source: "agm-biome-summary",
          }),
        ),
      ).toBeNull();
    } finally {
      warnSpy.mockRestore();
    }
  });
});
