import type { StudioState } from "../types";
import { getProjectStatusLabel } from "./projectPanelFormatters";
import { t } from "./shellShared";

type ActiveProject = StudioState["projectCenter"]["recentProjects"][number];

export function renderProjectDeliveryStatusSection(
  state: StudioState,
  activeProject: ActiveProject | undefined,
) {
  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "交付状态", "Delivery status")}</h2>
      <div class="studio-kv"><span>${t(state.language, "活动项目", "Active project")}</span><strong>${activeProject ? getProjectStatusLabel(activeProject.status, state.language) : t(state.language, "等待保存", "Pending save")}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "验证", "Validation")}</span><strong>${state.autoFixPreview.appliedDraftIds.length ? t(state.language, "已应用修复", "Fixes applied") : t(state.language, "待检查", "Needs review")}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "引擎包", "Engine package")}</span><strong>${activeProject?.exportReady ? t(state.language, "已准备", "Ready") : t(state.language, "未导出", "Not exported")}</strong></div>
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="section" data-value="repair">${t(state.language, "进入验证", "Go to validation")}</button>
        <button class="studio-ghost studio-ghost--primary" data-studio-action="section" data-value="export">${t(state.language, "进入导出", "Go to export")}</button>
      </div>
    </section>
  `;
}
