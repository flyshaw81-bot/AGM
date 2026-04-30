import { describe, expect, it } from "vitest";
import type { EngineProvinceSummaryItem } from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  filterAndSortDirectProvinces,
  getActiveDirectProvinces,
  getDirectProvinceColor,
  selectDirectProvince,
} from "./directProvincesWorkbenchModel";

const provinces = [
  { id: 0, name: "" },
  {
    id: 2,
    name: "Eastford",
    fullName: "County of Eastford",
    state: 1,
    burg: 10,
    type: "County",
    color: "#aabbcc",
  },
  {
    id: 1,
    name: "Northwatch",
    state: 2,
    type: "March",
    color: "broken",
  },
] satisfies EngineProvinceSummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    provinceFilterMode: "all",
    selectedProvinceId: null,
    selectedStateId: null,
    provinceSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

const getStateName = (stateId?: number) =>
  stateId === 1 ? "North Coast" : stateId === 2 ? "South Coast" : "-";
const getBurgName = (burgId?: number) =>
  burgId === 10 ? "Saltport" : burgId ? `#${burgId}` : "-";

describe("native provinces workbench model", () => {
  it("filters inactive provinces and sorts names", () => {
    const activeProvinces = getActiveDirectProvinces(provinces);

    expect(activeProvinces.map((province) => province.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectProvinces(
        activeProvinces,
        directEditor(),
        "",
        getStateName,
        getBurgName,
      ).map((province) => province.id),
    ).toEqual([2, 1]);
  });

  it("filters by selected state, burg presence, and query", () => {
    const activeProvinces = getActiveDirectProvinces(provinces);

    expect(
      filterAndSortDirectProvinces(
        activeProvinces,
        directEditor({
          provinceFilterMode: "selected-state",
          selectedStateId: 1,
        }),
        "",
        getStateName,
        getBurgName,
      ).map((province) => province.id),
    ).toEqual([2]);

    expect(
      filterAndSortDirectProvinces(
        activeProvinces,
        directEditor({ provinceFilterMode: "has-burg" }),
        "",
        getStateName,
        getBurgName,
      ).map((province) => province.id),
    ).toEqual([2]);

    expect(
      filterAndSortDirectProvinces(
        activeProvinces,
        directEditor(),
        "saltport",
        getStateName,
        getBurgName,
      ).map((province) => province.id),
    ).toEqual([2]);
  });

  it("selects fallback provinces and validates color", () => {
    const activeProvinces = getActiveDirectProvinces(provinces);
    const filteredProvinces = filterAndSortDirectProvinces(
      activeProvinces,
      directEditor(),
      "east",
      getStateName,
      getBurgName,
    );

    expect(
      selectDirectProvince(filteredProvinces, activeProvinces, 2)?.id,
    ).toBe(2);
    expect(
      selectDirectProvince(filteredProvinces, activeProvinces, 1)?.id,
    ).toBe(1);
    expect(getDirectProvinceColor(activeProvinces[0])).toBe("#aabbcc");
    expect(getDirectProvinceColor(activeProvinces[1])).toBe("#8fbf7a");
  });
});
