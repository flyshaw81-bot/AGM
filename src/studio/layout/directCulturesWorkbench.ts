import type { EngineEntitySummary } from "../bridge/engineActions";
import type {
  DirectCultureFilterMode,
  StudioLanguage,
  StudioState,
} from "../types";
import {
  filterAndSortDirectSocietyItems,
  getActiveDirectSocietyItems,
  getDirectSocietyColor,
  selectDirectSocietyItem,
} from "./directSocietyWorkbenchModel";
import { renderNativeSocietyWorkbench } from "./directSocietyWorkbenchView";
import { normalizeWorkbenchQuery } from "./directWorkbenchFiltering";
import { getDirectWorkbenchEditStatus } from "./directWorkbenchShared";
import { t } from "./shellShared";

export function renderDirectCulturesWorkbench(
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeCultures = getActiveDirectSocietyItems(entitySummary.cultures);
  const query = normalizeWorkbenchQuery(directEditor.cultureSearchQuery);
  const filteredCultures = filterAndSortDirectSocietyItems(
    activeCultures,
    directEditor.cultureFilterMode,
    query,
  );
  const selectedCulture = selectDirectSocietyItem(
    filteredCultures,
    activeCultures,
    directEditor.selectedCultureId,
  );
  const selectedColor = getDirectSocietyColor(selectedCulture, "#b38a58");
  const cultureStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedCulture &&
        directEditor.lastAppliedCultureId === selectedCulture.id,
    ),
  );
  const filterOptions: { value: DirectCultureFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部文化", "All cultures") },
    { value: "populated", label: t(language, "有覆盖单元格", "Populated") },
    { value: "has-center", label: t(language, "有中心", "Has center") },
  ];

  return renderNativeSocietyWorkbench({
    applyAction: "direct-culture-apply",
    colorInputId: "studioCultureColorInput",
    dataAttribute: "culture-id",
    dataWorkbench: "cultures",
    defaultColor: "#b38a58",
    editStatus: cultureStatus,
    editStatusId: "studioCultureEditStatus",
    emptyLabel: t(language, "没有匹配的文化", "No matching cultures"),
    entityType: "culture",
    fallbackTypeLabel: t(language, "文化", "Culture"),
    filterId: "studioCultureFilterSelect",
    filterOptions,
    filterValue: directEditor.cultureFilterMode,
    icon: "palette",
    language,
    nameInputId: "studioCultureNameInput",
    resetAction: "direct-culture-reset",
    rowAction: "direct-culture-select",
    searchId: "studioCultureSearchInput",
    searchPlaceholder: t(
      language,
      "搜索文化、ID 或形态",
      "Search culture, ID, or form",
    ),
    searchValue: directEditor.cultureSearchQuery,
    selectedColor,
    selectedItem: selectedCulture,
    title: t(language, "文化列表", "Culture list"),
    totalItems: activeCultures,
    typeInputId: "studioCultureTypeInput",
    visibleItems: filteredCultures,
    workbenchId: "studioDirectCulturesWorkbench",
  });
}
