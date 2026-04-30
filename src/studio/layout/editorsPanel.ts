import {
  type EditorAction,
  getEngineEditorAvailability,
  getEngineEntitySummary,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import type { StudioLanguage, StudioSection, StudioState } from "../types";
import {
  renderDirectBiomesWorkbench,
  renderDirectBurgsWorkbench,
  renderDirectCulturesWorkbench,
  renderDirectDiplomacyWorkbench,
  renderDirectProvincesWorkbench,
  renderDirectReligionsWorkbench,
  renderDirectRoutesWorkbench,
  renderDirectStatesWorkbench,
  renderDirectWorkbenchDirectory,
  renderDirectZonesWorkbench,
} from "./directWorkbenches";
import {
  EDITOR_CONTROL_LABELS,
  EDITOR_CONTROL_ZH_LABELS,
  SECTION_EDITOR_RECOMMENDATIONS,
  SECTION_LABELS,
  SHELL_LABELS,
} from "./shellConstants";
import { t } from "./shellShared";

export function getEditorLabel(
  action: EditorAction | null,
  language: StudioLanguage,
) {
  if (!action) return t(language, "无", "None");
  return language === "zh-CN"
    ? EDITOR_CONTROL_ZH_LABELS[action]
    : EDITOR_CONTROL_LABELS[action];
}

function getEditorOriginLabel(
  section: StudioSection | null,
  language: StudioLanguage,
) {
  return section
    ? SECTION_LABELS[language][section]
    : t(language, "无", "None");
}

export function getEditorStatusText(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  if (!state.editor.activeEditor || !state.editor.editorDialogOpen)
    return labels.closed;
  return `${labels.open} · ${getEditorLabel(state.editor.activeEditor, state.language)}`;
}

export function renderEditorsPanel(state: StudioState) {
  const editorAvailability = getEngineEditorAvailability();
  const activeEditor = state.editor.activeEditor;
  const activeEditorLabel = getEditorLabel(activeEditor, state.language);
  const recommendedEditor =
    SECTION_EDITOR_RECOMMENDATIONS[
      state.editor.lastEditorSection ?? state.section
    ] ?? null;
  const recommendedEditorLabel = recommendedEditor
    ? getEditorLabel(recommendedEditor, state.language)
    : t(state.language, "无", "None");
  const editorSurfaceStatus = activeEditor
    ? t(state.language, "已连接", "Connected")
    : "—";
  const originSection = state.editor.lastEditorSection;
  const originSectionLabel = getEditorOriginLabel(
    originSection,
    state.language,
  );
  const canReturnToOrigin =
    Boolean(originSection) && originSection !== "editors";
  const entitySummary = getEngineEntitySummary();
  const worldResources = getEngineWorldResourceSummary();

  return `
    ${renderDirectWorkbenchDirectory(entitySummary, worldResources, state.directEditor, state.language, "directory")}
    ${renderDirectStatesWorkbench(entitySummary, state.directEditor, state.language)}
    ${renderDirectBurgsWorkbench(entitySummary, state.directEditor, state.language)}
    ${renderDirectCulturesWorkbench(entitySummary, state.directEditor, state.language)}
    ${renderDirectReligionsWorkbench(entitySummary, state.directEditor, state.language)}
    ${renderDirectProvincesWorkbench(worldResources.provinces, entitySummary, state.directEditor, state.language)}
    ${renderDirectRoutesWorkbench(worldResources.routes, state.directEditor, state.language)}
    ${renderDirectZonesWorkbench(worldResources.zones, state.directEditor, state.language)}
    ${renderDirectDiplomacyWorkbench(entitySummary, state.directEditor, state.language)}
    ${renderDirectBiomesWorkbench(worldResources.biomes, state.directEditor, state.language)}
    <section class="studio-panel studio-editor-status-panel">
      <h2 class="studio-panel__title">${SECTION_LABELS[state.language].editors}</h2>
      <div class="studio-kv"><span>${t(state.language, "当前", "Active")}</span><strong>${activeEditorLabel}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "状态", "Status")}</span><strong>${getEditorStatusText(state)}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "编辑界面", "Editor surface")}</span><strong>${editorSurfaceStatus}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "来源", "Origin")}</span><strong>${originSectionLabel}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "建议", "Suggested")}</span><strong>${recommendedEditorLabel}</strong></div>
      <div class="studio-panel__actions">
        ${activeEditor ? `<button class="studio-ghost" data-studio-action="close-editor" data-value="${activeEditor}">${t(state.language, "关闭编辑器", "Close editor")}</button>` : ""}
        ${canReturnToOrigin ? `<button class="studio-ghost" data-studio-action="return-origin" data-value="${originSection}">${t(state.language, "返回", "Back to")} ${originSectionLabel}</button>` : ""}
      </div>
    </section>
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "打开编辑器", "Open editor")}</h2>
      <div class="studio-chip-grid">
        ${Object.entries(EDITOR_CONTROL_LABELS)
          .map(([action]) => {
            const editorAction = action as EditorAction;
            const disabled = editorAvailability[editorAction]
              ? ""
              : " disabled";
            const nativeStatesActive =
              editorAction === "editStates" && state.section === "editors";
            const activeClass =
              nativeStatesActive ||
              (state.editor.activeEditor === editorAction &&
                state.editor.editorDialogOpen)
                ? " is-active"
                : "";
            const studioAction =
              editorAction === "editStates" ? "section" : "editor";
            const value = editorAction === "editStates" ? "editors" : action;
            return `<button class="studio-chip${activeClass}" data-studio-action="${studioAction}" data-value="${value}"${disabled}>${getEditorLabel(editorAction, state.language)}</button>`;
          })
          .join("")}
      </div>
    </section>
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "工作流", "Workflow")}</h2>
      <p class="studio-panel__text">${t(state.language, "打开细分编辑器，AGM Studio 会同步追踪当前编辑状态与返回路径。", "Open detailed editors while AGM Studio keeps the active editing context and return path in sync.")}</p>
    </section>
  `;
}
