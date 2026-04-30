import type { StudioState } from "../types";
import {
  formatProjectCenterTime,
  getProjectStatusLabel,
} from "./projectPanelFormatters";
import { GAME_WORLD_PROFILE_UI_LABELS } from "./shellConstants";
import { escapeHtml, t } from "./shellShared";

export function renderProjectRecentProjectsSection(state: StudioState) {
  const recentProjects = state.projectCenter.recentProjects;

  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "最近项目", "Recent projects")}</h2>
      ${
        recentProjects.length
          ? `
        <div class="studio-balance-list">
          ${recentProjects
            .map(
              (project) => `
            <article class="studio-balance-card${project.id === state.projectCenter.activeProjectId ? " is-active" : ""}">
              <div class="studio-balance-card__title">${escapeHtml(project.name)}</div>
              <div class="studio-panel__text">${GAME_WORLD_PROFILE_UI_LABELS[state.language][project.gameProfile]} · ${project.width} × ${project.height} · ${escapeHtml(project.seed || "-")}</div>
              <div class="studio-kv"><span>${t(state.language, "状态", "Status")}</span><strong>${getProjectStatusLabel(project.status, state.language)}</strong></div>
              <div class="studio-kv"><span>${t(state.language, "更新时间", "Updated")}</span><strong>${formatProjectCenterTime(project.updatedAt, state.language)}</strong></div>
            </article>
          `,
            )
            .join("")}
        </div>
      `
          : `<p class="studio-panel__text">${t(state.language, "保存草稿或生成地图后，这里会显示最近项目。", "Recent projects appear here after saving a draft or generating a map.")}</p>`
      }
    </section>
  `;
}
