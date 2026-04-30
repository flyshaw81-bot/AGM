import { describe, expect, it } from "vitest";
import type { EngineEntitySummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  filterAndSortDirectBurgs,
  getActiveDirectBurgs,
  selectDirectBurg,
} from "./directBurgsWorkbenchModel";

const burgs = [
  { id: 0, name: "" },
  {
    id: 2,
    name: "Saltport",
    type: "Port",
    state: 1,
    culture: 4,
    population: 12000,
  },
  {
    id: 1,
    name: "Ashford",
    type: "Town",
    state: 2,
    culture: 7,
    population: 0,
  },
] satisfies EngineEntitySummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    burgFilterMode: "all",
    selectedBurgId: null,
    selectedStateId: null,
    burgSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

const getStateName = (stateId?: number) =>
  stateId === 1 ? "North Coast" : stateId === 2 ? "South Coast" : "-";
const getCultureName = (cultureId?: number) =>
  cultureId === 4 ? "Mariner" : cultureId === 7 ? "Highland" : "-";

describe("native burgs workbench model", () => {
  it("filters inactive burgs and sorts by name", () => {
    const activeBurgs = getActiveDirectBurgs(burgs);

    expect(activeBurgs.map((burg) => burg.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectBurgs(
        activeBurgs,
        directEditor(),
        "",
        getStateName,
        getCultureName,
      ).map((burg) => burg.id),
    ).toEqual([1, 2]);
  });

  it("filters by selected state, population, and query", () => {
    const activeBurgs = getActiveDirectBurgs(burgs);

    expect(
      filterAndSortDirectBurgs(
        activeBurgs,
        directEditor({ burgFilterMode: "selected-state", selectedStateId: 1 }),
        "",
        getStateName,
        getCultureName,
      ).map((burg) => burg.id),
    ).toEqual([2]);

    expect(
      filterAndSortDirectBurgs(
        activeBurgs,
        directEditor({ burgFilterMode: "populated" }),
        "",
        getStateName,
        getCultureName,
      ).map((burg) => burg.id),
    ).toEqual([2]);

    expect(
      filterAndSortDirectBurgs(
        activeBurgs,
        directEditor(),
        "mariner",
        getStateName,
        getCultureName,
      ).map((burg) => burg.id),
    ).toEqual([2]);
  });

  it("selects visible burgs before falling back to active burgs", () => {
    const activeBurgs = getActiveDirectBurgs(burgs);
    const filteredBurgs = filterAndSortDirectBurgs(
      activeBurgs,
      directEditor(),
      "salt",
      getStateName,
      getCultureName,
    );

    expect(selectDirectBurg(filteredBurgs, activeBurgs, 2)?.id).toBe(2);
    expect(selectDirectBurg(filteredBurgs, activeBurgs, 1)?.id).toBe(1);
    expect(selectDirectBurg(filteredBurgs, activeBurgs, null)?.id).toBe(2);
  });
});
