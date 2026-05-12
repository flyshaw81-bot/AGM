import { describe, expect, it } from "vitest";
import type { EngineMarkerSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import { renderDirectMarkersWorkbench } from "./directMarkersWorkbench";

const markers: EngineMarkerSummaryItem[] = [
  {
    id: 4,
    type: "ruins",
    icon: "R",
    cell: 12,
    x: 100,
    y: 200,
    size: 30,
    pinned: true,
    locked: false,
  },
];

const directEditor = {
  selectedMarkerId: 4,
  markerSearchQuery: "",
  markerFilterMode: "all",
  lastAppliedMarkerId: null,
} as StudioState["directEditor"];

describe("direct markers workbench", () => {
  it("renders markers as a native editable drawer with writeback hooks", () => {
    const html = renderDirectMarkersWorkbench(markers, directEditor, "en");

    expect(html).toContain('data-native-marker-drawer="true"');
    expect(html).toContain("studio-direct-marker-editor");
    expect(html).toContain('data-native-marker-detail="true"');
    expect(html).toContain('id="studioMarkerSearchInput"');
    expect(html).toContain('id="studioMarkerTypeInput"');
    expect(html).toContain('id="studioMarkerIconInput"');
    expect(html).toContain('id="studioMarkerPinnedSelect"');
    expect(html).not.toContain("studio-native-identity-detail__title-line");
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).toContain("Core marker fields");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).toContain("studio-native-identity-detail__actions");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-marker-apply"');
    expect(html).not.toContain('data-native-module-contract="markers"');
    expect(html).not.toContain("Marker drawer");
  });

  it("does not render an empty sticky action bar without a selected marker", () => {
    const html = renderDirectMarkersWorkbench(
      [],
      {
        ...directEditor,
        selectedMarkerId: null,
      } as StudioState["directEditor"],
      "en",
    );

    expect(html).toContain("No marker selected");
    expect(html).not.toContain("studio-native-identity-detail__actions");
  });
});
