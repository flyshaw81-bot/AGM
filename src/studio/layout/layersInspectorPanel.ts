import {
  getEngineLayerDetails,
  getEngineLayerStates,
  getEngineProjectSummary,
} from "../bridge/engineActions";
import type { StudioState } from "../types";
import { renderLayerGroup } from "./layerPanel";
import { SHELL_LABELS } from "./shellConstants";
import { t } from "./shellShared";

export function renderLayersInspectorPanel(state: StudioState) {
  const labels = SHELL_LABELS[state.language];
  const layerDetails = getEngineLayerDetails();
  const layerStates = getEngineLayerStates();
  const projectSummary = getEngineProjectSummary();
  const visibleCount = layerDetails.filter((layer) => layer.active).length;
  const pinnedCount = layerDetails.filter((layer) => layer.pinned).length;

  return `
    <section class="studio-panel">
      <h2 class="studio-panel__title">${t(state.language, "图层摘要", "Layers summary")}</h2>
      <div class="studio-kv"><span>${t(state.language, "可见", "Visible")}</span><strong>${visibleCount}/${layerDetails.length}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "已固定", "Pinned")}</span><strong>${pinnedCount}</strong></div>
      <div class="studio-kv"><span>${labels.preset}</span><strong>${projectSummary.lastLayersPreset}</strong></div>
      <label class="studio-stack-field">
        <span>${t(state.language, "修改预设", "Change preset")}</span>
        <select id="studioLayersPresetSelect">
          ${projectSummary.availableLayersPresets.map((option) => `<option value="${option}">${option}</option>`).join("")}
        </select>
      </label>
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="layers-preset-action" data-value="save"${projectSummary.canSaveLayersPreset ? "" : " disabled"}>${t(state.language, "保存预设", "Save preset")}</button>
        <button class="studio-ghost" data-studio-action="layers-preset-action" data-value="remove"${projectSummary.canRemoveLayersPreset ? "" : " disabled"}>${t(state.language, "移除预设", "Remove preset")}</button>
      </div>
    </section>
    ${renderLayerGroup(state.language, t(state.language, "地理", "Geography"), ["toggleTexture", "toggleHeight", "toggleBiomes", "toggleRelief"], layerStates)}
    ${renderLayerGroup(state.language, t(state.language, "政治", "Political"), ["toggleStates", "toggleProvinces", "toggleBorders", "toggleLabels"], layerStates)}
    ${renderLayerGroup(state.language, t(state.language, "基础设施", "Infrastructure"), ["toggleRivers", "toggleRoutes", "togglePopulation"], layerStates)}
    <details class="studio-advanced-section">
      <summary>${t(state.language, "更多图层", "More layers")}</summary>
      ${renderLayerGroup(state.language, t(state.language, "辅助线", "Guides"), ["toggleCells", "toggleGrid", "toggleCoordinates", "toggleCompass", "toggleRulers", "toggleScaleBar", "toggleVignette"], layerStates)}
      ${renderLayerGroup(state.language, t(state.language, "世界细节", "World details"), ["toggleIce", "toggleCultures", "toggleReligions", "toggleZones", "toggleTemperature", "togglePrecipitation"], layerStates)}
      ${renderLayerGroup(state.language, t(state.language, "聚落", "Settlement"), ["toggleEmblems", "toggleBurgIcons", "toggleMilitary", "toggleMarkers"], layerStates)}
    </details>
  `;
}
