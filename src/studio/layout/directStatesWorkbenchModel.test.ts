import { describe, expect, it } from "vitest";
import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  filterAndSortDirectStates,
  formatStateArea,
  formatStatePopulation,
  getActiveDirectStates,
  getNativeStateColor,
  getNativeStateTotalPopulation,
  selectDirectState,
} from "./directStatesWorkbenchModel";

const states = [
  { id: 0, name: "Neutrals" },
  {
    id: 1,
    name: "Northwatch",
    fullName: "Kingdom of Northwatch",
    form: "Monarchy",
    culture: 7,
    population: 1250000,
    area: 4500,
    neighbors: [2],
    color: "#3366aa",
  },
  {
    id: 2,
    name: "Southport",
    formName: "League",
    culture: 3,
    population: 300000,
    area: 9000,
    neighbors: [],
    color: "not-a-color",
  },
] satisfies EngineEntitySummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    stateFilterMode: "all",
    stateSortMode: "name",
    selectedStateId: null,
    stateSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

describe("native states workbench model", () => {
  it("filters inactive states and computes summaries", () => {
    const activeStates = getActiveDirectStates(states);

    expect(activeStates.map((state) => state.id)).toEqual([1, 2]);
    expect(getNativeStateTotalPopulation(activeStates)).toBe(1550000);
    expect(formatStatePopulation(1250000)).toBe("1.3M");
    expect(formatStatePopulation(12000)).toBe("12K");
    expect(formatStateArea(4500)).toBe("4500 km²");
  });

  it("filters by query and state mode before sorting", () => {
    const activeStates = getActiveDirectStates(states);

    expect(
      filterAndSortDirectStates(
        activeStates,
        directEditor({ stateFilterMode: "neighbors" }),
        "",
      ).map((state) => state.id),
    ).toEqual([1]);

    expect(
      filterAndSortDirectStates(
        activeStates,
        directEditor({ stateSortMode: "area" }),
        "",
      ).map((state) => state.id),
    ).toEqual([2, 1]);

    expect(
      filterAndSortDirectStates(activeStates, directEditor(), "league").map(
        (state) => state.id,
      ),
    ).toEqual([2]);
  });

  it("selects visible states and sanitizes invalid colors", () => {
    const activeStates = getActiveDirectStates(states);
    const filteredStates = filterAndSortDirectStates(
      activeStates,
      directEditor(),
      "north",
    );

    expect(selectDirectState(filteredStates, activeStates, 1)?.id).toBe(1);
    expect(selectDirectState(filteredStates, activeStates, 2)?.id).toBe(2);
    expect(getNativeStateColor(activeStates[0])).toBe("#3366aa");
    expect(getNativeStateColor(activeStates[1])).toBe("var(--studio-accent)");
  });
});
