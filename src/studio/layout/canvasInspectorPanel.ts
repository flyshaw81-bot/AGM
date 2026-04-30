import type { StudioState } from "../types";
import { renderBiomeDistributionInsights } from "./biomeInsightsPanel";
import { renderCanvasSelectionInfo } from "./canvasPanel";
import { segmentButton, viewportPresetOption } from "./shellChrome";
import {
  FIT_MODE_LABELS,
  SHELL_LABELS,
  VIEWPORT_PRESET_LABELS,
} from "./shellConstants";
import { t } from "./shellShared";

export function renderCanvasInspectorPanel(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  const fitModeLabels = FIT_MODE_LABELS[state.language];

  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "输出画布", "Output canvas")}</h2>
      <p class="studio-panel__text">${t(state.language, "选择导出和引擎接收的画幅。缩放、安全区和参考线属于画布工具条，不在这里重复设置。", "Choose the frame that export and engines will receive. Zoom, safe area, and guides live in the canvas toolbar.")}</p>
      <label class="studio-stack-field">
        <span>${labels.preset}</span>
        <select id="studioInspectorPresetSelect">
          ${Object.keys(VIEWPORT_PRESET_LABELS[state.language])
            .map((value) => viewportPresetOption(value, state.language))
            .join("")}
        </select>
      </label>
      <div class="studio-stack-field">
        <span>${labels.orientation}</span>
        <div class="studio-segment" role="group" aria-label="${labels.orientation}">
          ${segmentButton(labels.landscape, "landscape", state.viewport.orientation === "landscape", "orientation")}
          ${segmentButton(labels.portrait, "portrait", state.viewport.orientation === "portrait", "orientation")}
        </div>
      </div>
      <div class="studio-canvas-summary" aria-label="${t(state.language, "画布摘要", "Canvas summary")}">
        <div><span>${t(state.language, "画幅", "Frame")}</span><strong>${state.viewport.width} × ${state.viewport.height}</strong></div>
        <div><span>${labels.orientation}</span><strong>${state.viewport.orientation === "landscape" ? labels.landscape : labels.portrait}</strong></div>
        <div><span>${t(state.language, "视图", "View")}</span><strong>${fitModeLabels[state.viewport.fitMode]}</strong></div>
      </div>
    </section>
    ${renderCanvasSelectionInfo(state.viewport, state.language)}
    ${renderBiomeDistributionInsights(state.language, state.directEditor.selectedBiomeId)}
  `;
}
