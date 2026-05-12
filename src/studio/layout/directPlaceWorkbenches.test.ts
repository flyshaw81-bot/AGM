import { describe, expect, it } from "vitest";
import type {
  EngineEntitySummary,
  EngineProvinceSummaryItem,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderDirectBurgsWorkbench } from "./directBurgsWorkbench";
import { renderDirectProvincesWorkbench } from "./directProvincesWorkbench";

const entitySummary: EngineEntitySummary = {
  states: [
    {
      id: 1,
      name: "Northreach",
      type: "Kingdom",
      color: "#8aa6d8",
    },
  ],
  burgs: [
    {
      id: 10,
      name: "Frostgate",
      type: "Capital",
      state: 1,
      culture: 3,
      population: 4200,
    },
  ],
  cultures: [
    {
      id: 3,
      name: "Highland",
    },
  ],
  religions: [],
};

const provinces: EngineProvinceSummaryItem[] = [
  {
    id: 20,
    name: "Frostmark",
    fullName: "Province of Frostmark",
    type: "Crown land",
    state: 1,
    burg: 10,
    center: 144,
    color: "#6fa36f",
  },
];

const directEditor = {
  selectedBurgId: 10,
  burgSearchQuery: "",
  burgFilterMode: "all",
  lastAppliedBurgId: null,
  selectedProvinceId: 20,
  provinceSearchQuery: "",
  provinceFilterMode: "all",
  lastAppliedProvinceId: null,
} as StudioState["directEditor"];

describe("direct place workbenches", () => {
  it("renders burgs as a native place drawer with writeback hooks", () => {
    const html = renderDirectBurgsWorkbench(entitySummary, directEditor, "en");

    expect(html).toContain('data-native-place-drawer="burgs"');
    expect(html).toContain('data-native-place-detail="burg"');
    expect(html).toContain('data-direct-workbench-toolbar="true"');
    expect(html).toContain('id="studioBurgSearchInput"');
    expect(html).toContain('id="studioBurgFilterSelect"');
    expect(html).toContain('id="studioBurgNameInput"');
    expect(html).not.toContain("studio-native-identity__count");
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="related"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).not.toContain("studio-native-identity-detail__top-actions");
    expect(html).toContain("Technical info");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-burg-apply"');
    expect(html).not.toContain('data-studio-action="direct-state-open"');
    expect(html).not.toContain('data-studio-action="direct-culture-open"');
    expect(html.indexOf("State assignment")).toBeGreaterThan(
      html.indexOf("Core town fields"),
    );
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Entity drawer");
  });

  it("renders provinces as a native place drawer with writeback hooks", () => {
    const html = renderDirectProvincesWorkbench(
      provinces,
      entitySummary,
      directEditor,
      "en",
    );

    expect(html).toContain('data-native-place-drawer="provinces"');
    expect(html).toContain('data-native-place-detail="province"');
    expect(html).toContain('id="studioProvinceSearchInput"');
    expect(html).toContain('id="studioProvinceNameInput"');
    expect(html).toContain('id="studioProvinceColorInput"');
    expect(html).toContain("studio-native-color-field");
    expect(html).not.toContain("studio-native-identity-field__color");
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="related"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).not.toContain("studio-native-identity-detail__top-actions");
    expect(html).toContain("Technical info");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-province-apply"');
    expect(html).not.toContain('data-studio-action="direct-state-open"');
    expect(html).not.toContain('data-studio-action="direct-burg-select"');
    expect(html.indexOf("State assignment")).toBeGreaterThan(
      html.indexOf("Core province fields"),
    );
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Entity drawer");
  });
});
