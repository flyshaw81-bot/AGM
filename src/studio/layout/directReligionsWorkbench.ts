import type { EngineEntitySummary } from "../bridge/engineActions";
import type {
  DirectReligionFilterMode,
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

export function renderDirectReligionsWorkbench(
  entitySummary: EngineEntitySummary,
  directEditor: StudioState["directEditor"],
  language: StudioLanguage,
) {
  const activeReligions = getActiveDirectSocietyItems(entitySummary.religions);
  const query = normalizeWorkbenchQuery(directEditor.religionSearchQuery);
  const filteredReligions = filterAndSortDirectSocietyItems(
    activeReligions,
    directEditor.religionFilterMode,
    query,
  );
  const selectedReligion = selectDirectSocietyItem(
    filteredReligions,
    activeReligions,
    directEditor.selectedReligionId,
  );
  const selectedColor = getDirectSocietyColor(selectedReligion, "#8d70c9");
  const religionStatus = getDirectWorkbenchEditStatus(
    Boolean(
      selectedReligion &&
        directEditor.lastAppliedReligionId === selectedReligion.id,
    ),
  );
  const filterOptions: { value: DirectReligionFilterMode; label: string }[] = [
    { value: "all", label: t(language, "全部宗教", "All religions") },
    { value: "populated", label: t(language, "有覆盖单元格", "Populated") },
    { value: "has-center", label: t(language, "有中心", "Has center") },
  ];

  return renderNativeSocietyWorkbench({
    applyAction: "direct-religion-apply",
    colorInputId: "studioReligionColorInput",
    dataAttribute: "religion-id",
    dataWorkbench: "religions",
    defaultColor: "#8d70c9",
    editStatus: religionStatus,
    editStatusId: "studioReligionEditStatus",
    emptyLabel: t(language, "没有匹配的宗教", "No matching religions"),
    entityType: "religion",
    fallbackTypeLabel: t(language, "宗教", "Religion"),
    filterId: "studioReligionFilterSelect",
    filterOptions,
    filterValue: directEditor.religionFilterMode,
    icon: "star",
    language,
    nameInputId: "studioReligionNameInput",
    resetAction: "direct-religion-reset",
    rowAction: "direct-religion-select",
    searchId: "studioReligionSearchInput",
    searchPlaceholder: t(
      language,
      "搜索宗教、ID 或形态",
      "Search religion, ID, or form",
    ),
    searchValue: directEditor.religionSearchQuery,
    selectedColor,
    selectedItem: selectedReligion,
    title: t(language, "宗教列表", "Religion list"),
    totalItems: activeReligions,
    typeInputId: "studioReligionTypeInput",
    visibleItems: filteredReligions,
    workbenchId: "studioDirectReligionsWorkbench",
  });
}
