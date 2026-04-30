import type {
  getEngineDataActions,
  getEngineProjectSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import {
  formatProjectCenterTime,
  localizeProjectSourceDisplayValue,
  renderGameProfileOptions,
} from "./projectPanelFormatters";
import { escapeHtml, t } from "./shellShared";

type DataActions = ReturnType<typeof getEngineDataActions>;
type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;

export function renderProjectDocumentSection(
  state: StudioState,
  projectSummary: ProjectSummary,
  dataActions: DataActions,
) {
  const localSnapshotLabel = projectSummary.hasLocalSnapshot
    ? t(state.language, "可恢复", "Recoverable")
    : t(state.language, "暂无", "None");

  return `
    <section class="studio-panel" data-studio-project-document="true">
      <h2 class="studio-panel__title">${t(state.language, "当前项目", "Current project")}</h2>
      <label class="studio-stack-field">
        <span>${t(state.language, "项目名称", "Project name")}</span>
        <input id="studioProjectNameInput" class="studio-input" type="text" value="${escapeHtml(state.document.name)}" />
      </label>
      <label class="studio-stack-field">
        <span>${t(state.language, "目标游戏类型", "Target game type")}</span>
        <select id="studioProjectGameProfileSelect">
          ${renderGameProfileOptions(state.document.gameProfile, state.language)}
        </select>
      </label>
      <label class="studio-stack-field">
        <span>${t(state.language, "设计意图", "Design intent")}</span>
        <textarea id="studioProjectDesignIntentInput" class="studio-input" rows="3">${escapeHtml(state.document.designIntent)}</textarea>
      </label>
      <div class="studio-kv"><span>${t(state.language, "项目名称", "Project name")}</span><strong>${escapeHtml(state.document.name)}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "种子", "Seed")}</span><strong>${state.document.seed || "-"}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "画幅", "Frame")}</span><strong>${state.document.documentWidth || state.viewport.width} × ${state.document.documentHeight || state.viewport.height}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "风格", "Style")}</span><strong>${escapeHtml(state.document.stylePreset)}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "本地快照", "Local snapshot")}</span><strong>${localSnapshotLabel}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "上次保存", "Last saved")}</span><strong>${formatProjectCenterTime(state.projectCenter.lastSavedAt, state.language)}</strong></div>
        <div class="studio-kv"><span>${t(state.language, "文档来源", "Document source")}</span><strong>${state.document.source === "agm" ? "AGM Studio" : localizeProjectSourceDisplayValue("AGM Core", state.language)}</strong></div>
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="data" data-value="quick-load"${dataActions.canQuickLoad ? "" : " disabled"}>${t(state.language, "快速加载", "Quick load")}</button>
        <button class="studio-ghost" data-studio-action="data" data-value="save-storage"${dataActions.canSaveToStorage ? "" : " disabled"}>${t(state.language, "保存到存储", "Save to storage")}</button>
        <button class="studio-ghost" data-studio-action="data" data-value="open-file"${dataActions.canOpenFile ? "" : " disabled"}>${t(state.language, "打开文件", "Open file")}</button>
        <button class="studio-ghost studio-ghost--primary" data-studio-action="project" data-value="save-agm-draft">${t(state.language, "保存 AGM 草稿", "Save AGM draft")}</button>
        <button class="studio-ghost" data-studio-action="project" data-value="restore-agm-draft">${t(state.language, "恢复 AGM 草稿", "Restore AGM draft")}</button>
      </div>
    </section>
  `;
}
