import { describe, expect, it } from "vitest";
import type { EngineEntitySummary } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderDirectCulturesWorkbench } from "./directCulturesWorkbench";
import { renderDirectReligionsWorkbench } from "./directReligionsWorkbench";

const entitySummary: EngineEntitySummary = {
  states: [],
  burgs: [],
  cultures: [
    {
      id: 1,
      name: "Highland",
      form: "Heritage",
      cells: 14,
      capital: 8,
      color: "#b38a58",
    },
  ],
  religions: [
    {
      id: 2,
      name: "Old Faith",
      formName: "Faith",
      cells: 9,
      capital: 4,
      color: "#8d70c9",
    },
  ],
};

const directEditor = {
  selectedCultureId: 1,
  cultureSearchQuery: "",
  cultureFilterMode: "all",
  lastAppliedCultureId: null,
  selectedReligionId: 2,
  religionSearchQuery: "",
  religionFilterMode: "all",
  lastAppliedReligionId: null,
} as StudioState["directEditor"];

describe("direct identity workbenches", () => {
  it("renders cultures as a native identity drawer with writeback hooks", () => {
    const html = renderDirectCulturesWorkbench(
      entitySummary,
      directEditor,
      "en",
    );

    expect(html).toContain('data-native-identity-drawer="cultures"');
    expect(html).toContain('id="studioCultureSearchInput"');
    expect(html).toContain('id="studioCultureNameInput"');
    expect(html).toContain('id="studioCultureColorInput"');
    expect(html).toContain("studio-native-color-field");
    expect(html).not.toContain("studio-native-identity-detail__title-line");
    expect(html).not.toContain("studio-native-identity-field__color");
    expect(html).not.toContain("Selected");
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).toContain("Core culture fields");
    expect(html).toContain("Coverage info");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-culture-apply"');
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Entity drawer");
  });

  it("renders religions as a native identity drawer with writeback hooks", () => {
    const html = renderDirectReligionsWorkbench(
      entitySummary,
      directEditor,
      "en",
    );

    expect(html).toContain('data-native-identity-drawer="religions"');
    expect(html).toContain('id="studioReligionSearchInput"');
    expect(html).toContain('id="studioReligionNameInput"');
    expect(html).toContain('id="studioReligionColorInput"');
    expect(html).toContain("studio-native-color-field");
    expect(html).not.toContain("studio-native-identity-detail__title-line");
    expect(html).not.toContain("studio-native-identity-field__color");
    expect(html).not.toContain("Selected");
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).toContain("Core religion fields");
    expect(html).toContain("Coverage info");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-religion-apply"');
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Entity drawer");
  });
});
