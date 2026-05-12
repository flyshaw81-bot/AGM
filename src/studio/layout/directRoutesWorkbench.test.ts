import { describe, expect, it } from "vitest";
import type { EngineRouteSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import { renderDirectRoutesWorkbench } from "./directRoutesWorkbench";

const routes: EngineRouteSummaryItem[] = [
  {
    id: 7,
    group: "Royal road",
    feature: 14,
    pointCount: 6,
    startCell: 101,
  },
];

const directEditor = {
  selectedRouteId: 7,
  routeSearchQuery: "",
  routeFilterMode: "all",
  lastAppliedRouteId: null,
} as StudioState["directEditor"];

describe("direct routes workbench", () => {
  it("renders routes as a native route drawer with writeback hooks", () => {
    const html = renderDirectRoutesWorkbench(routes, directEditor, "en");

    expect(html).toContain('data-native-route-drawer="true"');
    expect(html).toContain("studio-direct-route-editor");
    expect(html).toContain('data-native-route-detail="true"');
    expect(html).toContain('id="studioRouteSearchInput"');
    expect(html).toContain('id="studioRouteGroupInput"');
    expect(html).toContain('id="studioRouteFeatureInput"');
    expect(html).not.toContain("studio-native-identity-detail__title-line");
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).toContain("Core route fields");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).toContain("studio-native-identity-detail__actions");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-route-apply"');
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Transport drawer");
  });

  it("does not render an empty sticky action bar without a selected route", () => {
    const html = renderDirectRoutesWorkbench(
      [],
      {
        ...directEditor,
        selectedRouteId: null,
      } as StudioState["directEditor"],
      "en",
    );

    expect(html).toContain("No route selected");
    expect(html).not.toContain("studio-native-identity-detail__actions");
  });
});
