import { describe, expect, it, vi } from "vitest";
import {
  AGM_DRAFT_STORAGE_KEY,
  importAgmRulesPackDraft,
  loadAgmDocumentDraft,
  parseAgmRulesPackDraft,
} from "./worldDocumentDraft";

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

  it("loads saved AGM drafts through injected storage targets", () => {
    const getStorageItem = vi.fn(() => null);

    expect(loadAgmDocumentDraft({ getStorageItem })).toBeNull();
    expect(getStorageItem).toHaveBeenCalledWith(AGM_DRAFT_STORAGE_KEY);
  });

  it("imports rules packs through injected file text targets", async () => {
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
    const file = new File(["ignored"], "rules.agm-rules.json");
    const readFileText = vi.fn(async () => JSON.stringify(rulesPack));

    await expect(
      importAgmRulesPackDraft(file, { readFileText }),
    ).resolves.toEqual(rulesPack);
    expect(readFileText).toHaveBeenCalledWith(file);
  });
});
