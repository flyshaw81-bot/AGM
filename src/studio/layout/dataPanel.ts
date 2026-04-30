import type {
  getEngineDataActions,
  getEngineProjectSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { SECTION_LABELS } from "./shellConstants";
import { t } from "./shellShared";

type EngineDataActions = ReturnType<typeof getEngineDataActions>;
type EngineProjectSummary = ReturnType<typeof getEngineProjectSummary>;

const EMPTY_VALUE = "—";

const DATA_DISPLAY_LABELS: Record<string, { en: string; zh: string }> = {
  "AGM Core": { en: "AGM Core", zh: "AGM 核心" },
  Core: { en: "AGM Core", zh: "AGM 核心" },
  "Current map": { en: "Current map", zh: "当前地图" },
  "Not saved yet": { en: "Not saved yet", zh: "尚未保存" },
  "Browser snapshot": { en: "Browser snapshot", zh: "浏览器快照" },
  Downloads: { en: "Downloads", zh: "下载目录" },
  "Local file": { en: "Local file", zh: "本地文件" },
  Generated: { en: "Generated", zh: "已生成" },
  "Current settings": { en: "Current settings", zh: "当前设置" },
  "Quick load": { en: "Quick load", zh: "快速加载" },
  "Selected file": { en: "Selected file", zh: "已选文件" },
};

export function localizeEngineDisplayValue(
  value: string,
  language: StudioState["language"],
) {
  const label = DATA_DISPLAY_LABELS[value];
  return label ? t(language, label.zh, label.en) : value;
}

export function renderDataPanel(
  state: StudioState,
  dataActions: EngineDataActions,
  projectSummary: EngineProjectSummary,
) {
  return `
        <section class="studio-panel">
          <h2 class="studio-panel__title">${SECTION_LABELS[state.language].data}</h2>
          <div class="studio-kv"><span>${t(state.language, "种子", "Seed")}</span><strong>${state.document.seed || EMPTY_VALUE}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "未保存", "Dirty")}</span><strong>${state.document.dirty ? t(state.language, "是", "Yes") : t(state.language, "否", "No")}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "快照", "Snapshot")}</span><strong>${projectSummary.hasLocalSnapshot ? t(state.language, "可用", "Available") : t(state.language, "无", "None")}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "来源", "Source")}</span><strong>${dataActions.sourceLabel ? localizeEngineDisplayValue(dataActions.sourceLabel, state.language) : EMPTY_VALUE}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "加载详情", "Load detail")}</span><strong>${dataActions.sourceDetail ? localizeEngineDisplayValue(dataActions.sourceDetail, state.language) : EMPTY_VALUE}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "上次保存", "Last save")}</span><strong>${dataActions.saveLabel ? localizeEngineDisplayValue(dataActions.saveLabel, state.language) : EMPTY_VALUE}</strong></div>
          <div class="studio-kv"><span>${t(state.language, "保存详情", "Save detail")}</span><strong>${dataActions.saveDetail ? localizeEngineDisplayValue(dataActions.saveDetail, state.language) : EMPTY_VALUE}</strong></div>
          <div class="studio-panel__actions">
            <button class="studio-ghost studio-ghost--primary" data-studio-action="data" data-value="quick-load"${dataActions.canQuickLoad ? "" : " disabled"}>${t(state.language, "快速加载", "Quick load")}</button>
            <button class="studio-ghost" data-studio-action="data" data-value="save-storage"${dataActions.canSaveToStorage ? "" : " disabled"}>${t(state.language, "保存到存储", "Save to storage")}</button>
            <button class="studio-ghost" data-studio-action="data" data-value="save-machine"${dataActions.canSaveToMachine ? "" : " disabled"}>${t(state.language, "下载", "Download")}</button>
            <button class="studio-ghost" data-studio-action="data" data-value="open-file"${dataActions.canOpenFile ? "" : " disabled"}>${t(state.language, "打开文件", "Open file")}</button>
            <button class="studio-ghost" data-studio-action="data" data-value="new-map"${dataActions.canCreateNew ? "" : " disabled"}>${t(state.language, "新建地图", "New map")}</button>
          </div>
          <details class="studio-advanced-section">
            <summary>${t(state.language, "Dropbox 与分享", "Dropbox and sharing")}</summary>
            <div class="studio-kv"><span>Dropbox</span><strong>${dataActions.dropboxConnected ? (dataActions.hasDropboxSelection ? t(state.language, "已选择文件", "File selected") : t(state.language, "已连接", "Connected")) : t(state.language, "未连接", "Not connected")}</strong></div>
            <div class="studio-kv"><span>${t(state.language, "Dropbox 文件", "Dropbox file")}</span><strong>${dataActions.selectedDropboxLabel || dataActions.selectedDropboxFile || EMPTY_VALUE}</strong></div>
            <div class="studio-kv"><span>${t(state.language, "分享链接", "Share link")}</span><strong>${dataActions.hasDropboxShareLink ? t(state.language, "就绪", "Ready") : t(state.language, "未创建", "Not created")}</strong></div>
            <div class="studio-panel__actions">
              <button class="studio-ghost" data-studio-action="data" data-value="save-dropbox"${dataActions.canSaveToDropbox ? "" : " disabled"}>${t(state.language, "保存到 Dropbox", "Save Dropbox")}</button>
              <button class="studio-ghost" data-studio-action="data" data-value="connect-dropbox"${dataActions.canConnectDropbox ? "" : " disabled"}>${t(state.language, "连接 Dropbox", "Connect Dropbox")}</button>
              <button class="studio-ghost" data-studio-action="data" data-value="load-dropbox"${dataActions.canLoadFromDropbox ? "" : " disabled"}>${t(state.language, "加载 Dropbox", "Load Dropbox")}</button>
              <button class="studio-ghost" data-studio-action="data" data-value="share-dropbox"${dataActions.canShareDropbox ? "" : " disabled"}>${t(state.language, "分享 Dropbox", "Share Dropbox")}</button>
            </div>
          </details>
          <details class="studio-advanced-section">
            <summary>${t(state.language, "高级加载", "Advanced loading")}</summary>
            <div class="studio-panel__actions">
              <button class="studio-ghost" data-studio-action="data" data-value="load-url"${dataActions.canLoadUrl ? "" : " disabled"}>${t(state.language, "加载 URL", "Load URL")}</button>
            </div>
          </details>
        </section>
      `;
}
