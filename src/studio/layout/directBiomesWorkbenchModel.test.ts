import { describe, expect, it } from "vitest";
import type { EngineBiomeSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  filterAndSortDirectBiomes,
  getActiveDirectBiomes,
  getDirectBiomeColor,
  selectDirectBiome,
} from "./directBiomesWorkbenchModel";

const biomes = [
  { id: -1, name: "" },
  {
    id: 2,
    name: "Forest",
    habitability: 7,
    agmRuleWeight: 1.2,
    agmResourceTag: "timber",
    color: "#557744",
  },
  {
    id: 1,
    name: "Desert",
    habitability: 0,
    agmRuleWeight: 0.4,
    color: "broken",
  },
] satisfies EngineBiomeSummaryItem[];

function directEditor(
  overrides: Partial<StudioState["directEditor"]> = {},
): StudioState["directEditor"] {
  return {
    biomeFilterMode: "all",
    selectedBiomeId: null,
    biomeSearchQuery: "",
    ...overrides,
  } as StudioState["directEditor"];
}

describe("native biomes workbench model", () => {
  it("filters inactive biomes and sorts by name", () => {
    const activeBiomes = getActiveDirectBiomes(biomes);

    expect(activeBiomes.map((biome) => biome.id)).toEqual([2, 1]);
    expect(
      filterAndSortDirectBiomes(activeBiomes, directEditor(), "").map(
        (biome) => biome.id,
      ),
    ).toEqual([1, 2]);
  });

  it("filters by resource tags, habitability, and query", () => {
    const activeBiomes = getActiveDirectBiomes(biomes);

    expect(
      filterAndSortDirectBiomes(
        activeBiomes,
        directEditor({ biomeFilterMode: "resource-tagged" }),
        "",
      ).map((biome) => biome.id),
    ).toEqual([2]);
    expect(
      filterAndSortDirectBiomes(
        activeBiomes,
        directEditor({ biomeFilterMode: "habitable" }),
        "",
      ).map((biome) => biome.id),
    ).toEqual([2]);
    expect(
      filterAndSortDirectBiomes(activeBiomes, directEditor(), "timber").map(
        (biome) => biome.id,
      ),
    ).toEqual([2]);
  });

  it("selects fallback biomes and validates color", () => {
    const activeBiomes = getActiveDirectBiomes(biomes);
    const filteredBiomes = filterAndSortDirectBiomes(
      activeBiomes,
      directEditor(),
      "forest",
    );

    expect(selectDirectBiome(filteredBiomes, activeBiomes, 2)?.id).toBe(2);
    expect(selectDirectBiome(filteredBiomes, activeBiomes, 1)?.id).toBe(1);
    expect(getDirectBiomeColor(activeBiomes[0])).toBe("#557744");
    expect(getDirectBiomeColor(activeBiomes[1])).toBe("#7aa35a");
  });
});
