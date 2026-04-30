import type {
  EngineEntitySummary,
  EngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioState } from "../types";
import { DIRECT_WORKBENCH_TARGETS } from "./directWorkbenchTargets";

type DirectEditorState = StudioState["directEditor"];
const EMPTY_VALUE = "—";

export type DirectWorkbenchDirectoryItem = {
  key: string;
  target: string;
  zh: string;
  en: string;
  count: number;
  selected: string;
  applied: string;
  filters: number;
};

const countActiveFilters = (...values: boolean[]) =>
  values.filter(Boolean).length;

const selectedValue = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === ""
    ? EMPTY_VALUE
    : `#${value}`;

export function createDirectWorkbenchDirectoryModel(
  entitySummary: EngineEntitySummary,
  worldResources: EngineWorldResourceSummary,
  directEditor: DirectEditorState,
  language: StudioLanguage,
) {
  const activeStates = entitySummary.states.filter(
    (state) => state.id > 0 && state.name && state.name !== "Neutrals",
  );
  const activeBurgs = entitySummary.burgs.filter(
    (burg) => burg.id > 0 && burg.name,
  );
  const activeCultures = entitySummary.cultures.filter(
    (culture) => culture.id > 0 && culture.name,
  );
  const activeReligions = entitySummary.religions.filter(
    (religion) => religion.id > 0 && religion.name,
  );
  const activeProvinces = worldResources.provinces.filter(
    (province) => province.id > 0 && province.name,
  );
  const activeRoutes = worldResources.routes.filter((route) => route.id > 0);
  const activeZones = worldResources.zones.filter(
    (zone) => zone.id >= 0 && zone.name,
  );
  const activeBiomes = worldResources.biomes.filter(
    (biome) => biome.id >= 0 && biome.name,
  );
  const diplomacySubject =
    activeStates.find(
      (state) => state.id === directEditor.selectedDiplomacySubjectId,
    ) || activeStates[0];
  const diplomacyObject =
    activeStates.find(
      (state) =>
        state.id === directEditor.selectedDiplomacyObjectId &&
        state.id !== diplomacySubject?.id,
    ) || activeStates.find((state) => state.id !== diplomacySubject?.id);
  const pairValue =
    diplomacySubject && diplomacyObject
      ? `#${diplomacySubject.id} - #${diplomacyObject.id}`
      : EMPTY_VALUE;
  const appliedPair = directEditor.lastAppliedDiplomacyPair
    ? directEditor.lastAppliedDiplomacyPair
        .replace(":", " - #")
        .replace(/^/, "#")
    : EMPTY_VALUE;
  const workbenches: DirectWorkbenchDirectoryItem[] = [
    {
      key: "states",
      target: DIRECT_WORKBENCH_TARGETS.states,
      zh: "国家",
      en: "States",
      count: activeStates.length,
      selected: selectedValue(
        directEditor.selectedStateId ?? activeStates[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedStateId),
      filters: countActiveFilters(
        Boolean(directEditor.stateSearchQuery.trim()),
        directEditor.stateFilterMode !== "all",
        directEditor.stateSortMode !== "name",
      ),
    },
    {
      key: "burgs",
      target: DIRECT_WORKBENCH_TARGETS.burgs,
      zh: "城镇",
      en: "Burgs",
      count: activeBurgs.length,
      selected: selectedValue(
        directEditor.selectedBurgId ?? activeBurgs[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedBurgId),
      filters: countActiveFilters(
        Boolean(directEditor.burgSearchQuery.trim()),
        directEditor.burgFilterMode !== "all",
      ),
    },
    {
      key: "cultures",
      target: DIRECT_WORKBENCH_TARGETS.cultures,
      zh: "文化",
      en: "Cultures",
      count: activeCultures.length,
      selected: selectedValue(
        directEditor.selectedCultureId ?? activeCultures[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedCultureId),
      filters: countActiveFilters(
        Boolean(directEditor.cultureSearchQuery.trim()),
        directEditor.cultureFilterMode !== "all",
      ),
    },
    {
      key: "religions",
      target: DIRECT_WORKBENCH_TARGETS.religions,
      zh: "宗教",
      en: "Religions",
      count: activeReligions.length,
      selected: selectedValue(
        directEditor.selectedReligionId ?? activeReligions[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedReligionId),
      filters: countActiveFilters(
        Boolean(directEditor.religionSearchQuery.trim()),
        directEditor.religionFilterMode !== "all",
      ),
    },
    {
      key: "provinces",
      target: DIRECT_WORKBENCH_TARGETS.provinces,
      zh: "省份",
      en: "Provinces",
      count: activeProvinces.length,
      selected: selectedValue(
        directEditor.selectedProvinceId ?? activeProvinces[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedProvinceId),
      filters: countActiveFilters(
        Boolean(directEditor.provinceSearchQuery.trim()),
        directEditor.provinceFilterMode !== "all",
      ),
    },
    {
      key: "routes",
      target: DIRECT_WORKBENCH_TARGETS.routes,
      zh: "路线",
      en: "Routes",
      count: activeRoutes.length,
      selected: selectedValue(
        directEditor.selectedRouteId ?? activeRoutes[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedRouteId),
      filters: countActiveFilters(
        Boolean(directEditor.routeSearchQuery.trim()),
        directEditor.routeFilterMode !== "all",
      ),
    },
    {
      key: "zones",
      target: DIRECT_WORKBENCH_TARGETS.zones,
      zh: "区域",
      en: "Zones",
      count: activeZones.length,
      selected: selectedValue(
        directEditor.selectedZoneId ?? activeZones[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedZoneId),
      filters: countActiveFilters(
        Boolean(directEditor.zoneSearchQuery.trim()),
        directEditor.zoneFilterMode !== "all",
      ),
    },
    {
      key: "diplomacy",
      target: DIRECT_WORKBENCH_TARGETS.diplomacy,
      zh: "外交",
      en: "Diplomacy",
      count: Math.max(0, activeStates.length - 1),
      selected: pairValue,
      applied: appliedPair,
      filters: countActiveFilters(
        Boolean(directEditor.diplomacySearchQuery.trim()),
        directEditor.diplomacyFilterMode !== "all",
      ),
    },
    {
      key: "biomes",
      target: DIRECT_WORKBENCH_TARGETS.biomes,
      zh: "生物群系 / 资源",
      en: "Biomes / Resources",
      count: activeBiomes.length,
      selected: selectedValue(
        directEditor.selectedBiomeId ?? activeBiomes[0]?.id,
      ),
      applied: selectedValue(directEditor.lastAppliedBiomeId),
      filters: countActiveFilters(
        Boolean(directEditor.biomeSearchQuery.trim()),
        directEditor.biomeFilterMode !== "all",
      ),
    },
  ];
  const totalActiveFilters = workbenches.reduce(
    (total, workbench) => total + workbench.filters,
    0,
  );
  const appliedWorkbenches = workbenches.filter(
    (workbench) => workbench.applied !== EMPTY_VALUE,
  );
  const firstAppliedWorkbench = appliedWorkbenches[0];
  const appliedSummary = appliedWorkbenches.length
    ? `${appliedWorkbenches.length} · ${language === "zh-CN" ? firstAppliedWorkbench.zh : firstAppliedWorkbench.en} ${firstAppliedWorkbench.applied}`
    : EMPTY_VALUE;

  return {
    activeBurgs,
    activeCultures,
    activeProvinces,
    activeStates,
    appliedSummary,
    firstAppliedWorkbench,
    totalActiveFilters,
    workbenches,
  };
}
