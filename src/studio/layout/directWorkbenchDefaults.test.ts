import { describe, expect, it } from "vitest";
import { createDirectWorkbenchClearFilterPatches } from "./directWorkbenchDefaults";

describe("directWorkbenchDefaults", () => {
  it("resets every native workbench filter to its default list state", () => {
    expect(createDirectWorkbenchClearFilterPatches()).toEqual({
      state: {
        stateSearchQuery: "",
        stateFilterMode: "all",
        stateSortMode: "name",
      },
      burg: { burgSearchQuery: "", burgFilterMode: "all" },
      culture: { cultureSearchQuery: "", cultureFilterMode: "all" },
      religion: { religionSearchQuery: "", religionFilterMode: "all" },
      province: { provinceSearchQuery: "", provinceFilterMode: "all" },
      route: { routeSearchQuery: "", routeFilterMode: "all" },
      zone: { zoneSearchQuery: "", zoneFilterMode: "all" },
      marker: { markerSearchQuery: "", markerFilterMode: "all" },
      diplomacy: { diplomacySearchQuery: "", diplomacyFilterMode: "all" },
      biome: { biomeSearchQuery: "", biomeFilterMode: "all" },
    });
  });
});
