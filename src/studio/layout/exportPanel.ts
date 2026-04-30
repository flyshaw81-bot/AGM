import type { getEngineExportSettings } from "../bridge/engineExport";
import type { StudioState } from "../types";
import { segmentButton } from "./shellChrome";
import { EXPORT_FORMAT_LABELS, SECTION_LABELS } from "./shellConstants";
import { t } from "./shellShared";

export function renderExportPanel(
  state: StudioState,
  exportSettings: ReturnType<typeof getEngineExportSettings>,
) {
  return `
        <section class="studio-panel studio-slim-panel">
          <h2 class="studio-panel__title">${SECTION_LABELS[state.language].export}</h2>
          <p class="studio-panel__text">${t(state.language, "常用导出默认可见；引擎交接和高级格式按需展开。", "Common exports stay visible; engine handoff and advanced formats expand on demand.")}</p>
          <div class="studio-segment" role="group" aria-label="${t(state.language, "导出格式", "Export format")}">
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
          <div class="studio-panel__actions">
            <button class="studio-ghost studio-ghost--primary" data-studio-action="run-export">${t(state.language, "导出当前图片", "Export current image")} ${EXPORT_FORMAT_LABELS[state.export.format]}</button>
          </div>
        </section>
        <section class="studio-panel studio-export-group">
          <h2 class="studio-panel__title">${t(state.language, "常用导出", "Common exports")}</h2>
          <div class="studio-panel__actions">
            <button class="studio-ghost studio-ghost--primary" data-studio-action="project" data-value="export-agm-draft">${t(state.language, "导出 AGM 文件", "Export AGM file")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-world-package">${t(state.language, "导出 AGM World JSON", "Export AGM World JSON")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightmap-png">${t(state.language, "导出高度图 PNG", "Export Heightmap PNG")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="restore-agm-draft">${t(state.language, "恢复 AGM 草稿", "Restore AGM draft")}</button>
            <label class="studio-ghost" for="studioAgmFileInput">${t(state.language, "导入 AGM 文件", "Import AGM file")}</label>
            <input id="studioAgmFileInput" type="file" accept=".agm,application/json" hidden />
          </div>
        </section>
        <section class="studio-panel studio-export-group">
          <h2 class="studio-panel__title">${t(state.language, "地图图层", "Map layers")}</h2>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="project" data-value="export-resource-map">${t(state.language, "导出资源地图 JSON", "Export Resource Map JSON")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-province-map">${t(state.language, "导出省份地图 JSON", "Export Province Map JSON")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-biome-map">${t(state.language, "导出生物群系地图 JSON", "Export Biome Map JSON")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-tiled-map">${t(state.language, "导出 Tiled 地图 JSON", "Export Tiled Map JSON")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-geojson-map-layers">${t(state.language, "导出 GeoJSON 地图层", "Export GeoJSON Map Layers")}</button>
          </div>
        </section>
        <details class="studio-advanced-section studio-export-group">
          <summary>${t(state.language, "引擎交接", "Engine handoff")}</summary>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="project" data-value="export-engine-package">${t(state.language, "导出引擎包 ZIP", "Export Engine Package ZIP")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-engine-manifest">${t(state.language, "导出引擎清单", "Export Engine Manifest")}</button>
          </div>
        </details>
        <details class="studio-advanced-section studio-export-group">
          <summary>${t(state.language, "高级格式", "Advanced formats")}</summary>
          <div class="studio-panel__actions">
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightmap-metadata">${t(state.language, "导出高度图元数据", "Export Heightmap Metadata")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightfield">${t(state.language, "导出高度场 JSON", "Export Heightfield JSON")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-heightmap-raw16">${t(state.language, "导出高度图 RAW16", "Export Heightmap RAW16")}</button>
            <button class="studio-ghost" data-studio-action="project" data-value="export-rules-pack">${t(state.language, "导出 AGM 规则包", "Export AGM Rules Pack")}</button>
            <label class="studio-ghost" for="studioRulesPackFileInput">${t(state.language, "导入 AGM 规则包", "Import AGM Rules Pack")}</label>
            <input id="studioRulesPackFileInput" type="file" accept=".agm-rules.json,application/json" hidden />
          </div>
        </details>
        <section class="studio-panel">
          <h2 class="studio-panel__title">${t(state.language, "栅格设置", "Raster settings")}</h2>
          <label class="studio-stack-field">
            <span>${t(state.language, "PNG 缩放", "PNG scale")}</span>
            <input id="studioPngResolutionInput" class="studio-input" type="number" min="1" step="1" value="${exportSettings.pngResolution}" />
          </label>
          <div class="studio-kv"><span>${t(state.language, "输出", "Output")}</span><strong>${state.viewport.width * exportSettings.pngResolution} × ${state.viewport.height * exportSettings.pngResolution}</strong></div>
        </section>
        <section class="studio-panel">
          <h2 class="studio-panel__title">${t(state.language, "切片", "Tiles")}</h2>
          <label class="studio-stack-field">
            <span>${t(state.language, "列数", "Columns")}</span>
            <input id="studioTileColsInput" class="studio-input" type="number" min="2" step="1" value="${exportSettings.tileCols}" />
          </label>
          <label class="studio-stack-field">
            <span>${t(state.language, "行数", "Rows")}</span>
            <input id="studioTileRowsInput" class="studio-input" type="number" min="2" step="1" value="${exportSettings.tileRows}" />
          </label>
          <label class="studio-stack-field">
            <span>${t(state.language, "切片缩放", "Tile scale")}</span>
            <input id="studioTileScaleInput" class="studio-input" type="number" min="1" step="1" value="${exportSettings.tileScale}" />
          </label>
        </section>
      `;
}
