import type {
  getEngineDataActions,
  getEngineProjectSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { escapeHtml, studioIcon, t } from "./shellShared";

type EngineDataActions = ReturnType<typeof getEngineDataActions>;
type EngineProjectSummary = ReturnType<typeof getEngineProjectSummary>;

const EMPTY_VALUE = "-";

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
  "Selected file": { en: "Selected file", zh: "已选文件" },
};

type NativeDataAction = {
  enabled: boolean;
  icon: string;
  label: string;
  primary?: boolean;
  value: string;
};

type NativeDataMetric = {
  label: string;
  value: string | number;
};

export function localizeEngineDisplayValue(
  value: string,
  language: StudioState["language"],
) {
  const label = DATA_DISPLAY_LABELS[value];
  return label ? t(language, label.zh, label.en) : value;
}

function formatDataValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  return String(value);
}

function renderNativeDataMetric({ label, value }: NativeDataMetric) {
  return `<div class="studio-native-data__metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatDataValue(value))}</strong></div>`;
}

function renderNativeDataAction({
  enabled,
  icon,
  label,
  primary,
  value,
}: NativeDataAction) {
  return `<button class="studio-native-data__action${primary ? " studio-native-data__action--primary" : ""}" data-studio-action="data" data-value="${escapeHtml(value)}"${enabled ? "" : " disabled"}>${studioIcon(icon, "studio-native-data__action-icon")}<span>${escapeHtml(label)}</span></button>`;
}

function renderNativeDataActionGroup(
  title: string,
  description: string,
  actions: NativeDataAction[],
) {
  return `<section class="studio-native-data__section">
    <div class="studio-native-data__section-head">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
    <div class="studio-native-data__actions">
      ${actions.map(renderNativeDataAction).join("")}
    </div>
  </section>`;
}

function renderNativeProjectSnapshot(
  state: StudioState,
  projectSummary: EngineProjectSummary,
) {
  const rows: NativeDataMetric[] = [
    {
      label: t(state.language, "画布", "Canvas"),
      value: `${formatDataValue(projectSummary.pendingWidth || state.document.documentWidth)} x ${formatDataValue(projectSummary.pendingHeight || state.document.documentHeight)}`,
    },
    {
      label: t(state.language, "点数", "Points"),
      value:
        projectSummary.pendingCellsLabel ||
        projectSummary.pendingPoints ||
        EMPTY_VALUE,
    },
    {
      label: t(state.language, "国家", "States"),
      value: projectSummary.pendingStates,
    },
    {
      label: t(state.language, "省份比例", "Province ratio"),
      value: projectSummary.pendingProvincesRatio,
    },
    {
      label: t(state.language, "文化", "Cultures"),
      value: projectSummary.pendingCultures,
    },
    {
      label: t(state.language, "宗教", "Religions"),
      value: projectSummary.pendingReligions,
    },
  ];

  return `<section class="studio-native-data__section">
    <div class="studio-native-data__section-head">
      <h3>${t(state.language, "项目参数快照", "Project parameter snapshot")}</h3>
      <p>${t(state.language, "确认当前项目来自 AGM 项目流，而不是旧编辑器散落状态。", "Confirm whether the current project comes from the AGM project flow instead of scattered legacy editor state.")}</p>
    </div>
    <div class="studio-native-data__metrics studio-native-data__metrics--compact">
      ${rows.map(renderNativeDataMetric).join("")}
    </div>
  </section>`;
}

export function renderDataPanel(
  state: StudioState,
  dataActions: EngineDataActions,
  projectSummary: EngineProjectSummary,
) {
  const snapshotLabel = projectSummary.hasLocalSnapshot
    ? t(state.language, "快照可用", "Snapshot available")
    : t(state.language, "暂无快照", "No snapshot");
  const sourceLabel = dataActions.sourceLabel
    ? localizeEngineDisplayValue(dataActions.sourceLabel, state.language)
    : EMPTY_VALUE;
  const sourceDetail = dataActions.sourceDetail
    ? localizeEngineDisplayValue(dataActions.sourceDetail, state.language)
    : EMPTY_VALUE;
  const saveLabel = dataActions.saveLabel
    ? localizeEngineDisplayValue(dataActions.saveLabel, state.language)
    : EMPTY_VALUE;
  const saveDetail = dataActions.saveDetail
    ? localizeEngineDisplayValue(dataActions.saveDetail, state.language)
    : EMPTY_VALUE;

  return `
        <section class="studio-native-data" data-native-data-center="true">
          <div class="studio-native-data__hero">
            <div>
              <p>${t(state.language, "基表与项目数据", "Tables and project data")}</p>
              <h3>${t(state.language, "数据检查中心", "Data Inspection Center")}</h3>
              <span>${t(state.language, "检查当前项目来源、快照、保存目标和生成参数；这里是 AGM 的项目数据入口。", "Inspect source, snapshot, save targets, and generation parameters; this is AGM's project data entrypoint.")}</span>
            </div>
            <strong class="studio-native-data__status${projectSummary.hasLocalSnapshot ? " is-ready" : ""}">${snapshotLabel}</strong>
          </div>
          <div class="studio-native-data__metrics">
            ${renderNativeDataMetric({ label: t(state.language, "项目名称", "Project name"), value: state.document.name })}
            ${renderNativeDataMetric({ label: t(state.language, "种子", "Seed"), value: state.document.seed })}
            ${renderNativeDataMetric({ label: t(state.language, "保存状态", "Save state"), value: state.document.dirty ? t(state.language, "未保存", "Unsaved") : t(state.language, "已保存", "Saved") })}
            ${renderNativeDataMetric({ label: t(state.language, "来源", "Source"), value: sourceLabel })}
            ${renderNativeDataMetric({ label: t(state.language, "加载详情", "Load detail"), value: sourceDetail })}
            ${renderNativeDataMetric({ label: t(state.language, "上次保存", "Last save"), value: saveLabel })}
            ${renderNativeDataMetric({ label: t(state.language, "保存详情", "Save detail"), value: saveDetail })}
            ${renderNativeDataMetric({ label: t(state.language, "自动保存", "Autosave"), value: projectSummary.autosaveInterval })}
          </div>
          ${renderNativeDataActionGroup(
            t(state.language, "本地项目操作", "Local project actions"),
            t(
              state.language,
              "加载浏览器快照、保存当前项目、打开文件或创建生成世界。",
              "Load browser snapshots, save the current project, open files, or create a generated world.",
            ),
            [
              {
                enabled: dataActions.canLoadBrowserSnapshot,
                icon: "bolt",
                label: t(state.language, "加载快照", "Load snapshot"),
                primary: true,
                value: "load-browser-snapshot",
              },
              {
                enabled: dataActions.canSaveBrowserSnapshot,
                icon: "save",
                label: t(state.language, "保存快照", "Save snapshot"),
                value: "save-browser-snapshot",
              },
              {
                enabled: dataActions.canDownloadProject,
                icon: "download",
                label: t(state.language, "下载项目", "Download project"),
                value: "download-project",
              },
              {
                enabled: dataActions.canOpenFile,
                icon: "folder",
                label: t(state.language, "打开文件", "Open file"),
                value: "open-file",
              },
              {
                enabled: dataActions.canCreateGeneratedWorld,
                icon: "plus",
                label: t(state.language, "创建生成世界", "Create world"),
                value: "create-generated-world",
              },
            ],
          )}
          ${renderNativeProjectSnapshot(state, projectSummary)}
          ${renderNativeDataActionGroup(
            t(state.language, "外部来源", "External sources"),
            t(
              state.language,
              "保留 URL 来源入口，用于导入外部地图数据。",
              "Keep URL source loading for external map data imports.",
            ),
            [
              {
                enabled: dataActions.canOpenUrlSource,
                icon: "upload",
                label: t(state.language, "打开 URL 来源", "Open URL source"),
                value: "open-url-source",
              },
            ],
          )}
        </section>
      `;
}
