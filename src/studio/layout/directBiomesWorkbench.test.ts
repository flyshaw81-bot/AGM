import { describe, expect, it } from "vitest";
import type { EngineBiomeSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import { renderDirectBiomesWorkbench } from "./directBiomesWorkbench";

const biomes: EngineBiomeSummaryItem[] = [
  {
    id: 2,
    name: "Temperate forest",
    color: "#557744",
    habitability: 80,
    movementCost: 2,
    iconDensity: 4,
    agmRuleWeight: 1.4,
    agmResourceTag: "timber",
  },
];

const directEditor = {
  selectedBiomeId: 2,
  biomeSearchQuery: "",
  biomeFilterMode: "all",
  lastAppliedBiomeId: null,
} as StudioState["directEditor"];

describe("direct biomes workbench", () => {
  it("renders biomes as a native AGM resource drawer with scoped fields", () => {
    const html = renderDirectBiomesWorkbench(biomes, directEditor, "en");

    expect(html).toContain('data-native-biome-drawer="true"');
    expect(html).toContain("studio-direct-biome-editor");
    expect(html).toContain('data-native-biome-detail="true"');
    expect(html).toContain('data-studio-biome-insights="true"');
    expect(html).toContain('id="studioBiomeSearchInput"');
    expect(html).toContain('id="studioBiomeHabitabilityInput"');
    expect(html).toContain('id="studioBiomeRuleWeightInput"');
    expect(html).toContain('id="studioBiomeResourceTagSelect"');
    expect(html).not.toContain("studio-native-identity-detail__title-line");
    expect(html).toContain('data-editor-scope="owned"');
    expect(html).toContain('data-editor-scope="readonly"');
    expect(html).toContain("AGM resource rules");
    expect(html).toContain("Biome coverage appears after a map is generated.");
    expect(html).toContain("studio-native-identity-detail__advanced-title");
    expect(html).toContain("studio-native-identity-detail__actions");
    expect(html).not.toContain(
      '<details class="studio-native-identity-detail__advanced"',
    );
    expect(html).not.toContain("<summary>");
    expect(html).toContain('data-studio-action="direct-biome-apply"');
    expect(html).not.toContain('data-studio-action="balance-focus"');
    expect(html).not.toContain("studio-direct-editor__header");
    expect(html).not.toContain("Resource drawer");
  });

  it("does not render an empty sticky action bar without a selected biome", () => {
    const html = renderDirectBiomesWorkbench(
      [],
      {
        ...directEditor,
        selectedBiomeId: null,
      } as StudioState["directEditor"],
      "en",
    );

    expect(html).toContain("No biome selected");
    expect(html).not.toContain("studio-native-identity-detail__actions");
  });
});
