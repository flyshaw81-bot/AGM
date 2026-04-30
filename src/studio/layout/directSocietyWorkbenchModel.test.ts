import { describe, expect, it } from "vitest";
import type { EngineEntitySummaryItem } from "../bridge/engineActions";
import {
  filterAndSortDirectSocietyItems,
  getActiveDirectSocietyItems,
  getDirectSocietyColor,
  selectDirectSocietyItem,
} from "./directSocietyWorkbenchModel";

const societyItems = [
  { id: 0, name: "" },
  {
    id: 2,
    name: "Forest Circle",
    form: "Circle",
    cells: 12,
    capital: 100,
    color: "#336644",
  },
  {
    id: 1,
    name: "Ash Rite",
    formName: "Rite",
    cells: 0,
    color: "bad-color",
  },
] satisfies EngineEntitySummaryItem[];

describe("native society workbench model", () => {
  it("filters inactive items and sorts by name", () => {
    const activeItems = getActiveDirectSocietyItems(societyItems);

    expect(activeItems.map((item) => item.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectSocietyItems(activeItems, "all", "").map(
        (item) => item.id,
      ),
    ).toEqual([1, 2]);
  });

  it("filters by population, center, and query", () => {
    const activeItems = getActiveDirectSocietyItems(societyItems);

    expect(
      filterAndSortDirectSocietyItems(activeItems, "populated", "").map(
        (item) => item.id,
      ),
    ).toEqual([2]);
    expect(
      filterAndSortDirectSocietyItems(activeItems, "has-center", "").map(
        (item) => item.id,
      ),
    ).toEqual([2]);
    expect(
      filterAndSortDirectSocietyItems(activeItems, "all", "rite").map(
        (item) => item.id,
      ),
    ).toEqual([1]);
  });

  it("selects fallback items and validates color", () => {
    const activeItems = getActiveDirectSocietyItems(societyItems);
    const filteredItems = filterAndSortDirectSocietyItems(
      activeItems,
      "all",
      "forest",
    );

    expect(selectDirectSocietyItem(filteredItems, activeItems, 2)?.id).toBe(2);
    expect(selectDirectSocietyItem(filteredItems, activeItems, 1)?.id).toBe(1);
    expect(getDirectSocietyColor(activeItems[0], "#000000")).toBe("#336644");
    expect(getDirectSocietyColor(activeItems[1], "#000000")).toBe("#000000");
  });
});
