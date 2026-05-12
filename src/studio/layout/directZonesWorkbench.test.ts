import { describe, expect, it } from "vitest";
import type { EngineZoneSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import { renderDirectZonesWorkbench } from "./directZonesWorkbench";

const zones: EngineZoneSummaryItem[] = [
  {
    id: 4,
    name: "North trade zone",
    type: "trade",
    cellCount: 12,
    area: 340,
    population: 120,
    color: "#446688",
  },
];

const directEditor = {
  selectedZoneId: 4,
  zoneSearchQuery: "",
  zoneFilterMode: "all",
  lastAppliedZoneId: null,
} as StudioState["directEditor"];

describe("direct zones workbench", () => {
  it("renders zones as a native zone drawer with writeback hooks", () => {
    const html = renderDirectZonesWorkbench(zones, directEditor, "en");

    expect(html).toContain('data-native-zone-drawer="true"');
    expect(html).toContain("studio-direct-zone-editor");
    expect(html).toContain('data-native-zone-detail="true"');
    expect(html).toContain('id="studioZoneSearchInput"');
    expect(html).toContain('id="studioZoneNameInput"');
    expect(html).toContain('id="studioZoneColorInput"');
    expect(html).toContain('id="studioZoneHiddenSelect"');
    expect(html).toContain("studio-native-color-field");
    expect(html).not.toContain("studio-native-identity-detail__title-line");
    expect(html).not.toContain("studio-native-identity-field__color");
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).toContain("Core zone fields");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).toContain("studio-native-identity-detail__actions");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-zone-apply"');
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Zone drawer");
  });

  it("does not render an empty sticky action bar without a selected zone", () => {
    const html = renderDirectZonesWorkbench(
      [],
      {
        ...directEditor,
        selectedZoneId: null,
      } as StudioState["directEditor"],
      "en",
    );

    expect(html).toContain("No zone selected");
    expect(html).not.toContain("studio-native-identity-detail__actions");
  });
});
