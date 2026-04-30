import type {
  getEngineProjectSummary,
  getEngineTopbarActions,
} from "../bridge/engineActions";
import type { StudioLanguage } from "../types";
import {
  renderProjectKv,
  renderProjectSelectSetting,
  renderSelectOption,
} from "./projectMapSettingsControls";
import { PROJECT_MAP_EMPTY_VALUE } from "./projectMapSettingsModel";
import { t } from "./shellShared";

type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;
type TopbarActions = ReturnType<typeof getEngineTopbarActions>;

export function renderProjectCanvasActions(
  projectSummary: ProjectSummary,
  topbarActions: TopbarActions,
  language: StudioLanguage,
) {
  return `
      ${renderProjectKv(
        t(language, "待生成画布尺寸", "Pending canvas size"),
        `${projectSummary.pendingWidth || PROJECT_MAP_EMPTY_VALUE} × ${projectSummary.pendingHeight || PROJECT_MAP_EMPTY_VALUE}`,
      )}
      <label class="studio-stack-field">
        <span>${t(language, "待生成宽度", "Pending width")}</span>
        <input id="studioProjectWidthInput" class="studio-input" type="number" min="1" step="1" value="${projectSummary.pendingWidth}" />
      </label>
      <label class="studio-stack-field">
        <span>${t(language, "待生成高度", "Pending height")}</span>
        <input id="studioProjectHeightInput" class="studio-input" type="number" min="1" step="1" value="${projectSummary.pendingHeight}" />
      </label>
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="project" data-value="restore-default-canvas-size"${projectSummary.canRestoreDefaultCanvasSize ? "" : " disabled"}>${t(language, "恢复默认画布尺寸", "Restore default canvas size")}</button>
        <button class="studio-ghost studio-ghost--primary" data-studio-action="topbar" data-value="new"${topbarActions.new ? "" : " disabled"}>${t(language, "生成地图", "Generate map")}</button>
      </div>
      ${renderProjectKv(
        t(language, "本地快照", "Local snapshot"),
        projectSummary.hasLocalSnapshot
          ? t(language, "可用", "Available")
          : t(language, "无", "None"),
      )}
      ${renderProjectSelectSetting(
        t(language, "图层预设", "Layers preset"),
        projectSummary.lastLayersPreset,
        t(language, "修改图层预设", "Change layers preset"),
        "studioProjectLayersPresetSelect",
        projectSummary.availableLayersPresets
          .map((option) =>
            renderSelectOption(option, option, projectSummary.lastLayersPreset),
          )
          .join(""),
      )}
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="project" data-value="seed-history"${projectSummary.canOpenSeedHistory ? "" : " disabled"}>${t(language, "种子历史", "Seed history")}</button>
        <button class="studio-ghost" data-studio-action="project" data-value="copy-seed-url"${projectSummary.canCopySeedUrl ? "" : " disabled"}>${t(language, "复制种子 URL", "Copy seed URL")}</button>
      </div>
    `;
}
