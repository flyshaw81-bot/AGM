import type {
  getEngineEditorAvailability,
  getEngineProjectSummary,
  getEngineTopbarActions,
} from "../bridge/engineActions";
import {
  createWorldDocumentDraft,
  GAME_WORLD_PROFILE_LABELS,
} from "../state/worldDocumentDraft";
import type { GameWorldProfile, StudioState } from "../types";
import { renderBalanceChecker } from "./balancePanel";
import { localizeEngineDisplayValue } from "./dataPanel";
import { renderProjectMapSettingsPanel } from "./projectMapSettingsPanel";
import { gameProfileOption } from "./shellChrome";
import {
  EXPORT_FORMAT_LABELS,
  GAME_WORLD_PROFILE_UI_LABELS,
} from "./shellConstants";
import { escapeHtml, t } from "./shellShared";

type ProjectSummary = ReturnType<typeof getEngineProjectSummary>;
type TopbarActions = ReturnType<typeof getEngineTopbarActions>;
type EditorAvailability = ReturnType<typeof getEngineEditorAvailability>;
type WorldDraftPreview = ReturnType<typeof createWorldDocumentDraft>;

function renderWorldJsonDraft(draft: WorldDraftPreview) {
  return escapeHtml(JSON.stringify(draft, null, 2));
}

export function renderProjectAdvancedGenerationSection(
  state: StudioState,
  projectSummary: ProjectSummary,
  topbarActions: TopbarActions,
  editorAvailability: EditorAvailability,
) {
  const worldDraft = createWorldDocumentDraft(state, projectSummary);

  return `
    <details class="studio-advanced-section" open>
      <summary>${t(state.language, "高级生成参数", "Advanced generation settings")}</summary>
    <section class="studio-panel" hidden data-studio-retired="scene-setup">
      <h2 class="studio-panel__title">${t(state.language, "场景设置", "Scene setup")}</h2>
      <p class="studio-panel__text">${t(state.language, "先选择这张世界地图服务的游戏场景。其他文档、调试和导出信息已经移到后面的流程里。", "Start by choosing the game scenario this world map serves. Document, debug, and export details live later in the workflow.")}</p>
      <div hidden>
      <div class="studio-panel__eyebrow">${t(state.language, "预览版 Beta", "Preview Beta")}</div>
      <h2 class="studio-panel__hero">AGM Studio ${t(state.language, "预览版 Beta", "Preview Beta")}</h2>
      <p class="studio-panel__text">${t(state.language, "选择游戏类型，生成地图，然后检查平衡性并导出 AGM World JSON。", "Choose a game profile, generate a map, then inspect Balance Checker and export AGM World JSON.")}</p>
      <div class="studio-balance-list">
        <article class="studio-balance-card">
          <div class="studio-balance-card__title">${t(state.language, "1. 选择 RPG / 策略 / 4X 类型", "1. Select RPG / Strategy / 4X profile")}</div>
          <div class="studio-panel__text">${t(state.language, "用目标游戏类型设定世界设计目标。", "Use Target game type to set the world design goal.")}</div>
        </article>
        <article class="studio-balance-card">
          <div class="studio-balance-card__title">${t(state.language, "2. 使用类型参数生成", "2. Generate with profile parameters")}</div>
          <div class="studio-panel__text">${t(state.language, "AGM 会在创建地图前应用有效的类型参数。", "AGM applies effective profile parameters before map creation.")}</div>
        </article>
        <article class="studio-balance-card">
          <div class="studio-balance-card__title">${t(state.language, "3. 检查生成影响并导出 AGM World JSON", "3. Review Profile generation impact and export AGM World JSON")}</div>
          <div class="studio-panel__text">${t(state.language, "使用平衡检查器和导出按钮检查可用于游戏的数据。", "Use Balance Checker and the export buttons to inspect game-ready data.")}</div>
        </article>
      </div>
      <div class="studio-panel__eyebrow">${t(state.language, "文档", "Document")}</div>
      <h2 class="studio-panel__hero">${state.document.name}</h2>
        <div class="studio-kv"><span>${t(state.language, "文档来源", "Document source")}</span><strong>${state.document.source === "agm" ? "AGM Studio" : localizeEngineDisplayValue("AGM Core", state.language)}</strong></div>
      <label class="studio-stack-field">
        <span>${t(state.language, "地图名称", "Map name")}</span>
        <input id="studioProjectNameInput" class="studio-input" type="text" value="${escapeHtml(state.document.name)}" />
      </label>
      <div class="studio-kv"><span>${t(state.language, "游戏类型", "Game profile")}</span><strong>${GAME_WORLD_PROFILE_UI_LABELS[state.language][state.document.gameProfile]}</strong></div>
      </div>
      <label class="studio-stack-field">
        <span>${t(state.language, "目标游戏类型", "Target game type")}</span>
        <select id="studioProjectGameProfileSelect">
          ${Object.keys(GAME_WORLD_PROFILE_LABELS)
            .map((value) =>
              gameProfileOption(
                value as GameWorldProfile,
                state.document.gameProfile,
                state.language,
              ),
            )
            .join("")}
        </select>
      </label>
      <label class="studio-stack-field">
        <span>${t(state.language, "设计意图", "Design intent")}</span>
        <textarea id="studioProjectDesignIntentInput" class="studio-input" rows="3">${escapeHtml(state.document.designIntent)}</textarea>
      </label>
      <div hidden>
      <div class="studio-kv"><span>${t(state.language, "种子", "Seed")}</span><strong>${state.document.seed || "—"}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "尺寸", "Size")}</span><strong>${state.document.documentWidth || 0} × ${state.document.documentHeight || 0}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "风格", "Style")}</span><strong>${state.document.stylePreset}</strong></div>
      <p class="studio-panel__text">${t(state.language, "世界页只保留生成地图和常用世界设置；导出、引擎交接和调试数据已收进导出与高级区。", "World keeps generation and common world settings; export, engine handoff, and debug data live in Export and advanced sections.")}</p>
      <div class="studio-panel__actions">
        <button class="studio-ghost studio-ghost--primary" data-studio-action="project" data-value="save-agm-draft">${t(state.language, "保存 AGM 草稿", "Save AGM draft")}</button>
      </div>
      </div>
      <div hidden data-studio-advanced="world-json">
        <pre id="studioProjectWorldJsonDraft" class="studio-code-preview">${renderWorldJsonDraft(worldDraft)}</pre>
      </div>
    </section>
    <details class="studio-advanced-section" data-studio-advanced="balance-checker">
      <summary>${t(state.language, "高级：平衡检查器", "Advanced: Balance Checker")}</summary>
      ${renderBalanceChecker(worldDraft, editorAvailability, state.autoFixPreview, state.language)}
    </details>
    <section class="studio-panel" data-studio-project-generate="true">
      <h2 class="studio-panel__title">${t(state.language, "生成地图", "Generate map")}</h2>
      <p class="studio-panel__text">${t(state.language, "按当前设置生成会在创建地图前应用所选类型的有效参数。", "Generate from current settings applies the selected profile's effective parameters before map creation.")}</p>
      <div class="studio-panel__actions">
        <button class="studio-ghost studio-ghost--primary" data-studio-action="topbar" data-value="new"${topbarActions.new ? "" : " disabled"}>${t(state.language, "按当前设置生成", "Generate from current settings")}</button>
        <button class="studio-ghost" data-studio-action="topbar" data-value="open"${topbarActions.open ? "" : " disabled"}>${t(state.language, "打开文件", "Open file")}</button>
        <button class="studio-ghost" data-studio-action="topbar" data-value="save"${topbarActions.save ? "" : " disabled"}>${t(state.language, "保存副本", "Save copy")}</button>
        <button class="studio-ghost" data-studio-action="topbar" data-value="export"${topbarActions.export ? "" : " disabled"}>${t(state.language, "导出", "Export")} ${EXPORT_FORMAT_LABELS[state.export.format]}</button>
      </div>
    </section>
    ${renderProjectMapSettingsPanel(projectSummary, topbarActions, state.language)}
    </details>
  `;
}
