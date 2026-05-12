import { describe, expect, it } from "vitest";
import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderDirectDiplomacyWorkbench } from "./directDiplomacyWorkbench";

const entitySummary: EngineEntitySummary = {
  states: [
    {
      id: 1,
      name: "Northwatch",
      color: "#446688",
      diplomacy: [],
    },
    {
      id: 2,
      name: "Grey River",
      color: "#886644",
    },
  ],
  burgs: [],
  cultures: [],
  religions: [],
};

entitySummary.states[0].diplomacy = [];
entitySummary.states[0].diplomacy[2] = "Enemy";

const directEditor = {
  selectedDiplomacySubjectId: 1,
  selectedDiplomacyObjectId: 2,
  diplomacySearchQuery: "",
  diplomacyFilterMode: "all",
  lastAppliedDiplomacyPair: null,
} as StudioState["directEditor"];

const worldResources: EngineWorldResourceSummary = {
  biomes: [],
  provinces: [],
  routes: [],
  zones: [],
  markers: [],
  military: [
    {
      id: "1-1",
      regimentId: 1,
      stateId: 1,
      stateName: "Northwatch",
      name: "Northwatch Guard",
      type: "Infantry",
      total: 1200,
      cell: 44,
    },
    {
      id: "2-1",
      regimentId: 1,
      stateId: 2,
      stateName: "Grey River",
      name: "Grey River Fleet",
      type: "Fleet",
      total: 900,
      naval: true,
    },
  ],
};

describe("direct diplomacy workbench", () => {
  it("renders diplomacy as a native relation drawer with writeback hooks", () => {
    const html = renderDirectDiplomacyWorkbench(
      entitySummary,
      worldResources,
      directEditor,
      "en",
    );

    expect(html).toContain('data-native-diplomacy-drawer="true"');
    expect(html).toContain("studio-direct-diplomacy-editor");
    expect(html).toContain('data-native-diplomacy-detail="true"');
    expect(html).toContain('id="studioDiplomacySubjectSelect"');
    expect(html).toContain('id="studioDiplomacySearchInput"');
    expect(html).toContain('id="studioDiplomacyRelationSelect"');
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).not.toContain('data-editor-scope="related"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).not.toContain('data-studio-action="direct-workbench-jump"');
    expect(html).not.toContain(
      'data-workbench-target="studioDirectMilitaryWorkbench"',
    );
    expect(html).not.toContain("Open military intelligence");
    expect(html).toContain("Military intelligence");
    expect(html).toContain("Northwatch Guard");
    expect(html).toContain("Grey River Fleet");
    expect(html).toContain("Subject advantage");
    expect(html).not.toContain("Open subject state");
    expect(html).not.toContain("Open object state");
    expect(html).not.toContain("Related states");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).not.toContain('data-studio-action="direct-state-open"');
    expect(html).toContain('data-studio-action="direct-diplomacy-apply"');
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Relation drawer");
  });
});
