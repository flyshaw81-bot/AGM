import { describe, expect, it } from "vitest";
import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import {
  filterDirectDiplomacyRelations,
  getActiveDirectDiplomacyStates,
  getDirectDiplomacyPairKey,
  getDirectDiplomacyRelation,
  selectDirectDiplomacyObject,
  selectDirectDiplomacySubject,
} from "./directDiplomacyWorkbenchModel";

const states: EngineEntitySummaryItem[] = [
  { id: 0, name: "Neutrals" },
  { id: 1, name: "Northwatch", diplomacy: [] },
  { id: 2, name: "Grey River" },
  { id: 3, name: "Saltport" },
  { id: 4, name: "Eastford" },
];

states[1].diplomacy = [];
states[1].diplomacy[2] = "Enemy";
states[1].diplomacy[3] = "Ally";

describe("directDiplomacyWorkbenchModel", () => {
  it("selects active subject and object without choosing neutrals", () => {
    const activeStates = getActiveDirectDiplomacyStates(states);
    const subject = selectDirectDiplomacySubject(activeStates, 99);
    const object = selectDirectDiplomacyObject(activeStates, subject, 1);

    expect(activeStates.map((state) => state.id)).toEqual([1, 2, 3, 4]);
    expect(subject?.id).toBe(1);
    expect(object?.id).toBe(2);
  });

  it("filters relation rows by conflict, positive and search query", () => {
    const activeStates = getActiveDirectDiplomacyStates(states);
    const subject = selectDirectDiplomacySubject(activeStates, 1);

    expect(
      filterDirectDiplomacyRelations(activeStates, subject, "conflict", "").map(
        (state) => state.id,
      ),
    ).toEqual([2]);
    expect(
      filterDirectDiplomacyRelations(activeStates, subject, "positive", "").map(
        (state) => state.id,
      ),
    ).toEqual([3]);
    expect(
      filterDirectDiplomacyRelations(activeStates, subject, "all", "east").map(
        (state) => state.id,
      ),
    ).toEqual([4]);
  });

  it("returns neutral fallback relation and stable pair key", () => {
    const activeStates = getActiveDirectDiplomacyStates(states);
    const subject = selectDirectDiplomacySubject(activeStates, 1);
    const object = selectDirectDiplomacyObject(activeStates, subject, 4);

    expect(getDirectDiplomacyRelation(subject, object)).toBe("Neutral");
    expect(getDirectDiplomacyPairKey(subject, object)).toBe("1:4");
  });
});
