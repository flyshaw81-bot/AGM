import type { EngineBiomeSummaryItem } from "../bridge/engineActionTypes";
import type { StudioState } from "../types";
import {
  matchesWorkbenchQuery,
  selectVisibleWorkbenchItem,
} from "./directWorkbenchFiltering";

export function getActiveDirectBiomes(
  biomes: readonly EngineBiomeSummaryItem[],
) {
  return biomes.filter((biome) => biome.id >= 0 && biome.name);
}

export function filterAndSortDirectBiomes(
  activeBiomes: readonly EngineBiomeSummaryItem[],
  directEditor: StudioState["directEditor"],
  query: string,
) {
  return [...activeBiomes]
    .filter((biome) => {
      if (
        directEditor.biomeFilterMode === "resource-tagged" &&
        !biome.agmResourceTag
      ) {
        return false;
      }
      if (
        directEditor.biomeFilterMode === "habitable" &&
        !(typeof biome.habitability === "number" && biome.habitability > 0)
      ) {
        return false;
      }
      return matchesWorkbenchQuery(query, [
        biome.name,
        String(biome.id),
        String(biome.habitability ?? ""),
        String(biome.agmRuleWeight ?? ""),
        biome.agmResourceTag,
      ]);
    })
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.id - right.id,
    );
}

export function selectDirectBiome(
  filteredBiomes: EngineBiomeSummaryItem[],
  activeBiomes: EngineBiomeSummaryItem[],
  selectedBiomeId: number | null,
) {
  return selectVisibleWorkbenchItem(
    filteredBiomes,
    activeBiomes,
    selectedBiomeId,
  );
}

export function getDirectBiomeColor(
  selectedBiome: EngineBiomeSummaryItem | undefined,
) {
  return selectedBiome?.color && /^#[0-9a-f]{6}$/i.test(selectedBiome.color)
    ? selectedBiome.color
    : "#7aa35a";
}
