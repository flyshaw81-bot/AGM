import type { getEngineExportSettings } from "../bridge/engineExport";
import type { StudioState } from "../types";
import type { RelationshipRepairHealth } from "./directRelationshipRepairHealth";
import { segmentButton } from "./shellChrome";
import { EXPORT_FORMAT_LABELS } from "./shellConstants";
import { escapeHtml, t } from "./shellShared";

type ProjectExportAction =
  | "export-agm-draft"
  | "export-world-package"
  | "export-resource-map"
  | "export-province-map"
  | "export-biome-map"
  | "export-tiled-map"
  | "export-geojson-map-layers"
  | "export-heightmap-metadata"
  | "export-heightfield"
  | "export-heightmap-png"
  | "export-heightmap-raw16"
  | "export-engine-manifest"
  | "export-engine-package"
  | "export-rules-pack"
  | "restore-agm-draft";

function renderProjectExportButton(
  action: ProjectExportAction,
  label: string,
  tone: "primary" | "default" = "default",
  options: { disabled?: boolean; disabledReason?: string } = {},
) {
  const disabledReason = options.disabledReason
    ? ` data-disabled-reason="${escapeHtml(options.disabledReason)}"`
    : "";
  return `<button class="studio-native-export__button${tone === "primary" ? " studio-native-export__button--primary" : ""}" data-studio-action="project" data-value="${action}"${options.disabled ? " disabled" : ""}${disabledReason}>${escapeHtml(label)}</button>`;
}

function renderRelationshipRepairDeliveryDecision(
  state: StudioState,
  relationshipRepairHealth: RelationshipRepairHealth,
) {
  const blocked = relationshipRepairHealth.exportGate === "blocked";

  if (blocked) {
    return `
      <div class="studio-native-export__decision is-blocked" data-export-delivery-decision="needs-repair" data-export-run-policy="image-export-allowed-delivery-blocked">
        <strong>${t(state.language, "交付前需要修复", "Needs repair before delivery")}</strong>
        <span>${t(state.language, "当前图像仍可导出用于检查；正式引擎交付包会等待关系修复完成。", "Image export remains available, but engine handoff should wait for relationship repair.")}</span>
        <div class="studio-native-export__decision-actions">
          <button class="studio-native-export__button" data-studio-action="section" data-value="repair">${t(state.language, "打开修复中心", "Open Repair Center")}</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="studio-native-export__decision is-ready" data-export-delivery-decision="ready" data-export-run-policy="package-export-ready">
      <strong>${t(state.language, "可以交付", "Ready to deliver")}</strong>
      <span>${t(state.language, "关系修复 gate 已通过；现在可以导出引擎包，或复查修复记录。", "Relationship repair has passed; export the engine package or review repair details.")}</span>
      <div class="studio-native-export__decision-actions">
        ${renderProjectExportButton("export-engine-package", t(state.language, "导出引擎包 ZIP", "Export Engine Package ZIP"), "primary")}
        <button class="studio-native-export__button" data-studio-action="section" data-value="repair">${t(state.language, "复查修复中心", "Review Repair Center")}</button>
      </div>
    </div>
  `;
}

function renderRelationshipRepairExportGate(
  state: StudioState,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  if (!relationshipRepairHealth) return "";

  const blocked = relationshipRepairHealth.exportGate === "blocked";
  const deliveryReady = relationshipRepairHealth.deliveryStatus === "ready";
  const title = blocked
    ? t(state.language, "关系修复未完成", "Relationship repair gate blocked")
    : t(state.language, "关系修复已通过", "Relationship repair gate passed");
  const message = blocked
    ? t(
        state.language,
        "仍有阻塞关系问题；可以继续导出检查文件，但 AGM 不会把当前项目标记为可交付。",
        "Relationship blocking issues remain; this world should not be treated as export-ready yet.",
      )
    : t(
        state.language,
        "关系修复 gate 已通过，可以继续打包或导出。",
        "Relationship repair passed; export readiness can continue.",
      );
  const lastRepair = relationshipRepairHealth.lastAppliedRepairId
    ? `#${relationshipRepairHealth.lastAppliedRepairId}`
    : t(state.language, "无", "None");
  const deliveryStatusLabel = deliveryReady
    ? t(state.language, "可交付", "Ready to deliver")
    : t(state.language, "需要修复", "Needs repair");

  return `
    <section class="studio-native-export__gate${blocked ? " is-blocked" : " is-ready"}" data-relationship-export-gate="${relationshipRepairHealth.exportGate}" data-relationship-delivery-status="${relationshipRepairHealth.deliveryStatus}">
      <div class="studio-native-export__gate-copy">
        <p>${escapeHtml(title)}</p>
        <span>${escapeHtml(message)} ${t(state.language, "上次修复", "Last repair")}: ${escapeHtml(lastRepair)}</span>
      </div>
      <div class="studio-native-export__gate-stats" data-relationship-repair-health="${relationshipRepairHealth.exportGate}" data-relationship-repair-issue-count="${relationshipRepairHealth.issueCount}" data-relationship-repair-blocking-count="${relationshipRepairHealth.blockingIssueCount}" data-relationship-repair-export-gate="${relationshipRepairHealth.exportGate}" data-relationship-delivery-status="${relationshipRepairHealth.deliveryStatus}">
        <div><span>${t(state.language, "关系问题", "Relationship issues")}</span><strong>${relationshipRepairHealth.issueCount}</strong></div>
        <div><span>${t(state.language, "阻塞问题", "Blocking issues")}</span><strong>${relationshipRepairHealth.blockingIssueCount}</strong></div>
        <div><span>${t(state.language, "交付状态", "Delivery status")}</span><strong>${escapeHtml(deliveryStatusLabel)}</strong></div>
      </div>
      ${renderRelationshipRepairDeliveryDecision(state, relationshipRepairHealth)}
    </section>
  `;
}

function renderNativeExportFormat(state: StudioState) {
  return `
    <section class="studio-native-export__hero">
      <div class="studio-native-export__hero-copy">
        <p>${t(state.language, "当前图像", "Current image")}</p>
        <h3>${t(state.language, "导出当前地图画面", "Export current map view")}</h3>
        <span>${t(state.language, "旧导出函数继续可用；AGM 负责交付状态和格式选择。", "Legacy export commands remain available, while AGM owns delivery state and format choice.")}</span>
      </div>
      <div class="studio-native-export__format-switch studio-segment" role="group" aria-label="${t(state.language, "导出格式", "Export format")}">
        ${Object.entries(EXPORT_FORMAT_LABELS)
          .map(([value, label]) =>
            segmentButton(
              label,
              value,
              state.export.format === value,
              "export-format",
            ),
          )
          .join("")}
      </div>
      <button class="studio-native-export__button studio-native-export__button--primary" data-studio-action="run-export">${t(state.language, "导出当前图像", "Export current image")} ${EXPORT_FORMAT_LABELS[state.export.format]}</button>
    </section>
  `;
}

function renderNativeExportCard(
  title: string,
  description: string,
  body: string,
  modifier = "",
) {
  return `
    <section class="studio-native-export__card${modifier ? ` ${modifier}` : ""}">
      <header>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
      </header>
      <div class="studio-native-export__actions">${body}</div>
    </section>
  `;
}

function renderCommonExportCard(state: StudioState) {
  return renderNativeExportCard(
    t(state.language, "常用导出", "Common exports"),
    t(
      state.language,
      "项目文件、世界 JSON 和最常用地图资产。",
      "Project files, world JSON, and common map assets.",
    ),
    `
      ${renderProjectExportButton("export-agm-draft", t(state.language, "导出 AGM 文件", "Export AGM file"), "primary")}
      ${renderProjectExportButton("export-world-package", t(state.language, "导出 AGM World JSON", "Export AGM World JSON"))}
      ${renderProjectExportButton("export-heightmap-png", t(state.language, "导出高度图 PNG", "Export Heightmap PNG"))}
      ${renderProjectExportButton("restore-agm-draft", t(state.language, "恢复 AGM 草稿", "Restore AGM draft"))}
      <label class="studio-native-export__button" for="studioAgmFileInput">${t(state.language, "导入 AGM 文件", "Import AGM file")}</label>
      <input id="studioAgmFileInput" type="file" accept=".agm,application/json" hidden />
    `,
  );
}

function renderMapLayerExportCard(state: StudioState) {
  return renderNativeExportCard(
    t(state.language, "地图图层", "Map layers"),
    t(
      state.language,
      "面向游戏管线的资源、省份、生物群系和 GeoJSON 输出。",
      "Resource, province, biome, and GeoJSON outputs for game pipelines.",
    ),
    `
      ${renderProjectExportButton("export-resource-map", t(state.language, "导出资源地图 JSON", "Export Resource Map JSON"))}
      ${renderProjectExportButton("export-province-map", t(state.language, "导出省份地图 JSON", "Export Province Map JSON"))}
      ${renderProjectExportButton("export-biome-map", t(state.language, "导出生物群系地图 JSON", "Export Biome Map JSON"))}
      ${renderProjectExportButton("export-tiled-map", t(state.language, "导出 Tiled 地图 JSON", "Export Tiled Map JSON"))}
      ${renderProjectExportButton("export-geojson-map-layers", t(state.language, "导出 GeoJSON 地图层", "Export GeoJSON Map Layers"))}
    `,
  );
}

function renderEngineHandoffCard(
  state: StudioState,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  const blocked = relationshipRepairHealth?.exportGate === "blocked";
  return renderNativeExportCard(
    t(state.language, "引擎交付", "Engine handoff"),
    t(
      state.language,
      blocked
        ? "关系修复完成后才能导出正式引擎包；清单仍可导出用于检查。"
        : "只提供交付入口；本轮不重写 Unity/Godot/Unreal 行为。",
      blocked
        ? "Repair relationship issues before exporting the formal engine package; manifest export remains available for review."
        : "Delivery entry points only; Unity, Godot, and Unreal behavior is not rewritten in this pass.",
    ),
    `
      ${renderProjectExportButton(
        "export-engine-package",
        t(state.language, "导出引擎包 ZIP", "Export Engine Package ZIP"),
        blocked ? "default" : "primary",
        {
          disabled: blocked,
          disabledReason: blocked
            ? t(
                state.language,
                "关系修复完成后才能导出正式引擎包",
                "Repair relationship issues before exporting the formal engine package",
              )
            : undefined,
        },
      )}
      ${renderProjectExportButton("export-engine-manifest", t(state.language, "导出引擎清单", "Export Engine Manifest"))}
      ${blocked ? `<small class="studio-native-export__hint" data-export-package-blocked-hint="true">${t(state.language, "引擎包已被关系修复 gate 阻塞。", "Engine package export is blocked by the relationship repair gate.")}</small>` : ""}
    `,
  );
}

function renderAdvancedExportCard(state: StudioState) {
  return renderNativeExportCard(
    t(state.language, "高级格式", "Advanced formats"),
    t(
      state.language,
      "高度场、RAW16 和规则包等低频导出。",
      "Heightfields, RAW16, and rules pack exports.",
    ),
    `
      ${renderProjectExportButton("export-heightmap-metadata", t(state.language, "导出高度图元数据", "Export Heightmap Metadata"))}
      ${renderProjectExportButton("export-heightfield", t(state.language, "导出高度场 JSON", "Export Heightfield JSON"))}
      ${renderProjectExportButton("export-heightmap-raw16", t(state.language, "导出高度图 RAW16", "Export Heightmap RAW16"))}
      ${renderProjectExportButton("export-rules-pack", t(state.language, "导出 AGM 规则包", "Export AGM Rules Pack"))}
      <label class="studio-native-export__button" for="studioRulesPackFileInput">${t(state.language, "导入 AGM 规则包", "Import AGM Rules Pack")}</label>
      <input id="studioRulesPackFileInput" type="file" accept=".agm-rules.json,application/json" hidden />
    `,
  );
}

function renderRasterSettingsCard(
  state: StudioState,
  exportSettings: ReturnType<typeof getEngineExportSettings>,
) {
  return renderNativeExportCard(
    t(state.language, "栅格设置", "Raster settings"),
    t(
      state.language,
      "PNG 输出和切片尺寸。",
      "PNG output and tile dimensions.",
    ),
    `
      <label class="studio-native-export__field">
        <span>${t(state.language, "PNG 缩放", "PNG scale")}</span>
        <input id="studioPngResolutionInput" class="studio-input" type="number" min="1" step="1" value="${exportSettings.pngResolution}" />
      </label>
      <div class="studio-native-export__kv"><span>${t(state.language, "输出", "Output")}</span><strong>${state.viewport.width * exportSettings.pngResolution} x ${state.viewport.height * exportSettings.pngResolution}</strong></div>
      <label class="studio-native-export__field">
        <span>${t(state.language, "列数", "Columns")}</span>
        <input id="studioTileColsInput" class="studio-input" type="number" min="2" step="1" value="${exportSettings.tileCols}" />
      </label>
      <label class="studio-native-export__field">
        <span>${t(state.language, "行数", "Rows")}</span>
        <input id="studioTileRowsInput" class="studio-input" type="number" min="2" step="1" value="${exportSettings.tileRows}" />
      </label>
      <label class="studio-native-export__field">
        <span>${t(state.language, "切片缩放", "Tile scale")}</span>
        <input id="studioTileScaleInput" class="studio-input" type="number" min="1" step="1" value="${exportSettings.tileScale}" />
      </label>
    `,
    "studio-native-export__card--settings",
  );
}

export function renderExportPanel(
  state: StudioState,
  exportSettings: ReturnType<typeof getEngineExportSettings>,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  return `
    <section class="studio-native-export" data-native-export-panel="true">
      ${renderNativeExportFormat(state)}
      ${renderRelationshipRepairExportGate(state, relationshipRepairHealth)}
      <div class="studio-native-export__grid">
        ${renderCommonExportCard(state)}
        ${renderMapLayerExportCard(state)}
        ${renderEngineHandoffCard(state, relationshipRepairHealth)}
        ${renderAdvancedExportCard(state)}
        ${renderRasterSettingsCard(state, exportSettings)}
      </div>
    </section>
  `;
}
