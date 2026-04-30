import type { getEngineProjectSummary } from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  renderProjectInputSetting,
  renderProjectSelectSetting,
  renderSelectOption,
} from "./projectMapSettingsControls";
import { PROJECT_MAP_EMPTY_VALUE } from "./projectMapSettingsModel";
import { t } from "./shellShared";

type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;

export function renderProjectGenerationSettings(
  projectSummary: ProjectSummary,
  language: StudioLanguage,
) {
  return `
      ${renderProjectInputSetting(
        t(language, "自动保存", "Autosave"),
        projectSummary.autosaveInterval === "0"
          ? t(language, "关闭", "Off")
          : `${projectSummary.autosaveInterval} min`,
        t(language, "自动保存间隔", "Autosave interval"),
        "studioProjectAutosaveInput",
        "number",
        `min="0" max="60" step="1" value="${projectSummary.autosaveInterval}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "待生成种子", "Pending seed"),
        projectSummary.pendingSeed || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改种子", "Change seed"),
        "studioProjectSeedInput",
        "number",
        `min="1" max="999999999" step="1" value="${projectSummary.pendingSeed}"${projectSummary.canSetSeed ? "" : " disabled"}`,
      )}
      ${renderProjectInputSetting(
        t(language, "点密度", "Points density"),
        projectSummary.pendingCellsLabel || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改点密度", "Change points density"),
        "studioProjectPointsInput",
        "range",
        `min="1" max="13" step="1" value="${projectSummary.pendingPoints || "4"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "待生成国家", "Pending states"),
        projectSummary.pendingStates || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改国家数量", "Change states"),
        "studioProjectStatesInput",
        "number",
        `min="0" max="100" step="1" value="${projectSummary.pendingStates || "0"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "省份比例", "Provinces ratio"),
        projectSummary.pendingProvincesRatio || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改省份比例", "Change provinces ratio"),
        "studioProjectProvincesRatioInput",
        "number",
        `min="0" max="100" step="1" value="${projectSummary.pendingProvincesRatio || "0"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "增长率", "Growth rate"),
        projectSummary.pendingGrowthRate || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改增长率", "Change growth rate"),
        "studioProjectGrowthRateInput",
        "number",
        `min="0.1" max="2" step="0.1" value="${projectSummary.pendingGrowthRate || "1"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "待生成文化", "Pending cultures"),
        projectSummary.pendingCultures || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改文化数量", "Change cultures"),
        "studioProjectCulturesInput",
        "number",
        `min="1" step="1" value="${projectSummary.pendingCultures || "1"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "城镇数量", "Burgs number"),
        projectSummary.pendingBurgsLabel || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改城镇数量", "Change burgs number"),
        "studioProjectBurgsInput",
        "number",
        `min="0" max="1000" step="1" value="${projectSummary.pendingBurgs || "1000"}"`,
      )}
      ${renderProjectInputSetting(
        t(language, "宗教数量", "Religions number"),
        projectSummary.pendingReligions || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改宗教数量", "Change religions number"),
        "studioProjectReligionsInput",
        "number",
        `min="0" max="50" step="1" value="${projectSummary.pendingReligions || "0"}"`,
      )}
      ${renderProjectSelectSetting(
        t(language, "国家标签模式", "State labels mode"),
        projectSummary.pendingStateLabelsModeLabel || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改国家标签模式", "Change state labels mode"),
        "studioProjectStateLabelsModeSelect",
        [
          renderSelectOption(
            "auto",
            t(language, "自动", "Auto"),
            projectSummary.pendingStateLabelsMode,
          ),
          renderSelectOption(
            "short",
            t(language, "短名称", "Short names"),
            projectSummary.pendingStateLabelsMode,
          ),
          renderSelectOption(
            "full",
            t(language, "完整名称", "Full names"),
            projectSummary.pendingStateLabelsMode,
          ),
        ].join(""),
      )}
      ${renderProjectSelectSetting(
        t(language, "文化集", "Culture set"),
        projectSummary.pendingCultureSetLabel || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改文化集", "Change culture set"),
        "studioProjectCultureSetSelect",
        projectSummary.availableCultureSets
          .map((option) =>
            renderSelectOption(
              option.value,
              option.label,
              projectSummary.pendingCultureSet,
            ),
          )
          .join(""),
      )}
      ${renderProjectSelectSetting(
        t(language, "待生成高度图", "Pending heightmap"),
        projectSummary.pendingTemplateLabel || PROJECT_MAP_EMPTY_VALUE,
        t(language, "修改高度图", "Change heightmap"),
        "studioProjectTemplateSelect",
        projectSummary.availableTemplates
          .map((option) =>
            renderSelectOption(
              option.value,
              option.label,
              projectSummary.pendingTemplate,
            ),
          )
          .join(""),
      )}
    `;
}
