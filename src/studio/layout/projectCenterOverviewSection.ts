import type { getEngineTopbarActions } from "../bridge/engineActions";
import type { StudioState } from "../types";
import { GAME_WORLD_PROFILE_UI_LABELS } from "./shellConstants";
import { escapeHtml, t } from "./shellShared";

type TopbarActions = ReturnType<typeof getEngineTopbarActions>;

export function renderProjectCenterOverviewSection(
  state: StudioState,
  topbarActions: TopbarActions,
) {
  return `
    <section class="studio-panel studio-project-center" data-studio-project-overview="true">
      <div class="studio-panel__eyebrow">${t(state.language, "项目中心", "Project Center")}</div>
      <h2 class="studio-panel__hero">${escapeHtml(state.document.name)}</h2>
      <p class="studio-panel__text">${t(state.language, "从这里管理项目、恢复草稿、创建新世界，并检查当前项目是否已经准备好验证和导出。", "Manage projects, restore drafts, create worlds, and check whether the current project is ready for validation and export.")}</p>
      <div class="studio-canvas-summary" aria-label="${t(state.language, "项目状态", "Project status")}">
        <div><span>${t(state.language, "类型", "Profile")}</span><strong>${GAME_WORLD_PROFILE_UI_LABELS[state.language][state.document.gameProfile]}</strong></div>
        <div><span>${t(state.language, "画幅", "Frame")}</span><strong>${state.document.documentWidth || state.viewport.width} × ${state.document.documentHeight || state.viewport.height}</strong></div>
        <div><span>${t(state.language, "种子", "Seed")}</span><strong>${escapeHtml(state.document.seed || "-")}</strong></div>
        <div><span>${t(state.language, "保存", "Save")}</span><strong>${state.document.dirty ? t(state.language, "未保存", "Unsaved") : t(state.language, "已同步", "Synced")}</strong></div>
      </div>
      <div class="studio-panel__actions">
        <button class="studio-ghost studio-ghost--primary" data-studio-action="topbar" data-value="new"${topbarActions.new ? "" : " disabled"}>${t(state.language, "新建并生成", "New and generate")}</button>
        <button class="studio-ghost" data-studio-action="topbar" data-value="open"${topbarActions.open ? "" : " disabled"}>${t(state.language, "打开项目", "Open project")}</button>
        <button class="studio-ghost" data-studio-action="topbar" data-value="save"${topbarActions.save ? "" : " disabled"}>${t(state.language, "保存副本", "Save copy")}</button>
        <button class="studio-ghost" data-studio-action="project" data-value="save-agm-draft">${t(state.language, "保存草稿", "Save draft")}</button>
        <button class="studio-ghost" data-studio-action="project" data-value="restore-agm-draft">${t(state.language, "恢复草稿", "Restore draft")}</button>
      </div>
    </section>
  `;
}
