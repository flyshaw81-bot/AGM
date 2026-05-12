import { describe, expect, it } from "vitest";
import type { EngineEntitySummary } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderDirectStatesWorkbench } from "./directStatesWorkbench";

const entitySummary: EngineEntitySummary = {
  states: [
    { id: 0, name: "Neutrals" },
    {
      id: 1,
      name: "Northwatch",
      fullName: "Kingdom of Northwatch",
      form: "Monarchy",
      formName: "Kingdom",
      culture: 2,
      capital: 3,
      population: 1250000,
      rural: 900000,
      urban: 350000,
      cells: 42,
      area: 12000,
      neighbors: [4],
      diplomacy: ["Ally"],
      color: "#3366aa",
    },
  ],
  burgs: [{ id: 3, name: "Highgate", state: 1 }],
  cultures: [{ id: 2, name: "Highland" }],
  religions: [],
};

const directEditor = {
  selectedStateId: 1,
  stateSearchQuery: "",
  stateSortMode: "name",
  stateFilterMode: "all",
  lastAppliedStateId: null,
} as StudioState["directEditor"];

describe("direct states workbench view", () => {
  it("renders the native states drawer with preserved writeback hooks", () => {
    const html = renderDirectStatesWorkbench(entitySummary, directEditor, "en");

    expect(html).toContain('data-native-states-drawer="true"');
    expect(html).toContain('data-native-states-toolbar="true"');
    expect(html).toContain('id="studioStateSearchInput"');
    expect(html).toContain("studio-native-states__select--filter");
    expect(html).toContain("studio-native-states__select--compat-sort");
    expect(html).toContain('id="studioStateNameInput"');
    expect(html).toContain('id="studioStateColorInput"');
    expect(html).toContain("studio-native-color-field");
    expect(html).toContain('id="studioStateCultureInput"');
    expect(html).toContain("Diplomacy records");
    expect(html).not.toContain('id="studioStateDiplomacyInput"');
    expect(html).not.toContain("One diplomacy record per line");
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="related"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).not.toContain('data-editor-scope="advanced"');
    expect(html).not.toContain("Selected");
    expect(html).toContain("State identity");
    expect(html).not.toContain("<details");
    expect(html).not.toContain("<summary>");
    expect(html).not.toContain("Government and population");
    expect(html).not.toContain("Assignment and capital");
    expect(html).not.toContain("Map metrics");
    expect(html).not.toContain("Diplomacy and borders");
    expect(html).not.toContain("studio-native-state-detail__top-actions");
    expect(html).not.toContain("studio-native-state-detail__title-line");
    expect(html.indexOf("State ID")).toBeLessThan(
      html.indexOf("State identity"),
    );
    expect(html).toContain('data-studio-action="direct-state-apply"');
    expect(html).not.toContain('data-studio-action="direct-culture-open"');
    expect(html).not.toContain(
      'data-studio-action="direct-diplomacy-open-state"',
    );
    expect(html).toContain('data-state-id="1"');
  });

  it("uses the native drawer structure instead of the old direct editor header", () => {
    const html = renderDirectStatesWorkbench(entitySummary, directEditor, "en");

    expect(html).toContain("studio-native-states__list");
    expect(html.indexOf("studio-native-states__toolbar")).toBeLessThan(
      html.indexOf("studio-native-states__list"),
    );
    expect(html).toContain("studio-native-state-detail__form");
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Entity drawer");
  });

  it("uses the compact Chinese label for the state filter control", () => {
    const html = renderDirectStatesWorkbench(
      entitySummary,
      directEditor,
      "zh-CN",
    );

    expect(html).toContain('id="studioStateFilterSelect"');
    expect(html).toContain("<span>筛选</span>");
    expect(html).not.toContain("筛选 Filter");
  });
});
