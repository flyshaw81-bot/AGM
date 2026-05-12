import {
  type EditorAction,
  getEngineEntitySummary,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import type {
  StudioEditorModule,
  StudioLanguage,
  StudioSection,
  StudioState,
} from "../types";
import {
  renderDirectBiomesWorkbench,
  renderDirectBurgsWorkbench,
  renderDirectCulturesWorkbench,
  renderDirectDiplomacyWorkbench,
  renderDirectMarkersWorkbench,
  renderDirectProvincesWorkbench,
  renderDirectReligionsWorkbench,
  renderDirectRoutesWorkbench,
  renderDirectStatesWorkbench,
  renderDirectZonesWorkbench,
} from "./directWorkbenches";
import { renderNativeModuleContractWorkbench } from "./nativeModuleContractWorkbench";
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
  if (!state.editor.activeEditor || !state.editor.editorDialogOpen) {
    return labels.closed;
  }
  return `${labels.open} - ${getEditorLabel(state.editor.activeEditor, state.language)}`;
}

function renderEditorCompatibilityPanel(
  state: StudioState,
  activeEditorLabel: string,
  recommendedEditorLabel: string,
  originSectionLabel: string,
  editorSurfaceStatus: string,
  canReturnToOrigin: boolean,
) {
  return `
    <details class="studio-native-editor-compat" data-native-editor-compat="true">
      <summary><span>${t(state.language, "旧编辑器桥接", "Legacy editor bridge")}</span><strong>${t(state.language, "按需查看", "Review when needed")}</strong></summary>
      <div class="studio-native-editor-compat__body">
        <section class="studio-panel studio-editor-status-panel" data-editor-bridge-status="true">
          <h2 class="studio-panel__title">${t(state.language, "旧编辑器状态", "Legacy editor status")}</h2>
          <div class="studio-kv"><span>${t(state.language, "当前", "Active")}</span><strong>${activeEditorLabel}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "状态", "Status")}</span><strong>${getEditorStatusText(state)}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "编辑界面", "Editor surface")}</span><strong>${editorSurfaceStatus}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "来源", "Origin")}</span><strong>${originSectionLabel}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "建议", "Suggested")}</span><strong>${recommendedEditorLabel}</strong></div>
          <div class="studio-panel__actions">
            ${state.editor.activeEditor ? `<button class="studio-ghost" data-studio-action="close-editor" data-value="${state.editor.activeEditor}">${t(state.language, "关闭旧编辑器", "Close legacy editor")}</button>` : ""}
            ${canReturnToOrigin ? `<button class="studio-ghost" data-studio-action="return-origin" data-value="${state.editor.lastEditorSection}">${t(state.language, "返回", "Back to")} ${originSectionLabel}</button>` : ""}
          </div>
        </section>
        <section class="studio-panel" data-editor-navigation-note="true">
          <h2 class="studio-panel__title">${t(state.language, "产品化编辑入口", "Product editor navigation")}</h2>
          <p class="studio-panel__text">${t(state.language, "主要编辑器已经收口到左侧模块栏；这里仅保留旧弹窗桥接状态，不再重复渲染第二套工作台。", "Primary editors now live in the left module bar; this area only keeps legacy dialog bridge status and no longer renders duplicate workbenches.")}</p>
        </section>
      </div>
    </details>
  `;
}

function getActiveEditorModule(state: StudioState): StudioEditorModule {
  return state.shell.activeEditorModule ?? "states";
}

function renderActiveEditorModulePanel(state: StudioState) {
  const entitySummary = getEngineEntitySummary();
  const worldResources = getEngineWorldResourceSummary();

  switch (getActiveEditorModule(state)) {
    case "states":
      return renderDirectStatesWorkbench(
        entitySummary,
        state.directEditor,
        state.language,
      );
    case "cultures":
      return renderDirectCulturesWorkbench(
        entitySummary,
        state.directEditor,
        state.language,
      );
    case "provinces":
      return renderDirectProvincesWorkbench(
        worldResources.provinces,
        entitySummary,
        state.directEditor,
        state.language,
      );
    case "religions":
      return renderDirectReligionsWorkbench(
        entitySummary,
        state.directEditor,
        state.language,
      );
    case "burgs":
      return renderDirectBurgsWorkbench(
        entitySummary,
        state.directEditor,
        state.language,
      );
    case "routes":
      return renderDirectRoutesWorkbench(
        worldResources.routes,
        state.directEditor,
        state.language,
      );
    case "military":
      return renderNativeModuleContractWorkbench(
        "military",
        worldResources,
        state.language,
        state.directEditor,
      );
    case "markers":
      return renderDirectMarkersWorkbench(
        worldResources.markers,
        state.directEditor,
        state.language,
      );
    case "diplomacy":
      return renderDirectDiplomacyWorkbench(
        entitySummary,
        worldResources,
        state.directEditor,
        state.language,
      );
    case "zones":
      return renderDirectZonesWorkbench(
        worldResources.zones,
        state.directEditor,
        state.language,
      );
    case "biomes":
      return renderDirectBiomesWorkbench(
        worldResources.biomes,
        state.directEditor,
        state.language,
      );
  }
}

export function renderEditorsPanel(state: StudioState) {
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
    : "-";
  const originSection = state.editor.lastEditorSection;
  const originSectionLabel = getEditorOriginLabel(
    originSection,
    state.language,
  );
  const canReturnToOrigin =
    Boolean(originSection) && originSection !== "editors";
  const activeModule = getActiveEditorModule(state);
  const shouldRenderEditorCompatibility = Boolean(
    state.editor.activeEditor || state.editor.editorDialogOpen,
  );

  return `
    <div class="studio-native-module-drawer" data-native-editor-module="${activeModule}">
      ${renderActiveEditorModulePanel(state)}
    </div>
    ${
      shouldRenderEditorCompatibility
        ? renderEditorCompatibilityPanel(
            state,
            activeEditorLabel,
            recommendedEditorLabel,
            originSectionLabel,
            editorSurfaceStatus,
            canReturnToOrigin,
          )
        : ""
    }
  `;
}
