import { describe, expect, it } from "vitest";
import type { EngineWorldResourceSummary } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import { renderNativeModuleContractWorkbench } from "./nativeModuleContractWorkbench";

const worldResources: EngineWorldResourceSummary = {
  biomes: [],
  provinces: [],
  routes: [],
  zones: [],
  markers: [
    {
      id: 1,
      type: "volcano",
      cell: 12,
      pinned: true,
      hidden: false,
    },
  ],
  military: [
    {
      id: "1:1",
      regimentId: 1,
      stateId: 1,
      stateName: "North",
      name: "1st Guard",
      total: 1000,
      cell: 4,
    },
  ],
};

describe("nativeModuleContractWorkbench", () => {
  it("renders military as a read-only intelligence module", () => {
    const html = renderNativeModuleContractWorkbench(
      "military",
      worldResources,
      "en",
      {
        militarySearchQuery: "",
        militaryFilterMode: "all",
      } as StudioState["directEditor"],
    );

    expect(html).toContain('id="studioDirectMilitaryWorkbench"');
    expect(html).toContain('data-native-module-contract="military"');
    expect(html).toContain('data-military-readonly="true"');
    expect(html).toContain("Military intelligence");
    expect(html).toContain("Read-only intelligence");
    expect(html).toContain("Unit samples");
    expect(html).toContain('id="studioMilitarySearchInput"');
    expect(html).toContain('id="studioMilitaryFilterSelect"');
    expect(html).toContain("Not editable yet");
    expect(html).toContain("Writeback: not available");
    expect(html).not.toContain("studio-native-contract__hero-icon");
    expect(html).not.toContain('data-studio-action="direct-military-apply"');
  });
});
