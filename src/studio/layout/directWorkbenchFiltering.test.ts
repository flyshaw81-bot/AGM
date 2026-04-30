import { describe, expect, it } from "vitest";
import {
  matchesWorkbenchQuery,
  normalizeWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

describe("native workbench filtering helpers", () => {
  it("normalizes search input before matching", () => {
    expect(normalizeWorkbenchQuery("  NorthWatch  ")).toBe("northwatch");
  });

  it("matches against string and numeric values", () => {
    expect(matchesWorkbenchQuery("42", ["Northwatch", 42])).toBe(true);
    expect(matchesWorkbenchQuery("watch", ["Northwatch", 42])).toBe(true);
    expect(matchesWorkbenchQuery("missing", ["Northwatch", 42])).toBe(false);
  });

  it("selects visible items before falling back to active items", () => {
    const activeItems = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const filteredItems = [{ id: 2 }];

    expect(selectVisibleWorkbenchItem(filteredItems, activeItems, 2)?.id).toBe(
      2,
    );
    expect(selectVisibleWorkbenchItem(filteredItems, activeItems, 3)?.id).toBe(
      3,
    );
    expect(
      selectVisibleWorkbenchItem(filteredItems, activeItems, null)?.id,
    ).toBe(2);
  });
});
