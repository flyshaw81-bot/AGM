import { describe, expect, it } from "vitest";
import type {
  EngineEntitySummaryItem,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import { createDirectWorkbenchRelationshipIssues } from "./directWorkbenchRelationshipIssues";

const activeCultures = [
  { id: 1, name: "Northfolk" },
  { id: 2, name: "Southfolk" },
] satisfies EngineEntitySummaryItem[];

describe("native workbench relationship issues", () => {
  it("detects missing references and province-burg state mismatches", () => {
    const issues = createDirectWorkbenchRelationshipIssues({
      activeStates: [
        {
          id: 1,
          name: "Northwatch",
          culture: 99,
          capital: 88,
        },
        { id: 2, name: "Southport", culture: 2 },
      ],
      activeBurgs: [
        { id: 10, name: "Saltport", state: 99, culture: 1 },
        { id: 11, name: "Bridgehold", state: 2, culture: 2 },
      ],
      activeCultures,
      activeProvinces: [
        {
          id: 20,
          name: "North Coast",
          state: 1,
          burg: 11,
        },
      ] satisfies EngineProvinceSummaryItem[],
      language: "en",
    });

    expect(issues.map((issue) => issue.groupKey)).toEqual(
      expect.arrayContaining([
        "state-clear-culture",
        "state-clear-capital",
        "burg-clear-state",
        "province-sync-burg-state",
      ]),
    );
    expect(
      issues.find((issue) => issue.groupKey === "state-clear-culture")
        ?.repairTarget,
    ).toBe("#0");
    expect(
      issues.find((issue) => issue.groupKey === "province-sync-burg-state")
        ?.repairTarget,
    ).toBe("#2");
  });

  it("returns no issues for consistent relationships", () => {
    const issues = createDirectWorkbenchRelationshipIssues({
      activeStates: [{ id: 1, name: "Northwatch", culture: 1, capital: 10 }],
      activeBurgs: [{ id: 10, name: "Saltport", state: 1, culture: 1 }],
      activeCultures,
      activeProvinces: [{ id: 20, name: "North Coast", state: 1, burg: 10 }],
      language: "en",
    });

    expect(issues).toEqual([]);
  });
});
