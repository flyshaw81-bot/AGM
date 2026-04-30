import type { StudioState } from "../types";

type DirectEditorState = StudioState["directEditor"];

export type DirectWorkbenchClearFilterPatches = {
  state: Pick<
    DirectEditorState,
    "stateSearchQuery" | "stateFilterMode" | "stateSortMode"
  >;
  burg: Pick<DirectEditorState, "burgSearchQuery" | "burgFilterMode">;
  culture: Pick<DirectEditorState, "cultureSearchQuery" | "cultureFilterMode">;
  religion: Pick<
    DirectEditorState,
    "religionSearchQuery" | "religionFilterMode"
  >;
  province: Pick<
    DirectEditorState,
    "provinceSearchQuery" | "provinceFilterMode"
  >;
  route: Pick<DirectEditorState, "routeSearchQuery" | "routeFilterMode">;
  zone: Pick<DirectEditorState, "zoneSearchQuery" | "zoneFilterMode">;
  diplomacy: Pick<
    DirectEditorState,
    "diplomacySearchQuery" | "diplomacyFilterMode"
  >;
  biome: Pick<DirectEditorState, "biomeSearchQuery" | "biomeFilterMode">;
};

export function createDirectWorkbenchClearFilterPatches(): DirectWorkbenchClearFilterPatches {
  return {
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
    diplomacy: { diplomacySearchQuery: "", diplomacyFilterMode: "all" },
    biome: { biomeSearchQuery: "", biomeFilterMode: "all" },
  };
}
