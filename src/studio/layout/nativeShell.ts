import {
  getEngineEntitySummary,
  getEngineLayerStates,
  getEngineTopbarActions,
  getEngineWorldResourceSummary,
} from "../bridge/engineActions";
import { STUDIO_CANVAS_PRESETS } from "../canvas/presets";
import type {
  FitMode,
  StudioEditorModule,
  StudioSection,
  StudioState,
} from "../types";
import { renderBiomeDistributionInsights } from "./biomeInsightsPanel";
import { renderCanvasSelectionInfo } from "./canvasPanel";
import { createRelationshipRepairHealthFromSummaries } from "./directRelationshipRepairHealth";
import {
  DIRECT_WORKBENCH_TARGETS,
  type DirectWorkbenchTargetId,
} from "./directWorkbenchTargets";
import { renderInspector } from "./inspectorPanel";
import { getProjectDeliveryStatusLabel } from "./projectPanelFormatters";
import { renderTopbarUtilityControls } from "./shellChrome";
import {
  CANVAS_TOOL_LABELS,
  CANVAS_TOOL_ORDER,
  FIT_MODE_LABELS,
  LAYER_CONTROL_LABELS,
  LAYER_CONTROL_ZH_LABELS,
  PRODUCT_NAV_LABELS,
  VIEWPORT_PRESET_LABELS,
} from "./shellConstants";
import { renderFocusOverlay } from "./shellFocusOverlay";
import { escapeHtml, studioIcon, studioThemeLogoUrl, t } from "./shellShared";

const NATIVE_VIEWPORT_PRESET_IDS = [
  "desktop-landscape",
  "desktop-portrait",
  "widescreen-landscape",
  "widescreen-portrait",
  "classic-landscape",
  "classic-portrait",
  "square",
];

const NATIVE_LAYER_ACTIONS: Array<keyof typeof LAYER_CONTROL_LABELS> = [
  "toggleCells",
  "toggleBiomes",
  "toggleRivers",
  "toggleRelief",
  "toggleBorders",
  "toggleRoutes",
  "toggleReligions",
  "toggleMarkers",
];

const NATIVE_LAYER_ICONS: Record<keyof typeof LAYER_CONTROL_LABELS, string> = {
  toggleTexture: "image",
  toggleHeight: "bar-chart-3",
  toggleBiomes: "leaf",
  toggleCells: "grid-3x3",
  toggleGrid: "grid",
  toggleCoordinates: "crosshair",
  toggleCompass: "compass",
  toggleRivers: "waves",
  toggleRelief: "mountain",
  toggleReligions: "star",
  toggleCultures: "palette",
  toggleStates: "flag",
  toggleProvinces: "map-pin",
  toggleZones: "grid-3x3",
  toggleBorders: "minus",
  toggleRoutes: "route",
  toggleTemperature: "thermometer",
  togglePopulation: "users",
  toggleIce: "snowflake",
  togglePrecipitation: "cloud-rain",
  toggleEmblems: "badge",
  toggleBurgIcons: "building-2",
  toggleLabels: "type",
  toggleMilitary: "shield",
  toggleMarkers: "pin-dot",
  toggleRulers: "ruler",
  toggleScaleBar: "scale",
  toggleVignette: "circle",
};

type NativeIconBarDirectModule = {
  kind: "direct";
  key: string;
  label: string;
  labelEn: string;
  icon: string;
  hint: string;
  target: DirectWorkbenchTargetId;
};

type NativeIconBarSectionModule = {
  kind: "section";
  key: string;
  label: string;
  labelEn: string;
  icon: string;
  hint: string;
  section: StudioSection;
};

type NativeIconBarPlaceholderModule = {
  kind: "placeholder";
  key: string;
  label: string;
  labelEn: string;
  icon: string;
  hint: string;
};

type NativeIconBarModule =
  | NativeIconBarDirectModule
  | NativeIconBarSectionModule
  | NativeIconBarPlaceholderModule;

const NATIVE_EDITOR_MODULES: NativeIconBarModule[] = [
  {
    kind: "direct",
    key: "states",
    label: "国家",
    labelEn: "States",
    icon: "flag",
    hint: "编辑国家名称、首都、文化、人口与外交关系",
    target: DIRECT_WORKBENCH_TARGETS.states,
  },
  {
    kind: "direct",
    key: "mapFeatures",
    label: "地图要素",
    labelEn: "Map features",
    icon: "grid-3x3",
    hint: "编辑路线、标记和区域",
    target: DIRECT_WORKBENCH_TARGETS.routes,
  },
  {
    kind: "section",
    key: "layers",
    label: "图层",
    labelEn: "Layers",
    icon: "layers",
    hint: "管理地图叠加层、可见性和快捷卡片",
    section: "layers",
  },
  {
    kind: "direct",
    key: "biomes",
    label: "生物群系",
    labelEn: "Biomes",
    icon: "leaf",
    hint: "编辑生物群系适居度、资源标签和 AGM 规则权重",
    target: DIRECT_WORKBENCH_TARGETS.biomes,
  },
  {
    kind: "section",
    key: "tables",
    label: "基表",
    labelEn: "Tables",
    icon: "table",
    hint: "查看底层数据表和快照",
    section: "data",
  },
];

type NativeV8EditorTab = {
  key: StudioEditorModule;
  label: string;
  labelEn: string;
  icon: string;
  target: DirectWorkbenchTargetId;
};

const NATIVE_V8_ENTITY_EDITOR_TABS: NativeV8EditorTab[] = [
  {
    key: "states",
    label: "国家",
    labelEn: "States",
    icon: "flag",
    target: DIRECT_WORKBENCH_TARGETS.states,
  },
  {
    key: "cultures",
    label: "文化",
    labelEn: "Cultures",
    icon: "palette",
    target: DIRECT_WORKBENCH_TARGETS.cultures,
  },
  {
    key: "religions",
    label: "宗教",
    labelEn: "Religions",
    icon: "temple",
    target: DIRECT_WORKBENCH_TARGETS.religions,
  },
  {
    key: "provinces",
    label: "省份",
    labelEn: "Provinces",
    icon: "province",
    target: DIRECT_WORKBENCH_TARGETS.provinces,
  },
  {
    key: "burgs",
    label: "城镇",
    labelEn: "Burgs",
    icon: "building-2",
    target: DIRECT_WORKBENCH_TARGETS.burgs,
  },
  {
    key: "diplomacy",
    label: "外交",
    labelEn: "Diplomacy",
    icon: "handshake",
    target: DIRECT_WORKBENCH_TARGETS.diplomacy,
  },
];

const NATIVE_V8_MAP_FEATURE_TABS: NativeV8EditorTab[] = [
  {
    key: "routes",
    label: "路线",
    labelEn: "Routes",
    icon: "route",
    target: DIRECT_WORKBENCH_TARGETS.routes,
  },
  {
    key: "markers",
    label: "标记",
    labelEn: "Markers",
    icon: "pin-dot",
    target: DIRECT_WORKBENCH_TARGETS.markers,
  },
  {
    key: "zones",
    label: "区域",
    labelEn: "Zones",
    icon: "zones",
    target: DIRECT_WORKBENCH_TARGETS.zones,
  },
];

const NATIVE_V8_MAP_FEATURE_MODULES = NATIVE_V8_MAP_FEATURE_TABS.map(
  (tab) => tab.key,
);

function shouldRenderNativeV8EntityEditorTabs(state: StudioState) {
  return (
    state.section === "editors" &&
    NATIVE_V8_ENTITY_EDITOR_TABS.some(
      (tab) => tab.key === state.shell.activeEditorModule,
    )
  );
}

function shouldRenderNativeV8MapFeatureTabs(state: StudioState) {
  return (
    state.section === "editors" &&
    NATIVE_V8_MAP_FEATURE_TABS.some(
      (tab) => tab.key === state.shell.activeEditorModule,
    )
  );
}

function renderProjectHomeAction(
  action: "new" | "open",
  enabled: boolean,
  state: StudioState,
) {
  const label = action === "new" ? "Create world" : "Open project";
  const zhLabel = action === "new" ? "创建世界" : "打开项目";
  const icon = action === "new" ? "plus" : "folder";
  return `<button class="studio-project-home__action${action === "new" ? " studio-project-home__action--primary" : ""}" data-studio-action="topbar" data-value="${action}"${enabled ? "" : " disabled"}>${studioIcon(icon, "studio-project-home__action-icon")}<span>${t(state.language, zhLabel, label)}</span></button>`;
}

function renderProjectHomeRecent(state: StudioState) {
  const recent = state.projectCenter.recentProjects.slice(0, 3);
  if (!recent.length) {
    return `<div class="studio-project-home__empty">${t(state.language, "暂无最近项目", "No recent projects yet")}</div>`;
  }

  return recent
    .map((project) => {
      const dimensions = project.width
        ? `${project.width} x ${project.height}`
        : project.gameProfile;
      const deliveryLabel = getProjectDeliveryStatusLabel(
        project.deliveryStatus,
        state.language,
      );
      return `<button class="studio-project-home__recent-row" data-studio-action="direct-workbench-jump" data-workbench-target="${DIRECT_WORKBENCH_TARGETS.states}" data-value="states">
        <span class="studio-project-home__recent-icon">${studioIcon("globe", "studio-project-home__recent-svg")}</span>
        <span class="studio-project-home__recent-main">
          <strong>${escapeHtml(project.name || "Untitled map")}</strong>
          <span>${escapeHtml(dimensions)} 路 ${escapeHtml(project.seed || "draft")} 路 ${escapeHtml(deliveryLabel)}</span>
        </span>
        ${studioIcon("chevron-right", "studio-project-home__recent-arrow")}
      </button>`;
    })
    .join("");
}

function renderProjectHomeTemplates() {
  const templates = [
    ["strategy", "Strategy campaign", "Large scale borders"],
    ["rpg", "RPG world", "Regions, towns, routes"],
    ["open-world", "Open world", "Exploration map"],
  ];

  return templates
    .map(
      ([
        profile,
        title,
        desc,
      ]) => `<button class="studio-project-home__template" data-studio-action="direct-workbench-jump" data-workbench-target="${DIRECT_WORKBENCH_TARGETS.states}" data-value="states" data-profile="${profile}">
        <span class="studio-project-home__template-art"></span>
        <span class="studio-project-home__template-body">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(desc)}</span>
        </span>
      </button>`,
    )
    .join("");
}

function renderNativeProjectHome(state: StudioState) {
  const actions = getEngineTopbarActions();

  return `
    <div id="studioApp" class="studio-app studio-native-app studio-project-home-app" data-native-shell="project-home">
      <main class="studio-project-home" aria-label="${t(state.language, "项目首页", "Project home")}">
        <div class="studio-project-home__utility">
          ${renderTopbarUtilityControls(state)}
        </div>
        <section class="studio-project-home__content">
          <div class="studio-project-home__brand">
            <span class="studio-project-home__brand-mark">${studioIcon("mountain", "studio-project-home__brand-icon")}</span>
            <h1>Atlas 生成矩阵</h1>
            <p>${t(state.language, "程序化世界生成编辑器", "Procedural world generation editor")}</p>
          </div>
          <div class="studio-project-home__actions">
            ${renderProjectHomeAction("new", actions.new, state)}
            ${renderProjectHomeAction("open", actions.open, state)}
            <button class="studio-project-home__action" data-studio-action="direct-workbench-jump" data-workbench-target="${DIRECT_WORKBENCH_TARGETS.states}" data-value="states">${studioIcon("canvas", "studio-project-home__action-icon")}<span>${t(state.language, "进入工作台", "Enter workbench")}</span></button>
          </div>
          <section class="studio-project-home__section" aria-label="${t(state.language, "最近项目", "Recent projects")}">
            <h2>${t(state.language, "最近项目", "Recent projects")}</h2>
            <div class="studio-project-home__recent-list">${renderProjectHomeRecent(state)}</div>
          </section>
          <section class="studio-project-home__section" aria-label="${t(state.language, "场景", "Scenarios")}">
            <h2>${t(state.language, "场景", "Scenarios")}</h2>
            <div class="studio-project-home__templates">${renderProjectHomeTemplates()}</div>
          </section>
          <footer class="studio-project-home__footer">AGM Studio v1.0-beta 路 ${t(state.language, "引擎就绪", "Engine ready")}</footer>
        </section>
      </main>
    </div>
  `;
}

function getNativeModuleLabel(state: StudioState, module: NativeIconBarModule) {
  return state.language === "zh-CN" ? module.label : module.labelEn;
}

function getNativeModuleActive(
  state: StudioState,
  module: NativeIconBarModule,
) {
  if (module.kind === "section") return module.section === state.section;
  if (module.kind === "direct") {
    return (
      state.section === "editors" &&
      (module.key === state.shell.activeEditorModule ||
        (module.key === "states" &&
          NATIVE_V8_ENTITY_EDITOR_TABS.some(
            (tab) => tab.key === state.shell.activeEditorModule,
          )) ||
        (module.key === "mapFeatures" &&
          NATIVE_V8_MAP_FEATURE_MODULES.includes(
            state.shell.activeEditorModule,
          )))
    );
  }
  return false;
}

function renderNativeIconBarModuleItem(
  state: StudioState,
  module: NativeIconBarModule,
  index: number,
) {
  const active = getNativeModuleActive(state, module);
  const label = getNativeModuleLabel(state, module);
  const disabled = module.kind === "placeholder";
  const actionAttributes =
    module.kind === "direct"
      ? `data-studio-action="direct-workbench-jump" data-workbench-target="${module.target}" data-value="${escapeHtml(module.key)}"`
      : module.kind === "section"
        ? `data-studio-action="section" data-value="${module.section}"`
        : `data-studio-action="native-module-placeholder" data-value="${escapeHtml(module.key)}"`;

  return `<button class="studio-native-iconbar__item${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}" ${actionAttributes} aria-pressed="${active}" title="${escapeHtml(module.hint)}" style="--item-index:${index}"${disabled ? " disabled" : ""}>
    <span class="studio-native-iconbar__item-mark">${studioIcon(module.icon, "studio-native-iconbar__svg")}</span>
    <span class="studio-native-iconbar__item-copy"><span class="studio-native-iconbar__item-label">${escapeHtml(label)}</span><span class="studio-native-iconbar__item-hint">${escapeHtml(module.hint)}</span></span>
  </button>`;
}

function renderNativeV8CanvasTools(state: StudioState) {
  return `<nav class="studio-native-v8-canvas-tools" data-native-v8-canvas-tools="true" role="toolbar" aria-label="${t(state.language, "画布工具", "Canvas tools")}">
    ${CANVAS_TOOL_ORDER.map((tool) => {
      const item = CANVAS_TOOL_LABELS[state.language][tool];
      const active = tool === state.viewport.canvasTool;
      return `<button class="studio-native-v8-canvas-tool${active ? " is-active" : ""}" type="button" data-studio-action="canvas-tool" data-value="${tool}" aria-label="${escapeHtml(item.hint)}" aria-pressed="${active}" title="${escapeHtml(item.hint)}">${studioIcon(item.icon, "studio-native-v8-canvas-tool__icon")}<span>${escapeHtml(item.label)}</span></button>`;
    }).join("")}
  </nav>`;
}

function renderNativeIconBar(state: StudioState) {
  const activeModule =
    NATIVE_EDITOR_MODULES.find((module) =>
      getNativeModuleActive(state, module),
    ) ?? NATIVE_EDITOR_MODULES[0];
  const activeLabel = activeModule
    ? getNativeModuleLabel(state, activeModule)
    : t(state.language, "\u5de5\u4f5c\u53f0", "Workbench");

  return `
    <aside class="studio-native-iconbar" aria-label="${t(state.language, "AGM 宸ヤ綔鍖", "AGM workspace")}">
      <div class="studio-native-iconbar__module-area">
        <div class="studio-native-iconbar__header" aria-hidden="true">
          <span class="studio-native-iconbar__kicker">${t(state.language, "\u5de5\u4f5c\u53f0", "Workbench")}</span>
          <strong>${escapeHtml(activeLabel)}</strong>
        </div>
        <nav class="studio-native-iconbar__nav studio-native-iconbar__nav--modules" aria-label="${t(state.language, "编辑模块", "Editor modules")}">
          ${NATIVE_EDITOR_MODULES.map((module, index) =>
            renderNativeIconBarModuleItem(state, module, index),
          ).join("")}
        </nav>
        ${renderNativeV8CanvasTools(state)}
      </div>
    </aside>
  `;
}

function getNativeRepairHealth(state: StudioState) {
  return createRelationshipRepairHealthFromSummaries({
    directEditor: state.directEditor,
    entitySummary: getEngineEntitySummary(),
    language: state.language,
    worldResources: getEngineWorldResourceSummary(),
  });
}

function renderNativeWorkflowStat(label: string, value: string | number) {
  return `<div class="studio-native-workflow__stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function renderNativeRepairWorkflow(state: StudioState) {
  const health = getNativeRepairHealth(state);
  const ready = health.exportGate === "ready";
  return `
    <section class="studio-native-workflow studio-native-workflow--repair" data-native-workflow="repair" data-relationship-delivery-status="${health.deliveryStatus}">
      <div class="studio-native-workflow__hero">
        <div>
          <p>${t(state.language, "验证工作流", "Validation workflow")}</p>
          <h3>${t(state.language, "关系修复中心", "Relationship Repair Center")}</h3>
          <span>${t(state.language, "检测关系问题、推荐修复、入队、应用、撤销，并更新导出准备状态。", "Detect relationship issues, recommend repairs, queue, apply, undo, and update export readiness.")}</span>
        </div>
        <strong class="studio-native-workflow__pill${ready ? " is-ready" : " is-blocked"}">${ready ? t(state.language, "可导出", "Ready") : t(state.language, "阻塞", "Blocked")}</strong>
      </div>
      <div class="studio-native-workflow__stats">
        ${renderNativeWorkflowStat(t(state.language, "关系问题", "Relationship issues"), health.issueCount)}
        ${renderNativeWorkflowStat(t(state.language, "阻塞问题", "Blocking issues"), health.blockingIssueCount)}
        ${renderNativeWorkflowStat(t(state.language, "上次修复", "Last repair"), health.lastAppliedRepairId ? `#${health.lastAppliedRepairId}` : "-")}
      </div>
      <div class="studio-native-workflow__actions">
        <button class="studio-native-workflow__button" data-studio-action="section" data-value="export">${t(state.language, "查看导出状态", "View export status")}</button>
        <button class="studio-native-workflow__button" data-studio-action="direct-relationship-history-review"${state.directEditor.relationshipQueueHistory?.target ? "" : " disabled"}>${t(state.language, "复查最近修复", "Review last repair")}</button>
      </div>
    </section>
  `;
}

function renderNativeExportWorkflowDecision(
  state: StudioState,
  blocked: boolean,
) {
  if (blocked) {
    return `
      <div class="studio-native-workflow__decision is-blocked" data-export-delivery-decision="needs-repair" data-export-run-policy="image-export-allowed-delivery-blocked">
        <strong>${t(state.language, "交付前需要修复", "Needs repair before delivery")}</strong>
        <span>${t(state.language, "当前图像仍可导出用于检查；正式交付包应等待关系修复完成。", "Current image export remains available for review; package handoff should wait for relationship repair.")}</span>
        <div class="studio-native-workflow__actions">
          <button class="studio-native-workflow__button studio-native-workflow__button--primary" data-studio-action="section" data-value="repair">${t(state.language, "打开修复中心", "Open Repair Center")}</button>
          <button class="studio-native-workflow__button" data-studio-action="run-export">${t(state.language, "导出当前图像", "Export current image")}</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="studio-native-workflow__decision is-ready" data-export-delivery-decision="ready" data-export-run-policy="package-export-ready">
      <strong>${t(state.language, "可以交付", "Ready to deliver")}</strong>
      <span>${t(state.language, "关系修复 gate 已通过；可以导出引擎包，或继续导出当前视图。", "Relationship repair gate has passed; export the engine package or continue exporting the current view.")}</span>
      <div class="studio-native-workflow__actions">
        <button class="studio-native-workflow__button studio-native-workflow__button--primary" data-studio-action="project" data-value="export-engine-package">${t(state.language, "导出引擎包 ZIP", "Export Engine Package ZIP")}</button>
        <button class="studio-native-workflow__button" data-studio-action="run-export">${t(state.language, "导出当前图像", "Export current image")}</button>
        <button class="studio-native-workflow__button" data-studio-action="section" data-value="repair">${t(state.language, "复查修复中心", "Review Repair Center")}</button>
      </div>
    </div>
  `;
}

function renderNativeExportWorkflow(state: StudioState) {
  const health = getNativeRepairHealth(state);
  const blocked = health.exportGate === "blocked";
  const needsRepair = health.deliveryStatus === "needs-repair";
  return `
    <section class="studio-native-workflow studio-native-workflow--export" data-native-workflow="export" data-relationship-export-gate="${health.exportGate}" data-relationship-delivery-status="${health.deliveryStatus}">
      <div class="studio-native-workflow__hero">
        <div>
          <p>${t(state.language, "交付工作流", "Delivery workflow")}</p>
          <h3>${t(state.language, "导出中心", "Export Center")}</h3>
          <span>${blocked ? t(state.language, "仍有关系阻塞问题；旧导出函数不会被硬拦，但 AGM 不会把它视为交付就绪。", "Relationship blocking issues remain; legacy export still works, but AGM will not mark it as delivery-ready.") : t(state.language, "关系修复 gate 已通过，可以继续打包或导出。", "Relationship repair gate has passed; package and export can continue.")}</span>
        </div>
        <strong class="studio-native-workflow__pill${needsRepair ? " is-blocked" : " is-ready"}">${needsRepair ? t(state.language, "需要修复", "Needs repair") : t(state.language, "可交付", "Ready to deliver")}</strong>
      </div>
      <div class="studio-native-workflow__stats">
        ${renderNativeWorkflowStat(t(state.language, "导出 Gate", "Export gate"), health.exportGate)}
        ${renderNativeWorkflowStat(t(state.language, "阻塞问题", "Blocking issues"), health.blockingIssueCount)}
        ${renderNativeWorkflowStat(t(state.language, "格式", "Format"), state.export.format.toUpperCase())}
      </div>
      ${renderNativeExportWorkflowDecision(state, blocked)}
    </section>
  `;
}

function renderNativeDrawerWorkflow(state: StudioState) {
  switch (state.section) {
    case "repair":
      return renderNativeRepairWorkflow(state);
    case "export":
      return renderNativeExportWorkflow(state);
    default:
      return "";
  }
}

function getNativeDrawerChrome(state: StudioState) {
  const nav = PRODUCT_NAV_LABELS[state.language][state.section];
  if (state.section === "editors") {
    return {
      icon: "flag",
      label: t(state.language, "编辑模块", "Editor modules"),
      eyebrow: t(state.language, "当前模块抽屉", "Current module drawer"),
    };
  }
  return {
    icon: nav.icon,
    label: nav.label,
    eyebrow: t(state.language, "当前工作区", "Current workspace"),
  };
}

function renderNativeDrawer(state: StudioState) {
  if (state.section === "canvas" || state.section === "project") return "";

  const chrome = getNativeDrawerChrome(state);
  return `
    <section class="studio-native-drawer studio-native-drawer--single" data-native-drawer="${state.section}" aria-label="${escapeHtml(chrome.label)}">
      <button class="studio-native-drawer__close" data-studio-action="section" data-value="canvas" aria-label="${t(state.language, "鍏抽棴鎶藉眽", "Close drawer")}">${studioIcon("x", "studio-native-drawer__close-icon")}</button>
      <div class="studio-native-drawer__body">${renderNativeDrawerWorkflow(state)}${renderInspector(state)}</div>
    </section>
  `;
}

function renderNativeViewportControls(state: StudioState) {
  const fitModeLabels = FIT_MODE_LABELS[state.language];
  const activePresetId = getNativePresetFamilyId(state.viewport.presetId);
  const fitModes: FitMode[] = ["contain", "cover", "actual-size"];

  return `
    <div class="studio-floating-toolbar__group studio-floating-toolbar__group--view" aria-label="${t(state.language, "画布视图", "Canvas view")}">
      ${renderNativeViewportDropdown(
        "presetId",
        studioIcon("monitor", "studio-floating-toolbar__select-icon"),
        t(state.language, "尺寸", "Size"),
        getNativePresetShortLabel(activePresetId, state),
        STUDIO_CANVAS_PRESETS.filter((preset) =>
          NATIVE_VIEWPORT_PRESET_IDS.includes(preset.id),
        ).map((preset) => ({
          value: preset.id,
          label: getNativePresetShortLabel(preset.id, state),
          selected: activePresetId === preset.id,
        })),
      )}
      ${renderNativeViewportDropdown(
        "fitMode",
        studioIcon("expand", "studio-floating-toolbar__select-icon"),
        t(state.language, "閫傞厤妯″紡", "Fit mode"),
        fitModeLabels[state.viewport.fitMode],
        fitModes.map((fitMode) => ({
          value: fitMode,
          label: fitModeLabels[fitMode],
          selected: state.viewport.fitMode === fitMode,
        })),
      )}
    </div>
  `;
}

function getNativePresetShortLabel(
  presetId: string,
  state: StudioState,
): string {
  switch (presetId) {
    case "desktop-landscape":
      return "16:10";
    case "desktop-portrait":
      return "10:16";
    case "widescreen-landscape":
      return "16:9";
    case "widescreen-portrait":
      return "9:16";
    case "classic-landscape":
      return "4:3";
    case "classic-portrait":
      return "3:4";
    case "mobile-portrait":
      return t(state.language, "绉诲姩绔栧睆", "Mobile portrait");
    case "mobile-landscape":
      return t(state.language, "绉诲姩妯睆", "Mobile landscape");
    case "square":
      return "1:1";
    default:
      return VIEWPORT_PRESET_LABELS[state.language][presetId] ?? presetId;
  }
}

function getNativePresetFamilyId(presetId: string) {
  return presetId;
}

function renderNativeViewportDropdown(
  field: "presetId" | "fitMode",
  icon: string,
  title: string,
  valueLabel: string,
  options: Array<{ value: string; label: string; selected: boolean }>,
) {
  const ariaLabel = `${title}: ${valueLabel}`;
  const optionHtml = options
    .map(
      (option) =>
        `<button class="studio-floating-toolbar__dropdown-option${option.selected ? " is-selected" : ""}" type="button" data-studio-action="viewport-dropdown-option" data-field="${field}" data-value="${escapeHtml(option.value)}" aria-label="${escapeHtml(`${title}: ${option.label}`)}" aria-pressed="${option.selected}"><span>${escapeHtml(option.label)}</span>${option.selected ? studioIcon("check", "studio-floating-toolbar__dropdown-check") : ""}</button>`,
    )
    .join("");
  return `<details class="studio-floating-toolbar__dropdown" name="studio-floating-toolbar-viewport" data-toolbar-control="${field}" data-viewport-field="${field}"><summary class="studio-floating-toolbar__dropdown-trigger" title="${escapeHtml(title)}" aria-label="${escapeHtml(ariaLabel)}">${icon}<span>${escapeHtml(valueLabel)}</span>${studioIcon("chevron-down", "studio-floating-toolbar__select-caret")}</summary><div class="studio-floating-toolbar__dropdown-menu">${optionHtml}</div></details>`;
}

function renderNativeToolButtons(state: StudioState) {
  return CANVAS_TOOL_ORDER.map((tool) => {
    const item = CANVAS_TOOL_LABELS[state.language][tool];
    const active = tool === state.viewport.canvasTool;
    return `<button class="studio-floating-toolbar__tool${active ? " is-active" : ""}" data-studio-action="canvas-tool" data-value="${tool}" aria-label="${escapeHtml(item.hint)}" aria-pressed="${active}" title="${escapeHtml(item.hint)}">${studioIcon(item.icon, "studio-floating-toolbar__tool-icon")}</button>`;
  }).join("");
}

function renderNativeGenerationButtons(state: StudioState) {
  const topbarActions = getEngineTopbarActions();
  const brushActive = state.viewport.canvasTool === "brush";
  const generateLabel = t(state.language, "生成", "Generate");
  const biomeLabel = t(state.language, "调整生物群系", "Adjust biomes");
  return `
    <div class="studio-floating-toolbar__group studio-floating-toolbar__group--commands">
      <button class="studio-floating-toolbar__icon-command studio-floating-toolbar__icon-command--generate" data-studio-action="topbar" data-value="new" aria-label="${escapeHtml(generateLabel)}" title="${escapeHtml(generateLabel)}"${topbarActions.new ? "" : " disabled"}>${studioIcon("sparkles", "studio-floating-toolbar__tool-icon")}</button>
      <button class="studio-floating-toolbar__icon-command studio-floating-toolbar__icon-command--biome${brushActive ? " is-active" : ""}" data-studio-action="canvas-tool" data-value="brush" aria-label="${escapeHtml(biomeLabel)}" aria-pressed="${brushActive}" title="${escapeHtml(biomeLabel)}">${studioIcon("leaf", "studio-floating-toolbar__tool-icon")}</button>
    </div>
  `;
}

function renderNativeFloatingToolbar(state: StudioState) {
  return `
    <div class="studio-floating-toolbar" data-floating-toolbar="canvas" role="toolbar" aria-label="${t(state.language, "画布工具栏", "Canvas toolbar")}">
      ${renderNativeViewportControls(state)}
      <div class="studio-floating-toolbar__group studio-floating-toolbar__group--tools">${renderNativeToolButtons(state)}</div>
      ${renderNativeGenerationButtons(state)}
    </div>
  `;
}

function renderNativeV8TopbarAction(
  value: "save" | "new" | "export",
  label: string,
  icon: string,
  enabled: boolean,
  variant = "",
) {
  return `<button class="studio-native-v8-topbar__action${variant ? ` studio-native-v8-topbar__action--${variant}` : ""}" type="button" data-studio-action="topbar" data-value="${value}"${enabled ? "" : " disabled"}>${studioIcon(icon, "studio-native-v8-topbar__action-icon")}<span>${escapeHtml(label)}</span></button>`;
}

function renderNativeV8TopbarSectionAction(
  value: "repair" | "export",
  label: string,
  icon: string,
  variant = "",
) {
  return `<button class="studio-native-v8-topbar__action${variant ? ` studio-native-v8-topbar__action--${variant}` : ""}" type="button" data-studio-action="section" data-value="${value}">${studioIcon(icon, "studio-native-v8-topbar__action-icon")}<span>${escapeHtml(label)}</span></button>`;
}

function renderNativeV8ViewportDropdown(
  field: "presetId" | "fitMode",
  icon: string,
  title: string,
  valueLabel: string,
  options: Array<{ value: string; label: string; selected: boolean }>,
) {
  const optionHtml = options
    .map(
      (option) =>
        `<button class="studio-native-v8-viewport__option${option.selected ? " is-selected" : ""}" type="button" data-studio-action="viewport-dropdown-option" data-field="${field}" data-value="${escapeHtml(option.value)}" aria-label="${escapeHtml(`${title}: ${option.label}`)}" aria-pressed="${option.selected}"><span>${escapeHtml(option.label)}</span>${option.selected ? studioIcon("check", "studio-native-v8-viewport__check") : ""}</button>`,
    )
    .join("");

  return `<details class="studio-native-v8-viewport__dropdown" name="studio-native-v8-topbar-viewport" data-toolbar-control="${field}" data-viewport-field="${field}"><summary class="studio-native-v8-viewport__trigger" title="${escapeHtml(title)}" aria-label="${escapeHtml(`${title}: ${valueLabel}`)}">${icon}<span>${escapeHtml(valueLabel)}</span>${studioIcon("chevron-down", "studio-native-v8-viewport__caret")}</summary><div class="studio-native-v8-viewport__menu">${optionHtml}</div></details>`;
}

function renderNativeV8ViewportControls(state: StudioState) {
  const fitModeLabels = FIT_MODE_LABELS[state.language];
  const activePresetId = getNativePresetFamilyId(state.viewport.presetId);
  const fitModes: FitMode[] = ["contain", "cover", "actual-size"];

  return `<div class="studio-native-v8-viewport" data-native-v8-viewport="true" aria-label="${t(state.language, "画布视图", "Canvas view")}">
    ${renderNativeV8ViewportDropdown(
      "presetId",
      studioIcon("monitor", "studio-native-v8-viewport__icon"),
      t(state.language, "尺寸", "Size"),
      getNativePresetShortLabel(activePresetId, state),
      STUDIO_CANVAS_PRESETS.filter((preset) =>
        NATIVE_VIEWPORT_PRESET_IDS.includes(preset.id),
      ).map((preset) => ({
        value: preset.id,
        label: getNativePresetShortLabel(preset.id, state),
        selected: activePresetId === preset.id,
      })),
    )}
    ${renderNativeV8ViewportDropdown(
      "fitMode",
      studioIcon("expand", "studio-native-v8-viewport__icon"),
      t(state.language, "适配模式", "Fit mode"),
      fitModeLabels[state.viewport.fitMode],
      fitModes.map((fitMode) => ({
        value: fitMode,
        label: fitModeLabels[fitMode],
        selected: state.viewport.fitMode === fitMode,
      })),
    )}
  </div>`;
}

function renderNativeV8Topbar(state: StudioState) {
  const actions = getEngineTopbarActions();
  const themeLogo = studioThemeLogoUrl(state.theme);
  const projectCenterLabel = t(state.language, "项目中心", "Project center");

  return `
    <header class="studio-topbar studio-native-topbar studio-native-v8-topbar" data-native-v8-topbar="true">
      <div class="studio-native-v8-topbar__brand">
        <button class="studio-topbar__native-menu" data-studio-action="toggle-navigation-collapse" aria-label="${state.shell.navigationCollapsed ? t(state.language, "展开导航", "Expand navigation") : t(state.language, "收起导航", "Collapse navigation")}" aria-expanded="${state.shell.navigationCollapsed ? "false" : "true"}">
          ${studioIcon("menu", "studio-topbar__native-menu-icon")}
        </button>
        <button class="studio-brand studio-brand--native" data-studio-action="section" data-value="project" aria-label="${escapeHtml(projectCenterLabel)}" title="${escapeHtml(projectCenterLabel)}">
          <img class="studio-brand__logo" src="${themeLogo}" alt="" />
        </button>
        <div class="studio-native-v8-topbar__name">
          <strong>AGM Studio</strong>
          <span>Atlas Generation Matrix</span>
        </div>
      </div>
      <div class="studio-native-v8-topbar__context" aria-label="${t(state.language, "当前地图配置", "Current map setup")}">
        <div class="studio-native-v8-topbar__viewport-cluster">
          ${renderNativeV8ViewportControls(state)}
        </div>
      </div>
      <div class="studio-native-v8-topbar__actions">
        <div class="studio-native-v8-topbar__action-group studio-native-v8-topbar__action-group--review">
        ${renderNativeV8TopbarSectionAction("repair", t(state.language, "检查", "Check"), "validate", "repair")}
        ${renderNativeV8TopbarSectionAction("export", t(state.language, "导出", "Export"), "upload", "export")}
        </div>
        <div class="studio-native-v8-topbar__action-group studio-native-v8-topbar__action-group--commit">
        ${renderNativeV8TopbarAction("save", t(state.language, "保存", "Save"), "save", actions.save)}
        ${renderNativeV8TopbarAction("new", t(state.language, "生成", "Generate"), "sparkles", actions.new, "generate")}
        </div>
        <div class="studio-native-v8-topbar__utility-island">
        ${renderTopbarUtilityControls(state)}
        </div>
      </div>
    </header>
  `;
}

function getLayerLabel(
  action: keyof typeof LAYER_CONTROL_LABELS,
  state: StudioState,
) {
  return state.language === "zh-CN"
    ? LAYER_CONTROL_ZH_LABELS[action]
    : LAYER_CONTROL_LABELS[action];
}

const NATIVE_V8_LAYER_CARD_LABELS: Partial<
  Record<keyof typeof LAYER_CONTROL_LABELS, { zh: string; en: string }>
> = {
  toggleCells: { zh: "网格", en: "Grid" },
  toggleBiomes: { zh: "生物", en: "Biomes" },
  toggleRivers: { zh: "河流", en: "Rivers" },
  toggleRelief: { zh: "地形", en: "Hillshade" },
  toggleBorders: { zh: "边界", en: "Boundaries" },
  toggleRoutes: { zh: "路线", en: "Routes" },
  toggleReligions: { zh: "宗教", en: "Religion" },
  toggleMarkers: { zh: "标记", en: "Markers" },
};

function getNativeV8LayerCardLabel(
  action: keyof typeof LAYER_CONTROL_LABELS,
  state: StudioState,
) {
  const label = NATIVE_V8_LAYER_CARD_LABELS[action];
  if (!label) return getLayerLabel(action, state);
  return t(state.language, label.zh, label.en);
}

function getNativeV8ProfileLabel(state: StudioState) {
  const labels: Record<string, string> = {
    rpg: "RPG World",
    strategy: "Strategy Map",
    "4x": "4X Civilization",
    tabletop: "Tabletop Campaign",
    "open-world": "Open World",
    "city-kingdom-continent": "City Kingdom",
  };

  return labels[state.document.gameProfile] ?? state.document.gameProfile;
}

function renderNativeV8BottomBar(state: StudioState) {
  const layerStates = getEngineLayerStates();
  const health = getNativeRepairHealth(state);
  const fitModeLabels = FIT_MODE_LABELS[state.language];
  const activeLayerCount = NATIVE_LAYER_ACTIONS.filter((action) =>
    Boolean(layerStates[action]),
  ).length;
  const statusLabel = state.shell.generationBusy
    ? t(state.language, "生成中", "Generating")
    : state.document.dirty
      ? t(state.language, "未保存修改", "Unsaved Changes")
      : t(state.language, "生成完成", "Generation Complete");
  const presetLabel =
    VIEWPORT_PRESET_LABELS[state.language][state.viewport.presetId] ??
    state.viewport.presetId;

  return `
    <footer class="studio-native-v8-bottom" data-native-v8-bottom-bar="true" aria-label="${t(state.language, "底部图层与交付状态", "Bottom layer and delivery status")}">
      <div class="studio-native-v8-bottom__cards" role="toolbar" aria-label="${t(state.language, "图层可见性", "Layer visibility")}">
        ${NATIVE_LAYER_ACTIONS.map((action) => {
          const active = Boolean(layerStates[action]);
          const label = getNativeV8LayerCardLabel(action, state);
          const stateLabel = active
            ? t(state.language, "开启", "On")
            : t(state.language, "关闭", "Off");
          return `<button class="studio-native-v8-layer-card${active ? " is-active" : ""}" data-native-v8-layer-card="true" data-studio-action="layer" data-value="${action}" data-layer-state="${active ? "shown" : "hidden"}" aria-pressed="${active ? "true" : "false"}" aria-label="${escapeHtml(`${label}: ${stateLabel}`)}" title="${escapeHtml(`${label}: ${stateLabel}`)}">
            <span class="studio-native-v8-layer-card__glyph" aria-hidden="true">${studioIcon(NATIVE_LAYER_ICONS[action], "studio-native-v8-layer-card__svg")}</span>
            <span class="studio-native-v8-layer-card__copy">
              <span class="studio-native-v8-layer-card__title">${escapeHtml(label)}</span>
            </span>
            <span class="studio-native-v8-layer-card__state" aria-hidden="true">${studioIcon(active ? "eye" : "eye-off", "studio-native-v8-layer-card__state-icon")}</span>
          </button>`;
        }).join("")}
      </div>
      <div class="studio-native-v8-bottom__status" role="status" aria-live="polite">
        <div class="studio-native-v8-bottom__status-main">
          <span class="studio-native-v8-bottom__status-dot${state.document.dirty ? " is-dirty" : ""}" aria-hidden="true"></span>
          <strong>${statusLabel}</strong>
        </div>
        <div class="studio-native-v8-bottom__status-meta">
          <span>${escapeHtml(presetLabel)} · ${state.viewport.width} × ${state.viewport.height}</span>
          <span>${escapeHtml(fitModeLabels[state.viewport.fitMode])}</span>
          <span>${escapeHtml(getNativeV8ProfileLabel(state))}</span>
          <span>${t(state.language, "图层", "Layers")} <strong>${activeLayerCount}/${NATIVE_LAYER_ACTIONS.length}</strong></span>
        </div>
        <div class="studio-native-v8-bottom__health" aria-label="${t(state.language, "验证状态", "Validation status")}">
          <span class="studio-native-v8-bottom__health-item${health.issueCount > 0 ? " has-warning" : ""}">${studioIcon("circle-check", "studio-native-v8-bottom__health-icon")} ${t(state.language, "警告", "Warnings")} <strong>${health.issueCount}</strong></span>
          <span class="studio-native-v8-bottom__health-item${health.blockingIssueCount > 0 ? " has-error" : ""}">${studioIcon("x", "studio-native-v8-bottom__health-icon")} ${t(state.language, "错误", "Errors")} <strong>${health.blockingIssueCount}</strong></span>
        </div>
        <button class="studio-native-v8-bottom__details" type="button" data-studio-action="section" data-value="repair">${t(state.language, "详情", "Details")}</button>
      </div>
    </footer>
  `;
}

function renderNativeGenerationBusyOverlay(state: StudioState) {
  const busy = state.shell.generationBusy;
  if (!busy) return "";

  return `
    <div class="studio-generation-busy" role="status" aria-live="polite" data-generation-busy="true">
      <div class="studio-generation-busy__panel">
        <span class="studio-generation-busy__spinner" aria-hidden="true"></span>
        <span class="studio-generation-busy__copy">
          <strong>${escapeHtml(busy.title)}</strong>
          <span>${escapeHtml(busy.detail)}</span>
        </span>
      </div>
    </div>
  `;
}

function renderNativeBiomeAdjustmentPanel(state: StudioState) {
  if (state.viewport.canvasTool !== "brush") return "";
  return `<aside class="studio-native-biome-popover" data-native-biome-adjustment="true">
    ${renderBiomeDistributionInsights(
      state.language,
      state.directEditor.selectedBiomeId,
      {
        closeAction: true,
      },
    )}
  </aside>`;
}

type NativeStageOptions = {
  renderBiomePopover?: boolean;
  renderDrawer?: boolean;
  renderToolbar?: boolean;
};

function renderNativeStage(
  state: StudioState,
  {
    renderBiomePopover = true,
    renderDrawer = true,
    renderToolbar = true,
  }: NativeStageOptions = {},
) {
  return `
    <main class="studio-stage studio-native-stage">
      <div id="studioStageViewport" class="studio-stage__viewport">
        <div id="studioCanvasFrameScaler" class="studio-canvas-frame-scaler">
          <div id="studioCanvasFrame" class="studio-canvas-frame">
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--guides"></div>
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--tool-grid"></div>
            <div class="studio-canvas-frame__overlay studio-canvas-frame__overlay--measure"><span>${t(state.language, "点击并拖动测量距离", "Click and drag to measure distance")}</span></div>
            <div class="studio-canvas-paint-preview" data-canvas-paint-preview="true" data-preview-tool="${state.viewport.paintPreview?.tool || ""}" data-preview-cell="${state.viewport.paintPreview?.cellId ?? ""}"><span class="studio-canvas-paint-preview__marker"></span><span class="studio-canvas-paint-preview__label"></span></div>
            ${renderFocusOverlay(state.balanceFocus, state.language)}
            <div id="studioMapHost" class="studio-map-host" data-canvas-tool="${state.viewport.canvasTool}" data-pan-x="${Math.round(state.viewport.panX)}" data-pan-y="${Math.round(state.viewport.panY)}"></div>
          </div>
        </div>
        ${renderToolbar ? renderNativeFloatingToolbar(state) : ""}
        ${renderBiomePopover ? renderNativeBiomeAdjustmentPanel(state) : ""}
        ${renderDrawer ? renderNativeDrawer(state) : ""}
        ${renderNativeGenerationBusyOverlay(state)}
      </div>
    </main>
  `;
}

function getNativeV8InfoPanelLabel(state: StudioState) {
  if (state.section === "editors") {
    if (shouldRenderNativeV8MapFeatureTabs(state)) {
      const module = NATIVE_EDITOR_MODULES.find(
        (item) => item.key === "mapFeatures",
      ) ?? {
        label: "地图要素",
        labelEn: "Map features",
      };
      return state.language === "zh-CN" ? module.label : module.labelEn;
    }
    const module =
      NATIVE_V8_ENTITY_EDITOR_TABS.find(
        (item) => item.key === state.shell.activeEditorModule,
      ) ??
      NATIVE_EDITOR_MODULES.find(
        (item) => item.key === state.shell.activeEditorModule,
      ) ??
      NATIVE_EDITOR_MODULES[0];
    return state.language === "zh-CN" ? module.label : module.labelEn;
  }

  const nav = PRODUCT_NAV_LABELS[state.language][state.section];
  return nav.label;
}

function renderNativeV8WorkbenchTabs(
  state: StudioState,
  tabs: NativeV8EditorTab[],
  ariaLabel: string,
) {
  return `<nav class="studio-native-v8-workbench-tabs" data-native-v8-workbench-tabs="true" data-native-v8-workbench-tabs-count="${tabs.length}" aria-label="${escapeHtml(ariaLabel)}">
    ${tabs
      .map((tab) => {
        const active = tab.key === state.shell.activeEditorModule;
        const label = tab.label;
        return `<button class="studio-native-v8-workbench-tab${active ? " is-active" : ""}" type="button" data-studio-action="direct-workbench-jump" data-workbench-target="${tab.target}" data-value="${tab.key}" aria-pressed="${active}" title="${escapeHtml(label)}">
        <strong>${escapeHtml(label)}</strong>
      </button>`;
      })
      .join("")}
  </nav>`;
}

function renderNativeV8InfoPanelTabs(state: StudioState) {
  if (shouldRenderNativeV8EntityEditorTabs(state)) {
    return renderNativeV8WorkbenchTabs(
      state,
      NATIVE_V8_ENTITY_EDITOR_TABS,
      t(state.language, "实体编辑分类", "Entity editing categories"),
    );
  }

  if (shouldRenderNativeV8MapFeatureTabs(state)) {
    return renderNativeV8WorkbenchTabs(
      state,
      NATIVE_V8_MAP_FEATURE_TABS,
      t(state.language, "地图要素分类", "Map feature categories"),
    );
  }

  return "";
}

function renderNativeV8CanvasInfo(state: StudioState) {
  const selectionInfo = renderCanvasSelectionInfo(
    state.viewport,
    state.language,
  );

  return selectionInfo;
}

function renderNativeV8Inspector(state: StudioState) {
  if (state.section === "canvas") return renderNativeV8CanvasInfo(state);
  return renderInspector(state);
}

function renderNativeV8InfoPanel(state: StudioState) {
  const panelLabel = getNativeV8InfoPanelLabel(state);
  const panelMode = state.section === "editors" ? "workbench" : "inspector";
  const panelTabs = shouldRenderNativeV8EntityEditorTabs(state)
    ? "entity"
    : shouldRenderNativeV8MapFeatureTabs(state)
      ? "map-features"
      : "none";

  return `
    <aside class="studio-native-v8-info-panel" data-native-v8-info-panel="true" data-native-v8-panel-mode="${panelMode}" data-native-v8-panel-tabs="${panelTabs}" aria-label="${escapeHtml(panelLabel)}">
      ${renderNativeV8InfoPanelTabs(state)}
      <div class="studio-native-v8-info-panel__body">
        ${renderNativeV8Inspector(state)}
      </div>
    </aside>
  `;
}

function renderNativeV8Workbench(state: StudioState) {
  const navigationCollapsed = state.shell.navigationCollapsed;
  return `
    <div id="studioApp" class="studio-app studio-native-app studio-native-app--v8${navigationCollapsed ? " is-nav-collapsed" : ""}" data-native-shell="workbench" data-native-ui="v8" data-navigation-collapsed="${navigationCollapsed ? "true" : "false"}">
      ${renderNativeV8Topbar(state)}
      <div class="studio-native-workbench studio-native-workbench--v8">
        ${renderNativeIconBar(state)}
        <div class="studio-native-v8-main">
          ${renderNativeStage(state, {
            renderBiomePopover: false,
            renderDrawer: false,
            renderToolbar: false,
          })}
          ${renderNativeV8InfoPanel(state)}
        </div>
        ${renderNativeV8BottomBar(state)}
      </div>
    </div>
  `;
}

export function renderNativeStudioShell(
  state: StudioState,
  _uiVariant?: unknown,
) {
  if (state.section === "project") return renderNativeProjectHome(state);
  return renderNativeV8Workbench(state);
}
